const Stripe = require('stripe');
const logger = require('../utils/logger');

class StripeClient {
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    // Verifica se siamo in modalità mock
    this.isMockMode = !apiKey || apiKey === 'sk_test_YOUR_KEY_HERE';

    if (this.isMockMode) {
      logger.warn('⚠️  Stripe in MOCK MODE - usando dati finti');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16'
      });
      logger.info('✅ Stripe inizializzato');
    }
  }

  /**
   * Crea una sessione di checkout Stripe
   * @param {Object} orderData - Dati ordine (items, customer, etc.)
   * @returns {Promise<Object>} - Sessione Stripe con URL checkout
   */
  async createCheckoutSession(orderData) {
    if (this.isMockMode) {
      return this._getMockCheckoutSession(orderData);
    }

    try {
      const { items, customerEmail, successUrl, cancelUrl, metadata } = orderData;

      // Crea line items per Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.images || []
          },
          unit_amount: Math.round(item.price * 100) // Converti in centesimi
        },
        quantity: item.quantity
      }));

      // Crea sessione Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        metadata: metadata || {},
        shipping_address_collection: {
          allowed_countries: ['IT', 'FR', 'DE', 'ES', 'AT', 'BE', 'NL']
        }
      });

      logger.info(`Stripe session creata: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url
      };

    } catch (error) {
      logger.error('Errore creazione sessione Stripe:', error.message);
      throw new Error('Errore durante la creazione del checkout');
    }
  }

  /**
   * Verifica webhook Stripe
   * @param {string} payload - Raw body della richiesta
   * @param {string} signature - Stripe-Signature header
   * @returns {Object} - Evento Stripe
   */
  verifyWebhook(payload, signature) {
    if (this.isMockMode) {
      logger.info('MOCK: Webhook Stripe verificato');
      return JSON.parse(payload);
    }

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      logger.info(`Webhook Stripe verificato: ${event.type}`);
      return event;

    } catch (error) {
      logger.error('Errore verifica webhook Stripe:', error.message);
      throw new Error('Webhook signature non valida');
    }
  }

  /**
   * Recupera una sessione di checkout
   * @param {string} sessionId - ID sessione Stripe
   * @returns {Promise<Object>} - Dati sessione
   */
  async getSession(sessionId) {
    if (this.isMockMode) {
      return {
        id: sessionId,
        payment_status: 'paid',
        customer_email: 'test@zenova.it',
        amount_total: 3500,
        metadata: {}
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      logger.error('Errore recupero sessione Stripe:', error.message);
      throw error;
    }
  }

  /**
   * Crea un rimborso
   * @param {string} paymentIntentId - ID payment intent
   * @param {number} amount - Importo da rimborsare (opzionale, default: totale)
   * @returns {Promise<Object>} - Dati rimborso
   */
  async createRefund(paymentIntentId, amount = null) {
    if (this.isMockMode) {
      logger.info('MOCK: Rimborso creato');
      return {
        id: 're_mock_' + Date.now(),
        status: 'succeeded',
        amount: amount || 3500
      };
    }

    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundData);
      logger.info(`Rimborso creato: ${refund.id}`);
      return refund;

    } catch (error) {
      logger.error('Errore creazione rimborso:', error.message);
      throw error;
    }
  }

  // ===== MOCK DATA (per sviluppo) =====

  _getMockCheckoutSession(orderData) {
    const sessionId = 'cs_test_mock_' + Date.now();
    const mockUrl = `http://localhost:3000/api/checkout/mock/${sessionId}`;

    logger.info('MOCK: Sessione Stripe creata', {
      sessionId,
      items: orderData.items.length,
      total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

    return {
      sessionId,
      url: mockUrl
    };
  }
}

module.exports = new StripeClient();
