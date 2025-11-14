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

// Funzione per normalizzare il nome del prodotto
function normalizeName(name) {
  if (!name) return '';
  // Converti in maiuscolo e rimuovi spazi extra
  return name.toUpperCase().trim().replace(/\s+/g, ' ');
}

// Raggruppa prodotti per nome normalizzato
const byName = {};
catalog.forEach((p, idx) => {
  const normalizedName = normalizeName(p.name);
  if (!byName[normalizedName]) {
    byName[normalizedName] = [];
  }
  byName[normalizedName].push({ ...p, originalIndex: idx });
});

// Identifica prodotti da mantenere
const toKeep = [];
const toRemove = [];

Object.entries(byName).forEach(([normalizedName, products]) => {
  if (products.length === 1) {
    // Nessun duplicato, mantieni
    toKeep.push(products[0]);
  } else {
    // Duplicati trovati
    console.log(`🔄 Duplicato trovato: ${products[0].name}`);
    console.log(`   Trovate ${products.length} varianti\n`);

    products.forEach((p, i) => {
      const img = (p.image || p.images?.[0] || 'nessuna').substring(0, 80);
      console.log(`   [${i+1}] €${p.price} - ${img}`);
    });

    // Mantieni il primo
    const kept = products[0];
    const removed = products.slice(1);

    console.log(`\n   ✅ MANTENGO il primo`);
    console.log(`   ❌ ELIMINO ${removed.length} duplicati\n`);

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

console.log(`\n✅ COMPLETATO!`);
console.log(`📦 Prodotti prima: ${before}`);
console.log(`❌ Prodotti eliminati: ${toRemove.length}`);
console.log(`✅ Prodotti rimanenti: ${newCatalog.length}`);
