const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'top-100-products.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

let updated = 0;

catalog.forEach(p => {
  // Converti zenovaCategory (stringa) in zenovaCategories (array)
  if (p.zenovaCategory && !p.zenovaCategories) {
    p.zenovaCategories = [p.zenovaCategory];
    updated++;
  }
  // Se non ha né l'uno né l'altro, usa category
  else if (!p.zenovaCategories && p.category) {
    p.zenovaCategories = [p.category];
    updated++;
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`✅ Aggiornati ${updated} prodotti con campo zenovaCategories (array)`);
console.log(`📦 Totale prodotti: ${catalog.length}`);

const smart = catalog.filter(p => p.zenovaCategories && p.zenovaCategories.includes('smart-living'));
const tech = catalog.filter(p => p.zenovaCategories && p.zenovaCategories.includes('tech-innovation'));

console.log(`\n📊 PRODOTTI PER CATEGORIA:`);
console.log(`   Smart Living: ${smart.length}`);
console.log(`   Tech Innovation: ${tech.length}`);

console.log(`\n🏠 Smart Living (primi 3):`);
smart.slice(0, 3).forEach(p => {
  console.log(`   - ${p.name.substring(0, 50)}`);
});

console.log(`\n⚡ Tech Innovation (primi 3):`);
tech.slice(0, 3).forEach(p => {
  console.log(`   - ${p.name.substring(0, 50)}`);
});
