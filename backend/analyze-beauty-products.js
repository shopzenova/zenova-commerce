const fs = require('fs');
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

// Trova tutti i prodotti Beauty
const beautyProducts = products.filter(p => p.zenovaCategory === 'beauty');

console.log(`📊 Totale prodotti Beauty: ${beautyProducts.length}\n`);

// Raggruppa per sottocategoria Zenova
const bySubcategory = {};
beautyProducts.forEach(p => {
  const sub = p.zenovaSubcategory || 'no-subcategory';
  if (!bySubcategory[sub]) bySubcategory[sub] = [];
  bySubcategory[sub].push({ id: p.id, name: p.name });
});

console.log('📋 Sottocategorie Beauty:\n');
Object.keys(bySubcategory).sort().forEach(sub => {
  console.log(`\n${sub}: ${bySubcategory[sub].length} prodotti`);
  bySubcategory[sub].slice(0, 3).forEach(p => {
    console.log(`  - ${p.id}: ${p.name.substring(0, 60)}...`);
  });
  if (bySubcategory[sub].length > 3) {
    console.log(`  ... e altri ${bySubcategory[sub].length - 3} prodotti`);
  }
});
