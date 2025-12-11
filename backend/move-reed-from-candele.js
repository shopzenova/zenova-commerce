const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔄 Spostamento Reed Diffuser');
console.log('Da: diffusori (Candele & Gel) → A: diffusori-bastoncini\n');

let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let moved = 0;

catalog = catalog.map(product => {
  // SOLO Reed Diffuser che sono in "diffusori"
  const isReedDiffuser = product.name && product.name.toLowerCase().includes('reed diffuser');
  const isInDiffusori = product.zenovaSubcategory === 'diffusori';

  if (isReedDiffuser && isInDiffusori) {
    console.log(`✅ ${product.id} - ${product.name.substring(0, 60)}`);
    moved++;

    return {
      ...product,
      zenovaSubcategory: 'diffusori-bastoncini'
    };
  }

  return product; // Non tocca nient'altro
});

console.log(`\n✅ Spostati ${moved} Reed Diffuser`);

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Salvato\n`);
