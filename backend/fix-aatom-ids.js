const fs = require('fs');
const path = require('path');

// Leggi prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Fixing AATOM product IDs...`);

// Trova il max ID esistente
let maxId = 0;
products.forEach(p => {
    if (p.id && typeof p.id === 'number') {
        maxId = Math.max(maxId, p.id);
    }
});

console.log(`📊 Max ID esistente: ${maxId}`);

// Assegna ID univoci ai prodotti AATOM con id null
let nextId = maxId + 1;
let fixed = 0;

products.forEach(p => {
    if (p.sku && p.sku.startsWith('AATOM-') && (p.id === null || p.id === undefined)) {
        const oldId = p.id;
        p.id = nextId++;
        console.log(`✅ ${p.sku}: id ${oldId} → ${p.id}`);
        fixed++;
    }
});

// Salva file
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Fixed ${fixed} prodotti AATOM`);
console.log(`📈 Nuovi ID assegnati: ${maxId + 1} - ${nextId - 1}`);
console.log(`💾 File salvato: ${productsFile}`);
