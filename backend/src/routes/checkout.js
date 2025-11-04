const express = require('express');
const router = express.Router();
const stripe = require('../integrations/StripeClient');
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');

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

    // 1. Verifica stock su BigBuy
    const productIds = items.map(item => item.bigbuyId || item.productId);
    const stockData = await bigbuy.checkMultipleStock(productIds);

    // Controlla disponibilità
    for (const item of items) {
      const productId = item.bigbuyId || item.productId;
      const stock = stockData.stocks?.find(s => s.productId === productId);

      if (!stock || !stock.available || stock.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Prodotto "${item.name}" non disponibile o quantità insufficiente`,
          productId
        });
      }
    }

    // 2. Prepara dati per Stripe
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

    // 3. Crea sessione Stripe
    const session = await stripe.createCheckoutSession(checkoutData);

    logger.info(`Checkout creato per ${customer.email}, session: ${session.sessionId}`);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        url: session.url
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

    res.json({
      success: true,
      message: 'Pagamento completato con successo!',
      orderEmail: session.customer_email
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
          alert('Pagamento simulato con successo!');
          window.location.href = '${process.env.FRONTEND_URL}/checkout-success.html?session_id=${sessionId}';
        }

        function simulateCancel() {
          alert('Pagamento annullato');
          window.location.href = '${process.env.FRONTEND_URL}/checkout.html?canceled=true';
        }
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
