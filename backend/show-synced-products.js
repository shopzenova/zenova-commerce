const data = require('./top-products-updated.json');

console.log('\n🔍 Campione prodotti sincronizzati:\n');

data.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.name}`);
  console.log(`   ID: ${p.id}`);
  console.log(`   Prezzo: €${p.price}`);
  console.log(`   Brand: ${p.brand}`);
  console.log(`   Stock: ${p.stock}`);
  console.log(`   Categoria Zenova: ${p.zenovaCategories ? p.zenovaCategories.join(', ') : 'N/A'}`);
  console.log(`   Immagini: ${p.images ? p.images.length : 0}`);
  console.log('');
});

console.log(`\n📊 TOTALE PRODOTTI: ${data.length}\n`);
