const fs = require('fs');

console.log('🗑️  RIMOZIONE PRODOTTI A BASSO MARGINE\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-cleanup-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

console.log(`📦 Prodotti attuali: ${products.length}\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🔍 IDENTIFICAZIONE PRODOTTI DA RIMUOVERE:\n');

// Identifica prodotti da rimuovere
const daRimuovere = products.filter(p => {
  // Oli per fragranza 10ml a €2.50 o meno
  const isOlioVecchio = p.price <= 3 &&
                        p.name &&
                        p.name.includes('Olio per Fragranza') &&
                        p.name.includes('10ml');

  // Incensi a €1.80 o meno (NON i nuovi Bulk)
  const isIncensoVecchio = p.price <= 2 &&
                           p.subcategory &&
                           p.subcategory.includes('incens') &&
                           !(p.sku && p.sku.startsWith('BinC-')); // Mantieni i Bulk nuovi

  return isOlioVecchio || isIncensoVecchio;
});

// Prodotti da mantenere
const daMantenere = products.filter(p => !daRimuovere.includes(p));

console.log(`❌ Oli fragranza 10ml (≤€3): ${daRimuovere.filter(p => p.name && p.name.includes('10ml')).length}`);
console.log(`❌ Incensi vecchi (≤€2): ${daRimuovere.filter(p => p.price <= 2 && p.subcategory && p.subcategory.includes('incens')).length}`);
console.log(`\n🗑️  TOTALE DA RIMUOVERE: ${daRimuovere.length}`);
console.log(`✅ TOTALE DA MANTENERE: ${daMantenere.length}\n`);

console.log('='.repeat(90));
console.log('📋 ESEMPI RIMOSSI:\n');

daRimuovere.slice(0, 10).forEach(p => {
  console.log(`❌ ${p.name} - €${p.price}`);
});

if (daRimuovere.length > 10) {
  console.log(`   ... e altri ${daRimuovere.length - 10} prodotti\n`);
}

console.log('='.repeat(90));
console.log('📊 RIEPILOGO FINALE:\n');
console.log(`   Prodotti prima: ${products.length}`);
console.log(`   Prodotti rimossi: ${daRimuovere.length}`);
console.log(`   Prodotti dopo: ${daMantenere.length}`);
console.log(`   Spazio risparmiato: ~${((daRimuovere.length / products.length) * 100).toFixed(1)}%\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(daMantenere, null, 2));
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ PULIZIA COMPLETATA!\n');
