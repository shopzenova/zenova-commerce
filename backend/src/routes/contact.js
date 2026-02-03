const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

// Validazione campi
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isLength({ max: 100 }).withMessage('Il nome non può superare 100 caratteri'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Inserisci un indirizzo email valido')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty().withMessage('L\'oggetto è obbligatorio')
    .isLength({ max: 200 }).withMessage('L\'oggetto non può superare 200 caratteri'),
  body('message')
    .trim()
    .notEmpty().withMessage('Il messaggio è obbligatorio')
    .isLength({ max: 5000 }).withMessage('Il messaggio non può superare 5000 caratteri'),
];

// POST /api/contact
router.post('/', contactValidation, async (req, res) => {
  // Controlla errori validazione
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg)
    });
  }

  const { name, email, subject, message } = req.body;

  try {
    logger.info(`📩 Nuovo messaggio contatto da ${name} <${email}> - Oggetto: ${subject}`);

    const sent = await emailService.sendContactForm({ name, email, subject, message });

    if (!sent) {
      logger.error('❌ Errore invio email contatto');
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'invio del messaggio. Riprova più tardi.'
      });
    }

    logger.info(`✅ Email contatto inviata con successo da ${email}`);

    res.json({
      success: true,
      message: 'Messaggio inviato con successo! Ti risponderemo al più presto.'
    });

  } catch (error) {
    logger.error('❌ Errore route /api/contact:', error.message);
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'invio del messaggio. Riprova più tardi.'
    });
  }
});

module.exports = router;
