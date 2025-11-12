const fs = require('fs');

console.log('📚 Riorganizzazione prodotti eBook...\n');

const rawResults = JSON.parse(fs.readFileSync('ebook-accessories-all.json', 'utf-8'));

// Prodotti ebook trovati
const ebookProducts = [
    ...rawResults['ebook-reader']
].filter(p => {
    const name = p.name.toLowerCase();
    return name.includes('ebook') || name.includes('kobo') || name.includes('kindle') || name.includes('pocketbook');
});

// Separa reader e custodie
const readers = [];
const cases = [];

ebookProducts.forEach(p => {
    const name = p.name.toLowerCase();

    if (name.includes('custodia') || name.includes('cover') || name.includes('case')) {
        cases.push(p);
    } else {
        readers.push(p);
    }
});

console.log('=== PRODOTTI EBOOK BIGBUY ===\n');

console.log(`📱 eBook Reader (${readers.length}):`);
readers.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Stock: ${p.stock} | €${p.price}`);
});

console.log(`\n📦 Custodie per eBook (${cases.length}):`);
cases.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Stock: ${p.stock} | €${p.price}`);
});

const final = {
    'ebook-reader': readers,
    'custodie-ebook': cases
};

console.log(`\n📊 TOTALE: ${readers.length + cases.length} prodotti eBook`);

console.log('\n💡 NOTA: BigBuy NON vende separatamente:');
console.log('  - Alimentatori per eBook (usano USB standard)');
console.log('  - Luci di lettura specifiche');
console.log('  - Custodie morbide vs rigide (solo custodie generiche)');

fs.writeFileSync('ebook-products-organized.json', JSON.stringify(final, null, 2));
console.log('\n💾 Salvato in: ebook-products-organized.json');
