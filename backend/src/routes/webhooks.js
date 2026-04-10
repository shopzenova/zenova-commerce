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

// GET /webhook/ebay-deletion - Verifica endpoint eBay (challenge)
router.get('/ebay-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;
  if (!challengeCode) return res.status(400).json({ error: 'Missing challenge_code' });
  const crypto = require('crypto');
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN || 'zenova-ebay-verification-token-2026';
  const endpoint = process.env.EBAY_DELETION_ENDPOINT || 'https://zenova-backend.up.railway.app/webhook/ebay-deletion';
  const hash = crypto.createHash('sha256')
    .update(challengeCode + verificationToken + endpoint)
    .digest('hex');
  res.json({ challengeResponse: hash });
});

// POST /webhook/ebay-deletion - Notifiche cancellazione account eBay
router.post('/ebay-deletion', async (req, res) => {
  try {
    logger.info('eBay account deletion notification:', JSON.stringify(req.body));
    // Notiamo la richiesta — non salviamo dati utenti eBay quindi nessuna azione richiesta
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Errore webhook/ebay-deletion:', error);
    res.status(400).send('Webhook Error');
  }
});

module.exports = router;
