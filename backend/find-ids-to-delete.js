const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// Nomi dei 12 prodotti da eliminare (dal testo dell'utente)
const toDelete = [
  "Bianco, Blu & Oro con Simbolo Occhio Greco",
  "Blu Mare & Bianco",
  "Turchese & Bianco",
  "Gold & Blue Greek Motiff",
  "Rich Blue & Gold Hand Painted Evil Eye",
  "Turquoise & Gold Fish Design"
];

const vestiario = data.filter(p => p.zenovaSubcategory === 'vestiario-wellness');

console.log('Cercando i 12 prodotti da eliminare:\n');

const idsToDelete = [];

vestiario.forEach(p => {
  const match = toDelete.some(keyword => p.name && p.name.includes(keyword));
  if (match) {
    console.log(`✅ ${p.id} - ${p.name}`);
    idsToDelete.push(p.id);
  }
});

console.log(`\n📊 Totale ID trovati: ${idsToDelete.length}`);
console.log('\nID da eliminare:');
console.log(idsToDelete.join(', '));
