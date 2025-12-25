const fs = require('fs');

const PRODUCTS_FILE = '../products.json';
const BACKUP_FILE = `./products.backup-fix-images-${Date.now()}.json`;

console.log('🖼️  SISTEMAZIONE IMMAGINI DIFFUSORI AATOM\n');
console.log('='.repeat(90));

// Leggi products.json
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`✅ Caricati ${products.length} prodotti\n`);

// Backup
console.log('💾 Backup...');
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup: ${BACKUP_FILE}\n`);

let fixedCount = 0;

console.log('🔧 SISTEMAZIONE IMMAGINI AATOM:\n');
console.log('='.repeat(90));

products.forEach(product => {
  if (product.sku && product.sku.startsWith('AATOM-')) {

    // Se ha images ma mainImage è locale o mancante
    if (product.images && product.images.length > 0) {

      const firstImage = product.images[0];
      const needsFix = !product.mainImage ||
                       product.mainImage.startsWith('images/') ||
                       product.mainImage !== firstImage;

      if (needsFix) {
        console.log(`\n📦 ${product.sku}: ${product.name}`);
        console.log(`   Vecchia mainImage: ${product.mainImage || 'MANCANTE'}`);
        console.log(`   Nuova mainImage: ${firstImage}`);

        // Imposta mainImage alla prima immagine dell'array
        product.mainImage = firstImage;

        // Aggiungi anche campo "image" per compatibilità
        product.image = firstImage;

        fixedCount++;
        console.log(`   ✅ Immagine principale aggiornata`);
      }
    } else {
      console.log(`\n⚠️  ${product.sku}: NESSUNA IMMAGINE DISPONIBILE`);
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 Prodotti AATOM con immagini sistemate: ${fixedCount}\n`);

// Salva
console.log('💾 Salvataggio...');
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log('✅ File salvato!\n');

console.log('='.repeat(90));
console.log('🎉 IMMAGINI SISTEMATE!\n');
console.log('Ora riavvia il backend e ricarica il sito (F5)\n');
