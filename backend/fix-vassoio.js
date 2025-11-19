const fs = require('fs');
const products = require('./top-100-products.json');

const index = products.findIndex(p => p.id === 'D1629969');

if (index !== -1) {
  products[index].zone = 'sidebar';
  products[index].visible = true;

  fs.writeFileSync('./top-100-products.json', JSON.stringify(products, null, 2));

  console.log('✅ Prodotto corretto!');
  console.log('Nome:', products[index].name);
  console.log('Zone:', products[index].zone);
  console.log('Visible:', products[index].visible);
} else {
  console.log('❌ Prodotto non trovato');
}
