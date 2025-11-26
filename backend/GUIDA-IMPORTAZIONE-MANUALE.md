# Guida Importazione Manuale Prodotti Smart Living & Tech Innovation

## Formato Prodotto Richiesto

Per aggiungere prodotti manualmente al catalogo `top-100-products.json`, ogni prodotto deve avere questa struttura:

```json
{
  "id": "SKU_PRODOTTO",
  "name": "Nome Prodotto",
  "description": "<p>Descrizione HTML del prodotto</p>",
  "brand": "ID_BRAND",
  "category": "2400,2421",
  "subcategory": "2400,2421",
  "zenovaCategory": "smart-living",
  "zenovaSubcategory": "illuminazione-smart",
  "price": 49.99,
  "retailPrice": 74.99,
  "wholesalePrice": 39.99,
  "stock": 50,
  "images": [
    "https://cdnbigbuy.com/images/SKU_R00.jpg",
    "https://cdnbigbuy.com/images/SKU_R01.jpg"
  ],
  "image": "https://cdnbigbuy.com/images/SKU_R00.jpg",
  "ean": "1234567890123",
  "weight": 0.5,
  "dimensions": {
    "width": 10,
    "height": 15,
    "depth": 5
  },
  "active": true
}
```

## Categorie Zenova Disponibili

### 1. Smart Living (smart-living)
**Sottocategorie suggerite:**
- `illuminazione-smart` - Lampadine LED, strisce LED, wake-up light
- `domotica` - Sensori, telecamere, campanelli smart
- `wireless-audio` - Speaker Bluetooth, casse wireless
- `smart-accessories` - Robot aspirapolvere, purificatori aria

**Icona:** 🏠

### 2. Tech Innovation (tech-innovation)
**Sottocategorie suggerite:**
- `wearables` - Smartwatch, fitness tracker, smart band
- `audio-tech` - Auricolari wireless, cuffie Bluetooth
- `gadget-tech` - Gadget innovativi, mini projector
- `health-tech` - Massaggiatori elettrici, TENS machine

**Icona:** ⚡

### 3. Beauty (beauty) ✅ GIÀ POPOLATA
- 5046 prodotti sincronizzati

### 4. Health & Personal Care (health-personal-care) ✅ GIÀ POPOLATA
- 1282 prodotti sincronizzati

### 5. Natural Wellness (natural-wellness) 🔜 DA CONFIGURARE
- Con fornitore AW Dropship

## Lista Prodotti Selezionati (60)

I prodotti selezionati sono salvati in:
```
backend/smart-tech-products-list.json
```

**Contenuto:**
- 30 prodotti Smart Living
- 30 prodotti Tech Innovation

Tutti con prezzo €15-150, stock disponibile, immagini verificate.

## Procedura Importazione Manuale

### Opzione 1: Modifica Diretta File JSON

1. Apri `backend/top-100-products.json`
2. Copia il formato prodotto sopra
3. Compila tutti i campi obbligatori
4. Aggiungi l'oggetto all'array prima dell'ultima parentesi `]`
5. Salva il file
6. Riavvia il server: `npm start`

### Opzione 2: Via Pannello Admin (CONSIGLIATO)

1. Accedi al pannello admin: `http://localhost:3000/admin.html`
   - Username: `admin`
   - Password: `admin123`

2. Vai alla sezione **"Gestione Categorie"**

3. Seleziona categoria: **Smart Living** o **Tech Innovation**

4. Nella lista prodotti FTP, cerca il prodotto per SKU

5. Click sul pulsante **"Importa"** per aggiungerlo al catalogo

6. Il prodotto verrà automaticamente:
   - Categorizzato correttamente
   - Aggiunto a `top-100-products.json`
   - Visibile nel frontend

### Opzione 3: Script Batch (Import Automatico Graduale)

Per evitare il rate limit BigBuy (10 richieste/ora):

```bash
cd backend
node import-batch-smart-tech.js
```

Lo script:
- Importa 10 prodotti alla volta
- Salva il progresso in `import-progress.json`
- Può essere rieseguito ogni ora finché completo
- Tempo totale stimato: ~6 ore per 60 prodotti

## Campi Obbligatori

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | String | SKU del prodotto (es. "M0311542") |
| `name` | String | Nome prodotto |
| `zenovaCategory` | String | Categoria Zenova: "smart-living" o "tech-innovation" |
| `price` | Number | Prezzo al pubblico (IVA inclusa) |
| `stock` | Number | Quantità disponibile |
| `images` | Array | Array di URL immagini |
| `image` | String | URL prima immagine (copertina) |
| `active` | Boolean | `true` per rendere visibile il prodotto |

## Campi Opzionali (ma consigliati)

- `description` - Descrizione HTML
- `brand` - ID brand BigBuy
- `zenovaSubcategory` - Per filtri avanzati
- `retailPrice` - Prezzo consigliato
- `wholesalePrice` - Prezzo d'acquisto fornitore
- `ean` - Codice EAN/barcode
- `weight` - Peso in kg
- `dimensions` - Oggetto con width, height, depth in cm

## Verificare Import Riuscito

1. **Via Browser:**
   - Vai su `http://localhost:3000/smart-living.html`
   - Verifica che i prodotti appaiano

2. **Via API:**
   ```bash
   curl http://localhost:3000/api/products?category=smart-living
   ```

3. **Via Pannello Admin:**
   - Sezione "Gestione Categorie"
   - Filtra per categoria
   - Controlla che i prodotti siano nella lista

## Rimuovere Prodotti Sbagliati

Se hai importato prodotti errati:

### Metodo 1: Via File JSON
1. Apri `backend/top-100-products.json`
2. Cerca il prodotto per SKU o nome
3. Rimuovi l'intero oggetto (incluse le parentesi graffe)
4. Salva e riavvia server

### Metodo 2: Script di Pulizia
```javascript
// backend/remove-products.js
const fs = require('fs');
const products = require('./top-100-products.json');

// Lista SKU da rimuovere
const skuToRemove = ['M0311542', 'S9916669'];

const cleaned = products.filter(p => !skuToRemove.includes(p.id));

fs.writeFileSync('top-100-products.json', JSON.stringify(cleaned, null, 2));
console.log(`Rimossi ${products.length - cleaned.length} prodotti`);
```

## Backup Prima di Modificare

SEMPRE creare backup prima di modifiche manuali:

```bash
cd backend
cp top-100-products.json top-100-products.backup-$(date +%Y%m%d-%H%M).json
```

## Stato Attuale Catalogo

- **Totale prodotti:** 6328
- **Beauty:** 5046 ✅
- **Health & Personal Care:** 1282 ✅
- **Smart Living:** 0 (da importare)
- **Tech Innovation:** 0 (da importare)
- **Natural Wellness:** 0 (futuro)

## Troubleshooting

### Prodotto non appare nel frontend
- Verifica campo `active: true`
- Verifica `zenovaCategory` corretta
- Controlla che `stock > 0`
- Riavvia il server

### Errore parsing JSON
- Usa un validator JSON: https://jsonlint.com/
- Controlla virgole mancanti/extra
- Verifica parentesi bilanciate

### Immagini non caricano
- Verifica URL immagini accessibili
- Usa sempre HTTPS
- CDN BigBuy: `https://cdnbigbuy.com/images/`

---

**Pronto per l'import!** 🚀

Per domande o problemi, consulta:
- `backend/config/category-mapping.js` - Configurazione categorie
- `backend/smart-tech-products-list.json` - Lista prodotti selezionati
