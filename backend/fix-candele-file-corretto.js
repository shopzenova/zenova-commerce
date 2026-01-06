const fs = require('fs');

console.log('🔧 FIX CANDELE - Sposta in top-100-products.json\n');

const dataProductsPath = './data/products.json';
const topProductsPath = './top-100-products.json';

// Leggi entrambi i file
const dataProducts = JSON.parse(fs.readFileSync(dataProductsPath, 'utf-8'));
const topProducts = JSON.parse(fs.readFileSync(topProductsPath, 'utf-8'));

console.log(`📦 Prodotti in data/products.json: ${dataProducts.length}`);
console.log(`📦 Prodotti in top-100-products.json: ${topProducts.length}`);
console.log('');

// Trova le 42 candele in data/products.json
const candele = dataProducts.filter(p => {
  return p.zenovaSubcategory === 'candele-gel-profumati-sali-bagno' &&
         p.id && p.id.startsWith('aw-');
});

console.log(`🕯️  Candele trovate in data/products.json: ${candele.length}`);
console.log('');

// Verifica quali sono già in top-100-products.json
const existingSkus = new Set(topProducts.map(p => p.sku));
const candeleNuove = candele.filter(c => !existingSkus.has(c.sku));

console.log(`✨ Candele nuove da aggiungere: ${candeleNuove.length}`);
console.log('');

if (candeleNuove.length === 0) {
  console.log('✅ Tutte le candele sono già in top-100-products.json!');
  process.exit(0);
}

// Backup
const backupPath = `./top-100-products.backup-fix-candele-${Date.now()}.json`;
fs.copyFileSync(topProductsPath, backupPath);
console.log(`✅ Backup creato: ${backupPath}\n`);

// Aggiungi candele nuove
console.log('📋 Candele da aggiungere:');
candeleNuove.forEach((c, i) => {
  console.log(`   ${i+1}. [${c.sku}] ${c.name}`);
  console.log(`      Prezzo: €${c.price} | Stock: ${c.stock}`);
  topProducts.push(c);
});

// Salva
fs.writeFileSync(topProductsPath, JSON.stringify(topProducts, null, 2));

console.log('\n' + '═'.repeat(70));
console.log('✅ FIX COMPLETATO!');
console.log(`   Candele aggiunte a top-100-products.json: ${candeleNuove.length}`);
console.log(`   Totale prodotti: ${topProducts.length}`);
console.log(`   Backup: ${backupPath}`);
console.log('═'.repeat(70));
