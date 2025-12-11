const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔧 FIX: Availability prodotti AATOM\n');

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let updated = 0;

catalog = catalog.map(product => {
  if (!product.id || !product.id.match(/^AATOM-/)) {
    return product;
  }

  const isActive = product.stock > 0;

  if (isActive) {
    console.log(`✅ ${product.id} - Stock: ${product.stock} - Attivo`);
    updated++;

    return {
      ...product,
      available: true,
      inStock: true,
      stockStatus: 'InStock'
    };
  } else {
    console.log(`⏸️  ${product.id} - Stock: ${product.stock} - Non disponibile`);
    return {
      ...product,
      available: false,
      inStock: false,
      stockStatus: 'OutofStock'
    };
  }
});

console.log(`\n✅ Aggiornati ${updated} prodotti AATOM attivi`);

// Salva catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Catalogo salvato: ${catalogPath}`);

console.log('\n🎉 FIX COMPLETATO!\n');
