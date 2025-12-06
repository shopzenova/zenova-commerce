const fs = require('fs');
const path = require('path');

// Leggi il layout esistente
const layoutFile = path.join(__dirname, 'config', 'product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutFile, 'utf8'));

// SKU AATOM da aggiungere
const aatomSkus = [
    "AATOM-11",
    "AATOM-12",
    "AATOM-14",
    "AATOM-16",
    "AATOM-18",
    "AATOM-25",
    "AATOM-26",
    "AATOM-27",
    "AATOM-28",
    "AATOM-29",
    "AATOM-30",
    "AATOM-31",
    "AATOM-32",
    "AATOM-39",
    "AATOM-40",
    "AATOM-41"
];

console.log(`📊 Layout corrente:`);
console.log(`  - Home: ${layout.home.length} prodotti`);
console.log(`  - Sidebar: ${layout.sidebar.length} prodotti`);
console.log(`  - Hidden: ${layout.hidden.length} prodotti`);

// Rimuovi eventuali AATOM già presenti
layout.home = layout.home.filter(sku => !sku.startsWith('AATOM-'));
layout.sidebar = layout.sidebar.filter(sku => !sku.startsWith('AATOM-'));
layout.hidden = layout.hidden.filter(sku => !sku.startsWith('AATOM-'));

// Aggiungi tutti gli AATOM alla sidebar
layout.sidebar.push(...aatomSkus);

console.log(`\n✅ Aggiornamento completato:`);
console.log(`  - Home: ${layout.home.length} prodotti`);
console.log(`  - Sidebar: ${layout.sidebar.length} prodotti (+ ${aatomSkus.length} AATOM)`);
console.log(`  - Hidden: ${layout.hidden.length} prodotti`);

// Salva il file aggiornato
fs.writeFileSync(layoutFile, JSON.stringify(layout, null, 2), 'utf8');
console.log(`\n💾 File salvato: ${layoutFile}`);
