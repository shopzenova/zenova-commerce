# 🚀 Zenova Backend - Istruzioni Setup

## ✅ File Creati

La struttura del backend è stata creata con successo:

```
backend/
├── server.js                       ✅ Entry point server
├── package.json                    ✅ Dipendenze npm
├── .env.example                    ✅ Template variabili ambiente
├── .gitignore                      ✅ File da ignorare
│
├── src/
│   ├── config/
│   │   └── database.js             ✅ Connessione Prisma
│   │
│   ├── integrations/
│   │   └── BigBuyClient.js         ✅ Client API BigBuy (con MOCK)
│   │
│   ├── routes/
│   │   ├── products.js             ✅ API prodotti
│   │   ├── cart.js                 ✅ API carrello
│   │   ├── checkout.js             🔄 Da completare con Stripe
│   │   ├── orders.js               🔄 Da completare con DB
│   │   └── webhooks.js             🔄 Da completare
│   │
│   └── utils/
│       └── logger.js               ✅ Winston logger
│
└── logs/                           ✅ Directory log
```

---

## 📦 STEP 1: Installare Node.js

**Verifica se hai già Node.js:**
```bash
node --version
```

**Se non installato:**
1. Vai su https://nodejs.org
2. Scarica versione LTS (18.x o superiore)
3. Installa

---

## 📥 STEP 2: Installare Dipendenze

```bash
cd C:\Users\giorg\zenova-ecommerce\backend
npm install
```

Questo installerà:
- ✅ Express (web framework)
- ✅ Prisma (database ORM)
- ✅ Axios (HTTP client)
- ✅ Winston (logging)
- ✅ Stripe (pagamenti)
- ✅ Helmet (sicurezza)
- ✅ CORS
- ✅ E altro...

---

## ⚙️ STEP 3: Configurare Ambiente

1. Copia il file `.env.example` in `.env`:
```bash
copy .env.example .env
```

2. Modifica `.env` con i tuoi dati:
```env
# Per ora lascia tutto così - BigBuy andrà in MOCK MODE
NODE_ENV=development
PORT=3000
BIGBUY_API_KEY=your_bigbuy_api_key_here  # Quando ti registri BigBuy
```

---

## 🗄️ STEP 4: Setup Database (OPZIONALE per ora)

**Puoi saltare questo step per ora** - il backend funziona anche senza DB (usa solo API BigBuy)

### Opzione A: PostgreSQL Locale

1. Installa PostgreSQL: https://www.postgresql.org/download/windows/
2. Crea database:
```sql
CREATE DATABASE zenova;
```
3. Aggiorna `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/zenova"
```

### Opzione B: PostgreSQL Cloud (Railway)

1. Vai su https://railway.app
2. New Project → PostgreSQL
3. Copia `DATABASE_URL` e metti in `.env`

### Prisma Migration

Quando database pronto:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🚀 STEP 5: Avviare Server

```bash
npm run dev
```

Dovresti vedere:
```
🚀 Server Zenova avviato su porta 3000
📝 Ambiente: development
🌐 Frontend URL: http://localhost:5500
⚠️  BigBuy in MOCK MODE - usando dati finti
```

---

## ✅ STEP 6: Testare API

### Test 1: Health Check
Apri browser: http://localhost:3000/health

Dovresti vedere:
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Test 2: Lista Prodotti (MOCK)
http://localhost:3000/api/products

Dovresti vedere 3 prodotti mock:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 123456,
        "name": "Diffusore Aromi Ultrasonico 400ml",
        "price": 35.00,
        ...
      },
      ...
    ]
  }
}
```

### Test 3: Validare Carrello
```bash
# Con curl o Postman
curl -X POST http://localhost:3000/api/cart/validate \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":123456,"quantity":2}]}'
```

---

## 🎯 Cosa Funziona Ora

✅ **Server Express attivo**
✅ **API prodotti (con dati MOCK BigBuy)**
✅ **API carrello validate**
✅ **Logging completo**
✅ **CORS configurato**
✅ **Rate limiting**
✅ **Gestione errori**

---

## 🔄 Cosa Manca (da fare)

🔄 **Database Prisma** (opzionale per ora)
🔄 **Stripe checkout** (prossimo step)
🔄 **Email service** (prossimo step)
🔄 **BigBuy API reale** (quando ti registri)

---

## 🐛 Troubleshooting

### "npm: command not found"
→ Node.js non installato. Installa da nodejs.org

### "Error: Cannot find module..."
→ Dipendenze mancanti. Esegui: `npm install`

### "Port 3000 already in use"
→ Cambia porta in `.env`: `PORT=3001`

### "ECONNREFUSED database"
→ Database non avviato o URL errato in `.env`

---

## 📚 Prossimi Passi

1. ✅ **Backend funzionante** (completato!)
2. 🔄 **Integrare Stripe** per checkout
3. 🔄 **Completare database** Prisma
4. 🔄 **Collegare frontend** Zenova
5. 🔄 **Registrare BigBuy** e sostituire mock

---

## 🆘 Aiuto

Se hai problemi:
1. Controlla i log in `logs/error.log`
2. Verifica `.env` configurato correttamente
3. Controlla che porta 3000 sia libera

---

**Backend pronto per lo sviluppo! 🎉**

Procediamo con Stripe o database? Oppure testiamo prima le API?
