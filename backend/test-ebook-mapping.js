const fs = require('fs');

console.log('🧪 Test mappatura prodotti eBook...\n');

const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

// Trova i prodotti eBook
const ebookProducts = products.filter(p =>
    p.name && (p.name.toLowerCase().includes('ebook') || p.name.toLowerCase().includes('kobo'))
);

console.log(`📦 Prodotti eBook trovati: ${ebookProducts.length}\n`);

ebookProducts.forEach((p, i) => {
    const productName = p.name.toLowerCase();

    console.log(`${i+1}. ${p.name}`);
    console.log(`   - includes 'ebook': ${productName.includes('ebook')}`);
    console.log(`   - includes 'kobo': ${productName.includes('kobo')}`);
    console.log(`   - includes 'rakuten': ${productName.includes('rakuten')}`);
    console.log(`   - includes 'custodia': ${productName.includes('custodia')}`);
    console.log(`   - includes 'cover': ${productName.includes('cover')}`);
    console.log(`   - includes 'case': ${productName.includes('case')}`);

    // Simula il filtro
    let category = null;
    let subcategory = null;

    if ((productName.includes('ebook') || productName.includes('kobo') ||
         productName.includes('kindle') || productName.includes('pocketbook') ||
         productName.includes('rakuten')) &&
        !productName.includes('custodia') && !productName.includes('cover') &&
        !productName.includes('case')) {
        category = 'Elettronica';
        subcategory = 'ebook-reader';
    }
    else if ((productName.includes('ebook') || productName.includes('kobo') ||
              productName.includes('kindle') || productName.includes('pocketbook')) &&
             (productName.includes('custodia') || productName.includes('cover') ||
              productName.includes('case'))) {
        category = 'Elettronica';
        subcategory = 'custodie-ebook';
    }

    console.log(`   ➜ Categoria: ${category || 'NULL (nascosto!)'}`);
    console.log(`   ➜ Sottocategoria: ${subcategory || 'NULL'}`);
    console.log('');
});
