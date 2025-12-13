const fs = require('fs');

// Carica prodotti
const products = require('./top-100-products.json');

console.log('🔧 CORREZIONE CATEGORIA PRODOTTI AW\n');

let fixed = 0;

// Correggi solo prodotti AW con categoria 'wellness'
products.forEach(product => {
  if (product.id && product.id.startsWith('AW')) {
    if (product.zenovaCategory === 'wellness') {
      // Cambia da 'wellness' a 'natural-wellness'
      product.zenovaCategory = 'natural-wellness';

      // Aggiorna anche l'array zenovaCategories per coerenza
      if (product.zenovaCategories && Array.isArray(product.zenovaCategories)) {
        product.zenovaCategories = product.zenovaCategories.map(cat =>
          cat === 'wellness' ? 'natural-wellness' : cat
        );
      }

      fixed++;
      console.log(`✅ ${product.id} - ${product.name.substring(0, 60)}`);
    }
  }
});

console.log('\n==================================');
console.log('📊 RIEPILOGO:');
console.log(`✅ Prodotti corretti: ${fixed}`);

// Salva file
fs.writeFileSync('top-100-products.json', JSON.stringify(products, null, 2), 'utf8');
console.log('\n💾 File salvato: top-100-products.json');
console.log('🎉 FATTO!');
