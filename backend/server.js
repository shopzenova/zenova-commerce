require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

// Sicurezza - Helmet con CSP configurato per development
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://cdnbigbuy.com"],
      connectSrc: ["'self'", "http://localhost:3000"],
    },
  },
}));

// CORS - permetti richieste dal frontend Zenova
app.use(cors({
  origin: function(origin, callback) {
    // Permetti sempre origin = null (file:// locale) o development
    if (!origin) {
      callback(null, true);
      return;
    }

    // Permetti tutte le porte localhost in development
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // Production: solo FRONTEND_URL specificato
    if (process.env.NODE_ENV === 'production' && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Serve file statici del frontend (dalla directory parent)
// Aggiungi header CORS per tutti i file statici
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, filePath) => {
    // Permetti CORS per immagini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ===== ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Image proxy endpoint for AW images (to bypass 403 Forbidden)
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    const https = require('https');
    const http = require('http');
    const url = require('url');

    const parsedUrl = url.parse(imageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.aroma-zone.com/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    };

    const proxyReq = client.get(options, (proxyRes) => {
      // Forward status code
      res.status(proxyRes.statusCode);

      // Forward content type
      if (proxyRes.headers['content-type']) {
        res.set('Content-Type', proxyRes.headers['content-type']);
      }

      // Set CORS headers
      res.set('Access-Control-Allow-Origin', '*');

      // Stream image to client
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      logger.error('Image proxy error:', error);
      res.status(500).send('Failed to fetch image');
    });
  } catch (error) {
    logger.error('Image proxy error:', error);
    res.status(500).send('Failed to fetch image');
  }
});

// API routes
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/checkout', require('./src/routes/checkout'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/admin', require('./src/routes/admin'));  // Admin panel API
app.use('/api/admin/sync', require('./src/routes/admin-sync'));  // BigBuy FTP Sync
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
