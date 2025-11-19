/**
 * Script per ri-categorizzare tutti i prodotti FTP con il sistema intelligente
 */

const fs = require('fs');
const path = require('path');
const { categorizeProduct, getProductSubcategory } = require('./config/category-mapping');

console.log('\n🔄 RICATEGORIZZAZIONE PRODOTTI FTP\n');
console.log('='.repeat(70));

// Carica prodotti
const productsPath = path.join(__dirname, 'top-products-updated.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log(`\n📦 Prodotti totali: ${products.length}`);

// Filtra solo prodotti FTP
const ftpProducts = products.filter(p => p.source === 'bigbuy_ftp');
console.log(`📥 Prodotti FTP: ${ftpProducts.length}`);

// Statistiche
const stats = {
  total: ftpProducts.length,
  categorized: 0,
  byCategory: {},
  failed: 0
};

// Ricategorizza ogni prodotto
console.log('\n🔍 Applicazione categorizzazione intelligente...\n');

const updatedProducts = products.map(product => {
  if (product.source !== 'bigbuy_ftp') {
    return product; // Mantieni prodotti non-FTP come sono
  }

  try {
    // Applica categorizzazione intelligente
    const newCategories = categorizeProduct(product);
    const newSubcategory = getProductSubcategory(product);

    // Aggiorna prodotto
    const updated = {
      ...product,
      zenovaCategories: newCategories,
      zenovaSubcategory: newSubcategory
    };

    // Statistiche
    stats.categorized++;
    newCategories.forEach(cat => {
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });

    return updated;
  } catch (error) {
    console.error(`❌ Errore categorizzazione prodotto ${product.id}:`, error.message);
    stats.failed++;
    return product;
  }
});

// Salva prodotti aggiornati
console.log('💾 Salvataggio prodotti ricategorizzati...');
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));

// Mostra statistiche
console.log('\n✅ RICATEGORIZZAZIONE COMPLETATA!\n');
console.log('='.repeat(70));
console.log(`\n📊 Prodotti ricategorizzati: ${stats.categorized}`);
console.log(`❌ Errori: ${stats.failed}`);

console.log('\n📂 Distribuzione per Categoria Zenova:\n');
Object.entries(stats.byCategory)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(percentage / 2));
    console.log(`   ${cat.padEnd(25)} ${count.toString().padStart(6)} prodotti (${percentage.padStart(5)}%) ${bar}`);
  });

// Conta prodotti con categorie Zenova valide (escluso "generale")
const validCategories = ['smart-living', 'cura-corpo-skin', 'meditazione-zen', 'design-atmosfera', 'gourmet-tea-coffee'];
const validProducts = updatedProducts.filter(p =>
  p.source === 'bigbuy_ftp' &&
  p.zenovaCategories &&
  p.zenovaCategories.some(c => validCategories.includes(c))
);

console.log(`\n🎯 Prodotti Zenova validi (escluso generale): ${validProducts.length}`);
console.log(`   (Questi saranno visibili nel Browser Catalogo)\n`);

console.log('✅ File aggiornato: top-products-updated.json\n');
