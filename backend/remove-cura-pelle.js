const fs = require('fs');
const path = require('path');

// Leggi il file JSON
const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Prodotti iniziali: ${products.length}`);

let removedCount = 0;

// Rimuovi prodotti cura della pelle (crema, essenza, protezione solare)
const filteredProducts = products.filter(product => {
  const productName = product.name.toLowerCase();

  const isCuraPelle = productName.includes('crema') ||
                      productName.includes('essenza') ||
                      productName.includes('protezione solare');

  if (isCuraPelle) {
    console.log(`❌ Rimosso: ${product.name}`);
    removedCount++;
    return false; // Rimuovi
  }

  return true; // Mantieni
});

console.log(`\n✅ Prodotti rimanenti: ${filteredProducts.length}`);
console.log(`🗑️  Prodotti eliminati: ${removedCount}`);

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(filteredProducts, null, 2), 'utf-8');
console.log(`💾 File salvato: ${jsonPath}`);
