const fs = require('fs');
const path = require('path');

// Carica il catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
let catalog = [];

try {
  const data = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`📦 Catalogo attuale: ${catalog.length} prodotti\n`);
} catch (error) {
  console.log('❌ Errore lettura catalogo:', error.message);
  process.exit(1);
}

const before = catalog.length;

// Raggruppa prodotti per categoria
const byCategory = {};
catalog.forEach(p => {
  const cat = p.category || 'no-category';
  if (!byCategory[cat]) {
    byCategory[cat] = [];
  }
  byCategory[cat].push(p);
});

console.log('📊 SOTTOCATEGORIE TROVATE:\n');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`   ${cat}: ${byCategory[cat].length} prodotti`);
});

console.log('\n\n🔄 ELABORAZIONE:\n');

// Per ogni categoria, mantieni solo i primi 4 prodotti ordinati per prezzo
const newCatalog = [];
let totalRemoved = 0;

Object.entries(byCategory).forEach(([cat, products]) => {
  // Ordina per prezzo crescente
  const sorted = products.sort((a, b) => {
    const priceA = parseFloat(a.price) || 999999;
    const priceB = parseFloat(b.price) || 999999;
    return priceA - priceB;
  });

  // Mantieni solo i primi 4
  const toKeep = sorted.slice(0, 4);
  const toRemove = sorted.slice(4);

  console.log(`\n📂 ${cat}`);
  console.log(`   Totale: ${products.length} prodotti`);
  console.log(`   ✅ Mantengo: ${toKeep.length} prodotti`);

  toKeep.forEach((p, i) => {
    console.log(`      ${i+1}. ${p.name} - €${p.price}`);
  });

  if (toRemove.length > 0) {
    console.log(`   ❌ Elimino: ${toRemove.length} prodotti`);
    totalRemoved += toRemove.length;
  }

  // Aggiungi i prodotti da mantenere al nuovo catalogo
  newCatalog.push(...toKeep);
});

// Salva il nuovo catalogo
fs.writeFileSync(catalogPath, JSON.stringify(newCatalog, null, 2));

console.log('\n\n✅ COMPLETATO!');
console.log(`📦 Prodotti prima: ${before}`);
console.log(`❌ Prodotti eliminati: ${totalRemoved}`);
console.log(`✅ Prodotti rimanenti: ${newCatalog.length}`);
console.log(`\n💡 Ogni sottocategoria ha max 4 prodotti ordinati per prezzo crescente`);
