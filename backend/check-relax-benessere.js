const products = require('./top-100-products.json');

const relaxProducts = products.filter(p => p.zenovaSubcategory === 'relax-benessere');

console.log('Prodotti con sottocategoria "relax-benessere":', relaxProducts.length);
console.log('\nElenco prodotti:\n');

relaxProducts.forEach((p, i) => {
  console.log(`${i+1}. [${p.source}] ${p.name}`);
});
