const fs = require('fs');
const path = require('path');

// Load products
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('📦 Prodotti totali:', products.length);

// Fix all products with zenovaCategory: "wellness" -> "natural-wellness"
let fixedCount = 0;
products.forEach(product => {
    if (product.zenovaCategory === 'wellness') {
        product.zenovaCategory = 'natural-wellness';
        fixedCount++;
    }

    // Also fix zenovaCategories array if present
    if (product.zenovaCategories && Array.isArray(product.zenovaCategories)) {
        const index = product.zenovaCategories.indexOf('wellness');
        if (index !== -1) {
            product.zenovaCategories[index] = 'natural-wellness';
        }
    }

    // Also fix category field if it's "Wellness"
    if (product.category === 'Wellness') {
        product.category = 'Natural Wellness';
    }
});

console.log('✅ Prodotti corretti:', fixedCount);

// Backup
const backupPath = path.join(__dirname, `top-100-products.backup-wellness-fix-${Date.now()}.json`);
fs.writeFileSync(backupPath, fs.readFileSync(productsPath, 'utf8'));
console.log('💾 Backup creato:', path.basename(backupPath));

// Save
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log('💾 File salvato:', productsPath);
console.log('');
console.log('🎯 FIX COMPLETATO!');
console.log('   Riavvia il backend per applicare le modifiche.');
