/**
 * Test connessione AW Dropship API
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

async function testAWConnection() {
  console.log('🔧 Test connessione AW Dropship...\n');

  const awClient = new AWDropshipClient();

  try {
    // Test 1: Ottenere categorie
    console.log('📋 Test 1: Ottenere lista categorie...');
    const categories = await awClient.getCategories();
    console.log(`✅ Categorie ricevute: ${categories.length}`);
    console.log('\n📦 Prime 10 categorie:');
    categories.slice(0, 10).forEach(cat => {
      console.log(`   - ${cat.name || cat.slug}: ${cat.products_count || '?'} prodotti`);
    });

    // Test 2: Ottenere prodotti (prima pagina)
    console.log('\n\n📦 Test 2: Ottenere prima pagina prodotti...');
    const products = await awClient.getProducts(1, 10);
    console.log(`✅ Prodotti ricevuti: ${products.data.length}`);
    console.log(`📊 Paginazione: pagina ${products.pagination.currentPage} di ${products.pagination.lastPage}`);
    console.log(`📊 Totale prodotti disponibili: ${products.pagination.total}`);

    console.log('\n🛍️  Primi 3 prodotti:');
    products.data.slice(0, 3).forEach(prod => {
      console.log(`   - [${prod.id}] ${prod.name}`);
      console.log(`     Prezzo: €${prod.price || '?'}`);
      console.log(`     Categoria: ${prod.category || 'N/A'}`);
    });

    // Test 3: Dettaglio singolo prodotto
    if (products.data.length > 0) {
      const firstProduct = products.data[0];
      console.log(`\n\n📝 Test 3: Dettaglio prodotto ${firstProduct.id}...`);
      const productDetail = await awClient.getProduct(firstProduct.id);

      if (productDetail) {
        console.log(`✅ Prodotto: ${productDetail.name}`);
        console.log(`   Descrizione: ${(productDetail.description || '').substring(0, 100)}...`);
        console.log(`   Stock: ${productDetail.stock || 'N/A'}`);
        console.log(`   Immagini: ${productDetail.images?.length || 0}`);
      }
    }

    console.log('\n\n✅ ✅ ✅ TUTTI I TEST COMPLETATI CON SUCCESSO! ✅ ✅ ✅\n');

    // Riepilogo
    console.log('📊 RIEPILOGO:');
    console.log(`   - Categorie disponibili: ${categories.length}`);
    console.log(`   - Prodotti totali: ${products.pagination.total}`);
    console.log(`   - API funzionante: ✅`);

  } catch (error) {
    console.error('\n❌ ERRORE durante i test:', error.message);
    console.error('\nDettagli:', error.response?.data || error);
    process.exit(1);
  }
}

// Esegui i test
testAWConnection().then(() => {
  console.log('\n🎉 Test completati, premi CTRL+C per uscire\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
