/**
 * SUPPLIER ORDER SERVICE
 * Inoltra automaticamente gli ordini confermati ai fornitori (BigBuy + AW)
 *
 * Flusso:
 * 1. Riceve ordine confermato (dopo pagamento)
 * 2. Separa items per fornitore (source: bigbuy vs aw)
 * 3. Invia ordine a BigBuy e/o AW
 * 4. Salva supplier order IDs nel DB
 * 5. Retry 3 volte su errore
 * 6. Email notifica su fallimento definitivo
 */

const { PrismaClient } = require('@prisma/client');
const bigbuy = require('../integrations/BigBuyClient');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const awDropship = new AWDropshipClient();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 secondi tra retry

class SupplierOrderService {

  /**
   * Inoltra ordine ai fornitori dopo conferma pagamento
   * Punto di ingresso principale — chiamato da webhook Stripe e capture PayPal
   * @param {Object} order - Ordine dal DB (formato formatOrderForAPI o raw Prisma)
   * @returns {Promise<Object>} - Risultato invio { bigbuy: {...}, aw: {...} }
   */
  async forwardToSupplier(order) {
    const orderNumber = order.orderNumber || order.id;
    logger.info(`🚀 SupplierOrderService: Inoltro ordine ${orderNumber} ai fornitori`);

    // Recupera ordine completo dal DB con items e prodotti
    const whereClause = order.id && typeof order.id === 'number'
      ? { id: order.id }
      : { orderNumber: String(orderNumber) };

    const dbOrder = await prisma.order.findFirst({
      where: whereClause,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!dbOrder) {
      logger.error(`❌ Ordine ${orderNumber} non trovato nel DB`);
      return { error: 'Ordine non trovato' };
    }

    // Parsa indirizzo di spedizione
    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(dbOrder.shippingAddress || '{}');
    } catch (e) {
      logger.warn('⚠️ Impossibile parsare shippingAddress, uso vuoto');
    }

    // Separa items per fornitore
    const bigbuyItems = [];
    const awItems = [];

    for (const item of dbOrder.items) {
      const source = item.product?.source || this._guessSource(item.productId, item.sku);

      if (source === 'bigbuy') {
        bigbuyItems.push(item);
      } else if (source === 'aw' || source === 'aw-dropship') {
        awItems.push(item);
      } else {
        logger.warn(`⚠️ Item ${item.sku} ha source sconosciuto: "${source}" — skip`);
      }
    }

    logger.info(`📊 Ordine ${orderNumber}: ${bigbuyItems.length} BigBuy + ${awItems.length} AW items`);

    const result = { bigbuy: null, aw: null };

    // Invia a BigBuy
    if (bigbuyItems.length > 0) {
      result.bigbuy = await this._sendToBigBuy(dbOrder, bigbuyItems, shippingAddress);
    }

    // Invia a AW
    if (awItems.length > 0) {
      result.aw = await this._sendToAW(dbOrder, awItems, shippingAddress);
    }

    if (bigbuyItems.length === 0 && awItems.length === 0) {
      logger.warn(`⚠️ Ordine ${orderNumber}: nessun item con fornitore riconosciuto`);
    }

    return result;
  }

  /**
   * Invia ordine a BigBuy con retry
   */
  async _sendToBigBuy(dbOrder, items, shippingAddress) {
    const orderNumber = dbOrder.orderNumber;

    // Prepara payload BigBuy
    const nameParts = (dbOrder.customerName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const bigbuyPayload = {
      internalReference: orderNumber,
      language: 'it',
      products: items.map(item => ({
        reference: item.product?.bigbuyId || item.productId || item.sku,
        quantity: item.quantity
      })),
      shippingAddress: {
        firstName,
        lastName,
        country: shippingAddress.country || 'IT',
        postcode: shippingAddress.postalCode || '',
        town: shippingAddress.city || '',
        address: shippingAddress.street || '',
        phone: dbOrder.customerPhone || '',
        email: dbOrder.customerEmail || ''
      }
    };

    // Retry loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`📦 BigBuy: Tentativo ${attempt}/${MAX_RETRIES} per ordine ${orderNumber}`);

        const bbResponse = await bigbuy.createOrder(bigbuyPayload);
        const bbOrderId = bbResponse.orderId || bbResponse.id;

        // Salva nel DB
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            bigbuyOrderId: typeof bbOrderId === 'number' ? bbOrderId : parseInt(bbOrderId) || null,
            bigbuyStatus: 'sent',
            bigbuySentAt: new Date(),
            supplierError: null,
            supplierRetries: attempt
          }
        });

        logger.info(`✅ BigBuy: Ordine ${orderNumber} inviato → BB ID: ${bbOrderId}`);
        return { success: true, orderId: bbOrderId, attempt };

      } catch (error) {
        logger.error(`❌ BigBuy tentativo ${attempt}/${MAX_RETRIES} fallito: ${error.message}`);

        // Salva errore nel DB
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            bigbuyStatus: 'error',
            supplierError: `BigBuy: ${error.message}`,
            supplierRetries: attempt
          }
        });

        if (attempt < MAX_RETRIES) {
          logger.info(`⏳ Retry tra ${RETRY_DELAY_MS / 1000} secondi...`);
          await this._delay(RETRY_DELAY_MS);
        } else {
          // Tutti i tentativi falliti — email admin
          logger.error(`🚨 BigBuy: TUTTI I TENTATIVI FALLITI per ordine ${orderNumber}`);
          await emailService.sendSupplierOrderError(dbOrder, 'bigbuy', error.message, MAX_RETRIES);
          return { success: false, error: error.message, attempt };
        }
      }
    }
  }

  /**
   * Invia ordine a AW Dropship con retry
   */
  async _sendToAW(dbOrder, items, shippingAddress) {
    const orderNumber = dbOrder.orderNumber;

    // Crea cliente AW con i dati del compratore
    let customerClientId;
    try {
      const nameParts = (dbOrder.customerName || '').split(' ');
      const awClient = await awDropship.createClient({
        name: dbOrder.customerName || '',
        company: '',
        email: dbOrder.customerEmail || '',
        phone: dbOrder.customerPhone || '',
        address: {
          country: shippingAddress.country || 'IT',
          street: shippingAddress.street || shippingAddress.addressLine1 || '',
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city || '',
          postalCode: shippingAddress.postalCode || ''
        }
      });
      customerClientId = awClient.id;
      logger.info(`AW: Cliente creato ID ${customerClientId} per ordine ${orderNumber}`);
    } catch (clientError) {
      // Fallback: usa AW_DEFAULT_CLIENT_ID se la creazione fallisce
      customerClientId = process.env.AW_DEFAULT_CLIENT_ID;
      if (!customerClientId) {
        const errMsg = `AW: impossibile creare cliente e AW_DEFAULT_CLIENT_ID non configurato - ${clientError.message}`;
        logger.error(errMsg);
        await emailService.sendSupplierOrderError(dbOrder, 'aw', errMsg, 0);
        return { success: false, error: errMsg };
      }
      logger.warn(`AW: creazione cliente fallita, uso default ${customerClientId}: ${clientError.message}`);
    }

    const awPayload = {
      customerClientId,
      items: items.map(item => ({
        portfolioId: item.productId || item.sku,
        quantity: item.quantity
      }))
    };

    // Retry loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(`📦 AW: Tentativo ${attempt}/${MAX_RETRIES} per ordine ${orderNumber}`);

        const awResponse = await awDropship.createOrder(awPayload);
        const awOrderId = String(awResponse.id || awResponse.reference || '');

        // Salva nel DB
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            awOrderId,
            awStatus: awResponse.state || 'submitted',
            awSentAt: new Date(),
            supplierError: null,
            supplierRetries: attempt
          }
        });

        logger.info(`✅ AW: Ordine ${orderNumber} inviato → AW ID: ${awOrderId}`);
        return { success: true, orderId: awOrderId, attempt };

      } catch (error) {
        logger.error(`❌ AW tentativo ${attempt}/${MAX_RETRIES} fallito: ${error.message}`);

        // Salva errore nel DB
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            awStatus: 'error',
            supplierError: `AW: ${error.message}`,
            supplierRetries: attempt
          }
        });

        if (attempt < MAX_RETRIES) {
          logger.info(`⏳ Retry tra ${RETRY_DELAY_MS / 1000} secondi...`);
          await this._delay(RETRY_DELAY_MS);
        } else {
          // Tutti i tentativi falliti — email admin
          logger.error(`🚨 AW: TUTTI I TENTATIVI FALLITI per ordine ${orderNumber}`);
          await emailService.sendSupplierOrderError(dbOrder, 'aw', error.message, MAX_RETRIES);
          return { success: false, error: error.message, attempt };
        }
      }
    }
  }

  /**
   * Indovina il fornitore dal productId/sku se il prodotto non è nel DB
   */
  _guessSource(productId, sku) {
    const id = (productId || sku || '').toLowerCase();
    // AW: prefissi aw-, aw_, awpfo-, fobp-, fobi-, fobc-, etc.
    if (id.startsWith('aw-') || id.startsWith('aw_') || id.startsWith('awpfo-') || id.startsWith('fob')) return 'aw';
    // BigBuy: numeri puri, M-prefix (profumi), bb-, S/V prefix
    if (id.match(/^\d+$/) || id.startsWith('m') || id.startsWith('bb-') || id.startsWith('s') || id.startsWith('v')) return 'bigbuy';
    return 'unknown';
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new SupplierOrderService();
