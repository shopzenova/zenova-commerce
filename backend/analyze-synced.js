const data = require('./top-100-products.json');

const cats = {};
data.forEach(p => {
  const cat = p.zenovaCategory;
  const subcat = p.zenovaSubcategory || 'senza-sottocategoria';
  if (!cats[cat]) cats[cat] = {};
  cats[cat][subcat] = (cats[cat][subcat] || 0) + 1;
});

Object.keys(cats).forEach(cat => {
  const total = Object.values(cats[cat]).reduce((a,b) => a+b, 0);
  console.log(`\n📦 ${cat.toUpperCase()} - Totale: ${total}`);
  Object.entries(cats[cat])
    .sort((a,b) => b[1] - a[1])
    .forEach(([sub, count]) => {
      console.log(`   - ${sub}: ${count}`);
    });
});
