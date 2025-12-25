const fs = require('fs');
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

const elettronici = products.filter(p => p.zenovaSubcategory === 'Diffusori Elettronici');

console.log('Prodotti in Diffusori Elettronici:', elettronici.length);
console.log('');

elettronici.forEach(p => {
  console.log(`ID: ${p.id}`);
  console.log(`Nome: ${p.name.substring(0, 60)}`);
  console.log(`Prezzo: €${p.price} | Stock: ${p.stock} | Visible: ${p.visible}`);
  console.log(`AWCode: ${p.awCode || 'N/A'}`);
  console.log('---');
});
