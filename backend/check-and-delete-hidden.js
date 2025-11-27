/**
 * Verifica e elimina prodotti dalla zona hidden
 */

const fs = require('fs');
const path = require('path');

// Carica prodotti
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Carica layout
const layoutPath = path.join(__dirname, 'config/product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

const hiddenIds = layout.hidden || [];

console.log(`🔍 Trovati ${hiddenIds.length} prodotti nella zona HIDDEN\n`);

// Trova i prodotti hidden
const hiddenProducts = products.filter(p => hiddenIds.includes(p.id));

console.log('📦 Dettagli prodotti HIDDEN da eliminare:\n');
hiddenProducts.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Nome: ${p.name}`);
    console.log(`Categoria: ${p.zenovaCategory || 'NESSUNA'}`);
    console.log('');
});

// Elimina i prodotti hidden
console.log('\n🗑️ Eliminazione prodotti...\n');

const updatedProducts = products.filter(p => !hiddenIds.includes(p.id));

console.log(`✅ Eliminati: ${products.length - updatedProducts.length} prodotti`);
console.log(`📊 Prodotti rimanenti: ${updatedProducts.length}`);

// Salva il file aggiornato
fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
console.log('\n✅ File top-100-products.json aggiornato!');

// Pulisci la zona hidden nel layout
layout.hidden = [];
fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2));
console.log('✅ Zona hidden pulita nel layout!');
