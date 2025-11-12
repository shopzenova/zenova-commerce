const fs = require('fs');

const allProducts = require('./massaggio-products.json');

console.log('🔍 Filtraggio prodotti Massaggio e Rilassamento...\n');
console.log(`Totale prodotti trovati: ${allProducts.length}\n`);

// FILTRO: solo prodotti REALMENTE di massaggio e rilassamento
const filtered = allProducts.filter(p => {
    const name = p.name.toLowerCase();
    const description = (p.description || '').toLowerCase();

    // ESCLUDI prodotti non pertinenti
    if (name.includes('trapano') || name.includes('drill') ||
        name.includes('cuffia') || name.includes('cap') ||
        name.includes('orecchini') || name.includes('earring') ||
        name.includes('amplificatore') || name.includes('amplifier') ||
        name.includes('correttore') && name.includes('alluce') ||
        name.includes('pouf') || name.includes('puff') ||
        name.includes('strumento') && name.includes('sollevamento') ||
        name.includes('lifting tool') ||
        name.includes('sbiancare') && name.includes('denti') ||
        name.includes('teeth') && name.includes('whitening') ||
        name.includes('separadita') ||
        name.includes('dilatatore nasale') ||
        name.includes('cintura') && name.includes('resistenza') ||
        name.includes('resistance band') ||
        name.includes('bande di resistenza') ||
        name.includes('cuscinetti metatarsali') ||
        name.includes('spazzola lisciante') ||
        name.includes('stendibiancheria') || name.includes('drying rack') ||
        name.includes('tubo') && name.includes('giardino') ||
        name.includes('garden hose') ||
        name.includes('rasoio') || name.includes('shaver') ||
        name.includes('bastone') && name.includes('estensibile')) {
        return false;
    }

    // INCLUDI solo prodotti veri di massaggio/rilassamento
    const isMassaggiatore =
        (name.includes('massaggiatore') || name.includes('massager')) ||
        (name.includes('massaggio') || name.includes('massage')) ||
        (name.includes('idromassaggio') || name.includes('foot spa') || name.includes('pediluvio')) ||
        (name.includes('termoforo') || name.includes('heat pad')) ||
        (name.includes('borsa') && name.includes('acqua calda')) ||
        (name.includes('fascia termica') && (name.includes('lombare') || name.includes('cervicale'))) ||
        (name.includes('cuscino') && name.includes('massaggiante')) ||
        (name.includes('pistola') && name.includes('massaggiante')) ||
        (name.includes('massage gun')) ||
        (name.includes('rullo') && name.includes('massaggio')) ||
        (name.includes('foam roller')) ||
        (name.includes('elettrostimolatore') || name.includes('tens')) ||
        (name.includes('shiatsu')) ||
        (name.includes('anticellulite') && (name.includes('massaggiante') || name.includes('vibrante')));

    return isMassaggiatore;
});

console.log(`✅ Prodotti filtrati: ${filtered.length}\n`);

// Ordina per stock (più venduti)
filtered.sort((a, b) => b.stock - a.stock);

// Mostra top 30
console.log('=== TOP 30 PRODOTTI MASSAGGIO E RILASSAMENTO ===\n');
filtered.slice(0, 30).forEach((p, i) => {
    console.log(`${i+1}. ${p.name.substring(0, 75)}`);
    console.log(`   Stock: ${p.stock} | €${p.price} | Brand: ${p.brand || 'N/A'}`);
});

if (filtered.length > 30) {
    console.log(`\n... e altri ${filtered.length - 30} prodotti`);
}

// Statistiche per brand
console.log('\n\n=== BRAND PIÙ PRESENTI ===\n');
const brandCount = {};
filtered.forEach(p => {
    const brand = p.brand || 'Senza brand';
    brandCount[brand] = (brandCount[brand] || 0) + 1;
});

Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} prodotti`);
    });

// Salva
fs.writeFileSync('massaggio-products-filtered.json', JSON.stringify(filtered, null, 2));
console.log(`\n\n💾 Prodotti filtrati salvati in: massaggio-products-filtered.json`);
console.log(`\n📊 TOTALE: ${filtered.length} prodotti di massaggio e rilassamento`);
