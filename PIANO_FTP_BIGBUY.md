# 🎉 SCOPERTA FTP BIGBUY - SOLUZIONE DEFINITIVA!

**Data**: 7 Novembre 2025 - Sera (18:00)
**Status**: ✅ TESTATO E FUNZIONANTE

---

## 🚀 COSA ABBIAMO SCOPERTO

BigBuy offre **accesso FTP** con file CSV/XML completi!

### ✅ Vantaggi FTP vs API REST
- ❌ **API REST**: Rate limit 429, chiamate lente, dati incompleti
- ✅ **FTP CSV**: Nessun rate limit, download 1 volta, TUTTI i dati!

---

## 📋 CREDENZIALI FTP

```
Server: www.dropshippers.com.es
Username: bbCDCSK9mS6i
Password: XgVEDUdao7
Porta: 21 (FTP standard)
```

**⚠️ IMPORTANTE**: Non saturare il servizio! BigBuy disattiverà l'account se scarichi troppo spesso.

**⏰ Orario download**: Mezzogiorno (file aggiornati in mattinata)

---

## 📂 STRUTTURA FTP

```
/
├── files/
│   ├── categories/
│   │   └── csv/
│   │       └── mapper_category.csv          ← Mappa ID → Nome categoria
│   ├── products/
│   │   └── csv/
│   │       ├── standard/
│   │       │   ├── product_2399_it.csv      ← Casa | Giardino (94 MB)
│   │       │   ├── product_2491_it.csv      ← Sport | Fitness (43 MB)
│   │       │   ├── product_2501_it.csv      ← Salute | Bellezza (29 MB)
│   │       │   └── product_2507_it.csv      ← Profumeria | Cosmesi (38 MB)
│   │       └── prestashop/
│   ├── combinations/
│   ├── manufacturer/
│   └── shipping_costs/
└── shipping_costs.csv
```

---

## 🎯 FILE CSV PER ZENOVA

### Categorie BigBuy per Zenova:

| ID | Nome IT | Nome EN | File CSV | Dimensione |
|---|---|---|---|---|
| 2399 | Casa \| Giardino | Home \| Garden | product_2399_it.csv | 94 MB |
| 2491 | Sport \| Fitness | Sports \| Fitness | product_2491_it.csv | 43 MB |
| 2501 | Salute \| Bellezza | Health \| Beauty | product_2501_it.csv | 29 MB |
| 2507 | Profumeria \| Cosmesi | Perfumes \| Cosmetics | product_2507_it.csv | 38 MB |

**Totale**: ~204 MB di dati prodotti in italiano!

---

## 📊 STRUTTURA FILE CSV (Esempio)

I file CSV standard contengono:
- ID prodotto
- SKU
- Nome prodotto (IT)
- Descrizione (IT)
- Prezzo wholesale
- Prezzo retail
- EAN/Barcode
- Immagini (URLs)
- Peso/Dimensioni
- Categoria
- Manufacturer
- Stock
- Attributi/Varianti
- E altro...

**Formato**: CSV con separatore `;` (punto e virgola)
**Encoding**: UTF-8

---

## 🚀 PIANO IMPLEMENTAZIONE

### Step 1: Script Download CSV (DOMANI MATTINA alle 12:00)

```bash
cd zenova-ecommerce/backend
node scripts/download-bigbuy-ftp.js
```

**Cosa fa**:
1. Connette a FTP BigBuy
2. Scarica 4 file CSV (2399, 2491, 2501, 2507)
3. Salva in `backend/bigbuy-data/`
4. Log dettagliato progresso

**Tempo stimato**: 5-10 minuti (205 MB)

### Step 2: Parser CSV → JSON

```bash
node scripts/parse-bigbuy-csv.js
```

**Cosa fa**:
1. Legge i 4 file CSV
2. Parsa i campi (nome, descrizione, prezzo, immagini)
3. Filtra prodotti (prezzo €5-€300, attivi, con stock)
4. Genera file JSON unificato
5. Salva in `backend/bigbuy-data/products.json`

**Tempo stimato**: 2-3 minuti

### Step 3: Integrazione Backend

Modifica `BigBuyClient.js`:
```javascript
// Invece di chiamare API REST
async getProducts() {
    // Leggi da file JSON locale
    const products = JSON.parse(
        fs.readFileSync('bigbuy-data/products.json')
    );
    return products;
}
```

**Vantaggi**:
- ✅ Zero chiamate API (no rate limit!)
- ✅ Velocissimo (legge da file locale)
- ✅ Dati completi (nomi, descrizioni, immagini IT)
- ✅ Aggiornamento 1 volta al giorno

### Step 4: Automazione Daily Update

Cron job (o Scheduled Task Windows):
```bash
# Ogni giorno alle 12:00
0 12 * * * cd /path/to/zenova-ecommerce/backend && node scripts/update-bigbuy-data.js
```

**Script automatico**:
1. Download CSV da FTP
2. Parse e conversione
3. Aggiorna JSON
4. Log risultati
5. Email notifica (opzionale)

---

## 📝 ESEMPIO PRODOTTO CSV

Dopo parsing, ogni prodotto avrà:

```json
{
    "id": 1249483,
    "sku": "XIOPWPSRGO",
    "name": "Tappetino Yoga Premium Eco-Friendly",
    "description": "Tappetino yoga in gomma naturale, antiscivolo...",
    "category": {
        "id": 2491,
        "name": "Sport | Fitness"
    },
    "price": {
        "wholesale": 15.50,
        "retail": 34.90,
        "suggested": 49.90
    },
    "images": [
        "https://cdn.bigbuy.eu/images/products/1249483_1.jpg",
        "https://cdn.bigbuy.eu/images/products/1249483_2.jpg"
    ],
    "stock": 150,
    "weight": 1.2,
    "manufacturer": "YogaMaster",
    "active": true
}
```

---

## ⏰ TIMELINE DOMANI

### 🌅 Mattina (9:00 - 11:00)
- Preparare script download FTP
- Preparare parser CSV
- Testare con file piccolo

### 🕛 Mezzogiorno (12:00)
- ✅ **DOWNLOAD** 4 file CSV da FTP BigBuy
- ✅ **PARSE** CSV → JSON
- ✅ **VERIFICA** dati estratti

### 🌆 Pomeriggio (14:00+)
- ✅ Integrare JSON nel backend
- ✅ Testare frontend con dati reali
- ✅ Configurare update automatico
- ✅ **DEPLOY** (se tutto ok!)

---

## 🎯 RISULTATO FINALE

**Prima (con API REST)**:
- ❌ Rate limit 429
- ❌ Dati incompleti (solo ID, SKU, prezzo)
- ❌ Nessun nome/descrizione/immagine
- ❌ Chiamate lente (3 sec delay)

**Dopo (con FTP CSV)**:
- ✅ Zero rate limit
- ✅ Dati COMPLETI (nomi, descrizioni, immagini IT)
- ✅ Migliaia di prodotti disponibili
- ✅ Velocità: lettura istantanea da JSON locale
- ✅ Aggiornamento: 1 volta al giorno (automatico)

---

## 📂 FILE CREATI OGGI

```
backend/
├── bigbuy-data/                    ← Cartella nuova
│   └── mapper_category.csv         ← Scaricato (mappa categorie)
├── scripts/                         ← Da creare domani
│   ├── download-bigbuy-ftp.js      ← Script download CSV
│   ├── parse-bigbuy-csv.js         ← Parser CSV→JSON
│   └── update-bigbuy-data.js       ← Update automatico
├── test-bigbuy-ftp.js              ← Test connessione (creato oggi)
├── explore-ftp-detailed.js         ← Esplorazione FTP (creato oggi)
└── download-bigbuy-csv.js          ← Download singolo file (creato oggi)
```

---

## 🔧 SCRIPT GIÀ PRONTI

✅ **test-bigbuy-ftp.js** - Testa connessione FTP
✅ **explore-ftp-detailed.js** - Esplora cartelle e trova file
✅ **download-bigbuy-csv.js** - Scarica singolo CSV

**Da creare domani**:
- [ ] Script download automatico 4 file
- [ ] Parser CSV completo
- [ ] Integrazione backend
- [ ] Cron job update

---

## 💡 NOTE IMPORTANTI

### Rate Limit FTP
BigBuy dice: **"Non saturare il servizio"**

**Best practice**:
- ✅ Download 1 volta al giorno (mezzogiorno)
- ❌ NON scaricare ogni ora
- ❌ NON scaricare in loop
- ✅ Usa file locale per tutto il giorno
- ✅ Update automatico notturno

### Dimensioni File
- Totale: ~205 MB
- Download: 5-10 min con ADSL
- Storage: Abbondante spazio disco

### Dati Aggiornati
BigBuy aggiorna i file **in mattinata**.
Scarica a **mezzogiorno** per avere dati freschi.

---

## 🎉 ACHIEVEMENT SERA 7 NOV

✅ Scoperto accesso FTP BigBuy
✅ Ottenute credenziali
✅ Testata connessione FTP
✅ Esplorata struttura file
✅ Trovate categorie Zenova
✅ Verificati 4 file CSV (205 MB)
✅ Scaricato mapper categorie
✅ Creati script test FTP

**DOMANI**: Download e import dati reali! 🚀

---

**Creato**: 7 Novembre 2025 - 18:00
**Prossimo step**: Download CSV alle 12:00 di domani!
