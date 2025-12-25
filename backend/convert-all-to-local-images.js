const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = '../products.json';
const BACKUP_FILE = `./products.backup-convert-local-${Date.now()}.json`;
const IMAGES_DIR = '../images/aw-products/';

console.log('🔧 CONVERSIONE IMMAGINI REMOTE → LOCALI\n');
console.log('='.repeat(90));

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`✅ Caricati ${products.length} prodotti\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Leggi tutti i file disponibili nella cartella images
const availableFiles = fs.readdirSync(IMAGES_DIR);
console.log(`📂 Trovati ${availableFiles.length} file immagini locali\n`);

let convertedCount = 0;

console.log('🔄 CONVERSIONE IN CORSO:\n');
console.log('='.repeat(90));

products.forEach(product => {
  if (product.sku && product.sku.startsWith('AATOM-')) {

    if (product.images && product.images.length > 0) {
      let hasChanges = false;

      // Converti ogni immagine
      product.images = product.images.map((img, index) => {
        if (typeof img === 'string' && img.startsWith('http')) {
          // È un URL remoto, cerca il file locale corrispondente
          const skuLower = product.sku.toLowerCase();

          // Trova tutti i file che corrispondono a questo SKU
          const matchingFiles = availableFiles.filter(f => f.startsWith(skuLower));

          if (matchingFiles.length > index) {
            // Usa il file corrispondente all'indice
            const localPath = `images/aw-products/${matchingFiles[index]}`;
            hasChanges = true;
            return localPath;
          }
        }
        return img;
      });

      if (hasChanges) {
        // Aggiorna mainImage e image
        product.mainImage = product.images[0];
        product.image = product.images[0];

        console.log(`\n✅ ${product.sku}`);
        console.log(`   Convertite ${product.images.length} immagini in locali`);
        console.log(`   Prima: ${product.images[0]}`);
        convertedCount++;
      }
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 Prodotti convertiti: ${convertedCount}\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log('✅ File salvato!\n');

console.log('='.repeat(90));
console.log('🎉 CONVERSIONE COMPLETATA!\n');
console.log('Tutte le immagini remote sono state convertite in percorsi locali.\n');
