const fs = require('fs');

const foundProducts = require('./found-specific-products.json');

console.log('🔍 Filtraggio prodotti trovati...\n');

// ===== LAMPADE ABBRONZANTI =====
console.log('=== LAMPADE ABBRONZANTI ===');
const lampadeFiltered = foundProducts['lampade-abbronzanti'].filter(p => {
    const name = p.name.toLowerCase();

    // ESCLUDI: lampade antizanzare, autoabbronzanti (creme), protezioni solari
    if (name.includes('antizanzare') ||
        name.includes('insetti') ||
        name.includes('autoabbronzante') ||
        name.includes('protezione solare') ||
        name.includes('smalto')) {
        return false;
    }

    // INCLUDI: solo lampade UV vere
    return name.includes('lampada uv') || name.includes('solarium') || name.includes('tanning lamp');
});

console.log(`Filtrati: ${lampadeFiltered.length} di ${foundProducts['lampade-abbronzanti'].length}`);
lampadeFiltered.forEach(p => {
    console.log(`  - ${p.name.substring(0, 80)}`);
    console.log(`    Stock: ${p.stock} | €${p.price}`);
});
console.log('');

// ===== ACCESSORI SAUNE =====
console.log('=== ACCESSORI SAUNE ===');
const sauneFiltered = foundProducts['accessori-saune'].filter(p => {
    const name = p.name.toLowerCase();

    // ESCLUDI: tamponi, prodotti non correlati
    if (name.includes('tamponi') ||
        name.includes('pacchetto trattamento')) {
        return false;
    }

    // INCLUDI: sauna viso, fasce sauna, gilet sauna
    return name.includes('sauna');
});

console.log(`Filtrati: ${sauneFiltered.length} di ${foundProducts['accessori-saune'].length}`);
sauneFiltered.slice(0, 10).forEach(p => {
    console.log(`  - ${p.name.substring(0, 80)}`);
    console.log(`    Stock: ${p.stock} | €${p.price}`);
});
console.log('');

// ===== TRUCCO =====
console.log('=== TRUCCO ===');
const truccoFiltered = foundProducts['trucco'].filter(p => {
    const name = p.name.toLowerCase();

    // ESCLUDI: maschere subacquee, organizer, mobili, trasportini, ecc.
    if (name.includes('mascara da sub') ||
        name.includes('maschera sub') ||
        name.includes('organizer') ||
        name.includes('frigo') ||
        name.includes('lettera ') ||
        name.includes('lanterna') ||
        name.includes('cesti') ||
        name.includes('tavolo') ||
        name.includes('sedie') ||
        name.includes('trasportino') ||
        name.includes('bestway')) {
        return false;
    }

    // INCLUDI: solo vero trucco
    return (name.includes('mascara') && name.includes('ciglia')) ||
           name.includes('rossetto') ||
           name.includes('fondotinta') ||
           name.includes('ombretto') ||
           name.includes('eyeliner') ||
           name.includes('matita labbra') ||
           name.includes('gloss') ||
           name.includes('cipria') ||
           name.includes('blush') ||
           name.includes('palette') ||
           (name.includes('primer') && name.includes('viso')) ||
           (name.includes('correttore') && name.includes('viso'));
});

console.log(`Filtrati: ${truccoFiltered.length} di ${foundProducts['trucco'].length}`);
truccoFiltered.slice(0, 15).forEach(p => {
    console.log(`  - ${p.name.substring(0, 80)}`);
    console.log(`    Stock: ${p.stock} | €${p.price}`);
});
console.log('');

// ===== RIEPILOGO =====
console.log('\n=== RIEPILOGO FINALE ===');
console.log(`Lampade abbronzanti: ${lampadeFiltered.length} prodotti validi`);
console.log(`Accessori saune: ${sauneFiltered.length} prodotti validi`);
console.log(`Trucco: ${truccoFiltered.length} prodotti validi`);
console.log('');

// Salva risultati filtrati
const filtered = {
    'lampade-abbronzanti': lampadeFiltered,
    'accessori-saune': sauneFiltered,
    'trucco': truccoFiltered
};

fs.writeFileSync('filtered-products.json', JSON.stringify(filtered, null, 2));
console.log('💾 Prodotti filtrati salvati in: filtered-products.json');

// RACCOMANDAZIONE
console.log('\n=== RACCOMANDAZIONE ===');
if (lampadeFiltered.length === 0) {
    console.log('⚠️  LAMPADE ABBRONZANTI: Nessun prodotto vero trovato.');
    console.log('    Consiglio: rimuovere questa categoria dalla sidebar');
}

if (sauneFiltered.length > 0) {
    console.log(`✅ ACCESSORI SAUNE: ${sauneFiltered.length} prodotti - CATEGORIA OK`);
}

if (truccoFiltered.length === 0) {
    console.log('⚠️  TRUCCO: Nessun prodotto vero trovato.');
    console.log('    Consiglio: rimuovere questa categoria dalla sidebar');
} else if (truccoFiltered.length < 5) {
    console.log(`⚠️  TRUCCO: Solo ${truccoFiltered.length} prodotti - categoria troppo piccola`);
    console.log('    Consiglio: rimuovere questa categoria dalla sidebar');
} else {
    console.log(`✅ TRUCCO: ${truccoFiltered.length} prodotti - CATEGORIA OK`);
}
