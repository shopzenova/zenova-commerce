const fs = require('fs');
const path = require('path');

// Leggi il file prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Totale prodotti: ${products.length}`);

let fixed = 0;
products.forEach(p => {
    if (p.sku && p.sku.startsWith('AATOM-')) {
        // Aggiungi campi Zenova mancanti
        if (!p.zenovaSubcategory) {
            p.zenovaSubcategory = p.subcategory || 'diffusori';
            fixed++;
        }
        if (!p.zenovaCategory) {
            p.zenovaCategory = 'aromatherapy';
        }
        if (!p.zenovaCategories) {
            p.zenovaCategories = ['aromatherapy'];
        }

        console.log(`✅ Aggiornato: ${p.sku} - ${p.name}`);
        console.log(`   zenovaSubcategory: ${p.zenovaSubcategory}`);
        console.log(`   zenovaCategory: ${p.zenovaCategory}`);
    }
});

// Salva il file aggiornato
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ Aggiornati ${fixed} prodotti AATOM`);
console.log(`💾 File salvato: ${productsFile}`);
