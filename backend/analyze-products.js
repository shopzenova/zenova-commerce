const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('Totale prodotti:', data.length);
console.log('\n=== CATEGORIE ===\n');

const categories = {};
data.forEach(p => {
    const cat = p.category || 'Senza categoria';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p.name);
});

Object.keys(categories).sort().forEach(cat => {
    console.log(`\n${cat} (${categories[cat].length} prodotti):`);
    categories[cat].slice(0, 8).forEach(name => console.log(`  • ${name}`));
    if (categories[cat].length > 8) {
        console.log(`  ... e altri ${categories[cat].length - 8} prodotti`);
    }
});
