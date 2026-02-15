/**
 * ORDER STATUS JOB
 * Controlla periodicamente lo stato degli ordini presso i fornitori (BigBuy + AW)
 *
 * Flusso:
 * 1. Cerca ordini con status "processing" che hanno un supplier order ID
 * 2. Per ogni ordine controlla lo stato presso il fornitore
 * 3. Quando il fornitore spedisce: crea/aggiorna Shipment + email tracking al cliente
 * 4. Quando il fornitore consegna: aggiorna Shipment + email consegna al cliente
 * 5. Gestisce errori senza bloccare il ciclo
 */

const { PrismaClient } = require('@prisma/client');
const bigbuy = require('../integrations/BigBuyClient');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const awDropship = new AWDropshipClient();

// Mappatura stati BigBuy → stato interno
const BIGBUY_STATUS_MAP = {
  'processing': 'processing',
  'shipped': 'shipped',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'in transit': 'shipped',
  'in_transit': 'shipped',
  'completed': 'delivered'
};

// Mappatura stati AW → stato interno
const AW_STATUS_MAP = {
  'creating': 'processing',
  'submitted': 'processing',
  'in-process': 'processing',
  'in_warehouse': 'processing',
  'in-warehouse': 'processing',
  'manual_required': 'processing',
  'dispatched': 'shipped',
  'shipped': 'shipped',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'completed': 'delivered'
};

class OrderStatusJob {

  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    // Intervallo configurabile via env (default 15 minuti)
    this.intervalMs = parseInt(process.env.ORDER_STATUS_CHECK_INTERVAL_MS) || 15 * 60 * 1000;
  }

  /**
   * Avvia il job periodico
   */
  start() {
    if (this.intervalId) {
      logger.warn('OrderStatusJob: gia\' in esecuzione, skip');
      return;
    }

    logger.info(`OrderStatusJob: avviato (intervallo: ${this.intervalMs / 1000}s)`);

    // Esegui subito al primo avvio (con ritardo di 30s per far partire il server)
    setTimeout(() => this.run(), 30000);

    // Poi esegui periodicamente
    this.intervalId = setInterval(() => this.run(), this.intervalMs);
  }

  /**
   * Ferma il job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('OrderStatusJob: fermato');
    }
  }

  /**
   * Esegue un ciclo di controllo stato
   */
  async run() {
    if (this.isRunning) {
      logger.info('OrderStatusJob: ciclo precedente ancora in corso, skip');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('OrderStatusJob: inizio controllo stato ordini...');

      // Cerca ordini attivi con supplier ID
      const orders = await prisma.order.findMany({
        where: {
          status: { in: ['processing', 'shipped'] },
          OR: [
            { bigbuyOrderId: { not: null } },
            { awOrderId: { not: null } }
          ]
        },
        include: {
          items: true,
          shipment: true
        }
      });

      if (orders.length === 0) {
        logger.info('OrderStatusJob: nessun ordine da controllare');
        return;
      }

      logger.info(`OrderStatusJob: ${orders.length} ordini da controllare`);

      let checked = 0;
      let updated = 0;
      let errors = 0;

      for (const order of orders) {
        try {
          const wasUpdated = await this._checkOrder(order);
          checked++;
          if (wasUpdated) updated++;
        } catch (error) {
          errors++;
          logger.error(`OrderStatusJob: errore ordine ${order.orderNumber}: ${error.message}`);
        }

        // Pausa tra ogni ordine per rispettare rate limits
        await this._delay(3000);
      }

      const durationMs = Date.now() - startTime;
      logger.info(`OrderStatusJob: completato in ${durationMs}ms — ${checked} controllati, ${updated} aggiornati, ${errors} errori`);

    } catch (error) {
      logger.error(`OrderStatusJob: errore fatale: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Controlla stato di un singolo ordine
   * @returns {boolean} true se l'ordine e' stato aggiornato
   */
  async _checkOrder(order) {
    let updated = false;

    // Controlla BigBuy
    if (order.bigbuyOrderId && order.bigbuyStatus !== 'delivered') {
      const bbUpdated = await this._checkBigBuyOrder(order);
      if (bbUpdated) updated = true;
    }

    // Controlla AW
    if (order.awOrderId && order.awStatus !== 'delivered' && order.awStatus !== 'manual_required') {
      const awUpdated = await this._checkAWOrder(order);
      if (awUpdated) updated = true;
    }

    return updated;
  }

  /**
   * Controlla stato ordine BigBuy
   */
  async _checkBigBuyOrder(order) {
    try {
      // Ottieni stato ordine
      const bbOrder = await bigbuy.getOrder(order.bigbuyOrderId);
      if (!bbOrder) return false;

      const rawStatus = (bbOrder.status || bbOrder.state || '').toLowerCase();
      const mappedStatus = BIGBUY_STATUS_MAP[rawStatus] || rawStatus;

      // Se lo stato non e' cambiato, skip
      if (mappedStatus === order.bigbuyStatus) return false;

      logger.info(`OrderStatusJob: BigBuy ordine ${order.orderNumber} stato: ${order.bigbuyStatus} -> ${mappedStatus}`);

      // Aggiorna stato nel DB
      const updateData = { bigbuyStatus: mappedStatus };

      // Se spedito o consegnato, aggiorna anche lo stato ordine principale
      if (mappedStatus === 'shipped' && order.status !== 'shipped') {
        updateData.status = 'shipped';
      } else if (mappedStatus === 'delivered') {
        // Se non ci sono anche ordini AW pendenti, segna come completato
        if (!order.awOrderId || order.awStatus === 'delivered') {
          updateData.status = 'delivered';
        }
      } else if (mappedStatus === 'cancelled') {
        updateData.status = 'cancelled';
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData
      });

      // Se spedito, cerca tracking e crea shipment
      if (mappedStatus === 'shipped') {
        await this._handleBigBuyShipping(order);
      }

      // Se consegnato, aggiorna shipment
      if (mappedStatus === 'delivered') {
        await this._handleDelivery(order);
      }

      return true;

    } catch (error) {
      logger.error(`OrderStatusJob: errore BigBuy check ordine ${order.orderNumber}: ${error.message}`);
      return false;
    }
  }

  /**
   * Controlla stato ordine AW
   */
  async _checkAWOrder(order) {
    try {
      let awOrder = await awDropship.getOrder(order.awOrderId);

      // Fallback: se getOrder fallisce, cerca nella lista ordini
      if (!awOrder) {
        logger.warn(`OrderStatusJob: getOrder(${order.awOrderId}) null, provo listOrders`);
        const allOrders = await awDropship.listOrders();
        awOrder = allOrders.find(o => String(o.id) === String(order.awOrderId));
      }

      if (!awOrder) return false;

      const rawStatus = (awOrder.state || awOrder.status || '').toLowerCase();
      const mappedStatus = AW_STATUS_MAP[rawStatus] || rawStatus;

      if (mappedStatus === order.awStatus) return false;

      logger.info(`OrderStatusJob: AW ordine ${order.orderNumber} stato: ${order.awStatus} -> ${mappedStatus}`);

      const updateData = { awStatus: mappedStatus };

      if (mappedStatus === 'shipped' && order.status !== 'shipped') {
        updateData.status = 'shipped';
      } else if (mappedStatus === 'delivered') {
        if (!order.bigbuyOrderId || order.bigbuyStatus === 'delivered') {
          updateData.status = 'delivered';
        }
      } else if (mappedStatus === 'cancelled') {
        updateData.status = 'cancelled';
      }

      await prisma.order.update({
        where: { id: order.id },
        data: updateData
      });

      // Se spedito, gestisci tracking AW
      if (mappedStatus === 'shipped') {
        await this._handleAWShipping(order, awOrder);
      }

      if (mappedStatus === 'delivered') {
        await this._handleDelivery(order);
      }

      return true;

    } catch (error) {
      logger.error(`OrderStatusJob: errore AW check ordine ${order.orderNumber}: ${error.message}`);
      return false;
    }
  }

  /**
   * Gestisce spedizione BigBuy: recupera tracking e crea Shipment
   */
  async _handleBigBuyShipping(order) {
    try {
      const tracking = await bigbuy.getOrderTracking(order.bigbuyOrderId);
      if (!tracking) return;

      const trackingNumber = tracking.trackingNumber || tracking.tracking_number || null;
      const carrier = tracking.carrier?.name || tracking.carrierName || 'Corriere';
      const shippedAt = tracking.shippedAt ? new Date(tracking.shippedAt) : new Date();
      const estimatedDelivery = tracking.estimatedDelivery ? new Date(tracking.estimatedDelivery) : null;

      // Crea o aggiorna Shipment
      await prisma.shipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          trackingNumber,
          carrier,
          shippedAt,
          estimatedDelivery,
          status: 'shipped'
        },
        update: {
          trackingNumber,
          carrier,
          shippedAt,
          estimatedDelivery,
          status: 'shipped'
        }
      });

      // Invia email tracking se non gia' inviata
      if (trackingNumber && (!order.shipment || !order.shipment.trackingEmailSent)) {
        const emailSent = await emailService.sendTrackingEmail(order, trackingNumber, carrier);
        if (emailSent) {
          await prisma.shipment.update({
            where: { orderId: order.id },
            data: { trackingEmailSent: true }
          });
          logger.info(`OrderStatusJob: email tracking inviata per ordine ${order.orderNumber}`);
        }
      }

    } catch (error) {
      logger.error(`OrderStatusJob: errore gestione shipping BigBuy ${order.orderNumber}: ${error.message}`);
    }
  }

  /**
   * Gestisce spedizione AW: estrae tracking dalla risposta AW
   */
  async _handleAWShipping(order, awOrder) {
    try {
      const trackingNumber = awOrder.tracking_number || awOrder.trackingNumber || null;
      const carrier = awOrder.carrier || awOrder.shipping_provider || 'Corriere';
      const shippedAt = awOrder.dispatched_at ? new Date(awOrder.dispatched_at) : new Date();

      await prisma.shipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          trackingNumber,
          carrier,
          shippedAt,
          status: 'shipped'
        },
        update: {
          trackingNumber,
          carrier,
          shippedAt,
          status: 'shipped'
        }
      });

      if (trackingNumber && (!order.shipment || !order.shipment.trackingEmailSent)) {
        const emailSent = await emailService.sendTrackingEmail(order, trackingNumber, carrier);
        if (emailSent) {
          await prisma.shipment.update({
            where: { orderId: order.id },
            data: { trackingEmailSent: true }
          });
          logger.info(`OrderStatusJob: email tracking inviata per ordine ${order.orderNumber}`);
        }
      }

    } catch (error) {
      logger.error(`OrderStatusJob: errore gestione shipping AW ${order.orderNumber}: ${error.message}`);
    }
  }

  /**
   * Gestisce consegna: aggiorna Shipment e invia email consegna
   */
  async _handleDelivery(order) {
    try {
      // Aggiorna shipment
      const shipment = await prisma.shipment.findUnique({
        where: { orderId: order.id }
      });

      if (shipment) {
        await prisma.shipment.update({
          where: { orderId: order.id },
          data: {
            status: 'delivered',
            deliveredAt: new Date()
          }
        });

        // Invia email consegna se non gia' inviata
        if (!shipment.deliveryEmailSent) {
          const emailSent = await emailService.sendDeliveryEmail(order);
          if (emailSent) {
            await prisma.shipment.update({
              where: { orderId: order.id },
              data: { deliveryEmailSent: true }
            });
            logger.info(`OrderStatusJob: email consegna inviata per ordine ${order.orderNumber}`);
          }
        }
      }

    } catch (error) {
      logger.error(`OrderStatusJob: errore gestione delivery ${order.orderNumber}: ${error.message}`);
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new OrderStatusJob();
