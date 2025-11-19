const data = require('./top-products-updated.json');

console.log('\n🔍 ANALISI CATEGORIZZAZIONE PRODOTTI');
console.log('=====================================\n');

// Filtra prodotti da FTP
const ftpProducts = data.filter(p => p.source === 'bigbuy_ftp');

console.log(`📊 Prodotti analizzati: ${ftpProducts.length}\n`);
console.log('SITUAZIONE ATTUALE:\n');

// Mostra esempi
console.log('Primi 5 prodotti importati via FTP:\n');
ftpProducts.slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.name.substring(0, 60)}...`);
  console.log(`   📂 BigBuy Category ID: ${p.categoryId || 'N/A'}`);
  console.log(`   🏷️  Zenova Categories: ${JSON.stringify(p.zenovaCategories)}`);
  console.log(`   📋 Raw Category: ${p.category}`);
  console.log('');
});

// Analizza distribuzione categorie Zenova
console.log('\n📊 DISTRIBUZIONE CATEGORIE ZENOVA:\n');
const zenovaCats = {};
ftpProducts.forEach(p => {
  const cats = p.zenovaCategories || ['N/A'];
  const key = cats.join(', ');
  zenovaCats[key] = (zenovaCats[key] || 0) + 1;
});

Object.entries(zenovaCats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} prodotti`);
});

// Leggi il CSV per vedere le sottocategorie BigBuy
console.log('\n\n🔍 SOTTOCATEGORIE BIGBUY DISPONIBILI NEL CSV:\n');
const fs = require('fs');
const csv = require('csv-parser');

const csvPath = './bigbuy-data/product_2403_it.csv';

let count = 0;
const categoryExamples = new Set();

fs.createReadStream(csvPath)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    if (count < 10 && row.CATEGORY) {
      const cats = row.CATEGORY.split(',');
      categoryExamples.add(row.CATEGORY);
      if (count < 5) {
        console.log(`Prodotto: ${(row.NAME || '').substring(0, 50)}...`);
        console.log(`  Sottocategorie BigBuy: ${row.CATEGORY}`);
        console.log('');
      }
      count++;
    }
  })
  .on('end', () => {
    console.log(`\n✅ Trovate sottocategorie BigBuy in ${count} prodotti`);
    console.log(`📂 Esempi categorie uniche: ${categoryExamples.size}\n`);
  });
