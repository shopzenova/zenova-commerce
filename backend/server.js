require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./src/utils/logger');

// Force rebuild - 2026-01-06 RIPRISTINO URGENTE prodotti

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy per Railway/Vercel (necessario per rate-limit corretto)
app.set('trust proxy', 1);

// ===== MIDDLEWARE =====

// Sicurezza - Helmet con CSP configurato per development
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://js.stripe.com"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://cdnbigbuy.com", "https://img.icons8.com"],
      connectSrc: ["'self'", "http://localhost:3000", "https://zenova-commerce-production.up.railway.app", "https://www.paypal.com", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://www.paypal.com", "https://js.stripe.com"],
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

    // Production: permetti lista domini separati da virgola in FRONTEND_URL
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
        : [];

      // Permetti tutti i domini Vercel (*.vercel.app) per preview deployments
      const isVercelDomain = origin.includes('.vercel.app');

      if (allowedOrigins.includes(origin) || isVercelDomain) {
        callback(null, true);
      } else {
        logger.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - protezione API
// Limite generale: 500 richieste per 15 minuti (era 100 - troppo basso!)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Troppi tentativi, riprova tra qualche minuto' },
  standardHeaders: true,
  legacyHeaders: false,
  // Non limitare le richieste di prodotti/layout (frequenti e leggere)
  skip: (req) => {
    return req.path.startsWith('/api/products') && req.method === 'GET';
  }
});
app.use('/api/', limiter);

// Rate limiting più stretto solo per checkout/pagamenti (anti-abuse)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Troppi tentativi di pagamento, riprova tra qualche minuto' }
});
app.use('/api/checkout', paymentLimiter);
app.use('/api/stripe', paymentLimiter);
app.use('/api/paypal', paymentLimiter);

// Logging richieste
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Serve file statici del frontend (dalla directory parent)
// Aggiungi header CORS e CACHE per tutti i file statici
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '1y', // Cache 1 anno
  immutable: true,
  setHeaders: (res, filePath) => {
    // Permetti CORS per immagini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Cache aggressivo per immagini
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Cache medio per JS/CSS
    if (filePath.match(/\.(js|css)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
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

// ===== IMAGE PROXY CON CACHE IN MEMORIA =====
const https = require('https');
const http = require('http');
const url = require('url');

// Keep-alive agents per connessioni persistenti (molto più veloci)
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 20, timeout: 15000 });
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 20, timeout: 15000 });

// Cache in memoria per immagini (max 200MB, TTL 2 ore)
const imageCache = new Map();
const IMAGE_CACHE_MAX_SIZE = 200 * 1024 * 1024; // 200MB
const IMAGE_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 ore
let imageCacheSize = 0;

// Deduplicazione richieste in-flight (se stessa immagine richiesta più volte, fetch una sola volta)
const pendingRequests = new Map();

function evictOldestCache() {
  if (imageCache.size === 0) return;
  const oldest = imageCache.keys().next().value;
  const entry = imageCache.get(oldest);
  if (entry) {
    imageCacheSize -= entry.data.length;
    imageCache.delete(oldest);
  }
}

// Image proxy endpoint for AW images (to bypass 403 Forbidden)
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  // CORS + Cache headers (sempre, anche da cache)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());

  // 1. Controlla cache in memoria
  const cached = imageCache.get(imageUrl);
  if (cached && (Date.now() - cached.timestamp < IMAGE_CACHE_TTL)) {
    res.set('Content-Type', cached.contentType);
    res.set('X-Cache', 'HIT');
    return res.status(200).send(cached.data);
  }

  // 2. Controlla se c'è già una richiesta in-flight per questa URL
  if (pendingRequests.has(imageUrl)) {
    try {
      const result = await pendingRequests.get(imageUrl);
      res.set('Content-Type', result.contentType);
      res.set('X-Cache', 'DEDUP');
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(502).send('Failed to fetch image');
    }
  }

  // 3. Fetch dall'origine
  const fetchPromise = new Promise((resolve, reject) => {
    try {
      const parsedUrl = url.parse(imageUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: 'GET',
        agent: isHttps ? httpsAgent : httpAgent,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.aroma-zone.com/',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site'
        }
      };

      const proxyReq = client.get(options, (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
          reject(new Error(`Status ${proxyRes.statusCode}`));
          proxyRes.resume();
          return;
        }

        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const data = Buffer.concat(chunks);
          const contentType = proxyRes.headers['content-type'] || 'image/jpeg';

          // Salva in cache se sotto limite
          if (data.length < 5 * 1024 * 1024) { // max 5MB per immagine
            while (imageCacheSize + data.length > IMAGE_CACHE_MAX_SIZE && imageCache.size > 0) {
              evictOldestCache();
            }
            imageCache.set(imageUrl, { data, contentType, timestamp: Date.now() });
            imageCacheSize += data.length;
          }

          resolve({ data, contentType });
        });
        proxyRes.on('error', reject);
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        reject(new Error('Timeout'));
      });

      proxyReq.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

  pendingRequests.set(imageUrl, fetchPromise);

  try {
    const result = await fetchPromise;
    res.set('Content-Type', result.contentType);
    res.set('X-Cache', 'MISS');
    res.status(200).send(result.data);
  } catch (error) {
    logger.error('Image proxy error:', error.message);
    res.status(502).send('Failed to fetch image');
  } finally {
    pendingRequests.delete(imageUrl);
  }
});

// API routes
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/checkout', require('./src/routes/checkout'));
app.use('/api/paypal', require('./src/routes/paypal'));  // PayPal Advanced Checkout
app.use('/api/stripe', require('./src/routes/stripe'));  // Stripe Card Payments
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

// ===== JOBS =====

const orderStatusJob = require('./src/jobs/OrderStatusJob');
const stockSyncJob = require('./src/jobs/StockSyncJob');

// ===== START SERVER =====

app.listen(PORT, () => {
  logger.info(`🚀 Server Zenova avviato su porta ${PORT}`);
  logger.info(`📝 Ambiente: ${process.env.NODE_ENV}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);

  // Avvia job controllo stato ordini fornitori
  orderStatusJob.start();

  // Avvia job sincronizzazione stock automatica (ogni 4h)
  stockSyncJob.start();
});

module.exports = app;
// Force redeploy - 2026-01-06-09:02

