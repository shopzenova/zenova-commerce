const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-remove-old-aatom-${Date.now()}.json`;

console.log('🗑️  Rimozione vecchi prodotti AATOM duplicati...\n');

// Backup
console.log('💾 Creazione backup...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup salvato: ${BACKUP_FILE}\n`);

const beforeCount = products.length;

// Rimuovi prodotti con ID che inizia con "AATOM-" (maiuscolo, senza prefisso aw-)
// ma mantieni quelli con "aw-aatom-" (i nuovi)
const filteredProducts = products.filter(p => {
    // Se l'ID inizia con AATOM- maiuscolo (senza aw-), rimuovilo
    if (p.id && p.id.match(/^AATOM-/i) && !p.id.startsWith('aw-')) {
        console.log(`🗑️  Rimosso duplicato: ${p.id} - ${p.name}`);
        return false;
    }
    return true;
});

const afterCount = filteredProducts.length;
const removedCount = beforeCount - afterCount;

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2));

console.log(`\n✅ Rimozione completata!`);
console.log(`📦 Prodotti prima: ${beforeCount}`);
console.log(`📦 Prodotti dopo: ${afterCount}`);
console.log(`🗑️  Prodotti rimossi: ${removedCount}`);
