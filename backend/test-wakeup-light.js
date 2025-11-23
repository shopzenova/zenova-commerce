const { categorizeProduct, getProductSubcategory } = require('./config/category-mapping');

// Simula prodotto Wake-up light
const wakeUpLight = {
  name: 'Wake-up Light Sveglia con Simulazione Alba',
  description: 'Lampada sveglia con luce progressiva e simulazione alba naturale. Funzione smart light con radio FM e suoni naturali.',
  sku: 'V0103570'
};

console.log('🧪 TEST CATEGORIZZAZIONE WAKE-UP LIGHT\n');
console.log('Prodotto:', wakeUpLight.name);
console.log('Descrizione:', wakeUpLight.description);
console.log('\n' + '='.repeat(60));

const categories = categorizeProduct(wakeUpLight);
const subcategory = getProductSubcategory(wakeUpLight);

console.log('\n📍 RISULTATO CATEGORIZZAZIONE:');
console.log('Categorie matchate:', categories);
console.log('Sottocategoria principale:', subcategory);

if (categories.includes('exclude')) {
  console.log('\n❌ Prodotto ESCLUSO (non matcha categorie Zenova)');
} else if (categories.length > 0) {
  console.log('\n✅ Prodotto ACCETTATO');
  console.log('Categoria Zenova:', categories[0]);
} else {
  console.log('\n⚠️ Nessuna categoria trovata');
}
