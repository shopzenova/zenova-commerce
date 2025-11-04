# ZENOVA - Database Schema

## Database: PostgreSQL

---

## Schema Completo

### Tabelle Principali:
1. **products** - Prodotti dal catalogo BigBuy
2. **customers** - Clienti registrati
3. **orders** - Ordini effettuati
4. **order_items** - Dettaglio prodotti in ordine
5. **shipments** - Informazioni spedizione
6. **sync_log** - Log sincronizzazione BigBuy

---

## 1. PRODUCTS (Prodotti)

```sql
CREATE TABLE products (
  id                SERIAL PRIMARY KEY,
  bigbuy_id         INTEGER UNIQUE NOT NULL,      -- ID prodotto BigBuy
  sku               VARCHAR(100) UNIQUE NOT NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  category          VARCHAR(100),
  price             DECIMAL(10,2) NOT NULL,       -- Prezzo grossista BigBuy
  retail_price      DECIMAL(10,2) NOT NULL,       -- Prezzo vendita su Zenova
  stock             INTEGER DEFAULT 0,
  images            JSONB,                         -- Array URL immagini
  features          JSONB,                         -- Array caratteristiche
  weight            DECIMAL(8,2),                  -- Peso in kg
  dimensions        JSONB,                         -- {width, height, depth}
  active            BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_products_bigbuy_id ON products(bigbuy_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
```

**Esempio dati:**
```json
{
  "id": 1,
  "bigbuy_id": 123456,
  "sku": "BB-DIFF-001",
  "name": "Diffusore Aromi Smart WiFi",
  "description": "Diffusore ultrasonico con controllo WiFi...",
  "category": "aromatherapy",
  "price": 15.00,
  "retail_price": 35.00,
  "stock": 45,
  "images": ["https://cdn.bigbuy.eu/123456_1.jpg", "..."],
  "features": ["WiFi", "400ml", "LED RGB"],
  "weight": 0.5,
  "dimensions": {"width": 15, "height": 20, "depth": 15}
}
```

---

## 2. CUSTOMERS (Clienti)

```sql
CREATE TABLE customers (
  id                SERIAL PRIMARY KEY,
  email             VARCHAR(255) UNIQUE NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  phone             VARCHAR(20),

  -- Indirizzo spedizione
  address_line1     VARCHAR(255),
  address_line2     VARCHAR(255),
  city              VARCHAR(100),
  postal_code       VARCHAR(20),
  province          VARCHAR(100),
  country           VARCHAR(2) DEFAULT 'IT',

  -- Marketing
  newsletter        BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
```

---

## 3. ORDERS (Ordini)

```sql
CREATE TABLE orders (
  id                  SERIAL PRIMARY KEY,
  order_number        VARCHAR(50) UNIQUE NOT NULL,  -- ZEN-2025-00001
  customer_id         INTEGER REFERENCES customers(id),

  -- Dati cliente (snapshot al momento ordine)
  customer_email      VARCHAR(255) NOT NULL,
  customer_name       VARCHAR(255) NOT NULL,
  customer_phone      VARCHAR(20),

  -- Indirizzo spedizione (snapshot)
  shipping_address    JSONB NOT NULL,               -- Salva tutto l'indirizzo

  -- Importi
  subtotal            DECIMAL(10,2) NOT NULL,       -- Totale prodotti
  shipping_cost       DECIMAL(10,2) DEFAULT 0,
  total               DECIMAL(10,2) NOT NULL,

  -- Pagamento
  payment_method      VARCHAR(50) DEFAULT 'stripe',
  payment_status      VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  stripe_session_id   VARCHAR(255),
  stripe_payment_id   VARCHAR(255),
  paid_at             TIMESTAMP,

  -- BigBuy
  bigbuy_order_id     INTEGER,                       -- ID ordine su BigBuy
  bigbuy_status       VARCHAR(50),                   -- processing, shipped, delivered
  bigbuy_sent_at      TIMESTAMP,                     -- Quando inviato a BigBuy

  -- Stato generale
  status              VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled

  -- Note
  customer_notes      TEXT,
  internal_notes      TEXT,

  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_bigbuy_order_id ON orders(bigbuy_order_id);
```

**Esempio:**
```json
{
  "order_number": "ZEN-2025-00001",
  "customer_email": "mario@example.com",
  "customer_name": "Mario Rossi",
  "shipping_address": {
    "line1": "Via Roma 123",
    "city": "Milano",
    "postal_code": "20100",
    "country": "IT"
  },
  "subtotal": 70.00,
  "shipping_cost": 5.00,
  "total": 75.00,
  "status": "shipped"
}
```

---

## 4. ORDER_ITEMS (Dettaglio Ordine)

```sql
CREATE TABLE order_items (
  id                SERIAL PRIMARY KEY,
  order_id          INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id        INTEGER REFERENCES products(id),

  -- Snapshot prodotto al momento ordine
  bigbuy_id         INTEGER NOT NULL,
  sku               VARCHAR(100) NOT NULL,
  product_name      VARCHAR(255) NOT NULL,
  product_image     VARCHAR(500),

  -- Prezzi
  unit_price        DECIMAL(10,2) NOT NULL,        -- Prezzo vendita unitario
  quantity          INTEGER NOT NULL DEFAULT 1,
  total_price       DECIMAL(10,2) NOT NULL,        -- unit_price * quantity

  -- Costo (per calcolare margine)
  cost_price        DECIMAL(10,2),                 -- Prezzo pagato a BigBuy

  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

---

## 5. SHIPMENTS (Spedizioni)

```sql
CREATE TABLE shipments (
  id                SERIAL PRIMARY KEY,
  order_id          INTEGER REFERENCES orders(id) ON DELETE CASCADE,

  -- Tracking
  tracking_number   VARCHAR(255),
  carrier           VARCHAR(100),                  -- DHL, GLS, Poste, etc.
  carrier_service   VARCHAR(100),                  -- Standard, Express

  -- Date
  shipped_at        TIMESTAMP,
  estimated_delivery TIMESTAMP,
  delivered_at      TIMESTAMP,

  -- Status
  status            VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, delivered, failed

  -- Notifiche cliente
  tracking_email_sent BOOLEAN DEFAULT false,
  delivery_email_sent BOOLEAN DEFAULT false,

  -- Webhook data da BigBuy
  tracking_events   JSONB,                         -- Log eventi tracking

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
```

---

## 6. SYNC_LOG (Log Sincronizzazioni)

```sql
CREATE TABLE sync_log (
  id                SERIAL PRIMARY KEY,
  sync_type         VARCHAR(50) NOT NULL,          -- products, stock, orders, tracking
  status            VARCHAR(50) NOT NULL,          -- success, error
  items_processed   INTEGER DEFAULT 0,
  error_message     TEXT,
  sync_data         JSONB,                         -- Dati aggiuntivi
  duration_ms       INTEGER,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_log_sync_type ON sync_log(sync_type);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
```

---

## Relazioni

```
customers (1) ──── (N) orders
orders (1) ──── (N) order_items
orders (1) ──── (1) shipments
products (1) ──── (N) order_items
```

---

## Query Utili

### Prodotti più venduti
```sql
SELECT
  p.name,
  COUNT(oi.id) as total_orders,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.total_price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;
```

### Ordini da processare
```sql
SELECT
  o.order_number,
  o.customer_email,
  o.total,
  o.created_at
FROM orders o
WHERE o.payment_status = 'paid'
  AND o.bigbuy_order_id IS NULL
ORDER BY o.created_at ASC;
```

### Margine per ordine
```sql
SELECT
  o.order_number,
  o.total as revenue,
  SUM(oi.cost_price * oi.quantity) as cost,
  o.total - SUM(oi.cost_price * oi.quantity) as profit,
  ((o.total - SUM(oi.cost_price * oi.quantity)) / o.total * 100) as margin_percent
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY o.id, o.order_number, o.total
ORDER BY profit DESC;
```

---

## Prisma Schema (per backend Node.js)

```prisma
// File: backend/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id           Int      @id @default(autoincrement())
  bigbuyId     Int      @unique @map("bigbuy_id")
  sku          String   @unique
  name         String
  description  String?  @db.Text
  category     String?
  price        Decimal  @db.Decimal(10, 2)
  retailPrice  Decimal  @db.Decimal(10, 2) @map("retail_price")
  stock        Int      @default(0)
  images       Json?
  features     Json?
  weight       Decimal? @db.Decimal(8, 2)
  dimensions   Json?
  active       Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  orderItems   OrderItem[]

  @@index([bigbuyId])
  @@index([sku])
  @@index([category])
  @@map("products")
}

model Customer {
  id               Int      @id @default(autoincrement())
  email            String   @unique
  firstName        String   @map("first_name")
  lastName         String   @map("last_name")
  phone            String?
  addressLine1     String?  @map("address_line1")
  addressLine2     String?  @map("address_line2")
  city             String?
  postalCode       String?  @map("postal_code")
  province         String?
  country          String   @default("IT")
  newsletter       Boolean  @default(false)
  marketingConsent Boolean  @default(false) @map("marketing_consent")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  orders           Order[]

  @@index([email])
  @@map("customers")
}

model Order {
  id                Int       @id @default(autoincrement())
  orderNumber       String    @unique @map("order_number")
  customerId        Int?      @map("customer_id")
  customerEmail     String    @map("customer_email")
  customerName      String    @map("customer_name")
  customerPhone     String?   @map("customer_phone")
  shippingAddress   Json      @map("shipping_address")
  subtotal          Decimal   @db.Decimal(10, 2)
  shippingCost      Decimal   @default(0) @db.Decimal(10, 2) @map("shipping_cost")
  total             Decimal   @db.Decimal(10, 2)
  paymentMethod     String    @default("stripe") @map("payment_method")
  paymentStatus     String    @default("pending") @map("payment_status")
  stripeSessionId   String?   @map("stripe_session_id")
  stripePaymentId   String?   @map("stripe_payment_id")
  paidAt            DateTime? @map("paid_at")
  bigbuyOrderId     Int?      @map("bigbuy_order_id")
  bigbuyStatus      String?   @map("bigbuy_status")
  bigbuySentAt      DateTime? @map("bigbuy_sent_at")
  status            String    @default("pending")
  customerNotes     String?   @db.Text @map("customer_notes")
  internalNotes     String?   @db.Text @map("internal_notes")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  customer          Customer?  @relation(fields: [customerId], references: [id])
  items             OrderItem[]
  shipment          Shipment?

  @@index([orderNumber])
  @@index([customerId])
  @@index([customerEmail])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id           Int      @id @default(autoincrement())
  orderId      Int      @map("order_id")
  productId    Int?     @map("product_id")
  bigbuyId     Int      @map("bigbuy_id")
  sku          String
  productName  String   @map("product_name")
  productImage String?  @map("product_image")
  unitPrice    Decimal  @db.Decimal(10, 2) @map("unit_price")
  quantity     Int      @default(1)
  totalPrice   Decimal  @db.Decimal(10, 2) @map("total_price")
  costPrice    Decimal? @db.Decimal(10, 2) @map("cost_price")
  createdAt    DateTime @default(now()) @map("created_at")

  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product? @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@map("order_items")
}

model Shipment {
  id                  Int       @id @default(autoincrement())
  orderId             Int       @unique @map("order_id")
  trackingNumber      String?   @map("tracking_number")
  carrier             String?
  carrierService      String?   @map("carrier_service")
  shippedAt           DateTime? @map("shipped_at")
  estimatedDelivery   DateTime? @map("estimated_delivery")
  deliveredAt         DateTime? @map("delivered_at")
  status              String    @default("pending")
  trackingEmailSent   Boolean   @default(false) @map("tracking_email_sent")
  deliveryEmailSent   Boolean   @default(false) @map("delivery_email_sent")
  trackingEvents      Json?     @map("tracking_events")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  order               Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([trackingNumber])
  @@map("shipments")
}

model SyncLog {
  id              Int      @id @default(autoincrement())
  syncType        String   @map("sync_type")
  status          String
  itemsProcessed  Int      @default(0) @map("items_processed")
  errorMessage    String?  @db.Text @map("error_message")
  syncData        Json?    @map("sync_data")
  durationMs      Int?     @map("duration_ms")
  createdAt       DateTime @default(now()) @map("created_at")

  @@index([syncType])
  @@index([createdAt])
  @@map("sync_log")
}
```

---

## Setup Database

### 1. Installare PostgreSQL localmente o usare servizio cloud
```bash
# Opzione A: Locale (Windows)
# Scaricare da: https://www.postgresql.org/download/windows/

# Opzione B: Cloud (Railway)
# 1. Vai su railway.app
# 2. New Project → PostgreSQL
# 3. Copia DATABASE_URL
```

### 2. Creare database
```sql
CREATE DATABASE zenova;
```

### 3. Con Prisma (nel backend Node.js)
```bash
cd backend
npm install prisma @prisma/client
npx prisma init
# Copia schema.prisma sopra
npx prisma migrate dev --name init
npx prisma generate
```

---

## Prossimi Passi

1. ✅ Schema database definito
2. Setup progetto Node.js con Prisma
3. Creare migrations
4. Seed database con prodotti test
