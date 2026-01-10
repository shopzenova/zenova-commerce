const products = require('./top-100-products.json');

const visible = products.filter(p => p.visible !== false);
const hidden = products.filter(p => p.visible === false);

console.log('📊 Filtro visible:');
console.log('Totale prodotti:', products.length);
console.log('Prodotti visible !== false:', visible.length);
console.log('Prodotti hidden (visible === false):', hidden.length);
console.log('Differenza:', products.length - visible.length);

console.log('\n🎁 Bundle status:');
const bundles = products.filter(p => p.source === 'zenova-bundle');
bundles.forEach(b => {
  console.log('\nID:', b.id);
  console.log('Nome:', b.name);
  console.log('Visible:', b.visible);
  console.log('Zone:', b.zone);
  console.log('Passa filtro visible !== false?', b.visible !== false ? '✅' : '❌');
});
