# 📦 GUIDA IMPORTAZIONE PRODOTTI AW

## 🚀 Procedura Veloce (Step by Step)

### 1️⃣ Prepara i File
```bash
# Copia il CSV nella cartella backend
cp "C:\Users\giorg\Downloads\tuo-file.csv" "C:\Users\giorg\zenova-ecommerce\backend\nome-categoria-NEW.csv"
```

### 2️⃣ Crea Script di Import
```bash
# Copia il template
cp TEMPLATE-import-aw-products.js import-nome-categoria.js
```

### 3️⃣ Configura lo Script
Apri `import-nome-categoria.js` e modifica solo queste righe:

```javascript
const CSV_FILE = './nome-categoria-NEW.csv';              // ← Nome del tuo CSV
const CATEGORIA = 'nome-categoria';                       // ← Nome tecnico (es: incenso)
const NOME_CATEGORIA = 'Nome Categoria';                  // ← Nome leggibile (es: Incenso)
const TAGS = ['tag1', 'tag2', 'tag3'];                    // ← Tags rilevanti
const DESCRIZIONE_DEFAULT = 'Descrizione di default';     // ← Descrizione se manca nel CSV
```

### 4️⃣ Esegui l'Import
```bash
cd C:\Users\giorg\zenova-ecommerce\backend
node import-nome-categoria.js
```

### 5️⃣ Riavvia il Backend
```bash
# Ferma il backend corrente (Ctrl+C se in foreground)
# Oppure usa KillShell se è in background

# Riavvia
cd C:\Users\giorg\zenova-ecommerce\backend
node server.js
```

### 6️⃣ Verifica nel Browser
```bash
# Apri il browser
start http://127.0.0.1:8080

# Fai Ctrl+F5 per ricaricare
# Cerca i nuovi prodotti
```

### 7️⃣ Deploy su Vercel
```bash
cd C:\Users\giorg\zenova-ecommerce

# Copia products.json aggiornato
cp backend/top-100-products.json products.json

# Commit e push
git add .
git commit -m "Import: [Numero] [Nome Categoria]

- Importati [numero] prodotti [categoria] dal CSV AW (25 dic)
- [Descrizione breve dei prodotti]
- Prezzi RRP corretti
- Categoria: [nome-categoria]
- Totale prodotti: [numero totale]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
"

git push
```

---

## 📋 Esempi di Configurazione per Categorie Comuni

### Incenso
```javascript
const CSV_FILE = './incenso-NEW.csv';
const CATEGORIA = 'incenso';
const NOME_CATEGORIA = 'Incenso';
const TAGS = ['incenso', 'aromaterapia', 'meditazione', 'rilassamento'];
const DESCRIZIONE_DEFAULT = 'Incenso di alta qualità.';
```

### Candele
```javascript
const CSV_FILE = './candele-NEW.csv';
const CATEGORIA = 'candele-gel-profumati-sali-bagno';
const NOME_CATEGORIA = 'Candele Gel Profumati e Sali da Bagno';
const TAGS = ['candela', 'profumo', 'relax', 'aromaterapia'];
const DESCRIZIONE_DEFAULT = 'Candela profumata di alta qualità.';
```

### Oli per Fragranza
```javascript
const CSV_FILE = './oli-fragranza-NEW.csv';
const CATEGORIA = 'oli-per-fragranza';
const NOME_CATEGORIA = 'Oli per Fragranza';
const TAGS = ['olio fragranza', 'profumo', 'diffusore', 'aromaterapia'];
const DESCRIZIONE_DEFAULT = 'Olio per fragranza di alta qualità.';
```

---

## 🔧 Script Utility Disponibili

### Rimuovere Prodotti AW
Se devi rimuovere tutti i prodotti AW prima di re-importare:
```bash
node remove-all-aw-products.js
```

### Rimuovere Solo una Categoria Specifica
Crea uno script custom:
```javascript
const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf-8'));

// Filtra via la categoria specifica
const filtered = products.filter(p => p.zenovaSubcategory !== 'nome-categoria');

fs.writeFileSync('./top-100-products.json', JSON.stringify(filtered, null, 2));
console.log(`✅ Rimossi ${products.length - filtered.length} prodotti`);
```

---

## 📊 Struttura CSV Richiesta

Il CSV deve avere queste colonne:
- `Product code` - SKU del prodotto
- `Unit Name` - Nome del prodotto
- `Unit RRP` - Prezzo di vendita al pubblico
- `Price` - Costo del prodotto
- `Available Quantity` - Stock disponibile
- `Images` - URL immagini (separate da virgola)
- `Webpage description (plain text)` - Descrizione (opzionale)

---

## ✅ Checklist Importazione

- [ ] CSV copiato nella cartella backend
- [ ] Script creato da template
- [ ] Configurazione corretta (nome file, categoria, tags)
- [ ] Import eseguito con successo
- [ ] Backend riavviato
- [ ] Prodotti verificati nel browser (Ctrl+F5)
- [ ] Commit e push su Git
- [ ] Deploy Vercel completato
- [ ] Prodotti verificati online su shop.zenova.ovh

---

## 🎯 Categorie AW Importate

✅ **Già Importate:**
- Diffusori Aromatici AATOM (28 prodotti)
- Diffusori Oli (20 prodotti)
- Oli Essenziali (45 prodotti)
- Pietre Preziose (26 prodotti)

**Totale prodotti AW:** 119
**Totale prodotti sito:** 4262

---

## 🆘 Troubleshooting

### Problema: "Cannot find module 'csv-parser'"
```bash
cd C:\Users\giorg\zenova-ecommerce\backend
npm install csv-parser
```

### Problema: Prezzi sbagliati visualizzati
- Verifica che usi `Unit RRP` e non `Price`
- Fai hard refresh (Ctrl+Shift+F5)
- Riavvia il backend
- Verifica che `products.json` sia copiato nella root per Vercel

### Problema: Immagini non caricate
- Verifica che le URL nel CSV siano complete
- Controlla che lo swap immagini funzioni (prodotto in uso come prima)

---

**Data ultima modifica:** 25 Dicembre 2025
