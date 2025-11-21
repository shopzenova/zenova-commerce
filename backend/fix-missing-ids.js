const fs = require('fs');
const path = require('path');

console.log('🔧 FIX: Aggiunta ID mancanti ai prodotti...\n');

// Leggi il file JSON
const jsonPath = path.join(__dirname, 'top-100-products.json');
const data = require(jsonPath);

let fixedCount = 0;

// Per ogni prodotto, aggiungi ID se manca
data.forEach(product => {
    if (!product.id) {
        // Usa EAN come ID se disponibile
        if (product.ean) {
            product.id = product.ean;
            fixedCount++;
        } else {
            console.error(`❌ Prodotto senza ID e senza EAN: ${product.name}`);
        }
    }
});

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Fix completato!`);
console.log(`📊 Prodotti totali: ${data.length}`);
console.log(`🔧 ID aggiunti: ${fixedCount}`);

// Verifica
const noId = data.filter(p => !p.id);
console.log(`\n✅ Verifica: ${noId.length} prodotti ancora senza ID`);

if (noId.length === 0) {
    console.log('\n🎉 SUCCESSO! Tutti i prodotti hanno ora un ID!');
} else {
    console.log('\n⚠️  Alcuni prodotti non hanno né ID né EAN');
}
