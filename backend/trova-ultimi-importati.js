const fs = require('fs');

// Confronta con backup di ieri per trovare i nuovi
const yesterday = JSON.parse(fs.readFileSync('data/products.backup-before-candele-import-1767626785175.json', 'utf8'));
const beforeFix = JSON.parse(fs.readFileSync('data/products.backup-fix-aw-categorie-1767718971866.json', 'utf8'));

const yesterdayIds = new Set(yesterday.map(p => p.id));
const newOnes = beforeFix.filter(p => !yesterdayIds.has(p.id));

console.log(`Prodotti aggiunti DOPO ieri (5 gen 16:00):`);
console.log(`Totale: ${newOnes.length}\n`);

newOnes.forEach(p => {
  console.log(`${p.id} | ${p.name.substring(0, 60)} | ${p.source}`);
});

// Salva gli ID
fs.writeFileSync(
  'ultimi-importati-ids.json',
  JSON.stringify(newOnes.map(p => p.id), null, 2)
);

console.log(`\n✅ IDs salvati in: ultimi-importati-ids.json`);
