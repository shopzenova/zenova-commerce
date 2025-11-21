const fs = require('fs');
const path = require('path');

console.log('🗑️ RIMOZIONE PRODOTTI EROTICI...\n');

// Leggi il file JSON
const jsonPath = path.join(__dirname, 'top-100-products.json');
const data = require(jsonPath);

console.log(`📦 Prodotti totali prima: ${data.length}`);

// Nomi prodotti da eliminare
const productsToRemove = [
    'Vibratore B-Vibe Heart Rosa',
    'Vibratore B-Vibe Heart Rosso',
    'Massaggiatore per il Collo Pipedream Body Dock'
];

// Filtra i prodotti eliminando quelli erotici
const filteredData = data.filter(product => {
    const shouldRemove = productsToRemove.some(name => 
        product.name && product.name.includes(name)
    );
    
    if (shouldRemove) {
        console.log(`❌ Eliminato: ${product.name} (ID: ${product.id})`);
    }
    
    return !shouldRemove;
});

const removedCount = data.length - filteredData.length;

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(filteredData, null, 2), 'utf-8');

console.log(`\n✅ Rimozione completata!`);
console.log(`📊 Prodotti rimossi: ${removedCount}`);
console.log(`📦 Prodotti rimanenti: ${filteredData.length}`);

if (removedCount === 3) {
    console.log('\n🎉 SUCCESSO! Tutti i 3 prodotti erotici sono stati eliminati!');
} else {
    console.log(`\n⚠️  ATTENZIONE: Rimossi ${removedCount} prodotti invece di 3`);
}
