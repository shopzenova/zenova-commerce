// Clear cache first
Object.keys(require.cache).forEach(key => delete require.cache[key]);

const { categorizeProduct, ZENOVA_CATEGORIES } = require('./config/category-mapping');

const product = {
  name: 'Auricolari Wireless TWS',
  description: 'Earbuds Bluetooth con cancellazione rumore'
};

const text = `${product.name} ${product.description}`.toLowerCase();

console.log('🔍 DEBUG AURICOLARI');
console.log('='.repeat(60));
console.log('Prodotto:', product.name);
console.log('Descrizione:', product.description);
console.log('Text completo:', text);
console.log('\n📋 KEYWORD CHECK:');

// Check ogni categoria
for (const [catKey, catData] of Object.entries(ZENOVA_CATEGORIES)) {
  const matchedKeywords = catData.keywords.filter(kw => text.includes(kw.toLowerCase()));
  if (matchedKeywords.length > 0) {
    console.log(`\n✅ ${catKey}:`);
    console.log('   Keyword matchate:', matchedKeywords.join(', '));
  }
}

console.log('\n📍 RISULTATO FINALE:');
const result = categorizeProduct(product);
console.log('Categoria:', result);
