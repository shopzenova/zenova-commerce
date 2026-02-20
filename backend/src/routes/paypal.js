const express = require('express');
const router = express.Router();
const paypalService = require('../../services/paypalService');
const bigbuy = require('../integrations/BigBuyClient'); // Già singleton
const AWDropshipClient = require('../integrations/AWDropshipClient');
const orderService = require('../services/OrderService');
const supplierOrderService = require('../services/SupplierOrderService');
const logger = require('../utils/logger');

const awDropship = new AWDropshipClient();

/**
 * POST /api/paypal/create-order
 * Crea ordine PayPal dopo validazione stock
 */
router.post('/create-order', async (req, res) => {
  try {
    const { items, customer } = req.body;

    // Validazione input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Carrello vuoto'
      });
    }

    if (!customer || !customer.email) {
      return res.status(400).json({
        success: false,
        error: 'Email cliente richiesta'
      });
    }

    logger.info(`📦 Creazione ordine PayPal per ${customer.email}, ${items.length} prodotti`);

    // Verifica stock (best-effort: se API fallisce, ordine passa comunque)
    try {
      const bigbuyItems = items.filter(item => item.source === 'bigbuy');
      if (bigbuyItems.length > 0) {
        logger.info(`Verifica stock per ${bigbuyItems.length} prodotti BigBuy`);
        const productIds = bigbuyItems.map(item => item.bigbuyId || item.productId);
        const stockData = await bigbuy.checkMultipleStock(productIds);

        for (const item of bigbuyItems) {
          const productId = item.bigbuyId || item.productId;
          const stock = stockData.stocks?.find(s => s.productId === productId);
          if (stock && (!stock.available || stock.quantity < item.quantity)) {
            logger.warn(`BigBuy: Prodotto ${productId} non disponibile`);
            return res.status(400).json({
              success: false,
              error: `Prodotto "${item.name}" non disponibile o quantita' insufficiente`,
              productId
            });
          }
        }
        logger.info('Stock BigBuy verificato');
      }

      const awItems = items.filter(item => item.source === 'aw');
      if (awItems.length > 0) {
        logger.info(`Verifica stock per ${awItems.length} prodotti AW`);
        for (const item of awItems) {
          const productId = item.awId || item.productId;
          const productData = await awDropship.getProduct(productId);
          if (productData && productData.stock !== undefined && productData.stock < item.quantity) {
            logger.warn(`AW: Prodotto ${productId} non disponibile`);
            return res.status(400).json({
              success: false,
              error: `Prodotto "${item.name}" non disponibile o quantita' insufficiente`,
              productId
            });
          }
        }
        logger.info('Stock AW verificato');
      }
    } catch (stockError) {
      logger.warn(`Verifica stock fallita (ordine procede comunque): ${stockError.message}`);
    }

    // 3. Crea ordine PayPal
    const result = await paypalService.createOrder(items, customer);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Errore creazione ordine PayPal'
      });
    }

    // 4. Salva ordine nel database come pending
    const ppSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const ppShipping = customer.shippingCost || 0;
    const ppTotal = ppSubtotal + ppShipping;
    const ppVatAmount = Math.round((ppTotal - (ppTotal / 1.22)) * 100) / 100;

    // Build proper address object from flat customer fields
    const customerAddress = (typeof customer.address === 'object' && customer.address !== null && !Array.isArray(customer.address))
      ? customer.address
      : {
          street: customer.address || '',
          city: customer.city || '',
          postalCode: customer.postalCode || '',
          province: customer.province || '',
          country: customer.country || 'IT'
        };

    const order = await orderService.createOrder({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customerAddress
      },
      items: items,
      totals: {
        subtotal: ppSubtotal,
        shipping: ppShipping,
        total: ppTotal,
        vatAmount: ppVatAmount
      },
      payment: {
        method: 'paypal',
        sessionId: result.orderId, // PayPal order ID salvato in stripeSessionId
        status: 'pending'
      },
      shipping: {
        carrier: customer.shippingCarrier || '',
        trackingNumber: '',
        estimatedDelivery: ''
      },
      notes: customer.notes || ''
    });

    logger.info(`✅ Ordine PayPal creato: ${result.orderId}, DB ordine: ${order.id}`);

    res.json({
      success: true,
      data: {
        orderId: result.orderId,
        approvalUrl: result.approvalUrl,
        dbOrderId: order.id
      }
    });

  } catch (error) {
    logger.error('❌ Errore /api/paypal/create-order:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la creazione dell\'ordine PayPal'
    });
  }
});

/**
 * POST /api/paypal/capture-order
 * Cattura pagamento dopo approvazione utente
 */
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID richiesto'
      });
    }

    logger.info(`💳 Cattura pagamento PayPal per ordine: ${orderId}`);

    // Cattura pagamento
    const result = await paypalService.captureOrder(orderId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Errore cattura pagamento'
      });
    }

    // Trova ordine nel DB tramite stripeSessionId (dove salviamo il PayPal order ID)
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const dbOrder = await prisma.order.findFirst({
      where: { stripeSessionId: orderId }
    });

    let orderNumber = null;

    if (dbOrder) {
      // Aggiorna stato ordine
      await prisma.order.update({
        where: { id: dbOrder.id },
        data: { status: 'processing', paymentStatus: 'paid', paidAt: new Date() }
      });
      orderNumber = dbOrder.orderNumber;
      logger.info(`✅ Ordine ${orderNumber} aggiornato a processing`);

      // Inoltra ordine ai fornitori (async, non blocca la risposta)
      supplierOrderService.forwardToSupplier(dbOrder)
        .then(res => logger.info(`📦 Ordine ${orderNumber} inoltrato ai fornitori:`, JSON.stringify(res)))
        .catch(err => logger.error(`❌ Errore inoltro fornitore per ${orderNumber}:`, err.message));
    } else {
      logger.warn(`⚠️ Ordine DB non trovato per PayPal order ID: ${orderId}`);
    }

    await prisma.$disconnect();

    logger.info(`✅ Pagamento catturato: ${result.captureId}, €${result.amount}`);

    res.json({
      success: true,
      data: {
        orderId: result.orderId,
        status: result.status,
        captureId: result.captureId,
        amount: result.amount,
        payer: result.payer,
        dbOrderId: orderNumber
      }
    });

  } catch (error) {
    logger.error('❌ Errore /api/paypal/capture-order:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la cattura del pagamento'
    });
  }
});

/**
 * GET /api/paypal/order/:orderId
 * Recupera dettagli ordine PayPal
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    logger.info(`🔍 Recupero dettagli ordine PayPal: ${orderId}`);

    const result = await paypalService.getOrderDetails(orderId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: result.order
    });

  } catch (error) {
    logger.error('❌ Errore /api/paypal/order:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero ordine'
    });
  }
});

/**
 * POST /api/paypal/webhook
 * Gestisce webhook PayPal (IPNS)
 */
router.post('/webhook', async (req, res) => {
  try {
    logger.info('📥 Webhook PayPal ricevuto:', req.body.event_type);

    const event = req.body;

    // Gestisci eventi
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        logger.info(`✅ Ordine approvato: ${event.resource.id}`);
        break;

      case 'CHECKOUT.ORDER.COMPLETED':
        logger.info(`✅ Ordine completato: ${event.resource.id}`);

        // Trova e aggiorna ordine nel DB
        try {
          const prismaWh = new (require('@prisma/client').PrismaClient)();
          const whOrder = await prismaWh.order.findFirst({
            where: { stripeSessionId: event.resource.id }
          });
          if (whOrder) {
            await prismaWh.order.update({
              where: { id: whOrder.id },
              data: { status: 'processing', paymentStatus: 'paid', paidAt: new Date() }
            });
            logger.info(`📝 Ordine ${whOrder.orderNumber} aggiornato a processing (webhook)`);

            // Inoltra ai fornitori
            supplierOrderService.forwardToSupplier(whOrder)
              .then(r => logger.info(`📦 Ordine ${whOrder.orderNumber} inoltrato (webhook):`, JSON.stringify(r)))
              .catch(e => logger.error(`❌ Errore inoltro ${whOrder.orderNumber}:`, e.message));
          }
          await prismaWh.$disconnect();
        } catch (whErr) {
          logger.error('❌ Errore webhook CHECKOUT.ORDER.COMPLETED:', whErr.message);
        }
        break;

      case 'PAYMENT.CAPTURE.COMPLETED':
        logger.info(`💰 Pagamento catturato: ${event.resource.id}`);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        logger.warn(`❌ Pagamento rifiutato: ${event.resource.id}`);
        break;

      default:
        logger.info(`ℹ️ Evento non gestito: ${event.event_type}`);
    }

    res.json({ success: true });

  } catch (error) {
    logger.error('❌ Errore webhook PayPal:', error);
    res.status(500).json({
      success: false,
      error: 'Errore gestione webhook'
    });
  }
});

module.exports = router;
