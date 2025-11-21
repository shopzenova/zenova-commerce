const data = require('./top-100-products.json');

const health = data.filter(p => p.zenovaCategory === 'health-personal-care');
const noId = health.filter(p => !p.id);

console.log('Health totali:', health.length);
console.log('Health senza ID:', noId.length);

if (noId.length > 0) {
    console.log('\nPrimi 3 prodotti senza ID:');
    noId.slice(0, 3).forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - EAN: ${p.ean}`);
    });
}

// Verifica Beauty per confronto
const beauty = data.filter(p => p.zenovaCategory === 'beauty');
const beautyNoId = beauty.filter(p => !p.id);
console.log('\nBeauty totali:', beauty.length);
console.log('Beauty senza ID:', beautyNoId.length);
