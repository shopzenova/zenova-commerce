const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('=== SOTTOCATEGORIE WELLNESS ===\n');

const wellness = products.filter(p => p.zenovaCategory === 'wellness');

const subcats = {};
wellness.forEach(p => {
  const sub = p.zenovaSubcategory || 'NO-SUBCAT';
  subcats[sub] = (subcats[sub] || 0) + 1;
});

console.log(`Totale prodotti wellness: ${wellness.length}\n`);

Object.entries(subcats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([sub, count]) => {
    console.log(`  ${sub}: ${count}`);
  });

console.log('\n=== MAPPING NECESSARIO PER sidebar.js ===\n');
Object.keys(subcats).forEach(sub => {
  console.log(`    '${sub}': 'wellness',`);
});
