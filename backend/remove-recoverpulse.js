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
let removed = 0;

// Trova tutti i RECOVERYPULSE / RecoverPulse
const recoverPulseProducts = catalog.filter(p =>
  p.name && (p.name.includes('RECOVERYPULSE') || p.name.includes('RecoverPulse'))
);

console.log(`Trovati ${recoverPulseProducts.length} prodotti RecoverPulse:`);
recoverPulseProducts.forEach((p, i) => {
  console.log(`${i+1}. ${p.name} - €${p.price}`);
  const img = (p.image || p.images?.[0] || 'nessuna').substring(0, 80);
  console.log(`   ${img}`);
});

// Mantieni solo il primo, rimuovi gli altri
if (recoverPulseProducts.length > 1) {
  const toKeep = recoverPulseProducts[0];
  const toRemoveNames = recoverPulseProducts.slice(1).map(p => p.name);

  console.log(`\n✅ MANTENGO: ${toKeep.name}`);
  console.log(`❌ ELIMINO ${toRemoveNames.length} duplicati:`);
  toRemoveNames.forEach(name => console.log(`   - ${name}`));

  // Filtra il catalogo
  catalog = catalog.filter(p => {
    const isRecoverPulse = p.name && (p.name.includes('RECOVERYPULSE') || p.name.includes('RecoverPulse'));
    if (isRecoverPulse && p.name !== toKeep.name) {
      removed++;
      return false; // Rimuovi
    }
    return true; // Mantieni
  });
}

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n\n✅ COMPLETATO!`);
console.log(`📦 Prodotti prima: ${before}`);
console.log(`❌ Prodotti eliminati: ${removed}`);
console.log(`✅ Prodotti rimanenti: ${catalog.length}`);
