const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

// Simula la funzione di mapping
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

    // BENESSERE - Massaggio e Relax
    if (productName.includes('massaggiatore') || productName.includes('set regalo') && productName.includes('medisana')) {
        category = 'Benessere';
        subcategory = 'massaggio-relax';
    }
    // BENESSERE - Idromassaggio
    else if (productName.includes('idromassaggio')) {
        category = 'Benessere';
        subcategory = 'idromassaggio';
    }
    // BENESSERE - Integratori
    else if (productName.includes('integratore') || productName.includes('protezione solare')) {
        category = 'Benessere';
        subcategory = 'integratori';
    }
    // BELLEZZA - Profumi
    else if (productName.includes('profumo') || productName.includes('eau de') || productName.includes('edt') || productName.includes('edp')) {
        category = 'Bellezza';
        subcategory = 'profumi';
    }
    // BELLEZZA - Capelli
    else if (productName.includes('phon') || productName.includes('spazzola') || productName.includes('arricciacapelli') ||
             productName.includes('balsamo') || productName.includes('spray') && !productName.includes('protezione solare') ||
             (productName.includes('babyliss') && !productName.includes('rasoio')) ||
             (productName.includes('revlon') && !productName.includes('rasoio'))) {
        category = 'Bellezza';
        subcategory = 'capelli';
    }
    // BELLEZZA - Depilazione
    else if (productName.includes('epilatore') || productName.includes('rasoio') || productName.includes('depilazione') ||
             productName.includes('pulitore')) {
        category = 'Bellezza';
        subcategory = 'depilazione';
    }
    // BELLEZZA - Cura della Pelle
    else if (productName.includes('crema') || productName.includes('essenza')) {
        category = 'Bellezza';
        subcategory = 'cura-pelle';
    }
    // Solo prodotti Health & Beauty
    else if (product.category === 'Health & Beauty') {
        category = 'Bellezza';
        subcategory = 'altro';
    }
    // Tutti gli altri = nascosti
    else {
        return null;
    }

    return { name: product.name, category, subcategory };
}

console.log('=== TEST FINALE MAPPATURA ===\n');

const mapped = data.map(mapProduct).filter(p => p !== null);

console.log(`✅ Prodotti visibili: ${mapped.length} / 100\n`);

// Conta per categoria
const counts = {};
mapped.forEach(p => {
    const key = `${p.category} > ${p.subcategory}`;
    if (!counts[key]) counts[key] = [];
    counts[key].push(p.name);
});

Object.keys(counts).sort().forEach(cat => {
    console.log(`\n${cat} (${counts[cat].length} prodotti):`);
    counts[cat].slice(0, 3).forEach(name => {
        console.log(`  • ${name}`);
    });
    if (counts[cat].length > 3) {
        console.log(`  ... e altri ${counts[cat].length - 3}`);
    }
});

console.log(`\n\n🎯 TOTALE VISIBILE: ${mapped.length} prodotti`);
console.log(`❌ NASCOSTI: ${100 - mapped.length} prodotti (Home & Garden, ecc.)`);
