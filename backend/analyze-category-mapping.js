// Analizza mapping categorie BigBuy -> Zenova
const products = require('./top-100-products.json');

const categoryMap = {};

products.forEach(product => {
  const cats = product.category ? product.category.split(',') : [];
  const zenCat = product.zenovaCategory;

  cats.forEach(bigbuyCat => {
    if (!categoryMap[bigbuyCat]) {
      categoryMap[bigbuyCat] = { beauty: 0, health: 0, total: 0 };
    }
    categoryMap[bigbuyCat].total++;
    if (zenCat === 'beauty') categoryMap[bigbuyCat].beauty++;
    if (zenCat === 'health-personal-care') categoryMap[bigbuyCat].health++;
  });
});

// Mostra solo categorie con almeno 100 prodotti
console.log('\n📊 CATEGORIE BIGBUY -> ZENOVA\n');
Object.entries(categoryMap)
  .filter(([k, v]) => v.beauty > 100 || v.health > 100)
  .sort((a, b) => b[1].total - a[1].total)
  .forEach(([catId, stats]) => {
    const primary = stats.beauty > stats.health ? 'BEAUTY' : 'HEALTH';
    console.log(`Cat ${catId}: ${stats.total} totali | Beauty: ${stats.beauty} | Health: ${stats.health} | Primary: ${primary}`);
  });

// Trova categorie "root" per Beauty e Health
console.log('\n🎯 CATEGORIE PRINCIPALI:\n');
const beautyCats = Object.entries(categoryMap)
  .filter(([k, v]) => v.beauty > 500)
  .map(([k, v]) => k);
const healthCats = Object.entries(categoryMap)
  .filter(([k, v]) => v.health > 200)
  .map(([k, v]) => k);

console.log('Beauty root categories:', beautyCats);
console.log('Health root categories:', healthCats);
