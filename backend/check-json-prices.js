const products = require('./top-100-products.json');

// Conta quanti hanno originalPrice
const withOriginal = products.filter(p => p.originalPrice !== undefined && p.originalPrice !== null);
const awProducts = products.filter(p => p.source === 'aw' || p.supplier === 'aw-dropship');

console.log('Prodotti totali in JSON:', products.length);
console.log('Prodotti AW in JSON:', awProducts.length);
console.log('Prodotti con originalPrice:', withOriginal.length);
console.log('');

// Mostra esempio candela zodiaco
const candela = awProducts.find(p => p.id && p.id.includes('zcc'));
if (candela) {
  console.log('ESEMPIO - Candela Zodiaco nel JSON:');
  console.log('ID:', candela.id);
  console.log('Name:', candela.name);
  console.log('price:', candela.price);
  console.log('pvd:', candela.pvd);
  console.log('retailPrice:', candela.retailPrice);
  console.log('originalPrice:', candela.originalPrice);
} else {
  console.log('Candela zodiaco NON trovata');
}

console.log('');
console.log('Primi 5 prodotti AW nel JSON:');
awProducts.slice(0, 5).forEach(p => {
  console.log('---');
  console.log('ID:', p.id);
  console.log('Name:', p.name.substring(0, 50));
  console.log('price:', p.price);
  console.log('originalPrice:', p.originalPrice);
});
