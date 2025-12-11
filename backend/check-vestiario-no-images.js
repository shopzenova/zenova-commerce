const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

const vestiario = data.filter(p => p.zenovaSubcategory === 'vestiario-wellness');
console.log('Totale prodotti vestiario-wellness:', vestiario.length);

const noImage = vestiario.filter(p =>
  !p.image ||
  !p.images ||
  p.images.length === 0 ||
  p.image.includes('placeholder') ||
  p.image.includes('via.placeholder')
);

console.log('Prodotti SENZA immagini:', noImage.length);
console.log('\nProdotti da eliminare:\n');
noImage.forEach(p => {
  const imgPreview = p.image ? p.image.substring(0, 50) : 'nessuna';
  console.log(`  - ${p.id} | ${p.name?.substring(0, 45)} | img: ${imgPreview}`);
});
