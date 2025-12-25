const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Prodotti totali: ${products.length}`);

// Rimuovi solo AATOM
const filtered = products.filter(p => !p.sku || !p.sku.startsWith('AATOM-'));
console.log(`✅ Rimossi ${products.length - filtered.length} prodotti AATOM`);
console.log(`📦 Prodotti rimanenti: ${filtered.length}`);

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2));
console.log('💾 Salvato!');
