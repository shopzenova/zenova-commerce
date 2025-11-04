# 🧪 Guida Test Completa - Zenova Backend

## ✅ COSA ABBIAMO FATTO (Senza BigBuy!)

### **Backend Completo** ✅
- ✅ Server Express funzionante
- ✅ API prodotti (con MOCK BigBuy)
- ✅ API carrello con validazione
- ✅ Checkout Stripe (MOCK MODE)
- ✅ Sistema email (MOCK MODE)
- ✅ Logging completo
- ✅ Sicurezza (CORS, rate limiting, helmet)
- ✅ Schema database Prisma pronto

### **Tutto funziona in MOCK MODE** 🎭
- Nessun costo
- Nessuna API key richiesta
- BigBuy simulato
- Stripe simulato
- Email simulate
- **Puoi testare TUTTO il flusso!**

---

## 🚀 STEP 1: AVVIARE IL BACKEND

### Apri Terminal/PowerShell:

```bash
cd C:\Users\giorg\zenova-ecommerce\backend
npm start
```

Dovresti vedere:
```
🚀 Server Zenova avviato su porta 3000
📝 Ambiente: development
🌐 Frontend URL: http://127.0.0.1:5500
⚠️  BigBuy in MOCK MODE - usando dati finti
⚠️  Stripe in MOCK MODE - usando dati finti
⚠️  Email in MOCK MODE - email non inviate realmente
```

**✅ Perfetto! Il backend è attivo!**

---

## 🧪 STEP 2: TESTARE LE API

### Test 1: Health Check

Apri browser: **http://localhost:3000/health**

Dovresti vedere:
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### Test 2: Lista Prodotti (Mock BigBuy)

**http://localhost:3000/api/products**

Dovresti vedere 3 prodotti mock:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 123456,
        "name": "Diffusore Aromi Ultrasonico 400ml",
        "wholesalePrice": 15.00,
        "retailPrice": 35.00,
        "stock": 100,
        "images": [...]
      },
      {
        "id": 123457,
        "name": "Lampada Sale Himalayano",
        ...
      },
      {
        "id": 123458,
        "name": "Tappetino Yoga Premium",
        ...
      }
    ],
    "totalProducts": 3
  }
}
```

---

### Test 3: Dettaglio Prodotto

**http://localhost:3000/api/products/123456**

Vedi i dettagli del diffusore.

---

### Test 4: Verifica Stock

**http://localhost:3000/api/products/123456/stock**

```json
{
  "success": true,
  "data": {
    "productId": 123456,
    "quantity": 100,
    "available": true
  }
}
```

---

### Test 5: Valida Carrello (con Postman o curl)

```bash
curl -X POST http://localhost:3000/api/cart/validate \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"productId\":123456,\"quantity\":2}]}"
```

Risposta:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "items": [
      {
        "productId": 123456,
        "requestedQuantity": 2,
        "availableQuantity": 100,
        "available": true
      }
    ],
    "errors": []
  }
}
```

---

### Test 6: Checkout Stripe Mock

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [
      {
        \"productId\": 123456,
        \"bigbuyId\": 123456,
        \"name\": \"Diffusore Aromi\",
        \"price\": 35.00,
        \"quantity\": 1
      }
    ],
    \"customer\": {
      \"email\": \"test@zenova.it\",
      \"name\": \"Mario Rossi\"
    }
  }"
```

Risposta:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_mock_1234567890",
    "url": "http://localhost:3000/api/checkout/mock/cs_test_mock_1234567890"
  }
}
```

**Apri l'URL** nel browser e vedrai la pagina mock di Stripe!

---

## 🌐 STEP 3: COLLEGARE FRONTEND ZENOVA

### Nel file `zenova-ecommerce/script.js`, aggiungi all'inizio:

```javascript
// Carica API client
const API_URL = 'http://localhost:3000/api';
```

### Modifica la funzione checkout (esempio):

```javascript
// Nel tuo script.js
async function handleCheckout() {
  const cart = getCartFromLocalStorage(); // tua funzione esistente

  // Ottieni dati cliente (da form o localStorage)
  const customer = {
    email: document.getElementById('customer-email').value,
    name: document.getElementById('customer-name').value,
    phone: document.getElementById('customer-phone').value
  };

  try {
    // Valida carrello prima
    const validation = await fetch(`${API_URL}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      })
    }).then(res => res.json());

    if (!validation.success || !validation.data.valid) {
      alert('Alcuni prodotti non sono disponibili');
      return;
    }

    // Crea checkout
    const checkout = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item.id,
          bigbuyId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer
      })
    }).then(res => res.json());

    if (checkout.success) {
      // Redirect a Stripe (o mock)
      window.location.href = checkout.data.url;
    }

  } catch (error) {
    console.error('Errore checkout:', error);
    alert('Errore durante il checkout');
  }
}
```

---

## 📝 STEP 4: TESTARE FLUSSO COMPLETO

### Scenario: Cliente acquista 1 diffusore

1. **Apri Zenova frontend** (index.html)
2. **Aggiungi diffusore al carrello**
3. **Vai al checkout**
4. **Compila email, nome, telefono**
5. **Clicca "Procedi all'acquisto"**
6. **Vedi pagina mock Stripe**
7. **Clicca "Simula Successo"**
8. **Redirect a pagina successo**

**✅ FLUSSO COMPLETO TESTATO!**

---

## 🔍 MONITORARE LOG

Mentre testi, guarda i log del backend nel terminale:

```
info: POST /api/cart/validate
info: BigBuy: Ricevuti 1 prodotti
info: POST /api/checkout
info: MOCK: Sessione Stripe creata
info: Checkout creato per test@zenova.it, session: cs_test_mock_...
```

I log dettagliati sono anche in:
- `backend/logs/combined.log`
- `backend/logs/error.log`

---

## 🎯 COSA PUOI TESTARE ADESSO

### ✅ Senza BigBuy reale:
- [x] Caricare prodotti mock
- [x] Validare carrello
- [x] Verificare stock
- [x] Creare checkout
- [x] Simulare pagamento Stripe
- [x] Flusso completo acquisto

### ✅ Senza Stripe reale:
- [x] Mock checkout page funzionante
- [x] Simulare successo/annullamento
- [x] Testare redirect

### ✅ Senza Email reale:
- [x] Email conferma (loggata)
- [x] Email tracking (loggata)

---

## 🚀 PROSSIMI PASSI

### Quando vuoi andare LIVE:

1. **Registrati BigBuy** (€159)
   - Ottieni API key
   - Aggiorna `.env`: `BIGBUY_API_KEY=tua_chiave_vera`
   - Riavvia server
   - Mock mode si disattiva automaticamente!

2. **Registrati Stripe** (gratis)
   - Crea account su stripe.com
   - Ottieni test keys
   - Aggiorna `.env`: `STRIPE_SECRET_KEY=sk_test_xxx`
   - Testa con carte test Stripe
   - Poi passa a live keys

3. **Setup Email** (SendGrid gratis 100/giorno)
   - Crea account SendGrid
   - Ottieni SMTP credentials
   - Aggiorna `.env`
   - Email reali partiranno!

4. **Setup Database** (opzionale per ora)
   - Railway.app gratuito
   - Copia DATABASE_URL
   - `npx prisma migrate dev`
   - Ordini salvati in DB!

---

## 🆘 TROUBLESHOOTING

### "Cannot GET /api/products"
→ Backend non avviato. Esegui: `npm start`

### "CORS error"
→ Verifica FRONTEND_URL in `.env` corrisponda al tuo frontend

### "500 Internal Server Error"
→ Guarda `logs/error.log` per dettagli

### Port 3000 già in uso
→ Cambia PORT in `.env`: `PORT=3001`

---

## 📊 RIEPILOGO

### **FATTO OGGI** ✅
1. ✅ Backend Node.js completo
2. ✅ Dipendenze installate (407 packages)
3. ✅ .env configurato
4. ✅ BigBuy Mock funzionante
5. ✅ Stripe Mock funzionante
6. ✅ Email Mock funzionante
7. ✅ API prodotti
8. ✅ API carrello
9. ✅ API checkout
10. ✅ Schema Prisma pronto
11. ✅ Logging completo
12. ✅ Client API per frontend

### **COSTI SOSTENUTI**
💰 **€0.00** - Tutto gratis!

### **TEMPO RISPARMIATO**
⏱️ Settimane di sviluppo → FATTO OGGI!

---

## 🎉 SEI PRONTO PER TESTARE!

**Avvia il backend:**
```bash
cd C:\Users\giorg\zenova-ecommerce\backend
npm start
```

**Apri browser:**
- http://localhost:3000/health
- http://localhost:3000/api/products

**Poi apri il tuo frontend Zenova e testa il flusso completo!**

---

**Domande? Problemi? Dimmi e risolviamo insieme!** 😊
