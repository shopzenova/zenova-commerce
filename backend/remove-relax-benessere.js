const fs = require('fs');

console.log('🗑️  Rimozione sottocategoria "Relax e benessere" con tutti i prodotti...\n');

// Carica prodotti
const topProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));

console.log('📋 Prodotti totali prima:', topProducts.length);

// Filtra prodotti che hanno sottocategoria "relax-benessere"
const toRemove = topProducts.filter(p => p.zenovaSubcategory === 'relax-benessere');

console.log('📦 Prodotti da rimuovere:', toRemove.length);
console.log('\nProdotti che verranno eliminati:');
toRemove.forEach((p, i) => {
  console.log(`  ${i+1}. [${p.source}] ${p.name}`);
});

// Backup
const backupPath = `./top-100-products.backup-remove-relax-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(topProducts, null, 2));
console.log('\n💾 Backup creato:', backupPath);

// Rimuovi prodotti con sottocategoria relax-benessere
const filtered = topProducts.filter(p => p.zenovaSubcategory !== 'relax-benessere');

const removed = topProducts.length - filtered.length;

console.log('\n📊 RISULTATO:');
console.log('   Prodotti rimossi:', removed);
console.log('   Prodotti rimanenti:', filtered.length);

// Salva
fs.writeFileSync('./top-100-products.json', JSON.stringify(filtered, null, 2));
console.log('\n✅ File top-100-products.json aggiornato!');
console.log('⚠️  Riavvia il backend per applicare le modifiche');
