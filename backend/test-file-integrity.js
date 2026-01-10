const fs = require('fs');

// Verifica integrità del file
const filePath = 'data/products.json';

console.log('=== VERIFICA INTEGRITÀ FILE ===\n');

try {
  const stats = fs.statSync(filePath);
  console.log(`Dimensione file: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`Caratteri totali: ${content.length}`);

  const products = JSON.parse(content);
  console.log(`Prodotti caricati: ${products.length}`);

  // Conta prodotti con visible/zone undefined
  const noVisible = products.filter(p => p.visible === undefined).length;
  const noZone = products.filter(p => p.zone === undefined).length;

  console.log(`\nProdotti senza visible: ${noVisible}`);
  console.log(`Prodotti senza zone: ${noZone}`);

  // Verifica le candele specifiche
  const candeleTarget = products.filter(p => p.id && p.id.startsWith('aw-asc'));
  console.log(`\nCandele aw-asc-*: ${candeleTarget.length}`);

  if (candeleTarget.length > 0) {
    const c = candeleTarget[0];
    console.log(`\nPrima candela (${c.id}):`);
    console.log(`  visible: ${c.visible}`);
    console.log(`  zone: ${c.zone}`);
    console.log(`  source: ${c.source}`);

    // Verifica tutte
    const tutteOk = candeleTarget.every(p => p.visible === true && p.zone === 'sidebar' && p.source === 'aw');
    console.log(`\nTutte le candele aw-asc hanno campi corretti: ${tutteOk ? '✅' : '❌'}`);
  }

  console.log('\n✅ File integro e valido!\n');

} catch (error) {
  console.error('❌ Errore:', error.message);
}
