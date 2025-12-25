const fs = require('fs');

console.log('=== ANALISI PRODOTTI AW - NATURAL WELLNESS ===\n');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

const awNW = products.filter(p =>
  p.source === 'aw' &&
  p.category &&
  (p.category.includes('Natural Wellness') || p.category.includes('natural-wellness'))
);

console.log('Totale prodotti AW in Natural Wellness:', awNW.length);
console.log('\n--- PROBLEMI ---\n');

const noPrice = awNW.filter(p => !p.price || p.price === 0);
const noImages = awNW.filter(p => !p.images || p.images.length === 0);
const noNameIT = awNW.filter(p => !p.name_it);
const noDescIT = awNW.filter(p => !p.description_it);

console.log('❌ Senza prezzo o prezzo = 0:', noPrice.length);
console.log('❌ Senza immagini:', noImages.length);
console.log('❌ Senza nome tradotto IT:', noNameIT.length);
console.log('❌ Senza descrizione tradotta IT:', noDescIT.length);

console.log('\n--- ESEMPI PRODOTTI CON PROBLEMI ---\n');

if (noPrice.length > 0) {
  console.log('🔴 Esempio prodotto SENZA PREZZO:');
  const ex = noPrice[0];
  console.log('  ID:', ex.id);
  console.log('  SKU:', ex.sku);
  console.log('  Nome:', ex.name);
  console.log('  Prezzo:', ex.price);
  console.log('  PVD:', ex.pvd);
  console.log('  Retail Price:', ex.retail_price);
  console.log('  Wholesale Price:', ex.wholesale_price);
  console.log('');
}

if (noImages.length > 0) {
  console.log('🔴 Esempio prodotto SENZA IMMAGINI:');
  const ex = noImages[0];
  console.log('  ID:', ex.id);
  console.log('  Nome:', ex.name);
  console.log('  Images:', ex.images);
  console.log('  Image:', ex.image);
  console.log('');
}

if (noNameIT.length > 0) {
  console.log('🔴 Esempio prodotto SENZA TRADUZIONE NOME:');
  const ex = noNameIT[0];
  console.log('  ID:', ex.id);
  console.log('  Nome EN:', ex.name);
  console.log('  Nome IT:', ex.name_it);
  console.log('');
}

console.log('\n--- ESEMPI PRODOTTI OK ---\n');

const okProducts = awNW.filter(p => p.price > 0 && p.images && p.images.length > 0);
if (okProducts.length > 0) {
  console.log('✅ Esempio prodotto OK:');
  const ex = okProducts[0];
  console.log('  ID:', ex.id);
  console.log('  Nome:', ex.name);
  console.log('  Nome IT:', ex.name_it || '(manca)');
  console.log('  Prezzo:', ex.price);
  console.log('  Immagini:', ex.images.length);
  console.log('  Prima immagine:', ex.images[0]);
  console.log('');
}

console.log('=== FINE ANALISI ===');
