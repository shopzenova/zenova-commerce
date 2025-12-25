const fs = require('fs');

const DATA_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-aw-removal-${Date.now()}.json`;

console.log('🧹 PULIZIA COMPLETA PRODOTTI AW\n');
console.log('='.repeat(90));

// Leggi products.json del backend
const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
console.log(`\n📦 Prodotti totali: ${products.length}`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}`);

// Conta prodotti AW
const awProducts = products.filter(p =>
  p.supplier === 'AW' ||
  p.source === 'aw' ||
  p.awId ||
  (p.sku && p.sku.startsWith('AATOM-')) ||
  (p.sku && p.sku.startsWith('ASC-')) ||
  (p.sku && p.sku.startsWith('RDEO-')) ||
  (p.sku && p.sku.startsWith('BackF-')) ||
  (p.sku && p.sku.startsWith('SGHC-')) ||
  (p.id && p.id.startsWith('aw-'))
);

console.log(`\n🗑️  Prodotti AW da eliminare: ${awProducts.length}`);
console.log('\nEsempi di prodotti che verranno eliminati:');
awProducts.slice(0, 10).forEach(p => {
  console.log(`  - ${p.id || p.sku}: ${p.name}`);
});

// Mantieni SOLO BigBuy
const cleanedProducts = products.filter(p =>
  p.source === 'bigbuy' ||
  p.bigbuyId ||
  (!p.supplier && !p.source && !p.awId)
);

console.log(`\n✅ Prodotti BigBuy mantenuti: ${cleanedProducts.length}`);
console.log('\n' + '='.repeat(90));

// Salva
fs.writeFileSync(DATA_FILE, JSON.stringify(cleanedProducts, null, 2));
console.log(`\n💾 File salvato: ${DATA_FILE}`);

console.log('\n📊 RIEPILOGO:');
console.log(`   Prima: ${products.length} prodotti`);
console.log(`   Eliminati AW: ${awProducts.length}`);
console.log(`   Rimasti BigBuy: ${cleanedProducts.length}`);
console.log('\n✅ PULIZIA COMPLETATA!\n');
console.log('Pronto per re-import pulito dei prodotti AW dal CSV.\n');
