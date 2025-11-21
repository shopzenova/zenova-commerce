const fs = require('fs');

const categories = JSON.parse(fs.readFileSync('bigbuy-categories-full.json', 'utf-8'));

// Trova la categoria 2507
const beauty = categories.find(cat => cat.id === 2507);
console.log('Categoria 2507:', beauty ? `${beauty.id} → ${beauty.name} (parent: ${beauty.parentCategory})` : 'NON TROVATA');

// Trova la categoria 2501 (Health | Beauty)
const health = categories.find(cat => cat.id === 2501);
console.log('Categoria 2501:', health ? `${health.id} → ${health.name} (parent: ${health.parentCategory})` : 'NON TROVATA');

// Trova tutte le categorie figlie di 2501
const healthChildren = categories.filter(cat => cat.parentCategory === 2501);
console.log('\n📊 Sottocategorie di Health | Beauty (2501):\n');
healthChildren
  .sort((a, b) => a.id - b.id)
  .forEach(cat => {
    console.log(`${String(cat.id).padEnd(6)} → ${cat.name}`);
  });

// Ora trova le sottocategorie di 2507
const beautyChildren = categories.filter(cat => cat.parentCategory === 2507);
console.log('\n📊 Sottocategorie di Beauty/Bellezza (2507):\n');
beautyChildren
  .sort((a, b) => a.id - b.id)
  .forEach(cat => {
    console.log(`${String(cat.id).padEnd(6)} → ${cat.name}`);
  });

console.log(`\nTotale sottocategorie 2507: ${beautyChildren.length}`);
