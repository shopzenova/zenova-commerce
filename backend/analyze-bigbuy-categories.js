const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('=== STRUTTURA CATEGORIE BIGBUY ===\n');

// Prendi un prodotto di esempio per vedere la struttura
const sampleProduct = data[0];
console.log('Esempio prodotto:', sampleProduct.name);
console.log('Campi disponibili:', Object.keys(sampleProduct));
console.log('\nStruttura categorie:');
console.log('- category:', sampleProduct.category);
console.log('- categories:', sampleProduct.categories);
console.log('- categoryPath:', sampleProduct.categoryPath);

console.log('\n\n=== TUTTE LE CATEGORIE BIGBUY ===\n');

// Raccoglie tutte le categorie uniche
const categoryPaths = new Set();
const mainCategories = {};

data.forEach(p => {
    if (p.categoryPath) {
        categoryPaths.add(p.categoryPath);

        // Estrai la categoria principale (prima parte del path)
        const parts = p.categoryPath.split(' > ');
        const mainCat = parts[0];

        if (!mainCategories[mainCat]) {
            mainCategories[mainCat] = new Set();
        }

        // Aggiungi il path completo
        if (parts.length > 1) {
            mainCategories[mainCat].add(p.categoryPath);
        }
    }
});

// Stampa la gerarchia
Object.keys(mainCategories).sort().forEach(mainCat => {
    const paths = Array.from(mainCategories[mainCat]).sort();
    console.log(`\n${mainCat}:`);

    // Raggruppa per sottocategoria
    const subCategories = {};
    paths.forEach(path => {
        const parts = path.split(' > ');
        if (parts.length >= 2) {
            const subCat = parts[1];
            if (!subCategories[subCat]) {
                subCategories[subCat] = [];
            }
            subCategories[subCat].push(path);
        }
    });

    Object.keys(subCategories).sort().forEach(subCat => {
        const count = data.filter(p => p.categoryPath && p.categoryPath.includes(subCat)).length;
        console.log(`  • ${subCat} (${count} prodotti)`);

        // Mostra anche le sotto-sotto-categorie se esistono
        const uniquePaths = new Set(subCategories[subCat]);
        if (uniquePaths.size > 1) {
            uniquePaths.forEach(path => {
                const parts = path.split(' > ');
                if (parts.length > 2) {
                    console.log(`    - ${parts.slice(2).join(' > ')}`);
                }
            });
        }
    });
});

console.log('\n\n=== TOTALE ===');
console.log(`Categorie principali: ${Object.keys(mainCategories).length}`);
console.log(`Percorsi unici: ${categoryPaths.size}`);
