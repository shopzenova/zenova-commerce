const fs = require('fs');

console.log('📚 Aggiunta prodotti eBook al catalogo...\n');

// Carica catalogo attuale
const catalog = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));
console.log(`📦 Prodotti attuali nel catalogo: ${catalog.length}`);

// Carica prodotti eBook
const ebookData = JSON.parse(fs.readFileSync('ebook-products-organized.json', 'utf-8'));

const ebookReaders = ebookData['ebook-reader'];
const ebookCases = ebookData['custodie-ebook'];

console.log(`\n📱 eBook Reader da aggiungere: ${ebookReaders.length}`);
console.log(`📦 Custodie eBook da aggiungere: ${ebookCases.length}`);

// Aggiungi tutti i prodotti
const allEbookProducts = [...ebookReaders, ...ebookCases];

console.log('\n=== PRODOTTI DA AGGIUNGERE ===\n');
allEbookProducts.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Stock: ${p.stock} | €${p.price}`);
});

// Verifica duplicati
const existingIds = new Set(catalog.map(p => p.id));
const newProducts = allEbookProducts.filter(p => !existingIds.has(p.id));

if (newProducts.length < allEbookProducts.length) {
    console.log(`\n⚠️  ${allEbookProducts.length - newProducts.length} prodotti già presenti (saltati)`);
}

// Aggiungi al catalogo
const updatedCatalog = [...catalog, ...newProducts];

console.log(`\n📊 Catalogo aggiornato: ${catalog.length} → ${updatedCatalog.length} prodotti (+${newProducts.length})`);

// Salva
fs.writeFileSync('top-100-products.json', JSON.stringify(updatedCatalog, null, 2));
console.log('✅ Salvato in: top-100-products.json');
