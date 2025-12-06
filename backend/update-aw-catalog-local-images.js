/**
 * Aggiorna il catalogo per usare immagini locali
 */
const fs = require('fs');
const path = require('path');

const catalogPath = './top-100-products.json';
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');

console.log('🔄 Aggiornamento catalogo con immagini locali...\n');

let updated = 0;
let notFound = 0;

for (const product of products) {
  // Solo prodotti AW
  if (!product.id || !product.id.startsWith('AW-')) continue;

  const code = product.supplierCode;
  const filename = `${code}-main.webp`;
  const filepath = path.join(imagesDir, filename);

  if (fs.existsSync(filepath)) {
    // Aggiorna URL immagine con path locale
    product.images = [
      {
        url: `/images/aw-products/${filename}`,
        thumbnail: `/images/aw-products/${filename}`
      }
    ];
    console.log(`✅ ${code}: aggiornato`);
    updated++;
  } else {
    console.log(`⚠️  ${code}: immagine non trovata`);
    notFound++;
  }
}

// Salva backup
const backupPath = `./top-100-products.backup-local-images-${Date.now()}.json`;
fs.writeFileSync(backupPath, fs.readFileSync(catalogPath));
console.log(`\n💾 Backup: ${backupPath}`);

// Salva catalogo aggiornato
fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));

console.log(`\n📊 RISULTATI:`);
console.log(`   ✅ Aggiornati: ${updated}`);
console.log(`   ⚠️  Non trovati: ${notFound}`);
console.log(`\n✅ Catalogo aggiornato!`);
console.log(`\n💡 Riavvia il backend per caricare le modifiche`);
