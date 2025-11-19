const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvPath = path.join(__dirname, 'bigbuy-data/product_2399_it.csv');

console.log('🔍 Debug CSV Parser\n');
console.log('File:', csvPath);
console.log('Esiste:', fs.existsSync(csvPath));
console.log('\nPrime 3 righe parsed:\n');

let count = 0;

fs.createReadStream(csvPath)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    count++;

    if (count <= 3) {
      console.log(`\n--- Riga ${count} ---`);
      console.log('Chiavi:', Object.keys(row));
      console.log('ID:', row.ID);
      console.log('NAME:', row.NAME);
      console.log('BRAND:', row.BRAND);
      console.log('PVD:', row.PVD);
      console.log('STOCK:', row.STOCK);
      console.log('IMAGE1:', row.IMAGE1 ? row.IMAGE1.substring(0, 50) + '...' : 'N/A');
    }
  })
  .on('end', () => {
    console.log(`\n✅ Totale righe lette: ${count}`);
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('❌ Errore:', error);
    process.exit(1);
  });
