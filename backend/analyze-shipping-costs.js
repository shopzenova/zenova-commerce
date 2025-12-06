// Analizza file tariffe spedizione Italia
const fs = require('fs');
const csv = require('csv-parser');

async function analyzeShippingCosts() {
  const results = [];

  console.log('📊 Analisi tariffe spedizione Italia\n');
  console.log('Caricamento file reference_shipping_cost_it.csv...\n');

  return new Promise((resolve) => {
    fs.createReadStream('bigbuy-data/reference_shipping_cost_it.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        if (results.length < 20) {  // Prime 20 righe
          results.push(data);
        }
      })
      .on('end', () => {
        console.log('✅ File caricato!\n');
        console.log('========================================');
        console.log('STRUTTURA DATI');
        console.log('========================================');
        console.log('Campi disponibili:', Object.keys(results[0] || {}));
        console.log('\n');

        console.log('========================================');
        console.log('ESEMPI TARIFFE (prime 10 righe)');
        console.log('========================================\n');

        results.slice(0, 10).forEach((row, i) => {
          console.log(`Prodotto ${i + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            if (value && value !== '') {
              console.log(`  ${key}: ${value}`);
            }
          });
          console.log('');
        });

        // Analisi statistica
        console.log('========================================');
        console.log('ANALISI PREZZI');
        console.log('========================================\n');

        const priceFields = Object.keys(results[0]).filter(k =>
          k.toLowerCase().includes('price') ||
          k.toLowerCase().includes('cost') ||
          k.toLowerCase().includes('shipping')
        );

        console.log('Campi prezzo trovati:', priceFields);

        if (priceFields.length > 0) {
          console.log('\nStatistiche per campo prezzo:\n');

          priceFields.forEach(field => {
            const prices = results
              .map(r => parseFloat(r[field]))
              .filter(p => !isNaN(p) && p > 0);

            if (prices.length > 0) {
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

              console.log(`${field}:`);
              console.log(`  Min: €${min.toFixed(2)}`);
              console.log(`  Max: €${max.toFixed(2)}`);
              console.log(`  Media: €${avg.toFixed(2)}`);
              console.log('');
            }
          });
        }

        resolve();
      });
  });
}

analyzeShippingCosts().catch(console.error);
