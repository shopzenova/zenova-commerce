const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 CONTA INCENSI NEL CSV\n');

const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20260104 (2).csv';

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
      console.log(`   Stock: ${row['Available Quantity']} | Prezzo: €${row['Price']}`);
    });

    console.log('');
    console.log('═'.repeat(70));
    console.log(`✅ TOTALE: ${rows.length} incensi da importare`);
  })
  .on('error', (err) => {
    console.error('❌ Errore lettura CSV:', err.message);
  });
