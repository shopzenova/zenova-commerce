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

// Raggruppa prodotti per immagine principale
const byImage = {};
catalog.forEach((p, idx) => {
  const img = p.image || (p.images && p.images[0]) || 'no-image';
  if (!byImage[img]) {
    byImage[img] = [];
  }
  byImage[img].push({ ...p, originalIndex: idx });
});

// Identifica prodotti da mantenere
const toKeep = [];
const toRemove = [];

Object.entries(byImage).forEach(([img, products]) => {
  if (products.length === 1) {
    // Nessun duplicato, mantieni
    toKeep.push(products[0]);
  } else {
    // Duplicati trovati

    // Se sono prodotti senza nome (undefined), elimina tutti
    if (!products[0].name || products[0].name === 'undefined') {
      console.log(`🗑️  Elimino ${products.length} prodotti senza nome`);
      toRemove.push(...products);
      return;
    }

    // Altrimenti, ordina per prezzo (dal più basso al più alto)
    products.sort((a, b) => {
      const priceA = parseFloat(a.price) || 999999;
      const priceB = parseFloat(b.price) || 999999;
      return priceA - priceB;
    });

    // Mantieni il primo (prezzo più basso)
    const kept = products[0];
    const removed = products.slice(1);

    console.log(`\n🔄 Duplicato: ${kept.name}`);
    console.log(`   ✅ MANTENGO: €${kept.price}`);
    removed.forEach(p => {
      console.log(`   ❌ ELIMINO: €${p.price}`);
    });

    toKeep.push(kept);
    toRemove.push(...removed);
  }
});

// Crea nuovo catalogo solo con prodotti da mantenere
const newCatalog = toKeep.map(p => {
  // Rimuovi il campo originalIndex aggiunto per il tracking
  const { originalIndex, ...product } = p;
  return product;
});

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(newCatalog, null, 2));

console.log(`\n\n✅ COMPLETATO!`);
console.log(`📦 Prodotti prima: ${before}`);
console.log(`❌ Prodotti eliminati: ${toRemove.length}`);
console.log(`✅ Prodotti rimanenti: ${newCatalog.length}`);
