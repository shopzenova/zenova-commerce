const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderService = require('../services/OrderService');
const supplierOrderService = require('../services/SupplierOrderService');
const logger = require('../utils/logger');

/**
 * POST /api/stripe/create-payment-intent
 * Crea payment intent Stripe per pagamento carta
 */
router.post('/create-payment-intent', async (req, res) => {
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

    logger.info(`💳 Creazione payment intent Stripe per ${customer.email}, ${items.length} prodotti`);

    // Calcola totale ordine
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    // Aggiungi costo spedizione
    const shippingCost = customer.shippingCost || 0;
    const total = subtotal + shippingCost;

    // Converti in centesimi (Stripe richiede importi in centesimi)
    const amountInCents = Math.round(total * 100);

    logger.info(`💰 Totale ordine: €${total.toFixed(2)} (${amountInCents} cents)`);

    // Crea descrizione dettagliata con nomi prodotti
    const productNames = items.map(item => item.name || item.title || 'Prodotto').join(', ');
    const shortDescription = productNames.length > 200
      ? productNames.substring(0, 197) + '...'
      : productNames;

    // Crea payment intent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
      receipt_email: customer.email,
      metadata: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || '',
        shipping_address: customer.address || '',
        shipping_city: customer.city || '',
        shipping_postal_code: customer.postalCode || '',
        shipping_country: customer.country || '',
        items_count: items.length,
        subtotal: subtotal.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        products: shortDescription
      },
      description: shortDescription
    });

    logger.info(`✅ Payment intent creato: ${paymentIntent.id}`);

    // Calcola IVA (prezzi sono IVA inclusa al 22%)
    const vatAmount = Math.round((total - (total / 1.22)) * 100) / 100;

    // Salva ordine nel database come "pending"
    const orderData = {
      customer,
      items,
      totals: {
        subtotal: subtotal,
        shipping: shippingCost,
        total: total,
        vatAmount: vatAmount
      },
      payment: {
        method: 'stripe_card',
        sessionId: paymentIntent.id,
        status: 'pending'
      },
      status: 'pending',
      createdAt: new Date()
    };

    const dbOrder = await orderService.createOrder(orderData);
    logger.info(`💾 Ordine salvato nel DB: ${dbOrder.id}`);

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        dbOrderId: dbOrder.id
      }
    });

  } catch (error) {
    logger.error('❌ Errore creazione payment intent Stripe:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore durante la creazione del payment intent'
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Webhook Stripe per gestire eventi pagamento
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gestisci eventi Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`✅ Payment succeeded: ${paymentIntent.id}`);

      // Trova ordine per stripeSessionId (il payment intent ID)
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const dbOrder = await prisma.order.findFirst({
          where: { stripeSessionId: paymentIntent.id }
        });

        if (dbOrder) {
          // Aggiorna stato ordine
          await prisma.order.update({
            where: { id: dbOrder.id },
            data: { status: 'processing', paymentStatus: 'paid', paidAt: new Date() }
          });
          logger.info(`📝 Ordine ${dbOrder.orderNumber} aggiornato a processing`);

          // Inoltra ordine ai fornitori (async, non blocca il webhook)
          supplierOrderService.forwardToSupplier(dbOrder)
            .then(result => logger.info(`📦 Ordine ${dbOrder.orderNumber} inoltrato ai fornitori:`, JSON.stringify(result)))
            .catch(err => logger.error(`❌ Errore inoltro fornitore per ${dbOrder.orderNumber}:`, err.message));
        } else {
          logger.warn(`⚠️ Ordine non trovato per payment intent: ${paymentIntent.id}`);
        }

        await prisma.$disconnect();
      } catch (err) {
        logger.error(`❌ Errore gestione payment_intent.succeeded:`, err.message);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.error(`❌ Payment failed: ${failedPayment.id}`);

      // Aggiorna ordine nel database
      await orderService.updateOrderStatus(
        { paymentIntentId: failedPayment.id },
        'failed'
      );
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
