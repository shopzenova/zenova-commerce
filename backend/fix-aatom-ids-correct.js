const fs = require('fs');
const path = require('path');

// Leggi prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Fixing AATOM product IDs (use SKU as ID)...`);

let fixed = 0;

products.forEach(p => {
    if (p.sku && p.sku.startsWith('AATOM-')) {
        const oldId = p.id;
        p.id = p.sku; // Usa SKU come ID (come fa BigBuy)
        console.log(`✅ ${p.sku}: id ${oldId} → "${p.id}"`);
        fixed++;
    }
});

// Salva file
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Fixed ${fixed} prodotti AATOM`);
console.log(`💾 File salvato: ${productsFile}`);
console.log(`\n💡 Ora gli AATOM usano SKU come ID, come i prodotti BigBuy`);
