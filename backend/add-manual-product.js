const fs = require('fs');
const path = require('path');

// Prodotto da aggiungere: Lampada da Terra Home ESPRIT
const newProduct = {
  "id": "S3057894",
  "name": "Lampada da Terra Home ESPRIT Marrone 23 x 23 x 65 cm",
  "description": "Elegante lampada da terra della collezione Home ESPRIT. Design moderno e funzionale, perfetta per illuminare qualsiasi ambiente con stile.",
  "brand": "Home ESPRIT",
  "category": "2399,2400,2421",
  "price": 34.23,
  "pvd": 24.99,
  "stock": 53,
  "images": [
    "https://cdnbigbuy.com/images/8424002146917_S3057894_P01.jpg",
    "https://cdnbigbuy.com/images/8424002146917_S3057894_P02.jpg",
    "https://cdnbigbuy.com/images/8424002146917_S3057894_P03.jpg",
    "https://cdnbigbuy.com/images/8424002146917_S3057894_P04.jpg"
  ],
  "imageCount": 4,
  "video": "0",
  "ean": "8424002146917",
  "width": "23",
  "height": "65",
  "depth": "23",
  "weight": "",
  "raw": {
    "ID": "S3057894",
    "CATEGORY": "2399,2400,2421",
    "NAME": "Lampada da Terra Home ESPRIT Marrone 23 x 23 x 65 cm",
    "DESCRIPTION": "Elegante lampada da terra della collezione Home ESPRIT. Design moderno e funzionale.",
    "BRAND": "Home ESPRIT",
    "PRICE": "34.23",
    "PVD": "24.99",
    "STOCK": "53",
    "EAN13": "8424002146917",
    "WIDTH": "23",
    "HEIGHT": "65",
    "DEPTH": "23"
  }
};

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

// Verifica se il prodotto esiste già
const exists = catalog.find(p => p.id === newProduct.id);
if (exists) {
  console.log(`⚠️  Prodotto ${newProduct.id} già esistente`);
  process.exit(0);
}

// Aggiungi il prodotto
catalog.push(newProduct);

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`✅ Prodotto aggiunto con successo!`);
console.log(`📦 Catalogo aggiornato: ${catalog.length} prodotti`);
console.log(`\n💡 ${newProduct.name}`);
console.log(`   SKU: ${newProduct.id}`);
console.log(`   Prezzo: €${newProduct.price}`);
console.log(`   Stock: ${newProduct.stock}`);
console.log(`   Categoria: ${newProduct.category} (Lampade e Luci LED)`);
