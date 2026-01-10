const fs = require('fs');

console.log('🔍 CONFRONTO INCENSI AW - Due file JSON\n');

// Leggi i due file
const dataProducts = JSON.parse(fs.readFileSync('./backend/data/products.json', 'utf8'));
const topProducts = JSON.parse(fs.readFileSync('./backend/top-100-products.json', 'utf8'));

// Funzione per filtrare incensi AW reali
function getIncensiAW(products) {
  return products.filter(p => {
    if (!p.id || !p.id.startsWith('aw-')) return false;

    const name = (p.name || '').toLowerCase();
    const categories = JSON.stringify(p.categories || []).toLowerCase();
    const desc = (p.description || '').toLowerCase();

    const hasIncense = name.includes('incens') || categories.includes('incens') || desc.includes('incens');
    const isPerfume = name.includes('profumo') || name.includes('perfume') ||
                      name.includes('edp') || name.includes('eau de');

    return hasIncense && !isPerfume;
  });
}

const incensiData = getIncensiAW(dataProducts);
const incensiTop = getIncensiAW(topProducts);

console.log('═'.repeat(70));
console.log('📁 FILE: backend/data/products.json');
console.log(`   Prodotti totali: ${dataProducts.length}`);
console.log(`   Incensi AW: ${incensiData.length}`);
console.log('');
console.log('📁 FILE: backend/top-100-products.json');
console.log(`   Prodotti totali: ${topProducts.length}`);
console.log(`   Incensi AW: ${incensiTop.length}`);
console.log('═'.repeat(70));
console.log('');

// Trova differenze
const idsData = new Set(incensiData.map(p => p.id));
const idsTop = new Set(incensiTop.map(p => p.id));

const soloInData = incensiData.filter(p => !idsTop.has(p.id));
const soloInTop = incensiTop.filter(p => !idsData.has(p.id));

console.log(`🔄 DIFFERENZE:`);
console.log(`   Solo in data/products.json: ${soloInData.length}`);
console.log(`   Solo in top-100-products.json: ${soloInTop.length}`);
console.log('');

if (soloInData.length > 0) {
  console.log('📋 INCENSI SOLO IN data/products.json (questi mancano online):');
  console.log('─'.repeat(70));
  soloInData.forEach((p, i) => {
    console.log(`${i+1}. [${p.id}] ${p.name}`);
    console.log(`   SKU: ${p.sku || 'N/A'} | Stock: ${p.stock || 0}`);
  });
  console.log('');
}

if (soloInTop.length > 0) {
  console.log('📋 INCENSI SOLO IN top-100-products.json:');
  console.log('─'.repeat(70));
  soloInTop.forEach((p, i) => {
    console.log(`${i+1}. [${p.id}] ${p.name}`);
  });
}
