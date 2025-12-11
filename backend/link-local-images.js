const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('🔗 Collegamento immagini locali ai prodotti\n');

let updated = 0;

products.forEach(product => {
  const id = product.id || product.sku;

  if (!id) return;

  // Diffusori AATOM
  if (id.startsWith('AATOM-')) {
    const imageFolder = `images/aw-products/diffusori`;
    product.localImage = `${imageFolder}/${id}.jpg`;
    product.zenovaSubcategory = 'diffusori-elettronici';
    updated++;
    console.log(`✅ ${id} → ${product.localImage}`);
    console.log(`   Categoria: ${product.zenovaCategory} / ${product.zenovaSubcategory}`);
  }

  // Reed Diffusers ACD
  if (id.startsWith('ACD-')) {
    const imageFolder = `images/aw-products/diffusori`;
    product.localImage = `${imageFolder}/${id}.jpg`;
    product.zenovaSubcategory = 'diffusori';
    updated++;
    console.log(`✅ ${id} → ${product.localImage}`);
    console.log(`   Categoria: ${product.zenovaCategory} / ${product.zenovaSubcategory}`);
  }

  // Borse JNS
  if (id.startsWith('JNS-')) {
    const imageFolder = `images/aw-products/borse`;
    product.localImage = `${imageFolder}/${id}.jpg`;
    updated++;
    console.log(`✅ ${id} → ${product.localImage}`);
    console.log(`   Categoria: ${product.zenovaCategory} / ${product.zenovaSubcategory}`);
  }
});

// Salva le modifiche
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

console.log(`\n🎉 Completato!`);
console.log(`   - ${updated} prodotti aggiornati con immagini locali`);
console.log(`   - Totale prodotti: ${products.length}`);
