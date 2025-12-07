const fs = require('fs');
const path = require('path');

// Leggi il file prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Totale prodotti: ${products.length}`);

let fixed = 0;
products.forEach(p => {
    if (p.sku && p.sku.startsWith('JNS-')) {
        // Aggiungi campi Zenova mancanti
        if (!p.zenovaSubcategory) {
            p.zenovaSubcategory = p.subcategory || 'vestiario-wellness';
            fixed++;
        }
        if (!p.zenovaCategory) {
            p.zenovaCategory = 'wellness';
        }
        if (!p.zenovaCategories) {
            p.zenovaCategories = ['wellness'];
        }

        console.log(`✅ Aggiornato: ${p.sku} - ${p.name}`);
        console.log(`   zenovaSubcategory: ${p.zenovaSubcategory}`);
        console.log(`   zenovaCategory: ${p.zenovaCategory}`);
    }
});

// Salva il file aggiornato
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Aggiornati ${fixed} prodotti borse JNS`);
console.log(`💾 File salvato: ${productsFile}`);
