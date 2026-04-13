/**
 * AMAZON ORDER JOB
 * Polling ordini Amazon → inoltro AW → aggiornamento tracking
 *
 * Flusso:
 * 1. Ogni 30 minuti: chiama SP-API per ordini Unshipped
 * 2. Per ogni nuovo ordine: salva nel DB + inoltra ad AW Dropship
 * 3. Ogni ciclo: controlla ordini con awStatus=shipped → conferma spedizione su Amazon
 *
 * Mapping ASIN → AW: ogni ASIN Amazon mappa a uno o più codici prodotto AW
 */

const { PrismaClient } = require('@prisma/client');
const amazonClient    = require('../integrations/AmazonClient');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const emailService    = require('../integrations/EmailService');
const logger          = require('../utils/logger');

const prisma    = new PrismaClient();
const awDropship = new AWDropshipClient();

// Intervallo polling (default 30 minuti)
const POLL_INTERVAL_MS = parseInt(process.env.AMAZON_POLL_INTERVAL_MS) || 30 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING ASIN → codici AW
// Ogni ASIN Amazon corrisponde a uno o più prodotti AW da ordinare
//
// Bundle AW (1 codice): invia 1 riga ad AW, loro pensano al packing
// Set manuale (più codici): invia N righe ad AW (1 per ogni componente)
// ─────────────────────────────────────────────────────────────────────────────
const ASIN_TO_AW = {
  // Set 3 Incensi Smudge con Cristallo — Ametista Lavanda + Quarzo Rosa + Occhio di Tigre Vaniglia
  'B0GWXNM13C': [
    { sku: 'CGi-01', quantity: 1 }, // Amethyst / Lavender
    { sku: 'CGi-02', quantity: 1 }, // Rose Quartz / Rose
    { sku: 'CGi-04', quantity: 1 }, // Tiger Eye / Vanilla
  ],

  // Kit Palo Santo 3 in 1 — bundle AW (1 codice)
  'B0GWXMYYTP': [{ sku: 'B-61418-8425', quantity: 1 }],

  // Set 6 Candele di Soia Profumate - Cofanetto Regalo Aromi Misti
  'B0GX139SYS': [{ sku: 'B-61418-7061', quantity: 1 }],

  // Kit Relax Casa Aromaterapia – Diffusore LED + Candela Lavanda + 3 Oli Essenziali
  'B0GX2H21Y4': [{ sku: 'B-61418-2192', quantity: 1 }],
};

class AmazonOrderJob {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) {
      logger.warn('AmazonOrderJob: già in esecuzione');
      return;
    }

    if (!process.env.AMAZON_CLIENT_ID || !process.env.AMAZON_REFRESH_TOKEN) {
      logger.warn('AmazonOrderJob: credenziali SP-API mancanti — job non avviato');
      return;
    }

    logger.info(`AmazonOrderJob: avviato (intervallo: ${POLL_INTERVAL_MS / 1000}s)`);

    // Prima esecuzione dopo 90s dall'avvio server
    setTimeout(() => this.run(), 90000);
    this.intervalId = setInterval(() => this.run(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('AmazonOrderJob: fermato');
    }
  }

  async run() {
    if (this.isRunning) {
      logger.info('AmazonOrderJob: ciclo precedente ancora in corso, skip');
      return;
    }
    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('AmazonOrderJob: inizio ciclo...');

      // 1. Recupera nuovi ordini Amazon
      await this._pollNewOrders();

      // 2. Aggiorna tracking su Amazon per ordini già spediti da AW
      await this._syncTrackingToAmazon();

      const ms = Date.now() - startTime;
      logger.info(`AmazonOrderJob: ciclo completato in ${ms}ms`);
    } catch (err) {
      logger.error(`AmazonOrderJob: errore fatale: ${err.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  async _pollNewOrders() {
    const amazonOrders = await amazonClient.getOrders(48);
    logger.info(`AmazonOrderJob: ${amazonOrders.length} ordini trovati su Amazon`);

    for (const ao of amazonOrders) {
      try {
        await this._processOrder(ao);
      } catch (err) {
        logger.error(`AmazonOrderJob: errore ordine ${ao.amazonOrderId}: ${err.message}`);
      }
      await this._delay(2000);
    }
  }

  async _processOrder(ao) {
    // Controlla se già nel DB
    const existing = await prisma.order.findFirst({
      where: { amazonOrderId: ao.amazonOrderId }
    });
    if (existing) return;

    logger.info(`AmazonOrderJob: nuovo ordine Amazon ${ao.amazonOrderId} — €${ao.total}`);

    const shippingAddress = JSON.stringify({
      name:    ao.shippingName,
      street:  ao.shippingStreet,
      street2: ao.shippingStreet2,
      city:    ao.shippingCity,
      zip:     ao.shippingZip,
      country: ao.shippingCountry || 'IT',
      phone:   ao.shippingPhone,
    });

    const orderNumber = `AMZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail:   ao.buyerEmail  || 'amazon@zenova.ovh',
        customerName:    ao.shippingName || ao.buyerName || 'Cliente Amazon',
        customerPhone:   ao.shippingPhone || null,
        shippingAddress,
        subtotal:        ao.total,
        shippingCost:    0,
        total:           ao.total,
        paymentMethod:   'amazon',
        paymentStatus:   'paid',
        paidAt:          new Date(ao.createdAt || Date.now()),
        status:          'processing',
        source:          'amazon',
        amazonOrderId:   ao.amazonOrderId,
        items: {
          create: ao.items.map(item => ({
            sku:         item.sku  || item.asin || 'AMZ-ITEM',
            productName: item.title || 'Prodotto Amazon',
            unitPrice:   item.price,
            quantity:    item.quantity,
            totalPrice:  item.price * item.quantity,
          }))
        }
      }
    });

    logger.info(`AmazonOrderJob: ordine ${orderNumber} creato nel DB`);
    await this._forwardToAW(order, ao);
  }

  async _forwardToAW(order, ao) {
    try {
      const addr = JSON.parse(order.shippingAddress);

      // Costruisci lista prodotti AW dagli ASIN
      const awItems = [];
      for (const item of ao.items) {
        const mapping = ASIN_TO_AW[item.asin];
        if (!mapping || mapping.length === 0) {
          logger.warn(`AmazonOrderJob: ASIN ${item.asin} non mappato ad AW — skip`);
          continue;
        }
        for (const mapped of mapping) {
          awItems.push({
            portfolioId: mapped.sku,
            quantity:    mapped.quantity * item.quantity,
          });
        }
      }

      if (awItems.length === 0) {
        throw new Error('Nessun prodotto AW mappato per questo ordine');
      }

      // Crea/trova cliente AW
      const clientData = {
        name:    addr.name || order.customerName || 'Cliente Amazon',
        email:   order.customerEmail || 'amazon@zenova.ovh',
        phone:   addr.phone || '0000000000',
        address: {
          street:       addr.street || '',
          addressLine1: addr.street || '',
          city:         addr.city || '',
          postalCode:   addr.zip  || '',
          country:      addr.country || 'IT',
        }
      };

      const awClient = await awDropship.createClient(clientData);
      const awClientId = awClient?.id;
      if (!awClientId) throw new Error('createClient AW fallito');

      const awResult = await awDropship.createOrder({
        customerClientId: awClientId,
        items: awItems,
        deliveryAddress: {
          street:     addr.street || '',
          city:       addr.city   || '',
          postalCode: addr.zip    || '',
          country:    addr.country || 'IT',
        }
      });

      const awOrderId = awResult?.id || awResult?.reference;
      if (!awOrderId) throw new Error('createOrder AW fallito');

      await prisma.order.update({
        where: { id: order.id },
        data: {
          awOrderId: String(awOrderId),
          awStatus:  'processing',
          awSentAt:  new Date(),
        }
      });

      logger.info(`AmazonOrderJob: ordine ${order.orderNumber} inoltrato ad AW → ${awOrderId}`);

      // Email conferma al cliente
      if (order.customerEmail && !order.customerEmail.includes('amazon@')) {
        await emailService.sendOrderConfirmationEmail(order).catch(() => {});
      }

    } catch (err) {
      logger.error(`AmazonOrderJob: errore inoltro AW ${order.orderNumber}: ${err.message}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { supplierError: err.message }
      });
    }
  }

  /**
   * Per ordini già spediti da AW, conferma tracking su Amazon
   */
  async _syncTrackingToAmazon() {
    const orders = await prisma.order.findMany({
      where: {
        source:                'amazon',
        amazonOrderId:         { not: null },
        amazonTrackingSent:    false,
        awStatus:              'shipped',
      },
      include: { shipment: true, items: true }
    });

    if (orders.length === 0) return;
    logger.info(`AmazonOrderJob: ${orders.length} ordini con tracking da confermare su Amazon`);

    for (const order of orders) {
      try {
        const tracking = order.shipment?.trackingNumber;
        const carrier  = order.shipment?.carrier || 'Other';
        if (!tracking) continue;

        // Recupera gli orderItemId dal DB (salvati al momento dell'ordine)
        const itemsForShipment = order.items.map(i => ({
          orderItemId: i.amazonOrderItemId || i.sku,
          quantity:    i.quantity,
        }));

        const ok = await amazonClient.confirmShipment(
          order.amazonOrderId,
          itemsForShipment,
          tracking,
          carrier
        );

        if (ok) {
          await prisma.order.update({
            where: { id: order.id },
            data: { amazonTrackingSent: true }
          });
          logger.info(`AmazonOrderJob: tracking ${tracking} confermato su Amazon per ${order.orderNumber}`);
        }
      } catch (err) {
        logger.error(`AmazonOrderJob: errore sync tracking ${order.orderNumber}: ${err.message}`);
      }
      await this._delay(1000);
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AmazonOrderJob();
