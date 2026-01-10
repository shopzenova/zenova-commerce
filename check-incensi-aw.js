const data = require('./backend/data/products.json');

const awIncensiAll = data.filter(p =>
  p.id && p.id.startsWith('aw-') &&
  JSON.stringify(p).toLowerCase().includes('incens')
);

console.log('🔍 ANALISI INCENSI AW:');
console.log('═══════════════════════════════════════');
console.log('Incensi AW totali:', awIncensiAll.length);

const awIncensiSubcat = awIncensiAll.filter(p => p.subcategory === 'incenso');
console.log('Con subcategory="incenso":', awIncensiSubcat.length);

const missing = awIncensiAll.filter(p => p.subcategory !== 'incenso');
console.log('SENZA subcategory="incenso":', missing.length);

if (missing.length > 0) {
  console.log('\n❌ Incensi che NON hanno subcategory corretta:');
  missing.forEach((p, i) => {
    console.log(`${i+1}. ${p.id} | ${p.name.substring(0, 45)} | subcat: ${p.subcategory}`);
  });
}
