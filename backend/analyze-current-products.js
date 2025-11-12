const products = require('./top-100-products.json');

console.log('=== ANALISI PRODOTTI BIGBUY ===\n');
console.log(`Totale prodotti: ${products.length}\n`);

// Group by BigBuy category
const categories = {};
products.forEach(p => {
    const cat = p.category || 'Unknown';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p.name);
});

console.log('--- DISTRIBUZIONE PER CATEGORIA BIGBUY ---\n');
Object.keys(categories).sort().forEach(cat => {
    console.log(`${cat}: ${categories[cat].length} prodotti`);
    categories[cat].slice(0, 3).forEach(name => {
        console.log(`  - ${name.substring(0, 70)}`);
    });
    if (categories[cat].length > 3) {
        console.log(`  ... e altri ${categories[cat].length - 3} prodotti`);
    }
    console.log('');
});

// Look for specific keywords
console.log('\n--- RICERCA PRODOTTI PER CATEGORIE VUOTE ---\n');

const searches = {
    'Lampade abbronzanti': ['abbronz', 'solarium', 'uv', 'lampada solare'],
    'Accessori saune': ['sauna', 'bagno turco', 'spa'],
    'Trucco': ['trucco', 'makeup', 'rossetto', 'mascara', 'fondotinta', 'ombretto', 'eyeliner', 'matita']
};

Object.keys(searches).forEach(categoryName => {
    console.log(`${categoryName}:`);
    const keywords = searches[categoryName];
    const found = products.filter(p => {
        const name = p.name.toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return keywords.some(kw => name.includes(kw) || desc.includes(kw));
    });

    if (found.length > 0) {
        found.forEach(p => {
            console.log(`  ✓ ${p.name.substring(0, 80)}`);
        });
    } else {
        console.log(`  ✗ Nessun prodotto trovato`);
    }
    console.log('');
});

// Analyze all product names to find patterns
console.log('\n--- TUTTI I PRODOTTI (primi 50) ---\n');
products.slice(0, 50).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
});
