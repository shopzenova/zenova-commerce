const fs = require('fs');
const path = require('path');

// Carica catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log('📦 Prodotti attuali:', products.length);
console.log('');

// Prodotto di TEST Smart Living
const testProduct = {
  "id": "TEST-SMART-001",
  "name": "Lampadina LED Smart WiFi RGB - TEST",
  "description": "<p>Lampadina LED smart controllabile via WiFi con 16 milioni di colori. Compatibile con Alexa e Google Home. <b>PRODOTTO DI TEST</b></p>",
  "brand": "TEST",
  "category": "2421",
  "subcategory": "2421",
  "zenovaCategory": "smart-living",
  "zenovaSubcategory": "illuminazione-smart",
  "price": 19.99,
  "retailPrice": 29.99,
  "wholesalePrice": 15.00,
  "stock": 100,
  "images": [
    "https://via.placeholder.com/500x500?text=Smart+LED+Bulb"
  ],
  "image": "https://via.placeholder.com/500x500?text=Smart+LED+Bulb",
  "ean": "0000000000001",
  "weight": 0.15,
  "dimensions": {
    "width": 6,
    "height": 12,
    "depth": 6
  },
  "active": true
};

// Verifica se esiste già
const exists = products.find(p => p.id === testProduct.id);
if (exists) {
  console.log('⚠️  Prodotto TEST già presente, lo rimuovo...');
  const filtered = products.filter(p => p.id !== testProduct.id);
  products.length = 0;
  products.push(...filtered);
}

// Aggiungi prodotto test
products.push(testProduct);

// Salva catalogo
fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));

console.log('✅ Prodotto TEST aggiunto!');
console.log('');
console.log('📋 Dettagli:');
console.log('   ID:', testProduct.id);
console.log('   Nome:', testProduct.name);
console.log('   Categoria:', testProduct.zenovaCategory);
console.log('   Sottocategoria:', testProduct.zenovaSubcategory);
console.log('   Prezzo: €' + testProduct.price);
console.log('   Stock:', testProduct.stock);
console.log('');
console.log('📦 Totale prodotti ora:', products.length);
console.log('');
console.log('🔍 Verifica categorie:');
const categories = {};
products.forEach(p => {
  const cat = p.zenovaCategory || 'senza-categoria';
  categories[cat] = (categories[cat] || 0) + 1;
});
Object.entries(categories).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  const icon = cat === 'smart-living' ? '🏠' : cat === 'beauty' ? '💄' : cat === 'health-personal-care' ? '🏥' : '📦';
  console.log(`   ${icon} ${cat}: ${count}`);
});
