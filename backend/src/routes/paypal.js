const express = require('express');
const router = express.Router();
const paypalService = require('../../services/paypalService');
const bigbuy = require('../integrations/BigBuyClient'); // Già singleton
const AWDropshipClient = require('../integrations/AWDropshipClient');
const orderService = require('../services/OrderService');
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

    // TODO: Riabilitare verifica stock quando BigBuy API funzionerà correttamente
    // TEMPORANEAMENTE DISABILITATO PER TEST PAYPAL
    /*
    // 1. Verifica stock BigBuy
    const bigbuyItems = items.filter(item => item.source === 'bigbuy');
    if (bigbuyItems.length > 0) {
      logger.info(`🔍 Verifica stock per ${bigbuyItems.length} prodotti BigBuy`);

      const productIds = bigbuyItems.map(item => item.bigbuyId || item.productId);
      const stockData = await bigbuy.checkMultipleStock(productIds);

      for (const item of bigbuyItems) {
        const productId = item.bigbuyId || item.productId;
        const stock = stockData.stocks?.find(s => s.productId === productId);

        if (!stock || !stock.available || stock.quantity < item.quantity) {
          logger.warn(`❌ BigBuy: Prodotto ${productId} non disponibile`);
          return res.status(400).json({
            success: false,
            error: `Prodotto "${item.name}" non disponibile o quantità insufficiente`,
            productId
          });
        }
      }
      logger.info(`✅ Stock BigBuy verificato con successo`);
    }

    // 2. Verifica stock AW Dropship
    const awItems = items.filter(item => item.source === 'aw');
    if (awItems.length > 0) {
      logger.info(`🔍 Verifica stock per ${awItems.length} prodotti AW Dropship`);

      for (const item of awItems) {
        const productId = item.awId || item.productId;
        const productData = await awDropship.getProduct(productId);

        if (!productData || !productData.stock || productData.stock < item.quantity) {
          logger.warn(`❌ AW: Prodotto ${productId} non disponibile`);
          return res.status(400).json({
            success: false,
            error: `Prodotto "${item.name}" non disponibile o quantità insufficiente`,
            productId
          });
        }
      }
      logger.info(`✅ Stock AW Dropship verificato con successo`);
    }
    */
    logger.warn('⚠️  Verifica stock DISABILITATA temporaneamente per test PayPal');

    // 3. Crea ordine PayPal
    const result = await paypalService.createOrder(items, customer);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Errore creazione ordine PayPal'
      });
    }

    // 4. Salva ordine nel database come pending
    const order = await orderService.createOrder({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || {}
      },
      items: items,
      totals: {
        subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: customer.shippingCost || 0,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (customer.shippingCost || 0)
      },
      payment: {
        method: 'paypal',
        paypalOrderId: result.orderId,
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

    // Aggiorna ordine nel database
    const orders = await orderService.getAllOrders();
    const order = orders.find(o => o.payment.paypalOrderId === orderId);

    if (order) {
      await orderService.updateOrderStatus(order.id, 'processing');
      logger.info(`✅ Ordine ${order.id} aggiornato a processing`);
    }

    logger.info(`✅ Pagamento catturato: ${result.captureId}, €${result.amount}`);

    res.json({
      success: true,
      data: {
        orderId: result.orderId,
        status: result.status,
        captureId: result.captureId,
        amount: result.amount,
        payer: result.payer,
        dbOrderId: order ? order.id : null
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

        // Aggiorna ordine nel DB
        const orders = await orderService.getAllOrders();
        const order = orders.find(o => o.payment.paypalOrderId === event.resource.id);
        if (order) {
          await orderService.updateOrderStatus(order.id, 'processing');
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
