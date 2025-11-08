const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

// Simula la funzione di mapping con categorie BigBuy
function mapProduct(product) {
    const productName = product.name.toLowerCase();
    let category = null;
    let subcategory = 'altro';

    // ESCLUDI prodotti indesiderati
    if (productName.includes('cuccia') || productName.includes('cani') || productName.includes('cane') ||
        productName.includes('giocattolo') || productName.includes('videocamera') ||
        productName.includes('luce galleggiante') || productName.includes('piscina') ||
        product.category === 'Home & Garden') {
        return null;
    }

    // === BENESSERE (BigBuy) ===

    // Massaggio e rilassamento
    if (productName.includes('massaggiatore') || productName.includes('idromassaggio') ||
        productName.includes('set regalo') && productName.includes('medisana') ||
        productName.includes('testina') && productName.includes('therabody')) {
        category = 'Benessere';
        subcategory = 'massaggio-rilassamento';
    }

    // === BELLEZZA (BigBuy) ===

    // Profumi e fragranze
    else if (productName.includes('profumo') || productName.includes('eau de') ||
             productName.includes('edt') || productName.includes('edp')) {
        category = 'Bellezza';
        subcategory = 'profumi-fragranze';
    }
    // Cura dei capelli
    else if (productName.includes('phon') || productName.includes('spazzola') ||
             productName.includes('arricciacapelli') ||
             productName.includes('balsamo') && !productName.includes('labbra') ||
             productName.includes('spray') && !productName.includes('protezione solare') ||
             (productName.includes('babyliss') && !productName.includes('rasoio')) ||
             (productName.includes('revlon') && !productName.includes('rasoio'))) {
        category = 'Bellezza';
        subcategory = 'cura-capelli';
    }
    // Rasatura e depilazione
    else if (productName.includes('epilatore') || productName.includes('rasoio') ||
             productName.includes('depilazione') || productName.includes('pulitore')) {
        category = 'Bellezza';
        subcategory = 'rasatura-depilazione';
    }
    // Cura della pelle
    else if (productName.includes('crema') || productName.includes('essenza') ||
             productName.includes('protezione solare')) {
        category = 'Bellezza';
        subcategory = 'cura-pelle';
    }
    // Bagno e igiene personale
    else if (productName.includes('integratore') || productName.includes('balsamo labbra') ||
             productName.includes('gel doccia')) {
        category = 'Bellezza';
        subcategory = 'bagno-igiene';
    }
    // Utensili e accessori
    else if (productName.includes('caricabatterie')) {
        category = 'Bellezza';
        subcategory = 'utensili-accessori';
    }
    // Solo prodotti Health & Beauty
    else if (product.category === 'Health & Beauty') {
        category = 'Bellezza';
        subcategory = 'altro';
    }
    else {
        return null;
    }

    return { name: product.name, category, subcategory };
}

console.log('=== TEST MAPPATURA BIGBUY FINALE ===\n');

const mapped = data.map(mapProduct).filter(p => p !== null);

console.log(`✅ Prodotti visibili: ${mapped.length} / 100\n`);

// Conta per categoria
const counts = {};
mapped.forEach(p => {
    const key = `${p.category} > ${p.subcategory}`;
    if (!counts[key]) counts[key] = [];
    counts[key].push(p.name);
});

// Ordina per categoria
const benessere = {};
const bellezza = {};

Object.keys(counts).forEach(key => {
    if (key.startsWith('Benessere')) {
        benessere[key] = counts[key];
    } else {
        bellezza[key] = counts[key];
    }
});

console.log('=== BENESSERE ===\n');
Object.keys(benessere).forEach(cat => {
    console.log(`${cat} (${benessere[cat].length} prodotti):`);
    benessere[cat].slice(0, 3).forEach(name => {
        console.log(`  • ${name}`);
    });
    if (benessere[cat].length > 3) {
        console.log(`  ... e altri ${benessere[cat].length - 3}`);
    }
    console.log('');
});

console.log('\n=== BELLEZZA ===\n');
Object.keys(bellezza).forEach(cat => {
    console.log(`${cat} (${bellezza[cat].length} prodotti):`);
    bellezza[cat].slice(0, 3).forEach(name => {
        console.log(`  • ${name}`);
    });
    if (bellezza[cat].length > 3) {
        console.log(`  ... e altri ${bellezza[cat].length - 3}`);
    }
    console.log('');
});

console.log(`\n🎯 TOTALE VISIBILE: ${mapped.length} prodotti`);
console.log(`❌ NASCOSTI: ${100 - mapped.length} prodotti (Home & Garden, ecc.)`);

// Mostra sottocategorie vuote
const allSubcategories = {
    'Benessere > accessori-saune': 'Accessori per saune',
    'Benessere > lampade-abbronzanti': 'Lampade abbronzanti',
    'Benessere > massaggio-rilassamento': 'Massaggio e rilassamento',
    'Bellezza > bagno-igiene': 'Bagno e igiene personale',
    'Bellezza > cura-capelli': 'Cura dei capelli',
    'Bellezza > cura-pelle': 'Cura della pelle',
    'Bellezza > profumi-fragranze': 'Profumi e fragranze',
    'Bellezza > rasatura-depilazione': 'Rasatura e depilazione',
    'Bellezza > trucco': 'Trucco',
    'Bellezza > utensili-accessori': 'Utensili e accessori'
};

console.log('\n\n=== CATEGORIE VUOTE (da riempire importando più prodotti) ===\n');
Object.keys(allSubcategories).forEach(key => {
    if (!counts[key]) {
        console.log(`❌ ${allSubcategories[key]}`);
    }
});
