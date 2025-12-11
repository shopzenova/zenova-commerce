const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// Cerca prodotti UNLABELLED o SENZA ETICHETTA in oli-fragranza
const unlabelled = data.filter(p =>
  p.zenovaSubcategory === 'oli-fragranza' &&
  p.name &&
  (p.name.includes('UNLABELLED') || p.name.includes('SENZA ETICHETTA'))
);

console.log('Prodotti UNLABELLED/SENZA ETICHETTA in oli-fragranza:\n');
console.log(`Totale: ${unlabelled.length}\n`);

unlabelled.forEach(p => {
  console.log(`  - ${p.id} | ${p.name}`);
});

console.log(`\nID da eliminare:`);
console.log(unlabelled.map(p => p.id).join(', '));
