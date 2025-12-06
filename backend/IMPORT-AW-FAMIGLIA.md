# Guida Importazione Famiglia AW Dropship

## Sistema Perfetto - Testato e Funzionante ✅

Questo sistema importa correttamente:
- ✅ Prodotti completi dal CSV
- ✅ Immagini HD locali
- ✅ Schede tecniche dettagliate
- ✅ Prezzi, stock, specifiche
- ✅ Mapping automatico subcategory Zenova

## Processo Step-by-Step

### 1. Scaricare CSV dalla dashboard AW Dropship

**URL formato:**
```
https://www.aw-dropship.eu/[CODICE-FAMIGLIA]/data-feed.csv
```

**Esempio per diffusori:**
```
https://www.aw-dropship.eu/aatom-dssk/data-feed.csv
```

### 2. Script di Importazione

Lo script `import-diffusori-from-csv.js` fa:

1. **Scarica CSV** dal link AW
2. **Pulisce vecchi prodotti** della stessa famiglia (evita duplicati)
3. **Legge il CSV** e estrae tutti i dati
4. **Filtra prodotti attivi** (skip OutofStock/Inactive)
5. **Estrae schede tecniche** dalla descrizione HTML
6. **Mappa immagini HD locali** da `/images/aw-products/[categoria]/`
7. **Calcola prezzi** con markup automatico
8. **Salva in top-100-products.json**

### 3. Aggiungere al Layout

Script `add-aatom-to-layout.js`:
- Aggiunge SKU al file `product-layout.json`
- Li mette in sezione "sidebar" (visibili ma non homepage)

### 4. Fix Campi Zenova

Script `fix-aatom-zenova-fields.js`:
- Aggiunge `zenovaSubcategory`
- Aggiunge `zenovaCategory`
- Aggiunge `zenovaCategories`

### 5. Riavvio Backend

```bash
cd backend
node server.js
```

## Comandi Rapidi

```bash
# 1. Importa famiglia
cd zenova-ecommerce/backend
curl -k -L "https://www.aw-dropship.eu/CODICE-FAMIGLIA/data-feed.csv" -o aw-import.csv
node import-diffusori-from-csv.js

# 2. Aggiungi al layout
node add-aatom-to-layout.js

# 3. Fix campi Zenova
node fix-aatom-zenova-fields.js

# 4. Riavvia backend
node server.js
```

## Struttura File Importati

```json
{
  "id": 3912,
  "sku": "AATOM-11",
  "name": "Milan Atomiser - USB - Colour Change",
  "description": "...",
  "price": 21.20,
  "cost": 14.13,
  "rrp": 24.37,
  "category": "Aromatherapy",
  "subcategory": "diffusori",
  "zenovaSubcategory": "diffusori",
  "zenovaCategory": "aromatherapy",
  "zenovaCategories": ["aromatherapy"],
  "images": ["/images/aw-products/diffusori/AATOM-11.jpg"],
  "features": [...],
  "specifications": {...},
  "supplier": "AW Dropship"
}
```

## Note Importanti

1. **Immagini HD**: Devono essere già scaricate in `/images/aw-products/[categoria]/`
2. **SKU univoci**: Ogni famiglia ha prefisso diverso (AATOM, NSMed, etc.)
3. **Stock**: "Normal" = 50 unità, numero = quantità esatta
4. **Prezzi**: Costo CSV × 1.5 = Prezzo vendita
5. **Filtro attivi**: Solo prodotti con Status="Active"

## Famiglie AW Disponibili

- **AATOM** - Diffusori aromi (✅ testato)
- **NSMed** - Altri prodotti wellness
- Altri da identificare nella dashboard AW

## File Coinvolti

1. `import-diffusori-from-csv.js` - Script importazione principale
2. `add-aatom-to-layout.js` - Aggiunta al layout
3. `fix-aatom-zenova-fields.js` - Fix campi Zenova
4. `top-100-products.json` - Database prodotti
5. `config/product-layout.json` - Layout visibilità

## Risultato Finale

✅ 16 diffusori AW importati
✅ Schede tecniche complete
✅ Immagini HD locali
✅ Prezzi e stock aggiornati
✅ Visibili su frontend categoria "Aromatherapy → Diffusori"
