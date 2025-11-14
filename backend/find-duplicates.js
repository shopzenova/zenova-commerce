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

// Raggruppa prodotti per immagine principale
const byImage = {};
catalog.forEach((p, idx) => {
  const img = p.image || (p.images && p.images[0]) || 'no-image';
  if (!byImage[img]) {
    byImage[img] = [];
  }
  byImage[img].push({ ...p, originalIndex: idx });
});

// Trova gruppi di duplicati (stessa immagine)
const duplicateGroups = Object.entries(byImage)
  .filter(([img, products]) => products.length > 1)
  .sort((a, b) => b[1].length - a[1].length); // Ordina per numero di duplicati

console.log(`🔍 Gruppi di duplicati trovati: ${duplicateGroups.length}\n`);

let totalDuplicatesToRemove = 0;

// Mostra i primi 15 gruppi
duplicateGroups.slice(0, 15).forEach(([img, products], groupIdx) => {
  console.log(`\n--- GRUPPO ${groupIdx + 1} (${products.length} prodotti) ---`);
  console.log(`Immagine: ${img.substring(0, 100)}...`);

  products.forEach((p, i) => {
    console.log(`  [${i}] ${p.name}`);
    console.log(`      Prezzo: €${p.price} | Cat: ${p.category || 'N/A'}`);
    if (p.sku) console.log(`      SKU: ${p.sku}`);
  });

  console.log(`  ⚠️  Da eliminare: ${products.length - 1} duplicati`);
  totalDuplicatesToRemove += products.length - 1;
});

console.log(`\n\n📊 RIEPILOGO:`);
console.log(`   Prodotti totali: ${catalog.length}`);
console.log(`   Gruppi di duplicati: ${duplicateGroups.length}`);
console.log(`   Prodotti da eliminare: ${totalDuplicatesToRemove} (mostrati primi 15 gruppi)`);

// Calcola totale da eliminare
const totalToRemove = duplicateGroups.reduce((sum, [img, products]) =>
  sum + (products.length - 1), 0
);

console.log(`   Totale da eliminare (tutti): ${totalToRemove}`);
console.log(`   Prodotti rimanenti: ${catalog.length - totalToRemove}`);
