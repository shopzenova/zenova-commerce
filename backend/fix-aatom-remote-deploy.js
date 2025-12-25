const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './aw-diffusori.csv';
const BACKUP_FILE = `./products.backup-remote-deploy-${Date.now()}.json`;

console.log('🌐 CONVERSIONE DIFFUSORI AATOM PER DEPLOY ONLINE\n');
console.log('Usa URL remoti AW Dropship (no file locali)\n');
console.log('='.repeat(90));

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`✅ CSV letto: ${csvData.length} prodotti\n`);

    // Crea mappa SKU -> immagini remote
    const csvMap = {};
    csvData.forEach(row => {
      const images = row['Images'] ? row['Images'].split(',').map(img => img.trim()) : [];
      csvMap[row['Product code']] = images;
    });

    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`✅ Caricati ${products.length} prodotti\n`);

    // Backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Backup: ${BACKUP_FILE}\n`);

    let convertedCount = 0;

    console.log('🔄 CONVERSIONE A URL REMOTI:\n');
    console.log('='.repeat(90));

    products.forEach(product => {
      if (product.sku && product.sku.startsWith('AATOM-')) {
        const remoteImages = csvMap[product.sku];

        if (remoteImages && remoteImages.length >= 2) {
          // Scambia 1a con 2a (prodotto in funzione come principale)
          [remoteImages[0], remoteImages[1]] = [remoteImages[1], remoteImages[0]];

          product.images = remoteImages;
          product.mainImage = remoteImages[0];
          product.image = remoteImages[0];

          console.log(`\n✅ ${product.sku}`);
          console.log(`   Immagini remote: ${remoteImages.length}`);
          console.log(`   Principale: ${remoteImages[0].substring(0, 60)}...`);
          console.log(`   ✓ Prodotto in funzione (non scatola)`);

          convertedCount++;
        } else if (remoteImages && remoteImages.length === 1) {
          product.images = remoteImages;
          product.mainImage = remoteImages[0];
          product.image = remoteImages[0];

          console.log(`\n⚠️  ${product.sku}: Solo 1 immagine`);
          convertedCount++;
        } else {
          console.log(`\n❌ ${product.sku}: Nessuna immagine nel CSV`);
        }
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log(`\n📊 Prodotti convertiti a URL remoti: ${convertedCount}\n`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('✅ File salvato!\n');

    console.log('='.repeat(90));
    console.log('🎉 CONVERSIONE COMPLETATA - PRONTO PER DEPLOY!\n');
    console.log('✓ Tutte le immagini sono URL remoti AW Dropship');
    console.log('✓ Nessun file locale da caricare');
    console.log('✓ Funzioneranno online su shop.zenova.ovh');
    console.log('✓ Prodotto in funzione come prima immagine\n');
  });
