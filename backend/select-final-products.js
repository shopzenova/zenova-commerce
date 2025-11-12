const fs = require('fs');

const filtered = require('./filtered-products.json');
const currentTop100 = require('./top-100-products.json');

console.log('🎯 Selezione finale prodotti per categorie vuote...\n');

// ===== ACCESSORI SAUNE =====
console.log('=== ACCESSORI SAUNE ===');
const saune = filtered['accessori-saune'];
console.log(`Selezionati: ${saune.length} prodotti`);
saune.forEach(p => {
    console.log(`  ✓ ${p.name}`);
});
console.log('');

// ===== TRUCCO - FILTRO FINALE (SOLO PRODOTTI ADATTI A ZENOVA) =====
console.log('=== TRUCCO - FILTRO FINALE ===');
const trucco = filtered['trucco'].filter(p => {
    const name = p.name.toLowerCase();
    const description = (p.description || '').toLowerCase();

    // ESCLUDI: palette da spiaggia, borse, profumi (non sono trucco)
    if (name.includes('palette da spiaggia') ||
        name.includes('borsa ') ||
        name.includes('profumo ') ||
        name.includes('hello kitty') ||
        name.includes('real madrid')) {
        return false;
    }

    // INCLUDI SOLO: mascara per ciglia, rossetto, eyeliner, pennelli, gloss labbra
    // Prodotti beauty eleganti e di qualità
    const isMascara = (name.includes('mascara') && name.includes('ciglia'));
    const isRossetto = name.includes('rossetto');
    const isEyeliner = name.includes('eyeliner');
    const isPennello = name.includes('pennello') && (name.includes('fondotinta') || name.includes('trucco'));
    const isGloss = name.includes('gloss') && name.includes('labbra');
    const isMatita = (name.includes('matita') && name.includes('labbra'));

    return isMascara || isRossetto || isEyeliner || isPennello || isGloss || isMatita;
});

console.log(`Filtrati ulteriormente: ${trucco.length} prodotti ADATTI A ZENOVA`);

// Ordina per stock (più venduti)
trucco.sort((a, b) => b.stock - a.stock);

// Seleziona top 10 (non troppi per iniziare)
const truccoTop = trucco.slice(0, 10);

console.log('\nTop 10 prodotti trucco selezionati per Zenova:');
truccoTop.forEach((p, i) => {
    console.log(`  ${i+1}. ${p.name.substring(0, 70)}`);
    console.log(`     Stock: ${p.stock} | €${p.price} | ${p.imageCount} img`);
});
console.log('');

// ===== RIMUOVI LAMPADE ABBRONZANTI =====
console.log('=== LAMPADE ABBRONZANTI ===');
console.log('❌ Categoria RIMOSSA (0 prodotti disponibili su BigBuy)');
console.log('');

// ===== COMBINA TUTTO =====
const newProducts = [...saune, ...truccoTop];

console.log('\n=== RIEPILOGO ===');
console.log(`Accessori saune: ${saune.length} prodotti`);
console.log(`Trucco: ${truccoTop.length} prodotti`);
console.log(`TOTALE NUOVI PRODOTTI: ${newProducts.length}`);
console.log(`Prodotti attuali in top-100: ${currentTop100.length}`);
console.log(`Totale dopo aggiunta: ${currentTop100.length + newProducts.length}`);
console.log('');

// Formatta i nuovi prodotti come quelli esistenti
const formattedNewProducts = newProducts.map(p => {
    // Calcola margine
    const margin = p.pvd > 0 ? (((p.pvd - p.price) / p.pvd) * 100).toFixed(1) : '0';

    return {
        id: p.id,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: 'Health & Beauty',
        zenovaCategories: [p.zenovaCategory],
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
        score: p.stock, // Usa stock come score
        raw: p.raw
    };
});

// Combina con prodotti esistenti
const updatedProducts = [...currentTop100, ...formattedNewProducts];

// Salva
fs.writeFileSync('top-products-updated.json', JSON.stringify(updatedProducts, null, 2));
fs.writeFileSync('new-products-only.json', JSON.stringify(formattedNewProducts, null, 2));

console.log('💾 File salvati:');
console.log('  - top-products-updated.json (tutti i prodotti)');
console.log('  - new-products-only.json (solo nuovi prodotti)');
console.log('');

console.log('📋 PROSSIMO STEP:');
console.log('  1. Rinominare top-products-updated.json -> top-100-products.json');
console.log('  2. Aggiornare sidebar in prodotti.html per rimuovere "Lampade abbronzanti"');
console.log('  3. Aggiornare script.js per mappare i nuovi prodotti correttamente');
