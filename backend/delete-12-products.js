const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🗑️  Eliminazione 12 prodotti specifici\n');

// ID dei 12 prodotti da eliminare
const idsToDelete = [
  'AW-390273', 'AW-390268', 'AW-390265',
  'AW-390238', 'AW-390250', 'AW-390263',
  'AW-390252', 'AW-390251', 'AW-390262',
  'NSMed-03', 'NSMed-14', 'NSMed-16'
];

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const beforeCount = catalog.length;

console.log(`📦 Catalogo iniziale: ${beforeCount} prodotti\n`);

// Filtra via i 12 prodotti
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
