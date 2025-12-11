const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔄 Spostamento diffusori elettronici AATOM');
console.log('Da: diffusori → A: diffusori-elettronici\n');

let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let moved = 0;

catalog = catalog.map(product => {
  // SOLO prodotti AATOM che sono in "diffusori"
  const isAATOM = product.id && product.id.match(/^AATOM-/);
  const isInDiffusori = product.zenovaSubcategory === 'diffusori';

  if (isAATOM && isInDiffusori) {
    console.log(`✅ ${product.id} - ${product.name.substring(0, 60)}`);
    moved++;

    return {
      ...product,
      zenovaSubcategory: 'diffusori-elettronici'
    };
  }

  return product; // Non tocca nient'altro
});

console.log(`\n✅ Spostati ${moved} diffusori elettronici AATOM`);

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Salvato\n`);
