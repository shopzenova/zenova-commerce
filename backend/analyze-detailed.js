const fs = require('fs');

const data = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('=== ANALISI DETTAGLIATA HEALTH & BEAUTY ===\n');

const healthBeauty = data.filter(p => p.category === 'Health & Beauty');

console.log(`Totale prodotti Health & Beauty: ${healthBeauty.length}\n`);

healthBeauty.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    if (p.zenovaCategories && p.zenovaCategories.length > 0) {
        console.log(`   Zenova: ${p.zenovaCategories.join(', ')}`);
    }
});

console.log('\n\n=== PROFUMI (ora in Tech & Electronics) ===\n');

const perfumes = data.filter(p => p.name.toLowerCase().includes('profumo'));
console.log(`Totale profumi: ${perfumes.length}\n`);
perfumes.slice(0, 10).forEach(p => {
    console.log(`• ${p.name}`);
});
