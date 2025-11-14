const fs = require('fs');
const path = require('path');

// Carica il catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
let catalog = [];

try {
  const data = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`📦 Catalogo attuale: ${catalog.length} prodotti\n`);
} catch (error) {
  console.log('❌ Errore lettura catalogo:', error.message);
  process.exit(1);
}

const before = catalog.length;

// Rimuovi la custodia Kobo
catalog = catalog.filter(p => {
  const isCustodia = p.name && p.name.includes('Custodia per Tablet Rakuten Kobo');
  if (isCustodia) {
    console.log(`❌ Rimosso: ${p.name}`);
    console.log(`   Categoria: ${p.category}`);
    console.log(`   Prezzo: €${p.price}`);
  }
  return !isCustodia;
});

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n✅ Catalogo aggiornato!`);
console.log(`📦 Prodotti prima: ${before}`);
console.log(`📦 Prodotti dopo: ${catalog.length}`);
console.log(`❌ Prodotti eliminati: ${before - catalog.length}`);
