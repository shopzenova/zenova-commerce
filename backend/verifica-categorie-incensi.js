const fs = require('fs');

console.log('🔍 VERIFICA CATEGORIE INCENSI in data/products.json\n');

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

// Trova i 30 incensi a riflusso
const incensi = products.filter(p => {
  if (!p.id || !p.id.startsWith('aw-')) return false;

  const name = (p.name || '').toLowerCase();
  const hasIncense = name.includes('incens') || name.includes('coni');
  const isPerfume = name.includes('profumo') || name.includes('perfume');

  return hasIncense && !isPerfume;
});

console.log('═'.repeat(70));
console.log(`🔥 INCENSI A RIFLUSSO TROVATI: ${incensi.length}`);
console.log('═'.repeat(70));
console.log('');

// Analisi categorie
const perCategoria = {};
const senzaCategoria = [];

incensi.forEach(p => {
  // Controlla vari campi categoria
  const cats = p.zenovaCategories || p.categories || [];
  const subcat = p.zenovaSubcategory || p.subcategory || '';
  const visible = p.visible !== false && p.visibility !== 'hidden';

  const catString = cats.length > 0 ? cats.join(', ') : 'NESSUNA';

  if (!perCategoria[catString]) {
    perCategoria[catString] = [];
  }
  perCategoria[catString].push(p);

  if (cats.length === 0) {
    senzaCategoria.push(p);
  }

  console.log(`${visible ? '✅' : '❌'} [${p.id}] ${p.name}`);
  console.log(`   Categorie: ${catString}`);
  console.log(`   Subcategoria: ${subcat || 'NESSUNA'}`);
  console.log(`   Visible: ${p.visible !== false}`);
  console.log(`   Visibility: ${p.visibility || 'N/A'}`);
  console.log('');
});

console.log('═'.repeat(70));
console.log('📊 RIEPILOGO CATEGORIE:');
Object.keys(perCategoria).forEach(cat => {
  console.log(`   ${cat}: ${perCategoria[cat].length} prodotti`);
});

console.log('');
console.log(`⚠️  PRODOTTI SENZA CATEGORIA: ${senzaCategoria.length}/${incensi.length}`);
console.log('═'.repeat(70));

if (senzaCategoria.length > 0) {
  console.log('');
  console.log('❌ PROBLEMA: Questi incensi NON hanno categoria!');
  console.log('   Per questo non appaiono sul sito nel menu.');
  console.log('   Devono essere assegnati a una categoria per essere visibili.');
}
