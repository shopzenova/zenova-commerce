const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🗑️  Eliminazione oli UNLABELLED/SENZA ETICHETTA\n');

// ID dei 22 prodotti da eliminare
const idsToDelete = [
  'AW-187397', 'AW-187398', 'AW-187433', 'AW-187400',
  'AW-187401', 'AW-187434', 'AW-187402', 'AW-187403',
  'AW-187404', 'AW-187405', 'AW-187406', 'AW-187407',
  'AW-187408', 'AW-187410', 'AW-187411', 'AW-187412',
  'AW-187413', 'AW-187414', 'AW-187415', 'AW-187416',
  'AW-229458', 'AW-187417'
];

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const beforeCount = catalog.length;

console.log(`📦 Catalogo iniziale: ${beforeCount} prodotti\n`);

// Filtra via i prodotti
catalog = catalog.filter(p => {
  if (idsToDelete.includes(p.id)) {
    console.log(`❌ ${p.id} - ${p.name?.substring(0, 60)}`);
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
