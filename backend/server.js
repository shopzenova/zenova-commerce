require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

// Sicurezza
app.use(helmet());

// CORS - permetti richieste dal frontend Zenova
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - max 100 richieste per 15 minuti
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Troppi tentativi, riprova tra 15 minuti'
});
app.use('/api/', limiter);

// Logging richieste
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes (da implementare)
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/checkout', require('./src/routes/checkout'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/webhook', require('./src/routes/webhooks'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trovata' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Errore del server'
      : err.message
  });
});

// ===== START SERVER =====

app.listen(PORT, () => {
  logger.info(`🚀 Server Zenova avviato su porta ${PORT}`);
  logger.info(`📝 Ambiente: ${process.env.NODE_ENV}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
