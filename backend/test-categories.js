const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

// Simulate the mapping function from script.js
function categorizeProduct(product) {
    const productName = product.name.toLowerCase();
    let category = 'Bellezza';
    let subcategory = 'altro';

    // BELLEZZA - Profumi
    if (productName.includes('profumo') || productName.includes('eau de') || productName.includes('edt') || productName.includes('edp')) {
        category = 'Bellezza';
        subcategory = 'profumi';
    }
    // BELLEZZA - Capelli
    else if (productName.includes('phon') || productName.includes('spazzola') || productName.includes('arricciacapelli') ||
             (productName.includes('babyliss') && !productName.includes('rasoio')) ||
             (productName.includes('revlon') && !productName.includes('rasoio'))) {
        category = 'Bellezza';
        subcategory = 'capelli';
    }
    // BELLEZZA - Depilazione
    else if (productName.includes('epilatore') || productName.includes('rasoio') || productName.includes('depilazione')) {
        category = 'Bellezza';
        subcategory = 'depilazione';
    }
    // BELLEZZA - Cura della Pelle
    else if (productName.includes('crema') || productName.includes('balsamo') || productName.includes('spray') ||
             productName.includes('protezione solare') || productName.includes('pulitore') ||
             productName.includes('essenza')) {
        category = 'Bellezza';
        subcategory = 'cura-pelle';
    }
    // SALUTE E CURA DELLA PERSONA - Benessere
    else if (productName.includes('massaggiatore') || productName.includes('idromassaggio') ||
             productName.includes('integratore') || productName.includes('set regalo')) {
        category = 'Salute e Cura';
        subcategory = 'benessere';
    }
    // Default per altri prodotti Health & Beauty
    else if (product.category === 'Health & Beauty') {
        category = 'Bellezza';
        subcategory = 'altro';
    }

    return { category, subcategory };
}

// Filter only Health & Beauty products
const healthBeauty = data.filter(p => p.category === 'Health & Beauty' || p.name.toLowerCase().includes('profumo'));

console.log('=== TEST MAPPATURA CATEGORIE ===\n');
console.log(`Totale prodotti da categorizzare: ${healthBeauty.length}\n`);

const categoryCounts = {
    'Salute e Cura > benessere': [],
    'Bellezza > capelli': [],
    'Bellezza > depilazione': [],
    'Bellezza > cura-pelle': [],
    'Bellezza > profumi': [],
    'Bellezza > altro': []
};

healthBeauty.forEach(p => {
    const { category, subcategory } = categorizeProduct(p);
    const key = `${category} > ${subcategory}`;
    if (categoryCounts[key]) {
        categoryCounts[key].push(p.name);
    }
});

Object.keys(categoryCounts).forEach(cat => {
    console.log(`\n${cat} (${categoryCounts[cat].length} prodotti):`);
    categoryCounts[cat].slice(0, 5).forEach(name => {
        console.log(`  • ${name}`);
    });
    if (categoryCounts[cat].length > 5) {
        console.log(`  ... e altri ${categoryCounts[cat].length - 5}`);
    }
});

console.log(`\n\n✅ TOTALE: ${healthBeauty.length} prodotti categorizzati`);
