const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('=== ANALISI DIFFUSORI ===\n');

// Cerca diffusori AATOM
const aatom = data.filter(p => p.id?.includes('AATOM'));
console.log('Diffusori AATOM nel database:', aatom.length);

aatom.forEach(d => {
  console.log(`  ${d.id}: ${d.name}`);
  console.log(`    Categoria: ${d.zenovaCategory} / ${d.zenovaSubcategory}`);
  console.log(`    Immagini: ${d.images?.length || 0}`);
  console.log(`    Immagine locale: ${d.localImage || 'NO'}`);
});

// Cerca diffusori ACD
const acd = data.filter(p => p.id?.includes('ACD'));
console.log('\nDiffusori ACD (reed diffusers) nel database:', acd.length);

acd.slice(0, 10).forEach(d => {
  console.log(`  ${d.id}: ${d.name}`);
  console.log(`    Categoria: ${d.zenovaCategory} / ${d.zenovaSubcategory}`);
  console.log(`    Immagini: ${d.images?.length || 0}`);
  console.log(`    Immagine locale: ${d.localImage || 'NO'}`);
});

// Cerca borse JNS
const jns = data.filter(p => p.id?.includes('JNS'));
console.log('\nBorse JNS nel database:', jns.length);

jns.forEach(d => {
  console.log(`  ${d.id}: ${d.name}`);
  console.log(`    Categoria: ${d.zenovaCategory} / ${d.zenovaSubcategory}`);
  console.log(`    Immagine locale: ${d.localImage || 'NO'}`);
});
