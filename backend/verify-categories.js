const products = require('./top-100-products.json');

console.log('🔍 Verifica categorizzazione prodotti...\n');

// Conta prodotti per sottocategoria
const bySubcategory = {};

products.forEach(p => {
    // Determina subcategory dal nome (come fa script.js)
    const name = p.name.toLowerCase();
    let subcategory = 'altro';

    // BENESSERE
    if (name.includes('sauna') ||
        (name.includes('fascia') && name.includes('effetto sauna')) ||
        (name.includes('gilet') && name.includes('effetto sauna'))) {
        subcategory = 'accessori-saune';
    } else if (name.includes('massaggiatore') || name.includes('idromassaggio')) {
        subcategory = 'massaggio-rilassamento';
    }
    // BELLEZZA
    else if (name.includes('profumo') || name.includes('eau de')) {
        subcategory = 'profumi-fragranze';
    } else if (name.includes('phon') || name.includes('spazzola') || name.includes('arricciacapelli')) {
        subcategory = 'cura-capelli';
    } else if (name.includes('epilatore') || name.includes('rasoio') || name.includes('depilazione')) {
        subcategory = 'rasatura-depilazione';
    } else if (name.includes('crema') || name.includes('protezione solare')) {
        subcategory = 'cura-pelle';
    } else if (name.includes('integratore') || name.includes('balsamo labbra') || name.includes('gel doccia')) {
        subcategory = 'bagno-igiene';
    } else if (name.includes('caricabatterie')) {
        subcategory = 'utensili-accessori';
    } else if ((name.includes('mascara') && name.includes('ciglia')) ||
               name.includes('rossetto') ||
               name.includes('eyeliner') ||
               (name.includes('pennello') && (name.includes('fondotinta') || name.includes('trucco'))) ||
               (name.includes('gloss') && name.includes('labbra')) ||
               (name.includes('matita') && name.includes('labbra'))) {
        subcategory = 'trucco';
    }

    if (!bySubcategory[subcategory]) {
        bySubcategory[subcategory] = [];
    }
    bySubcategory[subcategory].push(p.name);
});

console.log('=== DISTRIBUZIONE PER SOTTOCATEGORIA ===\n');

const order = [
    'accessori-saune',
    'massaggio-rilassamento',
    'profumi-fragranze',
    'cura-capelli',
    'cura-pelle',
    'bagno-igiene',
    'rasatura-depilazione',
    'trucco',
    'utensili-accessori',
    'altro'
];

let totalVisible = 0;

order.forEach(sub => {
    if (bySubcategory[sub]) {
        const emoji = {
            'accessori-saune': '🧖',
            'massaggio-rilassamento': '💆',
            'profumi-fragranze': '🌺',
            'cura-capelli': '💇',
            'cura-pelle': '🌸',
            'bagno-igiene': '🧴',
            'rasatura-depilazione': '✂️',
            'trucco': '💄',
            'utensili-accessori': '🔌'
        }[sub] || '✨';

        console.log(`${emoji} ${sub.toUpperCase()}: ${bySubcategory[sub].length} prodotti`);

        // Mostra primi 3
        bySubcategory[sub].slice(0, 3).forEach(name => {
            console.log(`  - ${name.substring(0, 70)}`);
        });

        if (bySubcategory[sub].length > 3) {
            console.log(`  ... e altri ${bySubcategory[sub].length - 3}`);
        }
        console.log('');

        if (sub !== 'altro') {
            totalVisible += bySubcategory[sub].length;
        }
    }
});

console.log(`\n📊 TOTALI:`);
console.log(`   Prodotti visibili nelle categorie: ${totalVisible}`);
console.log(`   Prodotti nascosti (altro): ${bySubcategory['altro'] ? bySubcategory['altro'].length : 0}`);
console.log(`   TOTALE: ${products.length}`);

// Verifica nuovi prodotti
console.log(`\n🆕 NUOVI PRODOTTI AGGIUNTI:`);
console.log(`   Accessori saune: ${bySubcategory['accessori-saune'] ? bySubcategory['accessori-saune'].length : 0}`);
console.log(`   Trucco: ${bySubcategory['trucco'] ? bySubcategory['trucco'].length : 0}`);
