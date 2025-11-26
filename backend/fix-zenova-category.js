const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let updated = 0;

catalog.forEach(p => {
  if (!p.zenovaCategory && p.category) {
    p.zenovaCategory = p.category;
    updated++;
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`✅ Aggiornati ${updated} prodotti con campo zenovaCategory`);
console.log(`📦 Totale prodotti: ${catalog.length}`);

const smart = catalog.filter(p => p.zenovaCategory === 'smart-living');
const tech = catalog.filter(p => p.zenovaCategory === 'tech-innovation');

console.log(`\n📊 PRODOTTI PER CATEGORIA:`);
console.log(`   Smart Living: ${smart.length}`);
console.log(`   Tech Innovation: ${tech.length}`);
