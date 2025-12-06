const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class OrderService {
  constructor() {
    this.ordersFile = path.join(__dirname, '..', '..', 'data', 'orders.json');
    this.ensureDataDirectory();
    this.loadOrders();
  }

  /**
   * Assicura che la directory data esista
   */
  ensureDataDirectory() {
    const dataDir = path.dirname(this.ordersFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info('📁 Directory data creata');
    }
  }

  /**
   * Carica ordini da file
   */
  loadOrders() {
    try {
      if (fs.existsSync(this.ordersFile)) {
        const data = fs.readFileSync(this.ordersFile, 'utf8');
        this.orders = JSON.parse(data);
        logger.info(`📦 Caricati ${this.orders.length} ordini`);
      } else {
        this.orders = [];
        this.saveOrders();
        logger.info('📦 File ordini creato');
      }
    } catch (error) {
      logger.error('Errore caricamento ordini:', error);
      this.orders = [];
    }
  }

  /**
   * Salva ordini su file
   */
  saveOrders() {
    try {
      fs.writeFileSync(this.ordersFile, JSON.stringify(this.orders, null, 2));
      logger.info(`💾 Salvati ${this.orders.length} ordini`);
    } catch (error) {
      logger.error('Errore salvataggio ordini:', error);
      throw error;
    }
  }

  /**
   * Genera ID ordine unico
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ZN-${timestamp}-${random}`;
  }

  /**
   * Crea nuovo ordine
   * @param {Object} orderData - Dati ordine
   * @returns {Object} - Ordine creato
   */
  createOrder(orderData) {
    const order = {
      id: this.generateOrderId(),
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      customer: {
        name: orderData.customer.name || '',
        email: orderData.customer.email,
        phone: orderData.customer.phone || '',
        address: orderData.customer.address || {}
      },
      items: orderData.items.map(item => ({
        productId: item.productId || item.id,
        bigbuyId: item.bigbuyId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || (item.images && item.images[0])
      })),
      totals: {
        subtotal: orderData.totals?.subtotal || 0,
        shipping: orderData.totals?.shipping || 0,
        total: orderData.totals?.total || 0
      },
      payment: {
        method: orderData.payment?.method || 'stripe',
        sessionId: orderData.payment?.sessionId || '',
        status: orderData.payment?.status || 'pending'
      },
      shipping: {
        carrier: orderData.shipping?.carrier || '',
        trackingNumber: orderData.shipping?.trackingNumber || '',
        estimatedDelivery: orderData.shipping?.estimatedDelivery || ''
      },
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(order); // Aggiungi all'inizio
    this.saveOrders();

    logger.info(`✅ Ordine creato: ${order.id} - Cliente: ${order.customer.email}`);
    return order;
  }

  /**
   * Recupera tutti gli ordini
   * @param {Object} filters - Filtri opzionali (status, limit, offset)
   * @returns {Array} - Lista ordini
   */
  getAllOrders(filters = {}) {
    let filtered = [...this.orders];

    // Filtra per stato
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    // Filtra per email cliente
    if (filters.email) {
      filtered = filtered.filter(o => o.customer.email === filters.email);
    }

    // Paginazione
    const offset = filters.offset || 0;
    const limit = filters.limit || filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * Recupera ordine per ID
   * @param {string} orderId - ID ordine
   * @returns {Object|null} - Ordine o null
   */
  getOrderById(orderId) {
    return this.orders.find(o => o.id === orderId) || null;
  }

  /**
   * Aggiorna stato ordine
   * @param {string} orderId - ID ordine
   * @param {string} status - Nuovo stato
   * @returns {Object|null} - Ordine aggiornato o null
   */
  updateOrderStatus(orderId, status) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.saveOrders();

    logger.info(`📝 Ordine ${orderId} aggiornato: ${status}`);
    return order;
  }

  /**
   * Aggiorna tracking spedizione
   * @param {string} orderId - ID ordine
   * @param {Object} trackingData - Dati tracking
   * @returns {Object|null} - Ordine aggiornato o null
   */
  updateTracking(orderId, trackingData) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.shipping = {
      ...order.shipping,
      ...trackingData
    };
    order.updatedAt = new Date().toISOString();
    this.saveOrders();

    logger.info(`📦 Tracking aggiornato per ordine ${orderId}`);
    return order;
  }

  /**
   * Statistiche ordini
   * @returns {Object} - Statistiche
   */
  getStats() {
    const stats = {
      total: this.orders.length,
      byStatus: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      },
      totalRevenue: 0,
      averageOrderValue: 0
    };

    this.orders.forEach(order => {
      stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
      stats.totalRevenue += order.totals.total;
    });

    stats.averageOrderValue = stats.total > 0
      ? stats.totalRevenue / stats.total
      : 0;

    return stats;
  }
}

module.exports = new OrderService();
