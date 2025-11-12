const products = require('./top-100-products.json');

// Simuliamo la funzione di mapping
function mapBackendProductToFrontend(backendProduct) {
    const bigbuyCategory = backendProduct.category;
    let category = 'Prodotti';
    let subcategory = bigbuyCategory;

    // Mappa le categorie BigBuy alle nostre 5 categorie principali
    if (bigbuyCategory === '2609,2617,2909') {
        category = 'Smart Living';
        subcategory = '2609,2617,2909';
    } else if (bigbuyCategory === '2609,2617,2937') {
        category = 'Smart Living';
        subcategory = '2609,2617,2937';
    } else if (bigbuyCategory === 'Home & Garden') {
        category = 'Smart Living';
        subcategory = 'Home & Garden';
    } else if (bigbuyCategory === '2501,2502,2504') {
        category = 'Meditazione e Zen';
        subcategory = '2501,2502,2504';
    } else if (bigbuyCategory === 'Health & Beauty') {
        category = 'Cura del Corpo e Skin';
        subcategory = 'Health & Beauty';
    } else if (bigbuyCategory === '2501,2540,2546') {
        category = 'Cura del Corpo e Skin';
        subcategory = '2501,2540,2546';
    } else if (bigbuyCategory === '2501,2552,2554') {
        category = 'Cura del Corpo e Skin';
        subcategory = '2501,2552,2554';
    } else if (bigbuyCategory === '2501,2552,2556') {
        category = 'Cura del Corpo e Skin';
        subcategory = '2501,2552,2556';
    } else if (bigbuyCategory === '2501,2552,2568') {
        category = 'Cura del Corpo e Skin';
        subcategory = '2501,2552,2568';
    } else if (bigbuyCategory === 'Tech & Electronics') {
        category = 'Cura del Corpo e Skin';
        subcategory = 'Tech & Electronics';
    }

    return {
        id: backendProduct.id,
        name: backendProduct.name,
        category: category,
        subcategory: subcategory,
        bigbuyCategory: bigbuyCategory
    };
}

// Testa i primi 10 prodotti
console.log('\n=== TEST MAPPING PRODOTTI ===\n');

const mapped = products.slice(0, 10).map(mapBackendProductToFrontend);

mapped.forEach(p => {
    console.log(`Prodotto: ${p.name.substring(0, 50)}`);
    console.log(`  BigBuy Category: "${p.bigbuyCategory}"`);
    console.log(`  Mapped Category: "${p.category}"`);
    console.log(`  Mapped Subcategory: "${p.subcategory}"`);
    console.log('');
});

// Conta tutte le subcategories
const allMapped = products.map(mapBackendProductToFrontend);
const subcategoryCounts = {};

allMapped.forEach(p => {
    if (!subcategoryCounts[p.subcategory]) {
        subcategoryCounts[p.subcategory] = 0;
    }
    subcategoryCounts[p.subcategory]++;
});

console.log('\n=== DISTRIBUZIONE SOTTOCATEGORIE ===\n');
Object.keys(subcategoryCounts).sort((a, b) => subcategoryCounts[b] - subcategoryCounts[a]).forEach(sub => {
    console.log(`${sub}: ${subcategoryCounts[sub]} prodotti`);
});
