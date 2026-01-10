const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 ANALISI CSV CANDELE GEL E SALI DA BAGNO\n');

const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20260105.csv';

const rows = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    if (row['Status'] === 'Active') {
      rows.push(row);
    }
  })
  .on('end', () => {
    console.log('═'.repeat(70));
    console.log(`📋 PRODOTTI ATTIVI NEL CSV: ${rows.length}`);
    console.log('═'.repeat(70));
    console.log('');

    console.log('📦 LISTA PRODOTTI:');
    rows.forEach((row, i) => {
      console.log(`${i+1}. [${row['Product code']}] ${row['Unit Name']}`);
      console.log(`   Stock: ${row['Available Quantity']} | Prezzo: €${row['Price']} | RRP: €${row['Unit RRP']}`);
    });

    console.log('');
    console.log('═'.repeat(70));
    console.log(`✅ TOTALE: ${rows.length} candele/sali da importare`);
  })
  .on('error', (err) => {
    console.error('❌ Errore lettura CSV:', err.message);
  });
