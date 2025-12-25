const fs = require('fs');
const path = require('path');

console.log('📦 Creazione products.json ridotto per Vercel...\n');

// Carica database completo
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));
const layout = JSON.parse(fs.readFileSync('config/product-layout.json', 'utf-8'));

console.log(`Database completo: ${products.length} prodotti`);

// Prendi solo prodotti visibili o in layout
const visibleIds = new Set([...layout.home, ...layout.sidebar]);
const liteProducts = products.filter(p => p.visible === true || visibleIds.has(p.id));

console.log(`Prodotti visibili: ${liteProducts.length}`);

// Salva versione ridotta
const outputPath = path.join(__dirname, '..', 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(liteProducts, null, 2));

const stats = fs.statSync(outputPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log(`\n✅ File creato: ${outputPath}`);
console.log(`📊 Dimensione: ${sizeMB} MB`);
console.log(`📦 Prodotti: ${liteProducts.length}`);
