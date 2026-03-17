/**
 * ORDER SERVICE - PostgreSQL con Prisma
 * Gestisce ordini persistenti nel database
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class OrderService {
  /**
   * Genera numero ordine unico (formato: ZN-timestamp-random)
   */
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ZN-${timestamp}-${random}`;
  }

  /**
   * Crea nuovo ordine
   * @param {Object} orderData - Dati ordine
   * @returns {Object} - Ordine creato
   */
  async createOrder(orderData) {
    try {
      const orderNumber = this.generateOrderNumber();

      // Prepara indirizzo come stringa JSON
      const shippingAddress = JSON.stringify({
        street: orderData.customer?.address?.street || '',
        city: orderData.customer?.address?.city || '',
        postalCode: orderData.customer?.address?.postalCode || '',
        province: orderData.customer?.address?.province || '',
        country: orderData.customer?.address?.country || 'IT'
      });

      // Crea ordine nel database
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerEmail: orderData.customer?.email || '',
          customerName: orderData.customer?.name || '',
          customerPhone: orderData.customer?.phone || '',
          shippingAddress,
          subtotal: orderData.totals?.subtotal || 0,
          shippingCost: orderData.totals?.shipping || 0,
          total: orderData.totals?.total || 0,
          vatAmount: orderData.totals?.vatAmount || null,
          paymentMethod: orderData.payment?.method || 'stripe',
          paymentStatus: orderData.payment?.status || 'pending',
          stripeSessionId: orderData.payment?.sessionId || null,
          status: 'pending',
          customerNotes: orderData.notes || null,
          items: {
            create: (orderData.items || []).map(item => ({
              sku: item.productId || item.id || item.bigbuyId || '',
              productId: item.productId || item.id || null,
              productName: item.name || '',
              productImage: item.image || (item.images && item.images[0]) || null,
              unitPrice: item.price || 0,
              quantity: item.quantity || 1,
              totalPrice: (item.price || 0) * (item.quantity || 1),
              costPrice: item.wholesalePrice || null
            }))
          }
        },
        include: {
          items: true
        }
      });

      logger.info(`✅ Ordine creato: ${orderNumber} - Cliente: ${order.customerEmail}`);

      // Ritorna in formato compatibile con vecchio sistema
      return this.formatOrderForAPI(order);

    } catch (error) {
      logger.error('Errore creazione ordine:', error);
      throw error;
    }
  }

  /**
   * Recupera tutti gli ordini
   * @param {Object} filters - Filtri opzionali (status, limit, offset, email)
   * @returns {Array} - Lista ordini
   */
  async getAllOrders(filters = {}) {
    try {
      const where = {
        paidAt: { not: null } // Mostra solo ordini con pagamento completato
      };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.email) {
        where.customerEmail = filters.email;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
          shipment: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: filters.offset || 0,
        take: filters.limit || 100
      });

      return orders.map(order => this.formatOrderForAPI(order));

    } catch (error) {
      logger.error('Errore recupero ordini:', error);
      return [];
    }
  }

  /**
   * Recupera ordine per ID (supporta sia ID numerico che orderNumber)
   * @param {string|number} orderId - ID ordine o orderNumber
   * @returns {Object|null} - Ordine o null
   */
  async getOrderById(orderId) {
    try {
      let order;

      // Se è un numero, cerca per id
      if (!isNaN(orderId)) {
        order = await prisma.order.findUnique({
          where: { id: parseInt(orderId) },
          include: { items: true, shipment: true }
        });
      }

      // Se non trovato o è stringa, cerca per orderNumber
      if (!order) {
        order = await prisma.order.findUnique({
          where: { orderNumber: String(orderId) },
          include: { items: true, shipment: true }
        });
      }

      return order ? this.formatOrderForAPI(order) : null;

    } catch (error) {
      logger.error('Errore recupero ordine:', error);
      return null;
    }
  }

  /**
   * Aggiorna stato ordine
   * @param {string|number} orderId - ID ordine
   * @param {string} status - Nuovo stato
   * @returns {Object|null} - Ordine aggiornato o null
   */
  async updateOrderStatus(orderId, status) {
    try {
      const existingOrder = await this.getOrderById(orderId);
      if (!existingOrder) return null;

      const updateData = { status };

      // Se stato è "processing", aggiorna anche paymentStatus
      if (status === 'processing') {
        updateData.paymentStatus = 'paid';
        updateData.paidAt = new Date();
      }

      const order = await prisma.order.update({
        where: { orderNumber: existingOrder.id },
        data: updateData,
        include: { items: true, shipment: true }
      });

      logger.info(`📝 Ordine ${order.orderNumber} aggiornato: ${status}`);
      return this.formatOrderForAPI(order);

    } catch (error) {
      logger.error('Errore aggiornamento stato ordine:', error);
      return null;
    }
  }

  /**
   * Aggiorna tracking spedizione
   * @param {string|number} orderId - ID ordine
   * @param {Object} trackingData - Dati tracking
   * @returns {Object|null} - Ordine aggiornato o null
   */
  async updateTracking(orderId, trackingData) {
    try {
      const existingOrder = await this.getOrderById(orderId);
      if (!existingOrder) return null;

      // Trova l'ordine reale nel database
      const dbOrder = await prisma.order.findUnique({
        where: { orderNumber: existingOrder.id }
      });

      if (!dbOrder) return null;

      // Crea o aggiorna shipment
      await prisma.shipment.upsert({
        where: { orderId: dbOrder.id },
        update: {
          trackingNumber: trackingData.trackingNumber || null,
          carrier: trackingData.carrier || null,
          estimatedDelivery: trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery) : null,
          shippedAt: trackingData.trackingNumber ? new Date() : null,
          status: trackingData.trackingNumber ? 'shipped' : 'pending'
        },
        create: {
          orderId: dbOrder.id,
          trackingNumber: trackingData.trackingNumber || null,
          carrier: trackingData.carrier || null,
          estimatedDelivery: trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery) : null,
          shippedAt: trackingData.trackingNumber ? new Date() : null,
          status: trackingData.trackingNumber ? 'shipped' : 'pending'
        }
      });

      // Se c'è tracking, aggiorna stato ordine a shipped
      if (trackingData.trackingNumber) {
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: { status: 'shipped' }
        });
      }

      logger.info(`📦 Tracking aggiornato per ordine ${existingOrder.id}`);

      return this.getOrderById(orderId);

    } catch (error) {
      logger.error('Errore aggiornamento tracking:', error);
      return null;
    }
  }

  /**
   * Statistiche ordini
   * @returns {Object} - Statistiche
   */
  async getStats() {
    try {
      const [
        total,
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
        revenueResult
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'pending' } }),
        prisma.order.count({ where: { status: 'processing' } }),
        prisma.order.count({ where: { status: 'shipped' } }),
        prisma.order.count({ where: { status: 'delivered' } }),
        prisma.order.count({ where: { status: 'cancelled' } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            paymentStatus: 'paid',
            status: { not: 'cancelled' }
          }
        })
      ]);

      const totalRevenue = parseFloat(revenueResult._sum.total || 0);
      const paidOrders = processing + shipped + delivered;

      return {
        total,
        byStatus: {
          pending,
          processing,
          shipped,
          delivered,
          cancelled
        },
        totalRevenue,
        averageOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0
      };

    } catch (error) {
      logger.error('Errore statistiche ordini:', error);
      return {
        total: 0,
        byStatus: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }
  }

  /**
   * Formatta ordine dal database per API (compatibilità con vecchio sistema)
   */
  formatOrderForAPI(order) {
    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(order.shippingAddress || '{}');
    } catch (e) {
      shippingAddress = { raw: order.shippingAddress };
    }

    return {
      id: order.orderNumber,
      dbId: order.id,
      status: order.status,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone || '',
        address: shippingAddress
      },
      items: (order.items || []).map(item => ({
        productId: item.productId || item.sku,
        sku: item.sku,
        name: item.productName,
        price: parseFloat(item.unitPrice),
        quantity: item.quantity,
        image: item.productImage
      })),
      totals: {
        subtotal: parseFloat(order.subtotal),
        shipping: parseFloat(order.shippingCost),
        total: parseFloat(order.total),
        vatAmount: order.vatAmount ? parseFloat(order.vatAmount) : null
      },
      payment: {
        method: order.paymentMethod,
        sessionId: order.stripeSessionId || '',
        status: order.paymentStatus,
        paidAt: order.paidAt
      },
      shipping: {
        carrier: order.shipment?.carrier || '',
        trackingNumber: order.shipment?.trackingNumber || '',
        estimatedDelivery: order.shipment?.estimatedDelivery || '',
        status: order.shipment?.status || 'pending'
      },
      notes: order.customerNotes || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };
  }
}

// Esporta istanza singleton
module.exports = new OrderService();
