const fs = require('fs');
const path = require('path');

// Leggi il file dei prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

// Trova tutti i prodotti EO
const eoProducts = products.filter(p =>
    p.sku && (p.sku.startsWith('EO-') || p.sku.startsWith('EOBND-'))
);

console.log(`🌿 Trovati ${eoProducts.length} oli essenziali`);

// Leggi il file del layout
const layoutFile = path.join(__dirname, 'config/product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutFile, 'utf8'));

// Rimuovi eventuali vecchi SKU EO dalla sidebar
const oldSidebarLength = layout.sidebar.length;
layout.sidebar = layout.sidebar.filter(sku =>
    !sku.startsWith('EO-') && !sku.startsWith('EOBND-')
);

console.log(`🗑️  Rimossi ${oldSidebarLength - layout.sidebar.length} vecchi SKU EO dalla sidebar`);

// Aggiungi i nuovi SKU EO alla sidebar
const eoSkus = eoProducts.map(p => p.sku).sort();
layout.sidebar.push(...eoSkus);

console.log(`✅ Aggiunti ${eoSkus.length} nuovi SKU EO alla sidebar`);
console.log(`📦 Totale prodotti in sidebar: ${layout.sidebar.length}`);

// Salva il layout aggiornato
fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2));

console.log(`\n✅ Layout aggiornato!`);
console.log(`📁 File salvato: ${layoutFile}`);
