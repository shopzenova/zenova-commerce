const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// POST /webhook/stripe - Webhook Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    logger.info('Webhook Stripe ricevuto');
    // TODO: Implementare dopo setup Stripe
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Errore webhook/stripe:', error);
    res.status(400).send('Webhook Error');
  }
});

// POST /webhook/bigbuy - Webhook BigBuy
router.post('/bigbuy', async (req, res) => {
  try {
    logger.info('Webhook BigBuy ricevuto:', req.body);
    // TODO: Gestire eventi BigBuy (order.shipped, order.delivered)
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Errore webhook/bigbuy:', error);
    res.status(400).send('Webhook Error');
  }
});

module.exports = router;
