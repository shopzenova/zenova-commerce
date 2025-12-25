const fs = require('fs');
const csv = require('csv-parser');

const results = [];
const csvFile = './backend/aw-diffusori.csv';

console.log('📊 ANALISI 28 DIFFUSORI AROMATICI - CSV AATOM\n');
console.log('='.repeat(90));

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    results.push(row);
  })
  .on('end', () => {
    console.log(`Totale prodotti trovati: ${results.length}\n`);
    console.log('='.repeat(90));

    results.forEach((prod, i) => {
      const images = prod.Images ? prod.Images.split(',').map(img => img.trim()) : [];

      console.log(`\n${i + 1}. SKU: ${prod['Product code']}`);
      console.log(`   Nome: ${prod['Unit Name']}`);
      console.log(`   Status: ${prod.Status}`);
      console.log(`   Prezzo Costo: €${prod.Price}`);
      console.log(`   Prezzo Vendita (RRP): €${prod['Unit RRP']}`);
      console.log(`   Stock: ${prod['Available Quantity'] || prod.Stock}`);
      console.log(`   Foto: ${images.length} immagini`);

      // Evidenzia problemi
      if (prod.Status === 'Discontinuing') {
        console.log(`   ⚠️  PRODOTTO IN DISMISSIONE`);
      }
      if (prod.Status === 'OutofStock' || !prod['Available Quantity'] || prod['Available Quantity'] === '') {
        console.log(`   ⚠️  FUORI STOCK`);
      }
      if (images.length === 0) {
        console.log(`   ⚠️  MANCANO FOTO`);
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log('📊 RIEPILOGO:\n');

    const active = results.filter(p => p.Status === 'Active');
    const discontinuing = results.filter(p => p.Status === 'Discontinuing');
    const outOfStock = results.filter(p => p.Status === 'OutofStock' || !p['Available Quantity'] || p['Available Quantity'] === '');
    const withImages = results.filter(p => p.Images && p.Images.length > 0);

    console.log(`  Totale: ${results.length} prodotti`);
    console.log(`  ✅ Active: ${active.length}`);
    console.log(`  ⚠️  Discontinuing: ${discontinuing.length}`);
    console.log(`  ⚠️  Out of Stock: ${outOfStock.length}`);
    console.log(`  📷 Con foto: ${withImages.length}`);
    console.log(`  ⚠️  Senza foto: ${results.length - withImages.length}`);

    console.log('\n' + '='.repeat(90));
  });
