const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));
console.log('📦 Prodotti attuali nel catalogo: ' + catalog.length + '\n');

const byCategory = {};
catalog.forEach(p => {
  const cat = p.category || 'no-category';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(p);
});

Object.keys(byCategory).sort().forEach(cat => {
  console.log('\n📂 ' + cat + ' (' + byCategory[cat].length + ' prodotti):');
  byCategory[cat].forEach((p, i) => {
    console.log('  ' + (i+1) + '. ' + p.name + ' - €' + p.price);
  });
});
