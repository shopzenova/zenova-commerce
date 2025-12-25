const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Cerca tutti i diffusori aromatici
const diffusori = products.filter(p =>
  p.source === 'aw' &&
  (p.zenovaSubcategory === 'diffusori-bastoncini' ||
   p.zenovaSubcategory === 'diffusori' ||
   p.subcategory === 'diffusori' ||
   (p.name && (p.name.toLowerCase().includes('diffuser') ||
               p.name.toLowerCase().includes('diffusore'))))
);

console.log('🔍 DIFFUSORI AROMATICI - ANALISI COMPLETA\n');
console.log('='.repeat(90));
console.log('Totale diffusori trovati:', diffusori.length);
console.log('='.repeat(90));
console.log('');

// Raggruppa per SKU prefix
const bySKU = {};
diffusori.forEach(p => {
  const prefix = p.sku ? p.sku.split('-')[0] : 'NESSUNO';
  if (!bySKU[prefix]) bySKU[prefix] = [];
  bySKU[prefix].push(p);
});

console.log('📊 DIFFUSORI PER FORNITORE (SKU Prefix):');
Object.entries(bySKU).forEach(([prefix, prods]) => {
  console.log(`  ${prefix}: ${prods.length} prodotti`);
});
console.log('');

// Mostra tutti i diffusori
console.log('📦 ELENCO COMPLETO DIFFUSORI:\n');

diffusori.forEach((p, i) => {
  console.log(`${i+1}. SKU: ${p.sku || 'N/A'}`);
  console.log(`   Nome: ${p.name}`);
  console.log(`   Prezzo: ${p.price}€ | Stock: ${p.stock}`);
  console.log(`   Immagini: ${p.images ? p.images.length : 0}`);
  console.log(`   zenovaSubcategory: ${p.zenovaSubcategory || 'N/A'}`);

  // Controlla se nome in inglese
  const isEnglish = p.name.includes('Reed Diffuser') ||
                    p.name.includes('Backflow') ||
                    p.name.includes('Burner') ||
                    p.name.toLowerCase().includes('holder');
  if (isEnglish) {
    console.log(`   ⚠️  NOME IN INGLESE`);
  }

  // Controlla se mancano foto
  if (!p.images || p.images.length === 0) {
    console.log(`   ⚠️  MANCANO FOTO`);
  }

  console.log('');
});

console.log('='.repeat(90));
console.log('📊 RIEPILOGO PROBLEMI:\n');

const noImages = diffusori.filter(p => !p.images || p.images.length === 0);
const englishNames = diffusori.filter(p => {
  return p.name.includes('Reed Diffuser') ||
         p.name.includes('Backflow') ||
         p.name.includes('Burner') ||
         p.name.toLowerCase().includes('holder');
});
const noStock = diffusori.filter(p => p.stock === 0);
const wrongSubcat = diffusori.filter(p => p.zenovaSubcategory !== 'diffusori-aromatici');

console.log(`  ⚠️  Senza foto: ${noImages.length}`);
console.log(`  ⚠️  Nomi in inglese: ${englishNames.length}`);
console.log(`  ⚠️  Stock zero: ${noStock.length}`);
console.log(`  ⚠️  Sottocategoria sbagliata: ${wrongSubcat.length}`);

console.log('\n' + '='.repeat(90));
