const products = require('./products.json');

// Cerca quei prodotti che vedi
const hallway = products.filter(p => p.name.includes('Hallway - Warm Welcome'));
console.log('🔍 Hallway - Warm Welcome:');
hallway.forEach(p => {
  console.log('  Categoria:', p.zenovaSubcategory);
  console.log('  Subcategory:', p.subcategory);
  console.log('  ID:', p.id);
});

console.log('\n📊 Prodotti in Natural Wellness:');
const wellness = products.filter(p => p.zenovaCategory === 'natural-wellness');
const bySubcat = {};
wellness.forEach(p => {
  const sub = p.zenovaSubcategory || 'senza categoria';
  bySubcat[sub] = (bySubcat[sub] || 0) + 1;
});
Object.keys(bySubcat).sort().forEach(cat => {
  console.log(`  - ${cat}: ${bySubcat[cat]} prodotti`);
});
