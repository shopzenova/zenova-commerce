/**
 * Aggiunge campo "image" ai prodotti AW che ne sono sprovvisti
 */
const fs = require('fs');

const catalogPath = './top-100-products.json';
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('🔧 Aggiunta campo "image" ai prodotti AW...\n');

let fixed = 0;

for (const product of products) {
  // Se non ha image ma ha images array
  if (!product.image && product.images && product.images.length > 0) {
    const img = product.images[0];

    // Estrai URL dall'oggetto o usa direttamente se è una stringa
    if (typeof img === 'object') {
      product.image = img.url || img.thumbnail;
    } else {
      product.image = img;
    }

    console.log(`✅ ${product.id}: aggiunto image = ${product.image}`);
    fixed++;
  }
}

// Backup
const backupPath = `./top-100-products.backup-fix-image-${Date.now()}.json`;
fs.writeFileSync(backupPath, fs.readFileSync(catalogPath));
console.log(`\n💾 Backup: ${backupPath}`);

// Salva catalogo aggiornato
fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));

console.log(`\n📊 RISULTATI:`);
console.log(`   ✅ Prodotti corretti: ${fixed}`);
console.log(`\n✅ Catalogo aggiornato!`);
console.log(`\n💡 Riavvia il backend per caricare le modifiche`);
