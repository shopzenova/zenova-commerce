/**
 * EBAY ORDER JOB
 * Polling ordini eBay → inoltro AW → aggiornamento tracking
 *
 * Flusso:
 * 1. Ogni 20 minuti: chiama eBay GetOrders per ordini completati/pagati
 * 2. Per ogni nuovo ordine: salva nel DB + inoltra ad AW Dropship
 * 3. Ogni ciclo: controlla ordini eBay con awStatus=shipped → aggiorna tracking su eBay
 */

const { PrismaClient } = require('@prisma/client');
const ebayClient = require('../integrations/EbayClient');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const awDropship = new AWDropshipClient();

// Intervallo polling (default 20 minuti)
const POLL_INTERVAL_MS = parseInt(process.env.EBAY_POLL_INTERVAL_MS) || 20 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING eBay ItemID → codice AW
// Usato quando il Custom Label del listing non è impostato al codice AW
// Aggiornare ogni volta che si aggiunge un nuovo listing eBay
// ─────────────────────────────────────────────────────────────────────────────
const EBAY_ITEM_TO_AW = {
  // Candele Zodiaco
  '298209462210': 'ZCC-07', // Leone
  // TODO: aggiungere ItemID degli altri listing eBay
  // '1234567890': 'aw-zcc-01', // Acquario
  // '1234567891': 'aw-zcc-02', // Pesci
  // ecc.
};
// Finestra ordini: ultimi 2 giorni (per non perdere ordini se il server era down)
const ORDER_WINDOW_HOURS = 48;

class EbayOrderJob {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.intervalId) {
      logger.warn('EbayOrderJob: già in esecuzione');
      return;
    }
    logger.info(`EbayOrderJob: avviato (intervallo: ${POLL_INTERVAL_MS / 1000}s)`);

    // Prima esecuzione dopo 60s dall'avvio server
    setTimeout(() => this.run(), 60000);
    this.intervalId = setInterval(() => this.run(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('EbayOrderJob: fermato');
    }
  }

  async run() {
    if (this.isRunning) {
      logger.info('EbayOrderJob: ciclo precedente ancora in corso, skip');
      return;
    }
    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('EbayOrderJob: inizio ciclo...');

      // 1. Recupera nuovi ordini eBay
      await this._pollNewOrders();

      // 2. Aggiorna tracking su eBay per ordini già spediti da AW
      await this._syncTrackingToEbay();

      const ms = Date.now() - startTime;
      logger.info(`EbayOrderJob: ciclo completato in ${ms}ms`);
    } catch (err) {
      logger.error(`EbayOrderJob: errore fatale: ${err.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Recupera ordini eBay recenti e li processa
   */
  async _pollNewOrders() {
    const to   = new Date();
    const from = new Date(to.getTime() - ORDER_WINDOW_HOURS * 60 * 60 * 1000);

    const ebayOrders = await ebayClient.getOrders(from, to);
    logger.info(`EbayOrderJob: ${ebayOrders.length} ordini trovati su eBay`);

    for (const eo of ebayOrders) {
      try {
        await this._processOrder(eo);
      } catch (err) {
        logger.error(`EbayOrderJob: errore ordine eBay ${eo.ebayOrderId}: ${err.message}`);
      }
      await this._delay(2000);
    }
  }

  /**
   * Processa un singolo ordine eBay
   */
  async _processOrder(eo) {
    // Controlla se già esiste nel DB
    const existing = await prisma.order.findFirst({
      where: { ebayOrderId: eo.ebayOrderId }
    });
    if (existing) return; // già processato

    logger.info(`EbayOrderJob: nuovo ordine eBay ${eo.ebayOrderId} — ${eo.buyerName} €${eo.total}`);

    // Costruisci indirizzo di spedizione
    const shippingParts = [
      eo.shippingName,
      eo.shippingStreet,
      eo.shippingStreet2,
      eo.shippingCity,
      eo.shippingZip,
      eo.shippingCountry
    ].filter(Boolean);
    const shippingAddress = JSON.stringify({
      name:       eo.shippingName || eo.buyerName,
      street:     eo.shippingStreet,
      street2:    eo.shippingStreet2,
      city:       eo.shippingCity,
      zip:        eo.shippingZip,
      country:    eo.shippingCountry,
      phone:      eo.shippingPhone,
    });

    // Crea ordine nel DB
    const orderNumber = `EB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail:   eo.buyerEmail || 'ebay@zenova.ovh',
        customerName:    eo.buyerName  || 'Cliente eBay',
        customerPhone:   eo.shippingPhone || null,
        shippingAddress,
        subtotal:        eo.total,
        shippingCost:    0,
        total:           eo.total,
        paymentMethod:   'ebay',
        paymentStatus:   'paid',
        paidAt:          new Date(eo.createdAt || Date.now()),
        status:          'processing',
        source:          'ebay',
        ebayOrderId:     eo.ebayOrderId,
        items: {
          create: eo.items.map(item => ({
            sku:          item.sku || item.itemId || 'EBAY-ITEM',
            productName:  item.title || 'Prodotto eBay',
            unitPrice:    item.price,
            quantity:     item.quantity,
            totalPrice:   item.price * item.quantity,
          }))
        }
      }
    });

    logger.info(`EbayOrderJob: ordine ${orderNumber} creato nel DB`);

    // Inoltra ad AW Dropship
    await this._forwardToAW(order, eo);
  }

  /**
   * Inoltra ordine ad AW Dropship
   */
  async _forwardToAW(order, eo) {
    try {
      // Costruisci indirizzo per AW
      const addr = JSON.parse(order.shippingAddress);

      // Crea/trova cliente AW
      const clientData = {
        name:    addr.name || order.customerName || 'Cliente eBay',
        email:   order.customerEmail || 'ebay@zenova.ovh',
        phone:   addr.phone || '0000000000',
        address: {
          street:      addr.street || '',
          addressLine1: addr.street || '',
          city:        addr.city || '',
          postalCode:  addr.zip || '',
          country:     addr.country || 'IT',
        }
      };

      const awClient = await awDropship.createClient(clientData);
      const awClientId = awClient?.id;
      if (!awClientId) throw new Error('createClient AW fallito');

      // Costruisci items per AW
      // Priorità: 1) Custom Label (SKU eBay = codice AW) 2) Mapping ItemID → AW
      const awItems = eo.items
        .map(i => {
          const awSku = i.sku && !i.sku.match(/^\d+$/)
            ? i.sku                          // Custom Label = codice AW
            : EBAY_ITEM_TO_AW[i.sku]         // fallback: mapping ItemID
              || EBAY_ITEM_TO_AW[i.itemId];  // fallback: mapping ItemID diretto
          return awSku ? { portfolioId: awSku, quantity: i.quantity } : null;
        })
        .filter(Boolean);

      if (awItems.length === 0) {
        throw new Error('Nessun item con SKU valido per AW');
      }

      const awResult = await awDropship.createOrder({
        customerClientId: awClientId,
        items: awItems,
        deliveryAddress: {
          street:      addr.street || '',
          city:        addr.city || '',
          postalCode:  addr.zip || '',
          country:     addr.country || 'IT',
        }
      });

      const awOrderId = awResult?.id || awResult?.reference;
      if (!awOrderId) throw new Error('createOrder AW fallito');

      await prisma.order.update({
        where: { id: order.id },
        data: {
          awOrderId:  String(awOrderId),
          awStatus:   'processing',
          awSentAt:   new Date(),
        }
      });

      logger.info(`EbayOrderJob: ordine ${order.orderNumber} inoltrato ad AW → ${awOrderId}`);

      // Email conferma al cliente (se email valida)
      if (order.customerEmail && !order.customerEmail.includes('ebay@')) {
        await emailService.sendOrderConfirmationEmail(order).catch(() => {});
      }

    } catch (err) {
      logger.error(`EbayOrderJob: errore inoltro AW ordine ${order.orderNumber}: ${err.message}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { supplierError: err.message }
      });
    }
  }

  /**
   * Per gli ordini eBay già spediti da AW, aggiorna il tracking su eBay
   */
  async _syncTrackingToEbay() {
    const orders = await prisma.order.findMany({
      where: {
        source:          'ebay',
        ebayOrderId:     { not: null },
        ebayTrackingSent: false,
        awStatus:        'shipped',
      },
      include: { shipment: true }
    });

    if (orders.length === 0) return;
    logger.info(`EbayOrderJob: ${orders.length} ordini con tracking da sincronizzare su eBay`);

    for (const order of orders) {
      try {
        const tracking = order.shipment?.trackingNumber;
        const carrier  = order.shipment?.carrier || 'Other';
        if (!tracking) continue;

        const ok = await ebayClient.updateTracking(order.ebayOrderId, tracking, carrier);
        if (ok) {
          await prisma.order.update({
            where: { id: order.id },
            data: { ebayTrackingSent: true }
          });
          logger.info(`EbayOrderJob: tracking ${tracking} inviato a eBay per ordine ${order.orderNumber}`);
        }
      } catch (err) {
        logger.error(`EbayOrderJob: errore sync tracking ${order.orderNumber}: ${err.message}`);
      }
      await this._delay(1000);
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new EbayOrderJob();
