const fs = require('fs');

console.log('🔍 VERIFICA INCENSI AW - FILE LOCALE\n');

const data = JSON.parse(fs.readFileSync('./backend/top-100-products.json', 'utf8'));

// Trova solo prodotti AW che sono VERI incensi
// Escludiamo profumi e altri prodotti che hanno "incense" solo nel nome
const incensiAW = data.filter(p => {
  if (!p.id || !p.id.startsWith('aw-')) return false;

  const name = (p.name || '').toLowerCase();
  const categories = JSON.stringify(p.categories || []).toLowerCase();
  const desc = (p.description || '').toLowerCase();

  // Ha "incens" da qualche parte
  const hasIncense = name.includes('incens') || categories.includes('incens') || desc.includes('incens');

  // Ma NON è un profumo
  const isPerfume = name.includes('profumo') || name.includes('perfume') ||
                    name.includes('edp') || name.includes('eau de');

  return hasIncense && !isPerfume;
});

console.log('═'.repeat(70));
console.log('📦 PRODOTTI TOTALI NEL FILE:', data.length);
console.log('🔥 INCENSI AW TROVATI:', incensiAW.length);
console.log('═'.repeat(70));
console.log('');

// Raggruppa per categoria
const byCategory = {};
incensiAW.forEach(p => {
  const cats = p.categories || ['NESSUNA CATEGORIA'];
  cats.forEach(cat => {
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  });
});

console.log('📂 INCENSI PER CATEGORIA:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`   ${cat}: ${byCategory[cat].length} prodotti`);
});
console.log('');

// Mostra tutti gli incensi
console.log('📋 LISTA COMPLETA INCENSI AW LOCALI:');
console.log('─'.repeat(70));
incensiAW.forEach((p, i) => {
  const cats = p.categories ? p.categories.join(', ') : 'NO CATEGORIA';
  const visible = p.visible !== false ? '✅' : '❌';
  console.log(`${i+1}. ${visible} [${p.id}] ${p.name}`);
  console.log(`   Cat: ${cats}`);
  console.log(`   SKU: ${p.sku || 'N/A'}`);
});
console.log('═'.repeat(70));

// Conta visibili vs nascosti
const visibili = incensiAW.filter(p => p.visible !== false).length;
const nascosti = incensiAW.filter(p => p.visible === false).length;

console.log('\n📊 VISIBILITÀ:');
console.log(`   ✅ Visibili: ${visibili}`);
console.log(`   ❌ Nascosti: ${nascosti}`);
