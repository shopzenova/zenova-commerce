const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🗑️  Eliminazione 3 prodotti (ML) Dress\n');

// ID dei 3 prodotti da eliminare
const idsToDelete = ['AW-390271', 'AW-390264', 'AW-390266'];

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const beforeCount = catalog.length;

console.log(`📦 Catalogo iniziale: ${beforeCount} prodotti\n`);

// Filtra via i 3 prodotti
catalog = catalog.filter(p => {
  if (idsToDelete.includes(p.id)) {
    console.log(`❌ Eliminato: ${p.id} - ${p.name}`);
    return false;
  }
  return true;
});

const afterCount = catalog.length;
const deleted = beforeCount - afterCount;

console.log(`\n📊 Risultato:`);
console.log(`   Prodotti eliminati: ${deleted}`);
console.log(`   Catalogo finale: ${afterCount} prodotti`);

// Salva
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`\n✅ Salvato\n`);
