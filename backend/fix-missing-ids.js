const fs = require('fs');
const crypto = require('crypto');

// Leggi il catalogo
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

console.log('📦 Totale prodotti:', products.length);

// Trova prodotti senza ID
const noId = products.filter(p => !p.id);
console.log('❌ Prodotti SENZA ID:', noId.length);

// Funzione per generare ID univoco basato sul nome
function generateId(name, index) {
    // Crea un hash del nome + index per garantire unicità
    const hash = crypto.createHash('md5').update(name + index).digest('hex');
    return 'ZENOVA-' + hash.substring(0, 8).toUpperCase();
}

// Set per tenere traccia degli ID usati
const usedIds = new Set();
products.forEach(p => {
    if (p.id) usedIds.add(p.id);
});

// Aggiungi ID ai prodotti che non ce l'hanno
let fixed = 0;
products.forEach((product, index) => {
    if (!product.id) {
        let newId;
        let attempt = 0;

        // Genera ID univoco
        do {
            newId = generateId(product.name, index + attempt);
            attempt++;
        } while (usedIds.has(newId));

        product.id = newId;
        usedIds.add(newId);
        fixed++;

        if (fixed <= 5) {
            console.log(`✅ ${product.name.substring(0, 40)}... -> ID: ${newId}`);
        }
    }
});

console.log('\n✅ Aggiunti', fixed, 'ID');

// Salva il file aggiornato
fs.writeFileSync('top-100-products.json', JSON.stringify(products, null, 2));

console.log('💾 File salvato: top-100-products.json');
console.log('✅ Tutti i prodotti ora hanno un ID!');
