const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 VERIFICA CSV INCENSI A CONO RIFLUSSO\n');

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

    // Ora controlliamo se sono già in data/products.json
    const dataProducts = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    const topProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf-8'));

    const skusData = new Set(dataProducts.map(p => p.sku));
    const skusTop = new Set(topProducts.map(p => p.sku));

    console.log('📦 ANALISI PRODOTTI CSV:');
    console.log('─'.repeat(70));

    let inData = 0;
    let inTop = 0;
    let missing = 0;

    rows.forEach((row, i) => {
      const sku = row['Product code'];
      const name = row['Unit Name'];
      const stock = row['Available Quantity'];
      const price = row['Price'];

      const isInData = skusData.has(sku);
      const isInTop = skusTop.has(sku);

      let status = '';
      if (isInData && isInTop) {
        status = '✅ Presente in ENTRAMBI';
        inData++;
        inTop++;
      } else if (isInData) {
        status = '⚠️  Solo in data/products.json';
        inData++;
      } else if (isInTop) {
        status = '⚠️  Solo in top-100-products.json';
        inTop++;
      } else {
        status = '❌ MANCANTE';
        missing++;
      }

      console.log(`${i+1}. [${sku}] ${name}`);
      console.log(`   Stock: ${stock} | Prezzo: €${price}`);
      console.log(`   ${status}`);
      console.log('');
    });

    console.log('═'.repeat(70));
    console.log('📊 RIEPILOGO:');
    console.log(`   ✅ In data/products.json: ${inData}/${rows.length}`);
    console.log(`   ✅ In top-100-products.json: ${inTop}/${rows.length}`);
    console.log(`   ❌ Mancanti da entrambi: ${missing}/${rows.length}`);
    console.log('═'.repeat(70));
  })
  .on('error', (err) => {
    console.error('❌ Errore lettura CSV:', err.message);
  });
