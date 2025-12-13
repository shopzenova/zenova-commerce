const products = require('./top-100-products.json');

const awProducts = products.filter(p => p.id && p.id.startsWith('AW'));

console.log('✅ Prodotti AW totali:', awProducts.length);

const damaged = awProducts.filter(p => p.description?.includes('MYMEMORY WARNING'));
console.log('❌ Con errore MyMemory:', damaged.length);
console.log('✅ Con descrizione OK:', awProducts.length - damaged.length);

if (awProducts.length > 0) {
  const sample = awProducts[0];
  console.log('\n📦 Esempio prodotto AW:');
  console.log('ID:', sample.id);
  console.log('Nome:', sample.name);
  console.log('Descrizione (primi 150 char):');
  console.log(sample.description?.substring(0, 150));
}
