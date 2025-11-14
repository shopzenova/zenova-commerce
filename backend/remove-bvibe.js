const fs = require('fs');
const path = require('path');

// Carica il catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
let catalog = [];

try {
  const data = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
} catch (error) {
  console.log('❌ Errore lettura catalogo:', error.message);
  process.exit(1);
}

// Rimuovi prodotti B-Vibe
const before = catalog.length;
catalog = catalog.filter(p => {
  const isBVibe = p.name && p.name.includes('Vibratore') && p.name.includes('B-Vibe');
  if (isBVibe) {
    console.log(`❌ Rimosso: ${p.name}`);
  }
  return !isBVibe;
});

const removed = before - catalog.length;

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n✅ Catalogo aggiornato!`);
console.log(`📦 Prodotti prima: ${before}`);
console.log(`📦 Prodotti dopo: ${catalog.length}`);
console.log(`🗑️  Prodotti rimossi: ${removed}`);
