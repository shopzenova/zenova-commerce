const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔄 Spostamento diffusori a bastoncini');
console.log('Da: oli-fragranza → A: diffusori-bastoncini\n');

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let moved = 0;

catalog = catalog.map(product => {
  // Trova solo Reed Diffuser
  const isReedDiffuser = product.name && product.name.toLowerCase().includes('reed diffuser');
  const isInOliFragranza = product.zenovaSubcategory === 'oli-fragranza';

  if (isReedDiffuser && isInOliFragranza) {
    console.log(`✅ ${product.id || product.sku} - ${product.name.substring(0, 60)}`);
    console.log(`   Spostato: oli-fragranza → diffusori-bastoncini\n`);
    moved++;

    return {
      ...product,
      zenovaSubcategory: 'diffusori-bastoncini'
    };
  }

  return product; // Non modifica nient'altro
});

console.log(`✅ Spostati ${moved} diffusori a bastoncini`);

// Salva
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Salvato: ${catalogPath}\n`);
