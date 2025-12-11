const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const layoutPath = path.join(__dirname, 'config/product-layout.json');

console.log('🔧 Aggiunta prodotti diffusori al layout\n');

// Carica catalogo e layout
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

// Trova tutti i prodotti diffusori
const diffusori = catalog.filter(p => p.zenovaSubcategory === 'diffusori').map(p => p.id);

console.log(`Prodotti con zenovaSubcategory='diffusori': ${diffusori.length}`);

// Trova quanti sono già nel sidebar
const existing = diffusori.filter(id => layout.sidebar.includes(id));
console.log(`Già in sidebar: ${existing.length}`);

// Aggiungi i mancanti
const toAdd = diffusori.filter(id => !layout.sidebar.includes(id));
console.log(`Da aggiungere: ${toAdd.length}\n`);

if (toAdd.length > 0) {
  layout.sidebar.push(...toAdd);
  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8');
  console.log(`✅ Aggiunti ${toAdd.length} prodotti al layout sidebar`);
  console.log(`✅ Totale sidebar: ${layout.sidebar.length}`);
} else {
  console.log('✅ Tutti i prodotti diffusori sono già nel layout');
}
