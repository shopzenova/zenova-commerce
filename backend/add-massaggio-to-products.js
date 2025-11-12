const fs = require('fs');

const currentProducts = require('./top-100-products.json');
const massaggioProducts = require('./massaggio-products-filtered.json');

console.log('🔄 Aggiunta prodotti massaggio a top-100-products.json...\n');

console.log(`Prodotti attuali: ${currentProducts.length}`);
console.log(`Prodotti massaggio da aggiungere: ${massaggioProducts.length}`);

// Rimuovi i prodotti massaggio già esistenti (i 4 attuali)
const withoutOldMassaggio = currentProducts.filter(p => {
    const name = p.name.toLowerCase();
    const isOldMassaggio = name.includes('massaggiatore') || name.includes('idromassaggio');
    return !isOldMassaggio;
});

console.log(`\nProdotti dopo rimozione vecchi massaggio: ${withoutOldMassaggio.length}`);

// Formatta i nuovi prodotti massaggio
const formattedMassaggio = massaggioProducts.map(p => {
    const margin = p.pvd > 0 ? (((p.pvd - p.price) / p.pvd) * 100).toFixed(1) : '0';

    return {
        id: p.id,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: 'Health & Beauty',
        zenovaCategories: ['benessere'],
        price: p.price,
        pvd: p.pvd,
        margin: margin,
        stock: p.stock,
        imageCount: p.imageCount,
        images: p.images,
        video: p.video,
        ean: p.ean,
        width: p.width,
        height: p.height,
        depth: p.depth,
        weight: p.weight,
        score: p.stock,
        raw: p.raw
    };
});

// Combina
const updatedProducts = [...withoutOldMassaggio, ...formattedMassaggio];

console.log(`\n✅ Totale prodotti finali: ${updatedProducts.length}`);
console.log(`   (${withoutOldMassaggio.length} esistenti + ${formattedMassaggio.length} massaggio)`);

// Salva
fs.writeFileSync('top-products-with-massaggio.json', JSON.stringify(updatedProducts, null, 2));
console.log(`\n💾 Salvato in: top-products-with-massaggio.json`);

console.log(`\n📋 PROSSIMO STEP:`);
console.log(`   cp top-products-with-massaggio.json top-100-products.json`);
console.log(`   Poi riavviare il server`);
