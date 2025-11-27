/**
 * Script per aggiungere i prodotti Smart Living alla zona sidebar
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Aggiunta prodotti Smart Living alla sidebar...\n');

// Carica product-layout
const layoutPath = path.join(__dirname, 'config/product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

// Carica prodotti
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Trova prodotti Smart Living
const smartLivingProducts = products.filter(p =>
  p.zenovaCategories && p.zenovaCategories.includes('smart-living')
);

console.log(`📦 Trovati ${smartLivingProducts.length} prodotti Smart Living\n`);

// Inizializza sidebar se non esiste
if (!layout.sidebar) {
  layout.sidebar = [];
}

// Aggiungi i prodotti Smart Living alla sidebar (se non ci sono già)
let addedCount = 0;
smartLivingProducts.forEach(product => {
  if (!layout.sidebar.includes(product.id) &&
      !layout.home?.includes(product.id) &&
      !layout.hidden?.includes(product.id)) {
    layout.sidebar.push(product.id);
    console.log(`✅ Aggiunto: ${product.name.substring(0, 60)}`);
    addedCount++;
  }
});

// Salva il file aggiornato
fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2));

console.log(`\n✅ Completato!`);
console.log(`📊 Prodotti aggiunti alla sidebar: ${addedCount}`);
console.log(`📊 Totale sidebar: ${layout.sidebar.length}`);
console.log(`📊 Totale home: ${layout.home?.length || 0}`);
console.log(`📊 Totale hidden: ${layout.hidden?.length || 0}`);
