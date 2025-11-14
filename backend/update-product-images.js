const fs = require('fs');
const path = require('path');

const productId = "S3057894";
const images = [
  "https://cdnbigbuy.com/images/8424002146917_S3057894_P01.jpg",
  "https://cdnbigbuy.com/images/8424002146917_S3057894_P02.jpg",
  "https://cdnbigbuy.com/images/8424002146917_S3057894_P03.jpg",
  "https://cdnbigbuy.com/images/8424002146917_S3057894_P04.jpg"
];

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

// Trova e aggiorna il prodotto
const productIndex = catalog.findIndex(p => p.id === productId);
if (productIndex === -1) {
  console.log(`❌ Prodotto ${productId} non trovato`);
  process.exit(1);
}

console.log(`✅ Prodotto trovato: ${catalog[productIndex].name}`);
console.log(`   Immagini prima: ${catalog[productIndex].imageCount || 0}`);

// Aggiorna le immagini
catalog[productIndex].images = images;
catalog[productIndex].imageCount = images.length;

// Aggiorna anche il raw se esiste
if (catalog[productIndex].raw) {
  catalog[productIndex].raw.IMAGE1 = images[0] || "";
  catalog[productIndex].raw.IMAGE2 = images[1] || "";
  catalog[productIndex].raw.IMAGE3 = images[2] || "";
  catalog[productIndex].raw.IMAGE4 = images[3] || "";
}

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`✅ Prodotto aggiornato!`);
console.log(`   Immagini dopo: ${catalog[productIndex].imageCount}`);
console.log(`\n💡 ${catalog[productIndex].name}`);
console.log(`   ID: ${catalog[productIndex].id}`);
console.log(`   Immagini: ${images.length}`);
images.forEach((img, i) => {
  console.log(`   ${i + 1}. ${img}`);
});
