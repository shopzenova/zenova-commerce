const products = require('./top-100-products.json');

const awProducts = products.filter(p => p.source === 'aw' || p.supplier === 'aw-dropship');
const withoutOriginal = awProducts.filter(p => !p.originalPrice);

console.log('Prodotti AW SENZA originalPrice (useranno calcolo 30%):');
console.log('Totale:', withoutOriginal.length);
console.log('');
console.log('Primi 10:');
withoutOriginal.slice(0, 10).forEach(p => {
  const calculated = Math.round(p.price * 1.3 * 100) / 100;
  console.log('');
  console.log('ID:', p.id);
  console.log('Nome:', p.name.substring(0, 60));
  console.log('Wholesale: €' + p.price);
  console.log('Retail (30%): €' + calculated);
});
