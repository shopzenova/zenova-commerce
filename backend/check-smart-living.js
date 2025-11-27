const products = require('./top-100-products.json');

const smartLiving = products.filter(p =>
  p.zenovaCategories && p.zenovaCategories.includes('smart-living')
);

console.log('Prodotti Smart Living totali:', smartLiving.length);
console.log('\nPrimi 10 prodotti Smart Living:\n');

smartLiving.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.name.substring(0, 60)}`);
  console.log(`   Categorie: ${p.zenovaCategories.join(', ')}`);
  console.log(`   Sottocategoria: ${p.zenovaSubcategory || 'NESSUNA'}`);
  console.log(`   Zone: ${p.zone || 'NESSUNA'}`);
  console.log('');
});

// Conta prodotti per zone
const zones = {};
smartLiving.forEach(p => {
  const zone = p.zone || 'NESSUNA';
  zones[zone] = (zones[zone] || 0) + 1;
});

console.log('Distribuzione per zone:');
Object.entries(zones).forEach(([zone, count]) => {
  console.log(`  ${zone}: ${count}`);
});
