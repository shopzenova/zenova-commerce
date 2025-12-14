/**
 * Aggiungi campo "source" a tutti i prodotti
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'top-100-products.json');

console.log('📦 Aggiunta campo "source" ai prodotti...\n');

try {
  // Leggi file
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const products = JSON.parse(rawData);

  console.log(`📊 Trovati ${products.length} prodotti`);

  // Aggiungi campo source e bigbuyId a ogni prodotto
  let updated = 0;
  products.forEach(product => {
    if (!product.source) {
      product.source = 'bigbuy';
      product.bigbuyId = product.id;
      updated++;
    }
  });

  // Salva file
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));

  console.log(`✅ Aggiornati ${updated} prodotti`);
  console.log(`💾 File salvato: ${jsonPath}\n`);

} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
