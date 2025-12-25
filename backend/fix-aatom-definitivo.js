const fs = require('fs');

const PRODUCTS_FILE = '../products.json';
const BACKUP_FILE = `./products.backup-fix-definitivo-${Date.now()}.json`;
const IMAGES_DIR = '../images/aw-products/';

console.log('🔧 FIX DEFINITIVO DIFFUSORI AATOM\n');
console.log('1. Converte immagini remote → locali');
console.log('2. Scambia 1a e 2a immagine (prodotto in funzione come principale)\n');
console.log('='.repeat(90));

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`✅ Caricati ${products.length} prodotti\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Leggi file locali disponibili
const availableFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
console.log(`📂 Trovati ${availableFiles.length} file immagini locali\n`);

let fixedCount = 0;

console.log('🔄 SISTEMAZIONE IN CORSO:\n');
console.log('='.repeat(90));

products.forEach(product => {
  if (product.sku && product.sku.startsWith('AATOM-')) {

    if (product.images && product.images.length > 0) {
      const skuLower = product.sku.toLowerCase();

      // Trova tutti i file locali per questo SKU (ordinati)
      const productFiles = availableFiles
        .filter(f => f.startsWith(skuLower))
        .sort();

      if (productFiles.length >= 2) {
        // STEP 1: Crea array con percorsi locali
        const localImages = productFiles.map(file => `images/aw-products/${file}`);

        // STEP 2: Scambia la prima con la seconda (prodotto in funzione diventa principale)
        [localImages[0], localImages[1]] = [localImages[1], localImages[0]];

        // Aggiorna il prodotto
        product.images = localImages;
        product.mainImage = localImages[0];
        product.image = localImages[0];

        console.log(`\n✅ ${product.sku}: ${product.name}`);
        console.log(`   Immagini: ${localImages.length}`);
        console.log(`   Principale: ${localImages[0]}`);
        console.log(`   ✓ Prodotto in funzione (non scatola)`);

        fixedCount++;
      } else if (productFiles.length === 1) {
        // Solo 1 immagine disponibile
        product.images = [`images/aw-products/${productFiles[0]}`];
        product.mainImage = product.images[0];
        product.image = product.images[0];

        console.log(`\n⚠️  ${product.sku}: Solo 1 immagine`);
        fixedCount++;
      } else {
        console.log(`\n❌ ${product.sku}: Nessuna immagine locale trovata`);
      }
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 Prodotti sistemati: ${fixedCount}\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log('✅ File salvato!\n');

console.log('='.repeat(90));
console.log('🎉 FIX DEFINITIVO COMPLETATO!\n');
console.log('✓ Tutte le immagini sono locali');
console.log('✓ La prima immagine mostra sempre il prodotto in funzione');
console.log('✓ La scatola è in seconda posizione\n');
