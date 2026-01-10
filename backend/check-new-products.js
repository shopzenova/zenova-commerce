const fs = require('fs');

const current = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const backup = JSON.parse(fs.readFileSync('data/products.backup-before-candele-import-1767687716272.json', 'utf8'));

console.log('Prodotti ATTUALI:', current.length);
console.log('Prodotti BACKUP (prima import candele):', backup.length);
console.log('\nDifferenza:', current.length - backup.length, 'prodotti');

const currentIds = new Set(current.map(p => p.id));
const backupIds = new Set(backup.map(p => p.id));
const newProducts = current.filter(p => !backupIds.has(p.id));

console.log('\nProdotti NUOVI aggiunti stamattina:', newProducts.length);

if(newProducts.length > 0 && newProducts.length < 150) {
  console.log('\nNuovi prodotti AW:');
  const awNew = newProducts.filter(p => p.source === 'aw');
  awNew.forEach(p => console.log('-', p.name.substring(0, 70), '| sub:', p.zenovaSubcategory));
  console.log('\nTotale nuovi AW:', awNew.length);
}
