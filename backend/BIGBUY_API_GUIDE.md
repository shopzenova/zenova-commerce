# BigBuy API - Guida Integrazione Zenova

## Informazioni Base

### Endpoints
- **Production:** `https://api.bigbuy.eu`
- **Sandbox/Test:** `https://api.sandbox.bigbuy.eu`
- **Documentazione:** `https://api.bigbuy.eu/rest/doc`

### Autenticazione
BigBuy usa **autenticazione Bearer Token** via header HTTP.

```http
Authorization: Bearer YOUR_API_KEY
```

---

## 1. CATALOGO PRODOTTI

### Ottenere Lista Prodotti

**Endpoint:** `GET /rest/catalog/products.json`

```javascript
// Esempio richiesta
const axios = require('axios');

async function getProducts() {
  const response = await axios.get('https://api.bigbuy.eu/rest/catalog/products.json', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    params: {
      isoCode: 'it',              // Lingua italiana
      pageSize: 100,              // Prodotti per pagina
      page: 1                     // Numero pagina
    }
  });

  return response.data;
}
```

**Risposta esempio:**
```json
{
  "products": [
    {
      "id": 123456,
      "sku": "BB-DIFF-001",
      "name": "Diffusore Aromi Ultrasonico 400ml",
      "description": "Diffusore di aromi con tecnologia ultrasonica...",
      "inShopsPrice": 35.00,        // Prezzo consigliato vendita
      "wholesalePrice": 15.00,      // Prezzo grossista (quello che paghi)
      "retailPrice": 35.00,
      "taxRate": 22,
      "categories": [
        {
          "id": 456,
          "name": "Home & Living"
        }
      ],
      "images": [
        {
          "url": "https://cdn.bigbuy.eu/images/123456_1.jpg"
        },
        {
          "url": "https://cdn.bigbuy.eu/images/123456_2.jpg"
        }
      ],
      "weight": 0.5,
      "width": 15,
      "height": 20,
      "depth": 15
    }
  ],
  "page": 1,
  "pageSize": 100,
  "totalPages": 50,
  "totalProducts": 5000
}
```

### Filtrare per Categoria

```javascript
async function getProductsByCategory(categoryId) {
  const response = await axios.get('https://api.bigbuy.eu/rest/catalog/products.json', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    params: {
      isoCode: 'it',
      categoryId: categoryId,     // Es: 456 per Home & Living
      pageSize: 100,
      page: 1
    }
  });

  return response.data;
}
```

### Ottenere Dettaglio Singolo Prodotto

**Endpoint:** `GET /rest/catalog/product/{productId}.json`

```javascript
async function getProduct(productId) {
  const response = await axios.get(
    `https://api.bigbuy.eu/rest/catalog/product/${productId}.json`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      params: {
        isoCode: 'it'
      }
    }
  );

  return response.data;
}
```

---

## 2. STOCK (Disponibilità)

### Verificare Stock Prodotto

**Endpoint:** `GET /rest/catalog/productstock/{productId}.json`

```javascript
async function getProductStock(productId) {
  const response = await axios.get(
    `https://api.bigbuy.eu/rest/catalog/productstock/${productId}.json`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "productId": 123456,
  "quantity": 45,              // Quantità disponibile
  "available": true
}
```

### Verificare Stock Multipli Prodotti

**Endpoint:** `POST /rest/catalog/productsstock.json`

```javascript
async function checkMultipleStock(productIds) {
  const response = await axios.post(
    'https://api.bigbuy.eu/rest/catalog/productsstock.json',
    {
      products: productIds      // [123456, 789012, 345678]
    },
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "stocks": [
    { "productId": 123456, "quantity": 45, "available": true },
    { "productId": 789012, "quantity": 0, "available": false },
    { "productId": 345678, "quantity": 120, "available": true }
  ]
}
```

---

## 3. CREARE ORDINI

### Creare Ordine Singolo

**Endpoint:** `POST /rest/order`

```javascript
async function createOrder(orderData) {
  const response = await axios.post(
    'https://api.bigbuy.eu/rest/order',
    {
      // Prodotti
      products: [
        {
          reference: 123456,        // ID prodotto BigBuy
          quantity: 2
        },
        {
          reference: 789012,
          quantity: 1
        }
      ],

      // Indirizzo spedizione
      shippingAddress: {
        firstName: "Mario",
        lastName: "Rossi",
        country: "IT",
        postcode: "20100",
        town: "Milano",
        address: "Via Roma 123",
        phone: "+39 333 1234567",
        email: "mario.rossi@example.com",
        comment: ""
      },

      // Corriere (opzionale - BigBuy sceglie il migliore)
      carrier: {
        id: 11                      // ID corriere BigBuy (es: 11 = GLS)
      },

      // Note interne (opzionale)
      internalReference: "ZEN-2025-00001",  // Tuo numero ordine

      // Lingua
      language: "it"
    },
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "orderId": 987654,              // ID ordine BigBuy
  "orderReference": "BB-987654",
  "status": "processing",
  "total": 45.50,
  "shippingCost": 5.50,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### Stati Ordine BigBuy

- `pending` - In attesa
- `processing` - In elaborazione
- `shipped` - Spedito
- `delivered` - Consegnato
- `cancelled` - Annullato

---

## 4. TRACKING & SPEDIZIONI

### Ottenere Info Spedizione Ordine

**Endpoint:** `GET /rest/order/{orderId}/delivery-note`

```javascript
async function getOrderTracking(bigbuyOrderId) {
  const response = await axios.get(
    `https://api.bigbuy.eu/rest/order/${bigbuyOrderId}/delivery-note`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "orderId": 987654,
  "trackingNumber": "JVG123456789IT",
  "carrier": {
    "id": 11,
    "name": "GLS",
    "trackingUrl": "https://gls-group.eu/IT/it/ricerca-spedizioni"
  },
  "shippedAt": "2025-01-16T14:20:00Z",
  "estimatedDelivery": "2025-01-18",
  "status": "in_transit"
}
```

### Lista Tutti Gli Ordini

**Endpoint:** `GET /rest/orders`

```javascript
async function getOrders(page = 1) {
  const response = await axios.get(
    'https://api.bigbuy.eu/rest/orders',
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      params: {
        page: page,
        pageSize: 50
      }
    }
  );

  return response.data;
}
```

---

## 5. CATEGORIE

### Ottenere Albero Categorie

**Endpoint:** `GET /rest/catalog/categories.json`

```javascript
async function getCategories() {
  const response = await axios.get(
    'https://api.bigbuy.eu/rest/catalog/categories.json',
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      params: {
        isoCode: 'it'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "categories": [
    {
      "id": 100,
      "name": "Home & Living",
      "children": [
        {
          "id": 456,
          "name": "Aromatherapy",
          "children": [
            { "id": 789, "name": "Diffusori" },
            { "id": 790, "name": "Oli Essenziali" }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. CORRIERI DISPONIBILI

### Lista Corrieri

**Endpoint:** `GET /rest/shipping/carriers.json`

```javascript
async function getCarriers() {
  const response = await axios.get(
    'https://api.bigbuy.eu/rest/shipping/carriers.json',
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "carriers": [
    { "id": 11, "name": "GLS", "deliveryTime": "24-48h" },
    { "id": 12, "name": "DHL Express", "deliveryTime": "24h" },
    { "id": 13, "name": "Poste Italiane", "deliveryTime": "48-72h" }
  ]
}
```

### Calcolare Costo Spedizione

**Endpoint:** `POST /rest/shipping/costs.json`

```javascript
async function calculateShippingCost(products, destination) {
  const response = await axios.post(
    'https://api.bigbuy.eu/rest/shipping/costs.json',
    {
      products: products,         // Array con {reference, quantity}
      destination: {
        country: destination.country,
        postcode: destination.postcode
      }
    },
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// Risposta
{
  "shippingCosts": [
    { "carrierId": 11, "carrierName": "GLS", "cost": 5.50 },
    { "carrierId": 12, "carrierName": "DHL Express", "cost": 12.00 }
  ]
}
```

---

## 7. WEBHOOKS (per automazione completa)

BigBuy può inviare webhook al tuo backend quando:
- Ordine cambia stato
- Prodotto viene spedito
- Tracking disponibile
- Stock prodotti cambia

### Configurare Webhook

1. Vai su pannello BigBuy
2. Impostazioni → Webhooks
3. Aggiungi URL: `https://tuobackend.com/webhook/bigbuy`
4. Seleziona eventi: `order.shipped`, `order.delivered`

### Ricevere Webhook nel Backend

```javascript
// Nel tuo backend Express
app.post('/webhook/bigbuy', async (req, res) => {
  const event = req.body;

  console.log('Webhook BigBuy ricevuto:', event);

  switch(event.type) {
    case 'order.shipped':
      // Aggiorna database
      await updateOrderStatus(event.orderId, 'shipped');
      // Invia email tracking al cliente
      await sendTrackingEmail(event.orderId, event.trackingNumber);
      break;

    case 'order.delivered':
      await updateOrderStatus(event.orderId, 'delivered');
      await sendDeliveryConfirmationEmail(event.orderId);
      break;
  }

  res.status(200).send('OK');
});
```

---

## 8. IMPLEMENTAZIONE COMPLETA - Client BigBuy

### File: `backend/src/integrations/BigBuyClient.js`

```javascript
const axios = require('axios');

class BigBuyClient {
  constructor() {
    this.baseURL = process.env.BIGBUY_API_URL || 'https://api.bigbuy.eu';
    this.apiKey = process.env.BIGBUY_API_KEY;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // PRODOTTI
  async getProducts(page = 1, pageSize = 100) {
    const response = await this.client.get('/rest/catalog/products.json', {
      params: { isoCode: 'it', page, pageSize }
    });
    return response.data;
  }

  async getProduct(productId) {
    const response = await this.client.get(
      `/rest/catalog/product/${productId}.json`,
      { params: { isoCode: 'it' } }
    );
    return response.data;
  }

  async getProductsByCategory(categoryId, page = 1) {
    const response = await this.client.get('/rest/catalog/products.json', {
      params: { isoCode: 'it', categoryId, page, pageSize: 100 }
    });
    return response.data;
  }

  // STOCK
  async getProductStock(productId) {
    const response = await this.client.get(
      `/rest/catalog/productstock/${productId}.json`
    );
    return response.data;
  }

  async checkMultipleStock(productIds) {
    const response = await this.client.post(
      '/rest/catalog/productsstock.json',
      { products: productIds }
    );
    return response.data;
  }

  // ORDINI
  async createOrder(orderData) {
    const response = await this.client.post('/rest/order', orderData);
    return response.data;
  }

  async getOrder(orderId) {
    const response = await this.client.get(`/rest/order/${orderId}`);
    return response.data;
  }

  async getOrderTracking(orderId) {
    const response = await this.client.get(
      `/rest/order/${orderId}/delivery-note`
    );
    return response.data;
  }

  // CATEGORIE
  async getCategories() {
    const response = await this.client.get('/rest/catalog/categories.json', {
      params: { isoCode: 'it' }
    });
    return response.data;
  }

  // CORRIERI
  async getCarriers() {
    const response = await this.client.get('/rest/shipping/carriers.json');
    return response.data;
  }

  async calculateShippingCost(products, destination) {
    const response = await this.client.post('/rest/shipping/costs.json', {
      products,
      destination
    });
    return response.data;
  }
}

module.exports = new BigBuyClient();
```

---

## 9. WORKFLOW COMPLETO ORDINE

### Step-by-Step con Codice

```javascript
// 1. Cliente aggiunge prodotti al carrello (frontend)
// 2. Cliente procede al checkout
// 3. Backend verifica stock

const bigbuy = require('./integrations/BigBuyClient');

async function processCheckout(cart, customer) {

  // 1. Verifica stock su BigBuy
  const productIds = cart.items.map(item => item.bigbuyId);
  const stockData = await bigbuy.checkMultipleStock(productIds);

  // Controlla se tutto disponibile
  for (let item of cart.items) {
    const stock = stockData.stocks.find(s => s.productId === item.bigbuyId);
    if (!stock.available || stock.quantity < item.quantity) {
      throw new Error(`Prodotto ${item.name} non disponibile`);
    }
  }

  // 2. Crea sessione Stripe (pagamento)
  const stripeSession = await createStripeSession(cart, customer);

  // 3. Salva ordine nel DB come "pending"
  const order = await saveOrder({
    cart,
    customer,
    status: 'pending',
    stripeSessionId: stripeSession.id
  });

  return { checkoutUrl: stripeSession.url };
}

// 4. Webhook Stripe: pagamento completato
async function handleStripeWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Aggiorna ordine
    const order = await updateOrder(session.id, {
      paymentStatus: 'paid',
      status: 'processing'
    });

    // 5. Invia ordine a BigBuy AUTOMATICAMENTE
    const bigbuyOrder = await bigbuy.createOrder({
      products: order.items.map(item => ({
        reference: item.bigbuyId,
        quantity: item.quantity
      })),
      shippingAddress: {
        firstName: order.customerName.split(' ')[0],
        lastName: order.customerName.split(' ')[1],
        country: order.shippingAddress.country,
        postcode: order.shippingAddress.postalCode,
        town: order.shippingAddress.city,
        address: order.shippingAddress.line1,
        phone: order.customerPhone,
        email: order.customerEmail
      },
      internalReference: order.orderNumber,
      language: 'it'
    });

    // Salva ID ordine BigBuy
    await updateOrder(order.id, {
      bigbuyOrderId: bigbuyOrder.orderId,
      bigbuySentAt: new Date()
    });

    // Invia email conferma cliente
    await sendOrderConfirmationEmail(order);
  }
}

// 6. Webhook BigBuy: ordine spedito
async function handleBigBuyWebhook(event) {
  if (event.type === 'order.shipped') {
    const order = await getOrderByBigbuyId(event.orderId);

    // Aggiorna ordine
    await updateOrder(order.id, {
      status: 'shipped',
      trackingNumber: event.trackingNumber,
      carrier: event.carrier
    });

    // Invia email tracking cliente
    await sendTrackingEmail(order, event.trackingNumber);
  }
}
```

---

## 10. VARIABILI AMBIENTE

```bash
# File: backend/.env

# BigBuy API
BIGBUY_API_URL=https://api.bigbuy.eu
BIGBUY_API_KEY=your_api_key_here

# Per testing (prima di registrarti)
# BIGBUY_API_URL=https://api.sandbox.bigbuy.eu
```

---

## 11. TESTING (senza account BigBuy)

Prima di registrarti, puoi creare un **Mock Client**:

```javascript
// File: backend/src/integrations/BigBuyClientMock.js

class BigBuyClientMock {
  async getProducts(page = 1) {
    return {
      products: [
        {
          id: 123456,
          sku: 'MOCK-DIFF-001',
          name: 'Diffusore Aromi Mock',
          wholesalePrice: 15.00,
          retailPrice: 35.00,
          images: ['https://via.placeholder.com/400'],
          weight: 0.5
        }
      ],
      page: 1,
      totalPages: 1
    };
  }

  async getProductStock(productId) {
    return { productId, quantity: 100, available: true };
  }

  async createOrder(orderData) {
    return {
      orderId: 999999,
      status: 'processing',
      total: 45.50
    };
  }

  // ... altri metodi mock
}

module.exports = new BigBuyClientMock();
```

Usa mock finché non hai le credenziali vere:
```javascript
const bigbuy = process.env.NODE_ENV === 'production'
  ? require('./BigBuyClient')
  : require('./BigBuyClientMock');
```

---

## 12. PROSSIMI PASSI

1. ✅ Documentazione API studiata
2. Implementare BigBuyClient nel backend
3. Creare mock per sviluppo
4. Testare flusso completo con dati mock
5. Registrare account BigBuy
6. Sostituire mock con client reale
7. Test in produzione

---

## Risorse Utili

- **Documentazione ufficiale:** https://api.bigbuy.eu/rest/doc
- **PDF Guida:** https://www.bigbuy.eu/public/doc/Guia_API_BigBuy_EN.pdf
- **Supporto BigBuy:** support@bigbuy.eu
