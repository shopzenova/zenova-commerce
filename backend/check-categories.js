const products = require('./top-100-products.json');

console.log('=== VERIFICA CATEGORIE PRODOTTI ===\n');

const first20 = products.slice(0, 20);

first20.forEach(p => {
    const name = p.name.substring(0, 40).padEnd(40, ' ');
    const category = (p.category || 'N/A').padEnd(25, ' ');
    const zenova = p.zenovaSubcategory || 'N/A';
    console.log(`${name} | category: ${category} | zenova: ${zenova}`);
});

console.log('\n=== CONTEGGIO CATEGORIE ===');
const categoryCounts = {};
products.forEach(p => {
    const cat = p.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
});

Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).forEach(cat => {
    console.log(`${cat}: ${categoryCounts[cat]} prodotti`);
});

console.log('\n=== PRODOTTI CON zenovaSubcategory ===');
const withZenova = products.filter(p => p.zenovaSubcategory);
console.log(`Totale con zenovaSubcategory: ${withZenova.length} / ${products.length}`);
if (withZenova.length > 0) {
    console.log('Esempi:');
    withZenova.slice(0, 5).forEach(p => {
        console.log(`  ${p.name.substring(0, 40)} -> zenova: ${p.zenovaSubcategory}`);
    });
}
