const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Filtra SOLO prodotti AW (source: 'aw')
const awProducts = products.filter(p => p.source === 'aw');

console.log('🔍 PRODOTTI AW DROPSHIP - TOTALI\n');
console.log('='.repeat(90));
console.log('Totale prodotti AW:', awProducts.length);
console.log('='.repeat(90));
console.log('');

// Raggruppa per sottocategoria
const bySubcat = {};
awProducts.forEach(p => {
  const subcat = p.zenovaSubcategory || p.subcategory || 'NESSUNA';
  if (!bySubcat[subcat]) bySubcat[subcat] = [];
  bySubcat[subcat].push(p);
});

console.log('📂 PRODOTTI AW PER SOTTOCATEGORIA:');
Object.entries(bySubcat)
  .sort((a,b) => b[1].length - a[1].length)
  .forEach(([subcat, prods]) => {
    console.log(`  ${subcat}: ${prods.length} prodotti`);
  });
console.log('');

// Cerca i diffusori
const diffusori = awProducts.filter(p =>
  p.zenovaSubcategory === 'diffusori' ||
  p.zenovaSubcategory === 'diffusori-bastoncini' ||
  (p.name && (p.name.toLowerCase().includes('diffuser') ||
              p.name.toLowerCase().includes('diffusore')))
);

console.log('📦 DIFFUSORI AW (filtrati):');
console.log('Totale diffusori:', diffusori.length);
console.log('='.repeat(90));
console.log('');

diffusori.forEach((p, i) => {
  console.log(`${i+1}. ${p.sku || 'N/A'}`);
  console.log(`   Nome: ${p.name}`);
  console.log(`   Prezzo: ${p.price}€ | Stock: ${p.stock}`);
  console.log(`   Immagini: ${p.images ? p.images.length : 0}`);
  console.log(`   zenovaSubcategory: ${p.zenovaSubcategory || 'N/A'}`);

  // Controlla problemi
  const isEnglish = p.name.includes('Reed Diffuser') ||
                    p.name.includes('Backflow') ||
                    p.name.includes('Burner');
  if (isEnglish) console.log(`   ⚠️  NOME IN INGLESE`);

  if (!p.images || p.images.length === 0) console.log(`   ⚠️  MANCANO FOTO`);

  console.log('');
});

console.log('='.repeat(90));
console.log('📊 RIEPILOGO:\n');

const noImages = diffusori.filter(p => !p.images || p.images.length === 0);
const englishNames = diffusori.filter(p =>
  p.name.includes('Reed Diffuser') ||
  p.name.includes('Backflow') ||
  p.name.includes('Burner')
);

console.log(`  Totale diffusori AW: ${diffusori.length}`);
console.log(`  ⚠️  Senza foto: ${noImages.length}`);
console.log(`  ⚠️  Nomi in inglese: ${englishNames.length}`);
console.log(`  ✅ Con foto: ${diffusori.length - noImages.length}`);
console.log('');
