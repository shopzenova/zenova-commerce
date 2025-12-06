const fs = require('fs');

// Leggi i prodotti
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

console.log(`📦 Prodotti totali prima: ${products.length}`);

// Sottocategorie da eliminare (bagno e igiene personale)
const toRemove = [
  'deodoranti',
  'gel-doccia',
  'gel-intimo',
  'igiene-orale',
  'lozione-corpo'
];

// Filtra i prodotti
const beforeCount = products.length;
const filteredProducts = products.filter(p => {
  // Se non è Beauty, mantienilo
  if (p.zenovaCategory !== 'beauty') return true;

  // Se è Beauty ma non è in una sottocategoria da rimuovere, mantienilo
  if (!toRemove.includes(p.zenovaSubcategory)) return true;

  // Altrimenti rimuovilo
  return false;
});

const removed = beforeCount - filteredProducts.length;

console.log(`\n🗑️  Prodotti rimossi: ${removed}`);
console.log(`✅ Prodotti rimanenti: ${filteredProducts.length}`);

// Conta quanti prodotti rimangono per ogni sottocategoria rimossa
console.log(`\n📊 Breakdown rimozione:`);
toRemove.forEach(sub => {
  const count = products.filter(p => p.zenovaCategory === 'beauty' && p.zenovaSubcategory === sub).length;
  console.log(`   - ${sub}: ${count} prodotti rimossi`);
});

// Salva backup
const backupPath = `top-100-products-backup-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Backup creato: ${backupPath}`);

// Salva i nuovi prodotti
fs.writeFileSync('top-100-products.json', JSON.stringify(filteredProducts, null, 2));
console.log(`✅ File aggiornato: top-100-products.json`);

// Verifica prodotti Beauty rimanenti
const beautyRemaining = filteredProducts.filter(p => p.zenovaCategory === 'beauty');
console.log(`\n📋 Prodotti Beauty rimanenti: ${beautyRemaining.length}`);

const bySubcat = {};
beautyRemaining.forEach(p => {
  const sub = p.zenovaSubcategory || 'no-subcategory';
  bySubcat[sub] = (bySubcat[sub] || 0) + 1;
});

console.log(`\n🎯 Sottocategorie Beauty conservate:`);
Object.keys(bySubcat).sort().forEach(sub => {
  console.log(`   - ${sub}: ${bySubcat[sub]} prodotti`);
});
