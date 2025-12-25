const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './aw-diffusori.csv';
const BACKUP_FILE = `./products.backup-fix-prezzi-${Date.now()}.json`;

console.log('💰 FIX PREZZI DIFFUSORI AATOM - DA COSTO A VENDITA (RRP)\n');
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

    // Crea mappa SKU -> prezzi
    const priceMap = {};
    csvData.forEach(row => {
      priceMap[row['Product code']] = {
        costo: parseFloat(row['Price']),
        vendita: parseFloat(row['Unit RRP'])
      };
    });

    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`✅ Caricati ${products.length} prodotti\n`);

    // Backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Backup: ${BACKUP_FILE}\n`);

    let fixedCount = 0;

    console.log('💰 AGGIORNAMENTO PREZZI A VENDITA (RRP):\n');
    console.log('='.repeat(90));

    products.forEach(product => {
      if (product.sku && product.sku.startsWith('AATOM-')) {
        const prices = priceMap[product.sku];

        if (prices) {
          const oldPrice = product.price;
          const newPrice = prices.vendita;

          if (oldPrice !== newPrice) {
            console.log(`\n💰 ${product.sku}: ${product.name}`);
            console.log(`   Prezzo vecchio: €${oldPrice.toFixed(2)} ${oldPrice === prices.costo ? '(COSTO ❌)' : ''}`);
            console.log(`   Prezzo nuovo: €${newPrice.toFixed(2)} (RRP ✅)`);
            console.log(`   Profitto: €${(newPrice - prices.costo).toFixed(2)} (${((newPrice - prices.costo) / newPrice * 100).toFixed(1)}%)`);

            // Aggiorna prezzo
            product.price = newPrice;
            product.originalPrice = newPrice;

            fixedCount++;
          }
        }
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log(`\n📊 Prezzi aggiornati: ${fixedCount}\n`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('✅ File salvato!\n');

    console.log('='.repeat(90));
    console.log('🎉 PREZZI AGGIORNATI A VENDITA (RRP)!\n');
    console.log('✓ Tutti i diffusori ora hanno il prezzo di vendita al pubblico');
    console.log('✓ Margine di profitto corretto visualizzato\n');
  });
