/**
 * Script per trovare dove sono i prodotti Smart Living nel layout
 */

const fs = require('fs');
const path = require('path');

// Carica product-layout
const layoutPath = path.join(__dirname, 'config/product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

// Carica prodotti
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Trova prodotti Smart Living
const smartLivingProducts = products.filter(p =>
  p.zenovaCategories && p.zenovaCategories.includes('smart-living')
);

console.log(`📦 Trovati ${smartLivingProducts.length} prodotti Smart Living\n`);

smartLivingProducts.forEach(product => {
  let zone = 'NON TROVATO';

  if (layout.home && layout.home.includes(product.id)) {
    zone = 'HOME';
  } else if (layout.sidebar && layout.sidebar.includes(product.id)) {
    zone = 'SIDEBAR';
  } else if (layout.hidden && layout.hidden.includes(product.id)) {
    zone = 'HIDDEN';
  }

  console.log(`ID: ${product.id}`);
  console.log(`Nome: ${product.name.substring(0, 60)}`);
  console.log(`Zona: ${zone}`);
  console.log(`Subcategory: ${product.zenovaSubcategory || 'NESSUNA'}`);
  console.log('');
});
