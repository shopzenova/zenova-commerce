const fs = require('fs');

// Leggi i prodotti
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

console.log(`📦 Prodotti totali prima: ${products.length}`);

// Sottocategorie da eliminare
const categoriesToRemove = [
  'integratori',
  'misuratori-pressione',
  'separatore-dita',
  'siero-barba',
  'siero-viso'  // questa è in Beauty
];

// Conta prodotti prima
console.log('\n📊 Prodotti da eliminare:');
categoriesToRemove.forEach(sub => {
  const productsInCategory = products.filter(p => p.zenovaSubcategory === sub);
  const count = productsInCategory.length;

  if (count > 0) {
    const category = productsInCategory[0].zenovaCategory;
    console.log(`   - ${sub} (${category}): ${count} prodotti`);
  }
});

// Filtra i prodotti
const beforeCount = products.length;
const filteredProducts = products.filter(p => {
  return !categoriesToRemove.includes(p.zenovaSubcategory);
});

const removed = beforeCount - filteredProducts.length;

console.log(`\n🗑️  Prodotti rimossi: ${removed}`);
console.log(`✅ Prodotti rimanenti: ${filteredProducts.length}`);

// Salva backup
const backupPath = `top-100-products-backup-more-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Backup creato: ${backupPath}`);

// Salva i nuovi prodotti
fs.writeFileSync('top-100-products.json', JSON.stringify(filteredProducts, null, 2));
console.log(`✅ File aggiornato: top-100-products.json`);

// Verifica prodotti rimanenti per categoria
const beautyRemaining = filteredProducts.filter(p => p.zenovaCategory === 'beauty');
const healthRemaining = filteredProducts.filter(p => p.zenovaCategory === 'health-personal-care');

console.log(`\n📋 Prodotti Beauty rimanenti: ${beautyRemaining.length}`);
console.log(`📋 Prodotti Health & Personal Care rimanenti: ${healthRemaining.length}`);

// Mostra sottocategorie rimanenti in Health & Personal Care
const healthSubs = [...new Set(healthRemaining.map(p => p.zenovaSubcategory))].sort();
console.log(`\n🎯 Sottocategorie Health & Personal Care rimaste:`);
healthSubs.forEach(sub => {
  const count = healthRemaining.filter(p => p.zenovaSubcategory === sub).length;
  console.log(`   - ${sub}: ${count} prodotti`);
});
