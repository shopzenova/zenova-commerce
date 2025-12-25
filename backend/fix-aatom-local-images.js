const fs = require('fs');

const PRODUCTS_FILE = '../products.json';
const BACKUP_FILE = `./products.backup-fix-local-images-${Date.now()}.json`;

console.log('🖼️  SISTEMAZIONE IMMAGINI LOCALI DIFFUSORI AATOM\n');
console.log('='.repeat(90));

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`✅ Caricati ${products.length} prodotti\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

let fixedCount = 0;

console.log('🔧 FORZATURA IMMAGINI LOCALI PER AATOM:\n');

products.forEach(product => {
  if (product.sku && product.sku.startsWith('AATOM-')) {

    // Se ha images con URL remoti, convertiamoli in percorsi locali
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];

      // Se è un URL remoto, cerca il file locale corrispondente
      if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
        // Cerca il file locale nella cartella images/aw-products/
        const localImagePath = `images/aw-products/${product.sku.toLowerCase()}__*.jpeg`;

        // Usa il pattern generico per il primo file
        const expectedLocalPath = `images/aw-products/${product.sku.toLowerCase()}__57619.jpeg`;

        console.log(`\n📦 ${product.sku}`);
        console.log(`   Immagine remota rilevata, forzo percorso locale`);
        console.log(`   Percorso: ${expectedLocalPath}`);

        // Imposta mainImage e image al percorso locale
        product.mainImage = expectedLocalPath;
        product.image = expectedLocalPath;

        fixedCount++;
      }
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 Prodotti con immagini forzate a locale: ${fixedCount}\n`);

fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log('✅ File salvato!\n');
