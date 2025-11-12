const fs = require('fs');

console.log('📦 Spostamento prodotti eBook all\'inizio...\n');

const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

// Trova prodotti eBook
const ebookProducts = [];
const otherProducts = [];

products.forEach(p => {
    const name = p.name.toLowerCase();
    if (name.includes('ebook') || name.includes('kobo') || name.includes('pocketbook')) {
        ebookProducts.push(p);
    } else {
        otherProducts.push(p);
    }
});

console.log(`📚 Prodotti eBook: ${ebookProducts.length}`);
console.log(`📦 Altri prodotti: ${otherProducts.length}`);

// Metti eBook all'inizio
const reordered = [...ebookProducts, ...otherProducts];

console.log(`\n✅ Nuovo ordine: ${reordered.length} prodotti totali`);
console.log(`   Posizioni 0-${ebookProducts.length-1}: eBook`);
console.log(`   Posizioni ${ebookProducts.length}-${reordered.length-1}: Altri prodotti`);

// Salva
fs.writeFileSync('top-100-products.json', JSON.stringify(reordered, null, 2));
console.log('\n💾 Salvato!');
