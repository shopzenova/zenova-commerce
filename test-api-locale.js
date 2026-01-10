const fs = require('fs');

console.log('🧪 Test API Locale - Verifica Incensi\n');

const data = JSON.parse(fs.readFileSync('./backend/top-100-products.json', 'utf8'));

console.log('✅ RISULTATI LOCALE:');
console.log('═'.repeat(60));
console.log('📦 Prodotti totali:', data.length);
console.log('');

// Trova incensi
const incensi = data.filter(p => {
  const str = JSON.stringify(p).toLowerCase();
  return str.includes('incens') || str.includes('incense');
});

console.log('🔥 INCENSI TOTALI TROVATI:', incensi.length);

// Conta per fonte
const awIncensi = incensi.filter(p => p.id && p.id.startsWith('aw-'));
const bigbuyIncensi = incensi.filter(p => p.id && !p.id.startsWith('aw-'));

console.log('   - AW Dropship:', awIncensi.length);
console.log('   - BigBuy:', bigbuyIncensi.length);
console.log('');

// Controlla categorie degli incensi
const categorieUniche = new Set();
incensi.forEach(p => {
  if (p.categories) {
    p.categories.forEach(c => categorieUniche.add(c));
  }
});

console.log('📂 Categorie degli incensi:');
Array.from(categorieUniche).forEach(cat => {
  const count = incensi.filter(p => p.categories?.includes(cat)).length;
  console.log(`   - ${cat}: ${count} prodotti`);
});

console.log('\n📋 Primi 10 incensi:');
incensi.slice(0, 10).forEach((p, i) => {
  const name = p.name || 'N/A';
  const id = p.id || 'N/A';
  const cats = p.categories ? p.categories.join(', ') : 'NO CAT';
  console.log(`   ${i+1}. [${id}] ${name.substring(0, 40)}`);
  console.log(`       Categorie: ${cats}`);
});

console.log('\n' + '═'.repeat(60));
