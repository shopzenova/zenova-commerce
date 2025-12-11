const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔄 Aggiornamento categorie prodotti AATOM');
console.log('📂 Nuova categoria: natural-wellness > diffusori\n');

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// Filtra prodotti AATOM
const aatomProducts = catalog.filter(p => p.id && p.id.match(/^AATOM-/));
console.log(`📦 Trovati ${aatomProducts.length} prodotti AATOM\n`);

// Aggiorna categorie
let updated = 0;

catalog = catalog.map(product => {
  if (!product.id || !product.id.match(/^AATOM-/)) {
    return product;
  }

  console.log(`🔄 ${product.id} - ${product.name.substring(0, 50)}`);
  console.log(`   Vecchia: ${product.zenovaCategories ? product.zenovaCategories.join(', ') : 'nessuna'} > ${product.zenovaSubcategory || 'nessuna'}`);
  console.log(`   Nuova: natural-wellness > diffusori`);

  updated++;

  return {
    ...product,
    category: 'Natural Wellness',
    zenovaCategory: 'natural-wellness',
    zenovaCategories: ['natural-wellness', 'diffusori'],
    zenovaSubcategory: 'diffusori',
    tags: ['diffusore', 'aromaterapia', 'benessere', 'ultrasonic', 'AW Dropship']
  };
});

console.log(`\n✅ Aggiornati ${updated} prodotti AATOM`);

// Salva catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ Catalogo salvato: ${catalogPath}`);

console.log('\n🎉 AGGIORNAMENTO COMPLETATO!');
console.log('Prossimo passo: Riavvia il backend\n');
