const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Prodotti totali: ${products.length}`);

// Trova prodotti AW vecchi (con ID AW-* invece di SKU EO-*)
const oldAWProducts = products.filter(p =>
    p.id && typeof p.id === 'string' && p.id.startsWith('AW-') && p.supplier === 'aw-dropship'
);

console.log(`\n🔍 Trovati ${oldAWProducts.length} prodotti AW vecchi da rimuovere:`);
oldAWProducts.forEach(p => {
    console.log(`   - ${p.id}: ${p.name}`);
});

// Rimuovi i vecchi prodotti AW
const filtered = products.filter(p =>
    !(p.id && typeof p.id === 'string' && p.id.startsWith('AW-') && p.supplier === 'aw-dropship')
);

console.log(`\n📦 Prodotti dopo pulizia: ${filtered.length}`);
console.log(`🗑️  Rimossi: ${products.length - filtered.length} prodotti duplicati`);

// Salva
fs.writeFileSync(productsFile, JSON.stringify(filtered, null, 2));
console.log(`✅ File salvato: ${productsFile}`);
