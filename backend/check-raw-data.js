const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('=== VERIFICA DATI RAW BIGBUY ===\n');

// Prendi un prodotto di esempio
const sampleProduct = data[0];

console.log('Prodotto:', sampleProduct.name);
console.log('\n--- Campo RAW completo ---');

if (sampleProduct.raw) {
    console.log(JSON.stringify(sampleProduct.raw, null, 2).substring(0, 2000));
    console.log('\n...');

    // Cerca campi relativi alle categorie
    console.log('\n--- Campi categoria nel RAW ---');
    Object.keys(sampleProduct.raw).forEach(key => {
        if (key.toLowerCase().includes('categ')) {
            console.log(`${key}:`, sampleProduct.raw[key]);
        }
    });
} else {
    console.log('Nessun campo raw disponibile');
}

console.log('\n\n=== CATEGORIE DISPONIBILI ===');
const categories = {};

data.forEach(p => {
    const cat = p.category || 'Senza categoria';
    if (!categories[cat]) {
        categories[cat] = [];
    }
    categories[cat].push(p);
});

Object.keys(categories).forEach(cat => {
    console.log(`\n${cat} (${categories[cat].length} prodotti)`);

    // Prendi il primo prodotto e vedi se ha info nel raw
    const firstProduct = categories[cat][0];
    if (firstProduct.raw && firstProduct.raw.category) {
        console.log('  Raw category info:', JSON.stringify(firstProduct.raw.category, null, 2));
    }
});
