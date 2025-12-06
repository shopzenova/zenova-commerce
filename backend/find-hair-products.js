const fs = require('fs');
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

// Cerca prodotti con parole chiave capelli
const keywords = ['spazzola', 'pettine', 'brush', 'comb', 'capelli', 'hair'];

const hairProducts = products.filter(p => {
  const name = (p.name || '').toLowerCase();
  return keywords.some(k => name.includes(k));
});

console.log(`📊 Trovati ${hairProducts.length} prodotti per capelli\n`);

// Raggruppa per categoria Zenova
const byCategory = {};
hairProducts.forEach(p => {
  const cat = p.zenovaCategory || 'no-category';
  const sub = p.zenovaSubcategory || 'no-subcategory';
  const key = `${cat} / ${sub}`;
  if (!byCategory[key]) byCategory[key] = [];
  byCategory[key].push(p);
});

console.log('📋 Prodotti per capelli per categoria:\n');
Object.keys(byCategory).sort().forEach(key => {
  console.log(`${key}: ${byCategory[key].length} prodotti`);
  byCategory[key].slice(0, 5).forEach(p => {
    console.log(`  - ${p.id}: ${p.name.substring(0, 70)}`);
  });
  if (byCategory[key].length > 5) {
    console.log(`  ... e altri ${byCategory[key].length - 5} prodotti`);
  }
  console.log('');
});

// Lista tutte le sottocategorie Beauty
const beautyProducts = products.filter(p => p.zenovaCategory === 'beauty');
const beautySubs = [...new Set(beautyProducts.map(p => p.zenovaSubcategory))].sort();

console.log('\n📋 Tutte le sottocategorie Beauty attuali:');
beautySubs.forEach(sub => {
  const count = beautyProducts.filter(p => p.zenovaSubcategory === sub).length;
  console.log(`  - ${sub}: ${count} prodotti`);
});
