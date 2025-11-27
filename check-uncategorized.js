const data = require('./backend/top-100-products.json');
const noCategory = data.filter(p => !p.zenovaCategories || p.zenovaCategories.length === 0 || p.zenovaCategories.includes('uncategorized'));
console.log('Prodotti non categorizzati:', noCategory.length);
if(noCategory.length > 0) {
  console.log('\nPrimi 5:');
  noCategory.slice(0,5).forEach(p => {
    console.log(`- ${p.id}: ${p.name}`);
    console.log(`  Categorie: ${JSON.stringify(p.zenovaCategories)}`);
  });
}
