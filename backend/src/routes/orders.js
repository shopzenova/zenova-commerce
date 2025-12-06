const express = require('express');
const router = express.Router();
const orderService = require('../services/OrderService');
const logger = require('../utils/logger');

// POST /api/orders - Crea nuovo ordine
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;

    // Validazione base
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ordine deve contenere almeno un prodotto'
      });
    }

    if (!orderData.shipping || !orderData.shipping.email) {
      return res.status(400).json({
        success: false,
        error: 'Email richiesta'
      });
    }

    // Crea ordine con formato compatibile con OrderService
    const order = orderService.createOrder({
      customer: {
        name: `${orderData.shipping.firstName || ''} ${orderData.shipping.lastName || ''}`.trim(),
        email: orderData.shipping.email,
        phone: orderData.shipping.phone || '',
        address: {
          street: orderData.shipping.address || '',
          city: orderData.shipping.city || '',
          postalCode: orderData.shipping.postalCode || '',
          country: orderData.shipping.country || ''
        }
      },
      items: orderData.items,
      totals: {
        subtotal: orderData.total || 0,
        shipping: 0,
        total: orderData.total || 0
      },
      payment: {
        method: orderData.paymentMethod || 'card',
        sessionId: orderData.paymentId || '',
        status: 'pending'
      },
      shipping: {},
      notes: orderData.shipping.notes || ''
    });

    logger.info(`✅ Ordine creato via API: ${order.id}`);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Ordine creato con successo'
    });
  } catch (error) {
    logger.error('Errore POST /api/orders:', error);
    res.status(500).json({
      success: false,
      error: 'Errore creazione ordine'
    });
  }
});

// GET /api/orders - Lista tutti gli ordini
router.get('/', async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const orders = orderService.getAllOrders({
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    logger.error('Errore GET /api/orders:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero ordini'
    });
  }
});

// GET /api/orders/stats - Statistiche ordini
router.get('/stats', async (req, res) => {
  try {
    const stats = orderService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Errore GET /api/orders/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero statistiche'
    });
  }
});

// GET /api/orders/:id - Dettaglio ordine
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Errore GET /api/orders/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero ordine'
    });
  }
});

// PATCH /api/orders/:id/status - Aggiorna stato ordine
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Stato richiesto'
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Stato non valido. Valori accettati: ${validStatuses.join(', ')}`
      });
    }

    const order = orderService.updateOrderStatus(id, status);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: order,
      message: `Ordine aggiornato a: ${status}`
    });
  } catch (error) {
    logger.error('Errore PATCH /api/orders/:id/status:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento stato'
    });
  }
});

// PATCH /api/orders/:id/tracking - Aggiorna tracking spedizione
router.patch('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    const trackingData = {};
    if (trackingNumber) trackingData.trackingNumber = trackingNumber;
    if (carrier) trackingData.carrier = carrier;
    if (estimatedDelivery) trackingData.estimatedDelivery = estimatedDelivery;

    const order = orderService.updateTracking(id, trackingData);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Tracking aggiornato'
    });
  } catch (error) {
    logger.error('Errore PATCH /api/orders/:id/tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento tracking'
    });
  }
});

// GET /api/orders/:id/tracking - Recupera info tracking
router.get('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const order = orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Ordine non trovato'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        shipping: order.shipping,
        estimatedDelivery: order.shipping.estimatedDelivery
      }
    });
  } catch (error) {
    logger.error('Errore GET /api/orders/:id/tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero tracking'
    });
  }
});

module.exports = router;
