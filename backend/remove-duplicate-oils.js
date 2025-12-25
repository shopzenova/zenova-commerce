const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-remove-duplicates-${Date.now()}.json`;

console.log('🗑️  RIMOZIONE DUPLICATI OLI ESSENZIALI\n');

// Backup
console.log('💾 Backup...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup: ${BACKUP_FILE}\n`);

// Rimuovi TUTTI i prodotti con SKU EO-* o PrEO-* che hanno source="bigbuy"
// (sono i vecchi duplicati importati male)
const removed = [];
const kept = [];

products.forEach(p => {
    const sku = p.sku || '';
    const source = p.source || '';

    // Se è un olio essenziale (EO-* o PrEO-*) E ha source="bigbuy", rimuovilo
    if ((sku.startsWith('EO-') || sku.startsWith('PrEO-')) && source === 'bigbuy') {
        removed.push(p);
        console.log(`❌ RIMOSSO: ${p.name} (${p.sku}) - source: ${p.source} - €${p.price}`);
    } else {
        kept.push(p);
    }
});

console.log(`\n📊 RISULTATO:`);
console.log(`   Prodotti rimossi: ${removed.length}`);
console.log(`   Prodotti mantenuti: ${kept.length}`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(kept, null, 2));
fs.writeFileSync('../products.json', JSON.stringify(kept, null, 2));

console.log(`\n✅ File aggiornati!`);
console.log(`   - backend/top-100-products.json`);
console.log(`   - products.json`);

console.log(`\n🎉 DUPLICATI RIMOSSI! Ora hai solo gli oli AW corretti.`);
