const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// TODO: Implementare dopo setup database

// GET /api/orders/:id - Dettaglio ordine
router.get('/:id', async (req, res) => {
  try {
    res.json({
      success: false,
      message: 'Orders non ancora implementato - da fare con database'
    });
  } catch (error) {
    logger.error('Errore /api/orders/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero ordine'
    });
  }
});

// GET /api/orders/:id/tracking - Tracking spedizione
router.get('/:id/tracking', async (req, res) => {
  try {
    res.json({
      success: false,
      message: 'Tracking non ancora implementato'
    });
  } catch (error) {
    logger.error('Errore /api/orders/:id/tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Errore tracking'
    });
  }
});

module.exports = router;
