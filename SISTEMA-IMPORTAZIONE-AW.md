# Sistema di Importazione Prodotti AromaWorks (AW)

## 📋 Panoramica

Sistema completo e riutilizzabile per importare prodotti dal catalogo AromaWorks con:
- ✅ Schede tecniche complete
- ✅ Multiple immagini professionali
- ✅ Prezzi wholesale e retail
- ✅ Barcode, CPNP, specifiche complete
- ✅ Descrizioni HTML dettagliate

## 🎯 Categorie AW Disponibili

1. **Diffusori Elettronici** (AATOM) - ✅ **COMPLETATO**
2. **Oli Essenziali** (AWFO) - 📦 Pronto per importazione
3. **Oli per Massaggi**
4. **Candele Profumate**
5. **Incensi Naturali**
6. **Altri prodotti Natural Wellness**

## 🔧 File del Sistema

### Backend (Database SQLite)
- **`backend/import-diffusers.js`** - Importa CSV nel database locale
- **`backend/export-diffusers.js`** - Esporta da DB a products.json per Vercel
- **`backend/prisma/schema.prisma`** - Schema database prodotti

### Frontend (Vercel Statico)
- **`products.json`** - Tutti i prodotti per il frontend
- **`uploads/diffusers/`** - Immagini prodotti AW
- **`script.js`** - Gestione gallery e schede tecniche

## 📥 Processo di Importazione Completo

### STEP 1: Preparazione File da AW

1. **Accedi al pannello AW Dropship**
   - URL: https://app.aiku.io
   - Sezione: "I miei prodotti"

2. **Seleziona i prodotti**
   - Scegli categoria (es: Diffusori, Oli Essenziali)
   - Aggiungi al tuo portfolio
   - Verifica che siano "Active" o "Discontinuing"

3. **Esporta dati**
   - CSV: `Catalogare > Esporta > CSV` → `portfolio_data_feed_[date].csv`
   - Immagini: `Immagini > Scarica ZIP` → `portfolio_images_[code].zip`

4. **Salva file**
   - CSV in: `C:\Users\giorg\Downloads\`
   - ZIP in: `C:\Users\giorg\Downloads\`

### STEP 2: Configurazione Script

**Modifica `backend/import-diffusers.js`:**

```javascript
// LINEA 60-61: Aggiorna path file
const csvPath = 'C:\\Users\\giorg\\Downloads\\[TUO_FILE].csv';
const imagesDir = 'C:\\Users\\giorg\\zenova-ecommerce\\aw-[CATEGORIA]-images';

// LINEA 115-116: Modifica categoria e subcategory
category: 'Natural Wellness',  // O altra categoria
subcategory: 'oli-essenziali',  // Cambia per ogni tipo prodotto
```

**Modifica `backend/export-diffusers.js`:**

```javascript
// LINEA 14-19: Filtra per SKU pattern
where: {
  sku: {
    startsWith: 'AWFO-'  // Cambia pattern per categoria
  }
}

// LINEA 33-34: Imposta categoria frontend
category: 'Natural Wellness',
subcategory: 'oli-essenziali',  // Deve corrispondere al routing
```

### STEP 3: Esecuzione Importazione

```bash
# 1. Estrai immagini dallo ZIP
cd C:\Users\giorg\zenova-ecommerce
mkdir aw-[categoria]-images
powershell -Command "Expand-Archive -Path 'C:\Users\giorg\Downloads\[ZIP_FILE].zip' -DestinationPath 'aw-[categoria]-images' -Force"

# 2. Importa nel database locale
cd backend
node import-diffusers.js

# Output atteso:
# ✅ Importati: 28 prodotti
# ✅ Copiate: 176 immagini

# 3. Esporta per Vercel
node export-diffusers.js

# Output atteso:
# ✅ Products.json aggiornato
# 📊 Totale prodotti: 4344
```

### STEP 4: Copia Immagini nel Frontend

```bash
# Crea cartella uploads
mkdir C:\Users\giorg\zenova-ecommerce\uploads\[categoria]

# Copia immagini
powershell -Command "Copy-Item 'C:\Users\giorg\zenova-ecommerce\aw-[categoria]-images\*' 'C:\Users\giorg\zenova-ecommerce\uploads\[categoria]\' -Force"

# Verifica numero immagini
powershell -Command "(Get-ChildItem 'C:\Users\giorg\zenova-ecommerce\uploads\[categoria]' | Measure-Object).Count"
```

### STEP 5: Deploy su Vercel

```bash
cd C:\Users\giorg\zenova-ecommerce

# Aggiungi file al commit
git add products.json uploads/[categoria]/

# Commit con messaggio descrittivo
git commit -m "Import [N] [CATEGORIA] from AromaWorks

- Added [N] products with complete technical specs
- [N] professional product images included
- Prices from AW wholesale catalog
- Products in English (Google Translate handles translation)
- Categories: Natural Wellness > [Subcategory]

🤖 Generated with Claude Code"

# Push su GitHub (Vercel fa deploy automatico)
git push
```

### STEP 6: Verifica Online

Dopo 30-40 secondi:
- Vai su **shop.zenova.ovh**
- Naviga: Natural Wellness > [Categoria]
- Apri un prodotto e verifica:
  - ✅ Gallery immagini (frecce navigazione)
  - ✅ Descrizione HTML completa con elenchi puntati
  - ✅ Scheda tecnica (barcode, dimensioni, peso, materiali)
  - ✅ Tutte le specifiche AW

## 📊 Struttura Dati Prodotto AW

### Database (SQLite)

```javascript
{
  bigbuyId: 900019,        // ID fittizio generato
  sku: "AATOM-19",        // Codice prodotto AW
  name: "Copenhagen Atomiser...",
  description: "<p><strong>...</p>",  // HTML completo
  category: "Natural Wellness",
  price: 16.58,           // Wholesale price
  retailPrice: 29.50,     // RRP
  stock: 100,
  images: JSON.stringify([...]),
  features: JSON.stringify({
    barcode: "5055796...",
    family: "Aroma Diffusers",
    materials: "Plastic",
    dimensions: "15x10.5 (cm)",
    weight: 0.4,
    packageWeight: 0.614,
    countryOfOrigin: "CHN",
    unitsPerOuter: 1,
    cpnpNumber: ""
  }),
  weight: 0.4,
  dimensions: "15x10.5 (cm)",
  active: true
}
```

### Frontend (products.json)

```javascript
{
  id: 7,
  name: "Copenhagen Atomiser - USB - Colour Change - Timer",
  category: "Natural Wellness",
  subcategory: "diffusori-elettronici",
  price: 16.58,
  description: "<p><strong>Copenhagen Atomiser...</p>",  // HTML completo!
  icon: "💧",
  image: "/uploads/diffusers/aatom-19__61199.jpeg",
  images: [
    "/uploads/diffusers/aatom-19__61199.jpeg",
    "/uploads/diffusers/aatom-19__61200.jpeg",
    // ... fino a 11 immagini
  ],
  sku: "AATOM-19",
  stock: 100,
  weight: 0.4,
  dimensions: "15x10.5 (cm)",
  features: {
    barcode: "5055796...",
    family: "Aroma Diffusers",
    materials: "Plastic",
    // ... tutte le specifiche
  },
  badge: "Available"
}
```

## 🎨 Visualizzazione Frontend

### Gallery Immagini
- Multiple immagini navigabili con frecce
- Counter "1/11", "2/11", ecc.
- Zoom automatico
- Path: `/uploads/[categoria]/[sku]__[id].jpeg`

### Scheda Tecnica
- **Barcode** - Codice a barre prodotto
- **Famiglia** - Categoria AW (es: Aroma Diffusers)
- **Materiali** - Composizione (es: Plastic)
- **Dimensioni** - Formato dettagliato
- **Peso** - Peso netto prodotto
- **Peso Imballaggio** - Peso con confezione
- **Paese di Origine** - Codice paese (CHN, UK, etc.)
- **Unità per Scatola** - Pezzi per outer box
- **CPNP** - Numero registrazione cosmetici (quando presente)

### Descrizione HTML
- Paragrafi formattati con `<p>` tags
- Elenchi puntati con specifiche
- Grassetto per evidenziare caratteristiche chiave
- Include cosa è incluso nella confezione

## 🔄 Esempio Pratico: Importare Oli Essenziali

```bash
# 1. Scarica da AW
# - CSV: portfolio_data_feed_20251218.csv (100 oli AWFO)
# - ZIP: portfolio_images_oli.zip (400+ immagini)

# 2. Modifica import-diffusers.js
# - csvPath: 'oli_essenziali.csv'
# - imagesDir: 'aw-oils-images'
# - category: 'Natural Wellness'
# - subcategory: 'oli-essenziali'
# - SKU filter: startsWith('AWFO-')

# 3. Modifica export-diffusers.js
# - where: { sku: { startsWith: 'AWFO-' } }
# - subcategory: 'oli-essenziali'

# 4. Esegui
cd backend
node import-diffusers.js  # Import 100 oils
node export-diffusers.js  # Export to products.json

# 5. Copia immagini
mkdir uploads/oils
Copy-Item aw-oils-images/* uploads/oils/

# 6. Deploy
git add products.json uploads/oils/
git commit -m "Import 100 AW Essential Oils"
git push

# 7. Verifica su shop.zenova.ovh/Natural Wellness/Oli Essenziali
```

## ⚠️ Note Importanti

### Lingua
- **Oggi**: Prodotti in **inglese** (dati originali AW)
- **Google Translate Widget**: Traduce interfaccia automaticamente
- **Domani**: Traduzione italiana nativa quando MyMemory si sblocca

### Path Immagini
- **Locale**: `C:\Users\giorg\zenova-ecommerce\uploads\[categoria]\`
- **Frontend**: `/uploads/[categoria]/[filename]`
- **Vercel**: Serve automaticamente da `/uploads/` come file statici

### Prezzi
- `price` = Wholesale price da AW (costo acquisto)
- `retailPrice` = RRP da AW (prezzo consigliato vendita)
- Margine visibile per valutare profitto

### Stock
- Default: 100 unità per prodotti Active/Discontinuing
- 0 per Discontinued (esclusi automaticamente)

### Performance
- **Importazione**: ~30 secondi per 100 prodotti
- **Esportazione**: ~5 secondi
- **Deploy Vercel**: ~30-40 secondi
- **Totale**: < 2 minuti dall'import al live

## 🚀 Vantaggi del Sistema

✅ **Scalabile**: Importa 10 o 1000 prodotti con lo stesso processo
✅ **Riutilizzabile**: Stesso codice per tutte le categorie AW
✅ **Completo**: Mantiene tutti i dati AW (schede tecniche, immagini, prezzi)
✅ **Veloce**: Dal CSV al sito live in < 2 minuti
✅ **Professionale**: Stessa qualità delle schede prodotto AW
✅ **SEO-Ready**: HTML completo con descrizioni dettagliate

## 📈 Prossimi Passi

1. **Domani**: Tradurre diffusori in italiano nativo (MyMemory si sblocca)
2. **Espansione**: Importare oli essenziali AWFO (100+ prodotti)
3. **Ottimizzazione**: Aggiungere sezioni "Info Consegna" e "Resi"
4. **Crescita**: Completare Natural Wellness con incensi, candele, massaggi

## 📞 Troubleshooting

### Le immagini non si vedono
- Verifica path: `/uploads/[categoria]/` non `localhost:3000`
- Check `script.js` funzione `getAbsoluteImageUrl()`
- Controlla che immagini siano in `uploads/` prima del commit

### Prodotti non visibili
- Verifica `subcategory` corrisponda al routing
- Check `products.json` ha prodotti con quella subcategory
- Console browser: cerca errori filtro prodotti

### Descrizioni troncate
- Verifica `export-diffusers.js` riga 36
- NON usare `.substring(0, 200)`
- Mantieni `description: d.description || d.name`

---

**Sistema creato**: 18 Dicembre 2025
**Categoria test**: Diffusori Elettronici (28 prodotti, 176 immagini)
**Status**: ✅ Completato e funzionante su shop.zenova.ovh
