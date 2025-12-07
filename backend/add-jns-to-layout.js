const fs = require('fs');
const path = require('path');

// Leggi il file dei prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// Trova tutti i prodotti JNS
const jnsProducts = products.filter(p =>
    p.sku && p.sku.startsWith('JNS-')
);

console.log(`👜 Trovati ${jnsProducts.length} borse JNS`);

// Leggi il file del layout
const layoutFile = path.join(__dirname, 'config/product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutFile, 'utf8'));

// Rimuovi eventuali vecchi SKU JNS dalla sidebar
const oldSidebarLength = layout.sidebar.length;
layout.sidebar = layout.sidebar.filter(sku =>
    sku && !sku.startsWith('JNS-')
);

console.log(`🗑️  Rimossi ${oldSidebarLength - layout.sidebar.length} vecchi SKU JNS dalla sidebar`);

// Aggiungi i nuovi SKU JNS alla sidebar
const jnsSkus = jnsProducts.map(p => p.sku).sort();
layout.sidebar.push(...jnsSkus);

console.log(`✅ Aggiunti ${jnsSkus.length} nuovi SKU JNS alla sidebar`);
console.log(`📦 Totale prodotti in sidebar: ${layout.sidebar.length}`);

// Salva il layout aggiornato
fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

console.log(`\n✅ Layout aggiornato!`);
console.log(`📁 File salvato: ${layoutFile}`);
