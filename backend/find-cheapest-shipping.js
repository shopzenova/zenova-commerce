// Trova tariffe più economiche per paese
const fs = require('fs');
const csv = require('csv-parser');

async function findCheapestShipping(countryCode) {
  const results = [];
  const fileName = `reference_shipping_cost_${countryCode.toLowerCase()}.csv`;

  console.log(`📦 Analisi tariffe per ${countryCode}...\n`);

  return new Promise((resolve) => {
    fs.createReadStream(`bigbuy-data/${fileName}`)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        // Raggruppa per corriere
        const byCarrier = {};

        results.forEach(row => {
          const carrier = row.carrier;
          const cost = parseFloat(row.cost);

          if (!byCarrier[carrier]) {
            byCarrier[carrier] = {
              minCost: cost,
              maxCost: cost,
              avgCost: 0,
              count: 0,
              service: row.carrier_service
            };
          }

          byCarrier[carrier].minCost = Math.min(byCarrier[carrier].minCost, cost);
          byCarrier[carrier].maxCost = Math.max(byCarrier[carrier].maxCost, cost);
          byCarrier[carrier].count++;
        });

        // Calcola media
        Object.keys(byCarrier).forEach(carrier => {
          const costs = results
            .filter(r => r.carrier === carrier)
            .map(r => parseFloat(r.cost));
          byCarrier[carrier].avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
        });

        console.log(`✅ Analizzati ${results.length} prodotti\n`);
        console.log('========================================');
        console.log(`TARIFFE PER ${countryCode.toUpperCase()}`);
        console.log('========================================\n');

        // Ordina per costo medio
        const sorted = Object.entries(byCarrier).sort((a, b) => a[1].avgCost - b[1].avgCost);

        sorted.forEach(([carrier, data]) => {
          console.log(`${carrier.padEnd(15)} | Min: €${data.minCost.toFixed(2)} | Max: €${data.maxCost.toFixed(2)} | Media: €${data.avgCost.toFixed(2)} | Tempi: ${data.service}`);
        });

        console.log('\n');
        resolve(sorted[0]); // Ritorna il più economico
      });
  });
}

async function main() {
  const countries = ['IT', 'CH', 'FR', 'DE', 'ES', 'GB', 'NL', 'BE', 'AT'];

  const summary = {};

  for (const country of countries) {
    try {
      const cheapest = await findCheapestShipping(country);
      if (cheapest) {
        summary[country] = {
          carrier: cheapest[0],
          avgCost: cheapest[1].avgCost,
          service: cheapest[1].service
        };
      }
    } catch (err) {
      console.log(`⚠️  File per ${country} non ancora scaricato\n`);
    }
  }

  console.log('\n========================================');
  console.log('RIEPILOGO TARIFFE PIÙ ECONOMICHE');
  console.log('========================================\n');

  Object.entries(summary).forEach(([country, data]) => {
    console.log(`${country} → €${data.avgCost.toFixed(2)} (${data.carrier}, ${data.service} giorni)`);
  });
}

main().catch(console.error);
