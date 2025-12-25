const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Filtra prodotti AW
const awProducts = products.filter(p =>
  p.source === 'aw' ||
  p.category === 'Natural Wellness' ||
  p.category === 'natural-wellness'
);

console.log('📊 ANALISI PRODOTTI AW DROPSHIP - NATURAL WELLNESS\n');
console.log('='.repeat(60));
console.log('Totale prodotti AW:', awProducts.length);
console.log('='.repeat(60));
console.log('');

// 1. Raggruppa per CATEGORIA
console.log('📂 PER CATEGORIA:');
const byCategory = {};
awProducts.forEach(p => {
  const cat = p.category || 'NESSUNA CATEGORIA';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(p);
});

Object.entries(byCategory)
  .sort((a,b) => b[1].length - a[1].length)
  .forEach(([cat, prods]) => {
    console.log(`  ${cat}: ${prods.length} prodotti`);
  });
console.log('');

// 2. Raggruppa per SOTTOCATEGORIA
console.log('📂 PER SOTTOCATEGORIA (subcategory):');
const bySubcat = {};
awProducts.forEach(p => {
  const subcat = p.subcategory || 'NESSUNA';
  if (!bySubcat[subcat]) bySubcat[subcat] = [];
  bySubcat[subcat].push(p);
});

Object.entries(bySubcat)
  .sort((a,b) => b[1].length - a[1].length)
  .forEach(([subcat, prods]) => {
    console.log(`  ${subcat}: ${prods.length} prodotti`);
  });
console.log('');

// 3. Raggruppa per zenovaSubcategory
console.log('📂 PER ZENOVA SOTTOCATEGORIA (zenovaSubcategory):');
const byZenovaSubcat = {};
awProducts.forEach(p => {
  const subcat = p.zenovaSubcategory || 'NESSUNA';
  if (!byZenovaSubcat[subcat]) byZenovaSubcat[subcat] = [];
  byZenovaSubcat[subcat].push(p);
});

Object.entries(byZenovaSubcat)
  .sort((a,b) => b[1].length - a[1].length)
  .forEach(([subcat, prods]) => {
    console.log(`  ${subcat}: ${prods.length} prodotti`);
  });
console.log('');

// 4. Verifica struttura - mostra esempio di 3 prodotti
console.log('📋 ESEMPIO STRUTTURA (primi 3 prodotti):');
console.log('='.repeat(60));
awProducts.slice(0, 3).forEach((p, i) => {
  console.log(`\nProdotto ${i+1}:`);
  console.log('  SKU:', p.sku);
  console.log('  Nome:', p.name);
  console.log('  Categoria:', p.category);
  console.log('  Subcategory:', p.subcategory);
  console.log('  zenovaCategory:', p.zenovaCategory);
  console.log('  zenovaSubcategory:', p.zenovaSubcategory);
  console.log('  Source:', p.source);
  console.log('  Prezzo:', p.price);
});
console.log('');

// 5. Verifica prodotti senza sottocategoria
const noSubcat = awProducts.filter(p => !p.subcategory && !p.zenovaSubcategory);
console.log('⚠️  PRODOTTI SENZA SOTTOCATEGORIA:', noSubcat.length);
if (noSubcat.length > 0) {
  console.log('   Esempi:');
  noSubcat.slice(0, 5).forEach(p => {
    console.log(`   - ${p.sku}: ${p.name}`);
  });
}
console.log('');

// 6. Verifica traduzioni incomplete
console.log('🔍 VERIFICA TRADUZIONI:');
const withEnglish = awProducts.filter(p => {
  const name = p.name.toLowerCase();
  return name.includes('wax melts') ||
         name.includes('incense') ||
         name.includes('candle') ||
         name.includes('bath') ||
         name.includes('burner') ||
         name.includes('holder') ||
         name.includes('gift set') ||
         name.includes('small') ||
         name.includes('medium') ||
         name.includes('large');
});

console.log('  Prodotti con testo inglese:', withEnglish.length);
if (withEnglish.length > 0) {
  console.log('  Esempi:');
  withEnglish.slice(0, 10).forEach(p => {
    console.log(`    ${p.sku}: ${p.name}`);
  });
}
console.log('');

// 7. Raggruppa per famiglia di prodotto (dalle prime parole del nome)
console.log('📦 FAMIGLIE DI PRODOTTI (prime 3 parole nome):');
const families = {};
awProducts.forEach(p => {
  const family = p.name.split(' ').slice(0, 3).join(' ');
  if (!families[family]) families[family] = 0;
  families[family]++;
});

Object.entries(families)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([family, count]) => {
    if (count >= 3) {
      console.log(`  "${family}...": ${count} prodotti`);
    }
  });

console.log('\n' + '='.repeat(60));
console.log('✅ ANALISI COMPLETATA');
console.log('='.repeat(60));
