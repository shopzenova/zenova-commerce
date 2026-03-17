const express = require('express');
const router = express.Router();
const stripe = require('../integrations/StripeClient');
const bigbuy = require('../integrations/BigBuyClient');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const shippingService = require('../services/ShippingService');
const orderService = require('../services/OrderService');
const supplierOrderService = require('../services/SupplierOrderService');
const logger = require('../utils/logger');

const awDropship = new AWDropshipClient();

// POST /api/checkout - Crea sessione checkout Stripe
router.post('/', async (req, res) => {
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

    // 1. Separa prodotti per fornitore
    const bigbuyItems = items.filter(item => item.source === 'bigbuy');
    const awItems = items.filter(item => item.source === 'aw' || item.source === 'aw-dropship');

    logger.info(`📦 Checkout: ${bigbuyItems.length} prodotti BigBuy, ${awItems.length} prodotti AW`);

    // 2. Verifica stock BigBuy
    if (bigbuyItems.length > 0) {
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
      logger.info(`✅ Stock BigBuy verificato per ${bigbuyItems.length} prodotti`);
    }

    // 3. Verifica stock AW Dropship
    if (awItems.length > 0) {
      for (const item of awItems) {
        const productId = item.awId || item.productId || item.id;

        // Usa stock dal database se disponibile, altrimenti chiama API
        if (item.stock !== undefined && item.stock >= item.quantity) {
          continue; // Stock sufficiente dal database
        }

        // Fallback: verifica via API AW
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
      logger.info(`✅ Stock AW verificato per ${awItems.length} prodotti`);
    }

    // 4. Prepara dati per Stripe
    const checkoutData = {
      items: items.map(item => ({
        name: item.name,
        description: item.description || '',
        price: item.price,
        quantity: item.quantity,
        images: item.images ? [item.images[0]] : []
      })),
      customerEmail: customer.email,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/checkout.html?canceled=true`,
      metadata: {
        customerName: customer.name || '',
        customerPhone: customer.phone || ''
      }
    };

    // 5. Crea sessione Stripe
    const session = await stripe.createCheckoutSession(checkoutData);

    // 6. Salva ordine nel database
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
        method: 'stripe',
        sessionId: session.sessionId,
        status: 'pending'
      },
      shipping: {
        carrier: customer.shippingCarrier || '',
        trackingNumber: '',
        estimatedDelivery: ''
      },
      notes: customer.notes || ''
    });

    logger.info(`Checkout creato per ${customer.email}, session: ${session.sessionId}, ordine: ${order.id}`);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        url: session.url,
        orderId: order.id
      }
    });

  } catch (error) {
    logger.error('Errore /api/checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la creazione del checkout'
    });
  }
});

// GET /api/checkout/success - Redirect dopo pagamento successo
router.get('/success', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.redirect(`${process.env.FRONTEND_URL}/index.html`);
  }

  try {
    // Recupera sessione Stripe
    const session = await stripe.getSession(session_id);

    // Trova e aggiorna l'ordine corrispondente
    const orders = await orderService.getAllOrders();
    const order = orders.find(o => o.payment.sessionId === session_id);

    if (order) {
      // Aggiorna stato ordine a "processing" (pagamento confermato)
      await orderService.updateOrderStatus(order.id, 'processing');
      logger.info(`✅ Ordine ${order.id} aggiornato a processing`);

      // Inoltra ordine ai fornitori (async, non blocca la risposta)
      const { PrismaClient } = require('@prisma/client');
      const prismaCheckout = new PrismaClient();
      const dbOrder = await prismaCheckout.order.findFirst({
        where: { stripeSessionId: session_id }
      });
      if (dbOrder) {
        supplierOrderService.forwardToSupplier(dbOrder)
          .then(r => logger.info(`📦 Ordine ${order.id} inoltrato ai fornitori:`, JSON.stringify(r)))
          .catch(e => logger.error(`❌ Errore inoltro fornitore per ${order.id}:`, e.message));
      }
      await prismaCheckout.$disconnect();
    }

    res.json({
      success: true,
      message: 'Pagamento completato con successo!',
      orderEmail: session.customer_email,
      orderId: order ? order.id : null
    });

  } catch (error) {
    logger.error('Errore checkout/success:', error);
    res.status(500).json({
      success: false,
      error: 'Errore verifica pagamento'
    });
  }
});

// GET /api/checkout/cancel - Redirect dopo annullamento
router.get('/cancel', async (req, res) => {
  res.json({
    success: false,
    message: 'Pagamento annullato. Torna al carrello quando sei pronto!'
  });
});

// GET /api/checkout/mock/:sessionId - Mock checkout page (solo per sviluppo)
router.get('/mock/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mock Stripe Checkout</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #F5F1E8;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #8B6F47; }
        .button {
          background: #8B6F47;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px 5px;
        }
        .button:hover { background: #6F5735; }
        .cancel { background: #999; }
        .info { background: #E8DCC4; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 MOCK Stripe Checkout</h1>
        <p><strong>Session ID:</strong> ${sessionId}</p>

        <div class="info">
          <p>⚠️ <strong>Modalità Test</strong></p>
          <p>Questo è un checkout simulato. Nessun pagamento reale verrà effettuato.</p>
        </div>

        <h3>Simula pagamento:</h3>
        <button class="button" onclick="simulateSuccess()">✅ Simula Successo</button>
        <button class="button cancel" onclick="simulateCancel()">❌ Annulla</button>
      </div>

      <script>
        function simulateSuccess() {
          console.log('✅ Simula Successo clicked');
          alert('Pagamento simulato con successo!');
          const successUrl = '${process.env.FRONTEND_URL || 'http://127.0.0.1:8080'}/checkout-success.html?session_id=${sessionId}';
          console.log('Redirecting to:', successUrl);
          setTimeout(() => {
            window.location.href = successUrl;
          }, 500);
        }

        function simulateCancel() {
          console.log('❌ Annulla clicked');
          alert('Pagamento annullato');
          const cancelUrl = '${process.env.FRONTEND_URL || 'http://127.0.0.1:8080'}/checkout.html?canceled=true';
          console.log('Redirecting to:', cancelUrl);
          setTimeout(() => {
            window.location.href = cancelUrl;
          }, 500);
        }

        console.log('Mock checkout page loaded');
        console.log('Session ID:', '${sessionId}');
        console.log('Frontend URL:', '${process.env.FRONTEND_URL || 'http://127.0.0.1:8080'}');
      </script>
    </body>
    </html>
  `);
});

// POST /api/checkout/calculate-shipping - Calcola costi spedizione (usando CSV BigBuy)
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { items, destination } = req.body;

    // Validazione input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Carrello vuoto'
      });
    }

    if (!destination || !destination.country) {
      return res.status(400).json({
        success: false,
        error: 'Destinazione richiesta (country)'
      });
    }

    logger.info(`🚚 Calcolo spedizione per ${items.length} prodotti verso ${destination.country}`);

    // Calcola totale ordine
    const orderTotal = items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    logger.info(`💰 Totale ordine: €${orderTotal.toFixed(2)}`);

    // Calcola peso totale dal DB
    const { PrismaClient } = require('@prisma/client');
    const prismaShip = new PrismaClient();
    const productIds = items.map(item => item.id).filter(Boolean);
    const dbProducts = await prismaShip.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, weight: true }
    });
    await prismaShip.$disconnect();

    const weightMap = {};
    dbProducts.forEach(p => { weightMap[p.id] = p.weight ? parseFloat(p.weight) : null; });

    const DEFAULT_WEIGHT_KG = 0.5; // fallback per prodotti senza peso
    let totalWeightKg = 0;
    items.forEach(item => {
      const rawWeight = weightMap[item.id];
      let weightKg;
      if (rawWeight === null || rawWeight === undefined) {
        weightKg = DEFAULT_WEIGHT_KG;
      } else if (rawWeight > 10) {
        weightKg = rawWeight / 1000; // grammi → kg
      } else {
        weightKg = rawWeight; // già in kg
      }
      totalWeightKg += weightKg * (item.quantity || 1);
    });

    logger.info(`⚖️ Peso totale carrello: ${totalWeightKg.toFixed(3)} kg`);

    // Prepara dati prodotti
    const products = items.map(item => ({
      reference: item.id,
      quantity: item.quantity || 1,
      price: item.price || 0
    }));

    // Usa ShippingService con tariffe intelligenti
    const result = await shippingService.calculateShippingCost(products, {
      country: destination.country,
      postcode: destination.postcode || ''
    }, orderTotal, totalWeightKg);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        supportedCountries: result.supportedCountries
      });
    }

    logger.info(`✅ Costo spedizione: €${result.cost} ${result.isFree ? '(GRATIS!)' : ''}`);

    res.json({
      success: true,
      shipping: {
        cost: result.cost,
        carrier: result.carrier,
        country: result.country,
        zone: result.zone,
        isFree: result.isFree,
        freeAbove: result.freeAbove,
        orderTotal: orderTotal,
        productsCount: result.productsCount
      }
    });

  } catch (error) {
    logger.error('Errore calcolo spedizione:', error.message);
    res.status(500).json({
      success: false,
      error: 'Errore calcolo costi spedizione',
      message: error.message
    });
  }
});

module.exports = router;
