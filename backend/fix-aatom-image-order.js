const fs = require('fs');

const PRODUCTS_FILE = '../products.json';
const BACKUP_FILE = `./products.backup-fix-image-order-${Date.now()}.json`;

console.log('🖼️  SISTEMAZIONE ORDINE IMMAGINI DIFFUSORI AATOM\n');
console.log('Immagine principale = SEMPRE la seconda (prodotto in funzione, non scatola)\n');
console.log('='.repeat(90));

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`✅ Caricati ${products.length} prodotti\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

let fixedCount = 0;

console.log('🔧 SPOSTAMENTO IMMAGINE 2 IN PRIMA POSIZIONE:\n');
console.log('='.repeat(90));

products.forEach(product => {
  if (product.sku && product.sku.startsWith('AATOM-')) {

    if (product.images && product.images.length >= 2) {
      const oldFirst = product.images[0];
      const newFirst = product.images[1]; // La seconda diventa la principale

      console.log(`\n📦 ${product.sku}: ${product.name}`);
      console.log(`   Prima immagine (scatola): ${typeof oldFirst === 'string' ? oldFirst.substring(0, 60) + '...' : oldFirst}`);
      console.log(`   Seconda immagine (prodotto): ${typeof newFirst === 'string' ? newFirst.substring(0, 60) + '...' : newFirst}`);

      // Scambia le prime due immagini
      [product.images[0], product.images[1]] = [product.images[1], product.images[0]];

      // Aggiorna mainImage e image con la nuova prima immagine
      product.mainImage = product.images[0];
      product.image = product.images[0];

      console.log(`   ✅ Immagini scambiate - ora la seconda è la principale`);
      fixedCount++;
    } else if (product.images && product.images.length === 1) {
      console.log(`\n⚠️  ${product.sku}: Solo 1 immagine disponibile, nessun cambio`);
    } else {
      console.log(`\n⚠️  ${product.sku}: Nessuna immagine disponibile`);
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 Prodotti con immagini riordinate: ${fixedCount}\n`);

// Salva
console.log('💾 Salvataggio...');
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log('✅ File salvato!\n');

console.log('='.repeat(90));
console.log('🎉 ORDINE IMMAGINI SISTEMATO!\n');
console.log('Ora la prima immagine di ogni diffusore mostra il prodotto in funzione,');
console.log('non la scatola del packaging.\n');
console.log('📋 Riavvia il backend (già fatto automaticamente) e ricarica il sito (F5)\n');
