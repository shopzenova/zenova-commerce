const products = require('./top-100-products.json');

const categories = {};

products.forEach(p => {
    const catId = p.category;
    if (!categories[catId]) {
        categories[catId] = {
            name: p.categoryTree ? p.categoryTree[p.categoryTree.length - 1] : 'Unknown',
            fullTree: p.categoryTree ? p.categoryTree.join(' > ') : 'Unknown',
            count: 0,
            examples: []
        };
    }
    categories[catId].count++;
    if (categories[catId].examples.length < 5) {
        categories[catId].examples.push(p.name);
    }
});

console.log('\n=== ANALISI CATEGORIE PRODOTTI REALI ===\n');

Object.keys(categories).sort((a, b) => categories[b].count - categories[a].count).forEach(catId => {
    console.log(`Categoria ${catId}: ${categories[catId].name}`);
    console.log(`Tree: ${categories[catId].fullTree}`);
    console.log(`Prodotti: ${categories[catId].count}`);
    console.log(`Esempi:`);
    categories[catId].examples.forEach(ex => console.log(`  - ${ex}`));
    console.log('');
});
