const fs = require('fs');

// Carica prodotti
const productsData = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

// Ottieni tutti gli ID dei prodotti AW con zone=sidebar
const awSidebar = productsData
  .filter(p => p.source === 'aw' && p.zone === 'sidebar' && p.visible === true)
  .map(p => p.id);

console.log('Prodotti AW sidebar trovati:', awSidebar.length);
console.log('Candele aw-asc:', awSidebar.filter(id => id.startsWith('aw-asc')).length);
console.log('Candele aw-zcc:', awSidebar.filter(id => id.startsWith('aw-zcc')).length);
console.log('Candele aw-atc:', awSidebar.filter(id => id.startsWith('aw-atc')).length);
console.log('Incensi aromabf:', awSidebar.filter(id => id.includes('aromabf')).length);
console.log('Incensi eid:', awSidebar.filter(id => id.includes('eid-')).length);

// Carica layout esistente
const layout = JSON.parse(fs.readFileSync('config/product-layout.json', 'utf8'));

console.log('\nLayout sidebar prima:', layout.sidebar.length);

// Rimuovi vecchi prodotti AW dalla sidebar
layout.sidebar = layout.sidebar.filter(id => !id.startsWith('aw-'));

// Aggiungi tutti i nuovi prodotti AW
layout.sidebar.push(...awSidebar);

console.log('Layout sidebar dopo:', layout.sidebar.length);

// Salva
fs.writeFileSync('config/product-layout.json', JSON.stringify(layout, null, 2));
console.log('\n✅ Layout aggiornato!\n');

// Verifica
const prodottiAW = layout.sidebar.filter(id => id.startsWith('aw-'));
console.log('Verifica finale - Prodotti AW in sidebar:', prodottiAW.length);
