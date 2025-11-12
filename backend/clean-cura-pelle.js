const fs = require('fs');
const products = require('./top-100-products.json');

const filtered = products.filter(p => !p.zenovaSubcategory || !p.zenovaSubcategory.startsWith('cura-pelle'));

console.log('Prima:', products.length);
console.log('Dopo:', filtered.length);
console.log('Rimossi:', products.length - filtered.length);

fs.writeFileSync('top-100-products.json', JSON.stringify(filtered, null, 2));
console.log('✅ Pulito!');
