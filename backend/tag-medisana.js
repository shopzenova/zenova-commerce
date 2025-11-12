const fs = require('fs');
const path = require('path');

// Leggi il file JSON
const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Prodotti totali: ${products.length}`);

let taggedCount = 0;

// Tagga i prodotti Medisana con la sottocategoria 'massaggi-medisana'
const updatedProducts = products.map(product => {
  const isMedisana = product.name.toLowerCase().includes('medisana') ||
                     (product.brand && product.brand.toLowerCase().includes('medisana'));

  if (isMedisana) {
    console.log(`✅ Taggando: ${product.name}`);

    // Assicurati che zenovaSubcategory sia impostato
    product.zenovaSubcategory = 'massaggi-medisana';

    // Assicurati che zenovaCategories includa 'benessere'
    if (!product.zenovaCategories) {
      product.zenovaCategories = [];
    }
    if (!product.zenovaCategories.includes('benessere')) {
      product.zenovaCategories.push('benessere');
    }

    taggedCount++;
  }

  return product;
});

console.log(`\n✅ Prodotti Medisana taggati: ${taggedCount}`);

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(updatedProducts, null, 2), 'utf-8');
console.log(`💾 File salvato: ${jsonPath}`);
