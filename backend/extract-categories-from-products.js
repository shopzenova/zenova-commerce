const fs = require('fs');

const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('=== ESTRAZIONE CATEGORIE DAI PRODOTTI ===\n');

// Estrai tutti gli ID categoria unici
const categoryIds = new Set();
const categoryProducts = {};

products.forEach(p => {
    if (p.raw && p.raw.CATEGORY) {
        const ids = p.raw.CATEGORY.split(',').map(id => id.trim());
        ids.forEach(id => {
            categoryIds.add(id);
            if (!categoryProducts[id]) {
                categoryProducts[id] = [];
            }
            categoryProducts[id].push({
                name: p.name,
                bigbuyCategory: p.category
            });
        });
    }
});

console.log(`📊 Categorie ID univoche trovate: ${categoryIds.size}\n`);

// Raggruppa per categoria macro (Health & Beauty vs Home & Garden)
const healthBeautyIds = new Set();
const homeGardenIds = new Set();
const techIds = new Set();

Array.from(categoryIds).sort((a, b) => Number(a) - Number(b)).forEach(id => {
    const sampleProducts = categoryProducts[id].slice(0, 3);
    const mainCat = sampleProducts[0]?.bigbuyCategory;

    console.log(`\nID ${id}:`);
    console.log(`  Categoria macro: ${mainCat}`);
    console.log(`  Prodotti (${categoryProducts[id].length}):`);
    sampleProducts.forEach(p => {
        console.log(`    - ${p.name.substring(0, 60)}`);
    });

    if (mainCat === 'Health & Beauty') {
        healthBeautyIds.add(id);
    } else if (mainCat === 'Home & Garden') {
        homeGardenIds.add(id);
    } else if (mainCat === 'Tech & Electronics') {
        techIds.add(id);
    }
});

console.log(`\n\n=== RIEPILOGO ===`);
console.log(`Health & Beauty IDs: ${Array.from(healthBeautyIds).sort().join(', ')}`);
console.log(`Home & Garden IDs: ${Array.from(homeGardenIds).sort().join(', ')}`);
console.log(`Tech & Electronics IDs: ${Array.from(techIds).sort().join(', ')}`);

// Salva mapping
const mapping = {
    healthBeauty: Array.from(healthBeautyIds).sort(),
    homeGarden: Array.from(homeGardenIds).sort(),
    tech: Array.from(techIds).sort(),
    details: categoryProducts
};

fs.writeFileSync('category-ids-mapping.json', JSON.stringify(mapping, null, 2));
console.log('\n💾 Salvato in category-ids-mapping.json');
