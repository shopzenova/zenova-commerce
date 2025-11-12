const fs = require('fs');

console.log('🔍 Filtro SOLO prodotti eBook autentici...\n');

const results = JSON.parse(fs.readFileSync('ebook-accessories-all.json', 'utf-8'));

// Filtro per categoria
const filtered = {
    'ebook-reader': [],
    'custodie-ebook': [],
    'alimentatori-ebook': [],
    'luci-lettura': []
};

console.log('📚 eBook Reader:');
results['ebook-reader'].forEach(p => {
    const name = p.name.toLowerCase();
    // SOLO se contiene ebook o kobo o kindle
    if (name.includes('ebook') || name.includes('kobo') || name.includes('kindle')) {
        filtered['ebook-reader'].push(p);
        console.log(`  ✓ ${p.name}`);
    }
});

console.log(`\n📱 Custodie per eBook:`);
// Unisci custodie morbide e rigide
const allCases = [
    ...results['custodie-morbide'],
    ...results['custodie-rigide']
];

allCases.forEach(p => {
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();
    // SOLO custodie per ebook/kobo/kindle
    if ((name.includes('ebook') || name.includes('kobo') || name.includes('kindle')) &&
        (name.includes('custodia') || name.includes('cover') || name.includes('case'))) {
        filtered['custodie-ebook'].push(p);
        console.log(`  ✓ ${p.name}`);
    }
});

console.log(`\n🔌 Alimentatori per eBook:`);
results['alimentatori'].forEach(p => {
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();
    // SOLO alimentatori per ebook/kobo/kindle
    if ((name.includes('ebook') || name.includes('kobo') || name.includes('kindle')) &&
        (name.includes('caricabatterie') || name.includes('alimentatore') || name.includes('charger'))) {
        filtered['alimentatori-ebook'].push(p);
        console.log(`  ✓ ${p.name}`);
    }
});

console.log(`\n💡 Luci di lettura:`);
// Cerca luci specifiche per lettura/libro
results['luci-lettura'].forEach(p => {
    const name = p.name.toLowerCase();
    if (name.includes('luce') && (name.includes('lettura') || name.includes('libro') || name.includes('reading'))) {
        filtered['luci-lettura'].push(p);
        console.log(`  ✓ ${p.name}`);
    }
});

// Statistiche
console.log('\n\n📊 TOTALE PRODOTTI EBOOK AUTENTICI:\n');
let total = 0;
for (const [cat, products] of Object.entries(filtered)) {
    console.log(`  ${cat}: ${products.length} prodotti`);
    total += products.length;
}
console.log(`\n  TOTALE: ${total} prodotti`);

if (total > 0) {
    fs.writeFileSync('ebook-products-final.json', JSON.stringify(filtered, null, 2));
    console.log('\n💾 Salvato in: ebook-products-final.json');
} else {
    console.log('\n❌ Nessun prodotto eBook trovato');
}
