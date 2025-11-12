const fs = require('fs');
const path = require('path');

// Leggi il file JSON
const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Prodotti iniziali: ${products.length}`);

// Parole chiave da RIMUOVERE (case-insensitive)
const keywordsToRemove = [
  'pipedream',
  'body dock',
  'batterie ricaricabili',
  'batterie',
  'barbecue',
  'cavo usb',
  'scopa',
  'trixie',           // Tutti i prodotti per animali
  'incasso',
  'tavolo da pranzo',
  'tavolo',
  'bosch',
  'multi utensile',
  'estensore',
  'gabbia'
];

// Filtra i prodotti
const filteredProducts = products.filter(product => {
  const productName = product.name.toLowerCase();
  const productDesc = (product.description || '').toLowerCase();
  const productBrand = (product.brand || '').toLowerCase();

  // Se il prodotto contiene una delle parole chiave, lo rimuoviamo
  for (const keyword of keywordsToRemove) {
    if (productName.includes(keyword.toLowerCase()) ||
        productDesc.includes(keyword.toLowerCase()) ||
        productBrand.includes(keyword.toLowerCase())) {
      console.log(`❌ Rimosso: ${product.name}`);
      return false; // Rimuovi questo prodotto
    }
  }

  return true; // Mantieni questo prodotto
});

console.log(`\n✅ Prodotti rimanenti: ${filteredProducts.length}`);
console.log(`🗑️  Prodotti eliminati: ${products.length - filteredProducts.length}`);

// Salva il file filtrato
fs.writeFileSync(jsonPath, JSON.stringify(filteredProducts, null, 2), 'utf-8');
console.log(`\n💾 File salvato: ${jsonPath}`);
