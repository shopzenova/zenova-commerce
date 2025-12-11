const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔄 Spostamento portaincensi');
console.log('Da: diffusori (Candele & Gel) → A: incenso\n');

let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let moved = 0;

catalog = catalog.map(product => {
  // SOLO prodotti con "incense" o "incenso" nel nome che sono in "diffusori"
  const hasIncense = product.name && (product.name.toLowerCase().includes('incense') || product.name.toLowerCase().includes('incenso'));
  const isInDiffusori = product.zenovaSubcategory === 'diffusori';

  if (hasIncense && isInDiffusori) {
    console.log(`✅ ${product.id} - ${product.name.substring(0, 60)}`);
    moved++;

    return {
      ...product,
      zenovaSubcategory: 'incenso'
    };
  }

  return product; // Non tocca nient'altro
});

console.log(`\n✅ Spostati ${moved} portaincensi`);

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Salvato\n`);
