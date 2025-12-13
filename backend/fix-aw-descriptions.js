const fs = require('fs');

// Carica backup e file corrente
const backup = require('./top-100-products.backup-pretraduzione-20251212-174835.json');
const current = require('./top-100-products.json');

console.log('🔧 RIPRISTINO DESCRIZIONI PRODOTTI AW\n');

let fixed = 0;
let errors = 0;

// Crea mappa del backup per accesso veloce
const backupMap = new Map();
backup.forEach(p => backupMap.set(p.id, p));

// Ripristina descrizioni danneggiate
current.forEach(product => {
  if (product.id && product.id.startsWith('AW')) {
    // Se ha l'errore MyMemory
    if (product.description?.includes('MYMEMORY WARNING')) {
      const originalProduct = backupMap.get(product.id);

      if (originalProduct) {
        product.description = originalProduct.description;
        product.name = originalProduct.name; // Ripristina anche il nome
        fixed++;
        console.log(`✅ Ripristinato: ${product.id} - ${product.name.substring(0, 60)}`);
      } else {
        errors++;
        console.log(`❌ Non trovato nel backup: ${product.id}`);
      }
    }
  }
});

console.log('\n==================================');
console.log('📊 RIEPILOGO:');
console.log(`✅ Descrizioni ripristinate: ${fixed}`);
console.log(`❌ Errori: ${errors}`);

// Salva file riparato
fs.writeFileSync('top-100-products.json', JSON.stringify(current, null, 2), 'utf8');
console.log('\n💾 File salvato: top-100-products.json');
console.log('🎉 FATTO!');
