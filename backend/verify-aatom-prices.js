const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './aw-diffusori.csv';

console.log('🔍 VERIFICA PREZZI AATOM - Database vs CSV\n');
console.log('='.repeat(90));

// Leggi CSV
const csvMap = {};
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvMap[row['Product code']] = {
      cost: parseFloat(row['Price']),
      rrp: parseFloat(row['Unit RRP'])
    };
  })
  .on('end', () => {
    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

    console.log('\n📊 CONFRONTO PREZZI:\n');

    let correctCount = 0;
    let wrongCount = 0;

    products
      .filter(p => p.sku && p.sku.startsWith('AATOM-'))
      .forEach(p => {
        const csvData = csvMap[p.sku];

        if (csvData) {
          const isCorrect = p.price === csvData.rrp;

          if (!isCorrect) {
            console.log(`❌ ${p.sku}`);
            console.log(`   DB: €${p.price.toFixed(2)} | CSV RRP: €${csvData.rrp.toFixed(2)}`);
            console.log(`   ERRORE: Prezzo errato in database!`);
            wrongCount++;
          } else {
            console.log(`✅ ${p.sku}: €${p.price.toFixed(2)} (corretto)`);
            correctCount++;
          }
        } else {
          console.log(`⚠️  ${p.sku}: Non trovato nel CSV`);
        }
      });

    console.log('\n' + '='.repeat(90));
    console.log(`\n📈 RISULTATI:`);
    console.log(`   ✅ Prezzi corretti: ${correctCount}`);
    console.log(`   ❌ Prezzi errati: ${wrongCount}`);
    console.log('\n' + '='.repeat(90));

    if (wrongCount === 0) {
      console.log('\n🎉 TUTTI I PREZZI SONO CORRETTI NEL DATABASE!');
      console.log('\n💡 Se vedi prezzi errati nel browser, il problema è la cache.');
      console.log('   Soluzioni:');
      console.log('   1. Riavvia il backend (Ctrl+C e riavvia)');
      console.log('   2. Svuota cache browser (Ctrl+Shift+Delete)');
      console.log('   3. Prova browser in incognito\n');
    }
  });
