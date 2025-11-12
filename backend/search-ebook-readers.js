const fs = require('fs');

const products = require('./electronics-products.json');

console.log('📚 Ricerca eBook Reader...\n');

const ebook = products.filter(p => {
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();

    return name.includes('ebook') ||
           name.includes('e-book') ||
           name.includes('kindle') ||
           name.includes('kobo') ||
           (name.includes('lettore') && name.includes('ebook')) ||
           desc.includes('ebook reader') ||
           desc.includes('lettore ebook') ||
           desc.includes('e-reader');
});

console.log(`📚 eBook Reader trovati: ${ebook.length}\n`);

if (ebook.length > 0) {
    ebook.forEach((p, i) => {
        console.log(`${i+1}. ${p.name}`);
        console.log(`   Stock: ${p.stock} | €${p.price}`);
    });
} else {
    console.log('❌ Nessun eBook Reader trovato nei CSV attuali');
    console.log('\n💡 SUGGERIMENTO:');
    console.log('   Per avere eBook Reader, dobbiamo scaricare la categoria');
    console.log('   BigBuy 2609 (Computers | Electronics)');
}
