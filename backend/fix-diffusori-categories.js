const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let fixed = 0;

products.forEach(product => {
  if (product.name && product.name.toLowerCase().includes('diffus')) {
    // Aggiungi categories array
    product.categories = [
      { id: '999', name: 'Natural Wellness' },
      { id: '9991', name: 'Diffusori' }
    ];
    product.zone = 'sidebar';
    fixed++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log(`✅ Fissati ${fixed} diffusori con categories corrette`);
