const fs = require('fs');

const products = require('./top-100-products.json');

console.log('🔍 Verifica prodotti Bagno e Igiene...\n');

// Identifica prodotti bagno e igiene (basato su script.js mapping)
const bagnoIgiene = products.filter(p => {
    const name = p.name.toLowerCase();
    return name.includes('integratore') ||
           (name.includes('balsamo') && name.includes('labbra')) ||
           name.includes('gel doccia');
});

console.log(`Prodotti Bagno e Igiene trovati: ${bagnoIgiene.length}\n`);

bagnoIgiene.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
});

// Rimuovi questi prodotti
const withoutBagno = products.filter(p => !bagnoIgiene.find(b => b.id === p.id));

console.log(`\n✂️  Rimozione in corso...`);
console.log(`   Prodotti prima: ${products.length}`);
console.log(`   Prodotti dopo: ${withoutBagno.length}`);
console.log(`   Prodotti rimossi: ${products.length - withoutBagno.length}`);

// Salva
fs.writeFileSync('top-100-products-no-bagno.json', JSON.stringify(withoutBagno, null, 2));
console.log(`\n💾 Salvato in: top-100-products-no-bagno.json`);

console.log(`\n📋 PROSSIMO STEP:`);
console.log(`   cp top-100-products-no-bagno.json top-100-products.json`);
console.log(`   Poi riavviare il server`);
