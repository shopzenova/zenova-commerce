# ZENOVA - Architettura Backend

## Stack Tecnologico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **API Client:** Axios

### Servizi Esterni
- **BigBuy API:** Gestione prodotti e ordini
- **Stripe:** Pagamenti
- **SendGrid:** Email transazionali

### Hosting
- **Backend:** Railway / Render / Vercel
- **Database:** Railway PostgreSQL / Supabase
- **Frontend:** Vercel / Netlify

---

## Architettura Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      ZENOVA FRONTEND                         │
│                   (HTML/CSS/JS attuale)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   BACKEND NODE.JS                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (Express)                     │   │
│  │  /api/products  /api/cart  /api/checkout  /api/orders│   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │           Service Layer (Business Logic)              │  │
│  │  ProductService  OrderService  PaymentService         │  │
│  └────────────────────────┼──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │              Integration Layer                         │  │
│  │  BigBuyClient  StripeClient  EmailService             │  │
│  └────────────────────────┼──────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   PostgreSQL   │  │  BigBuy API │  │   Stripe API    │
│   Database     │  │             │  │                 │
└────────────────┘  └─────────────┘  └─────────────────┘
```

---

## Flusso Completo Ordine

### 1. Cliente Naviga Prodotti
```
Cliente → Frontend → GET /api/products
Backend → BigBuy API → Recupera catalogo
Backend → Database → Cache prodotti
Backend → Frontend → Lista prodotti
```

### 2. Cliente Aggiunge al Carrello
```
Cliente → Frontend → Salva in localStorage
(Nessuna chiamata backend - carrello client-side)
```

### 3. Cliente Procede al Checkout
```
Cliente → Frontend → POST /api/checkout
Backend → Valida carrello
Backend → Verifica stock BigBuy
Backend → Crea sessione Stripe
Backend → Frontend → URL pagamento Stripe
Cliente → Stripe → Inserisce dati carta
```

### 4. Pagamento Completato
```
Stripe → Backend → POST /webhook/stripe
Backend → Verifica pagamento
Backend → Database → Salva ordine
Backend → BigBuy API → POST /orders (crea ordine automaticamente)
BigBuy → Processa ordine
Backend → SendGrid → Email conferma cliente
```

### 5. BigBuy Spedisce
```
BigBuy → Prepara pacco (24-48h)
BigBuy → Spedisce
BigBuy → Backend → Webhook tracking
Backend → Database → Aggiorna stato ordine
Backend → SendGrid → Email tracking cliente
```

---

## Struttura Directory Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Config PostgreSQL
│   │   ├── bigbuy.js           # Config API BigBuy
│   │   ├── stripe.js           # Config Stripe
│   │   └── email.js            # Config SendGrid
│   │
│   ├── models/                 # Prisma schema
│   │   └── schema.prisma       # Database schema
│   │
│   ├── routes/                 # Express routes
│   │   ├── products.js         # GET /api/products
│   │   ├── cart.js             # POST /api/cart
│   │   ├── checkout.js         # POST /api/checkout
│   │   ├── orders.js           # GET /api/orders/:id
│   │   └── webhooks.js         # POST /webhook/*
│   │
│   ├── services/               # Business logic
│   │   ├── ProductService.js   # Gestione prodotti
│   │   ├── OrderService.js     # Gestione ordini
│   │   ├── PaymentService.js   # Gestione pagamenti
│   │   └── EmailService.js     # Invio email
│   │
│   ├── integrations/           # API esterne
│   │   ├── BigBuyClient.js     # Client API BigBuy
│   │   ├── StripeClient.js     # Client Stripe
│   │   └── EmailClient.js      # Client SendGrid
│   │
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # Autenticazione
│   │   ├── validation.js       # Validazione input
│   │   └── errorHandler.js     # Gestione errori
│   │
│   └── utils/                  # Utility functions
│       ├── logger.js           # Logging
│       └── helpers.js          # Helper functions
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # DB migrations
│
├── tests/                      # Test suite
│   ├── unit/
│   └── integration/
│
├── .env.example                # Variabili ambiente esempio
├── .gitignore
├── package.json
├── README.md
└── server.js                   # Entry point
```

---

## API Endpoints

### Prodotti
```
GET    /api/products              # Lista tutti i prodotti
GET    /api/products/:id          # Dettaglio prodotto
GET    /api/products/search?q=    # Ricerca prodotti
GET    /api/categories            # Lista categorie
```

### Carrello & Checkout
```
POST   /api/cart/validate         # Valida carrello (stock/prezzi)
POST   /api/checkout              # Crea sessione pagamento
GET    /api/checkout/success      # Pagamento completato
```

### Ordini
```
GET    /api/orders/:id            # Dettaglio ordine
GET    /api/orders/:id/tracking   # Tracking spedizione
```

### Webhooks
```
POST   /webhook/stripe            # Webhook Stripe
POST   /webhook/bigbuy            # Webhook BigBuy
```

---

## Sicurezza

### Autenticazione API
- API keys in variabili ambiente (.env)
- HTTPS obbligatorio
- CORS configurato per solo Zenova.it

### Webhook Verification
- Stripe: Signature verification
- BigBuy: IP whitelisting + token

### Validazione
- Input validation (express-validator)
- SQL injection protection (Prisma ORM)
- Rate limiting (express-rate-limit)

---

## Ambiente Sviluppo vs Produzione

### Development
```
DATABASE_URL=postgresql://localhost:5432/zenova_dev
BIGBUY_API_URL=https://api.sandbox.bigbuy.eu
STRIPE_KEY=sk_test_...
```

### Production
```
DATABASE_URL=postgresql://production-db/zenova
BIGBUY_API_URL=https://api.bigbuy.eu
STRIPE_KEY=sk_live_...
```

---

## Performance & Scalabilità

### Caching
- Prodotti BigBuy cachati per 1 ora
- Stock verificato in tempo reale al checkout

### Database
- Indici su: product_id, order_id, email
- Relazioni ottimizzate con Prisma

### Monitoring
- Logging: Winston
- Errori: Sentry (opzionale)
- Uptime: UptimeRobot (opzionale)

---

## Costi Hosting Stimati

- **Railway/Render:** €15-20/mese (backend + DB)
- **Vercel:** Gratis (frontend statico)
- **SendGrid:** Gratis (fino 100 email/giorno)
- **TOTALE:** ~€15-20/mese

---

## Timeline Sviluppo

### Fase 1 - Setup Base (Settimana 1)
- ✅ Struttura directory
- ✅ Database schema
- ✅ Express server base
- ✅ Connessione database

### Fase 2 - Integrazioni (Settimana 2)
- ✅ BigBuy client (mock prima di avere API key)
- ✅ Stripe integration
- ✅ Email service

### Fase 3 - API Endpoints (Settimana 3)
- ✅ Products API
- ✅ Checkout flow
- ✅ Webhooks

### Fase 4 - Testing & Deploy (Settimana 4-5)
- ✅ Test completi
- ✅ Deploy su Railway/Render
- ✅ Connessione frontend Zenova

---

## Prossimi Passi

1. Creare database schema completo
2. Setup progetto Node.js + Express
3. Implementare BigBuy client (mock)
4. Creare API endpoints base
5. Integrare Stripe checkout
6. Collegare frontend Zenova esistente
