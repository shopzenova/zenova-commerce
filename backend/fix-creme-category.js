const fs = require('fs');
const path = require('path');

// Carica il catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
let catalog = [];

try {
  const data = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
} catch (error) {
  console.log('❌ Errore lettura catalogo:', error.message);
  process.exit(1);
}

let movedCount = 0;

// Sposta i prodotti nelle categorie corrette
catalog.forEach(product => {
  if (product.category === '2501,2540,2546') {
    const name = product.name || '';

    // Massaggiatori -> Massaggio e Rilassamento
    if (name.includes('Massaggiatore')) {
      product.category = '2501,2502,2504';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2501,2502,2504';
      }
      console.log(`➡️  ${name} -> Massaggio e Rilassamento`);
      movedCount++;
    }

    // Profumi -> Fragranze & Profumi
    else if (name.includes('Profumo') || name.includes('Eau de')) {
      product.category = '2507,2508,2510';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2507,2508,2510';
      }
      console.log(`➡️  ${name} -> Fragranze & Profumi`);
      movedCount++;
    }

    // Prodotti per capelli, trucco, accessori vari -> Rimossi (non hanno categoria appropriata)
    else if (name.includes('Capelli') || name.includes('Shampoo') || name.includes('Balsamo') ||
             name.includes('Trucco') || name.includes('Accappatoio') ||
             name.includes('Le Wand') || name.includes('Rasoio') || name.includes('Barba') ||
             name.includes('Ossidante')) {
      // Questi prodotti non hanno una categoria appropriata nel nostro sito
      // Li spostiamo in una categoria generica 2501 (Health & Beauty generale)
      product.category = '2501';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2501';
      }
      console.log(`⚠️  ${name} -> Categoria generica (non visualizzato)`);
      movedCount++;
    }
  }
});

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n✅ Catalogo aggiornato!`);
console.log(`📦 Prodotti spostati: ${movedCount}`);
