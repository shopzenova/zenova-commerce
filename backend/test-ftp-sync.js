// Test script per BigBuy FTP Sync
require('dotenv').config();
const bigbuyFTP = require('./src/integrations/BigBuyFTP');
const logger = require('./src/utils/logger');

async function testFTPSync() {
  console.log('\n🔧 Test Sincronizzazione BigBuy FTP\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Connessione FTP
    console.log('\n📡 Test 1: Connessione FTP...');
    const connTest = await bigbuyFTP.testConnection();

    if (connTest.success) {
      console.log(`✅ Connessione OK - ${connTest.folders} cartelle trovate`);
    } else {
      console.log(`❌ Connessione fallita: ${connTest.error}`);
      return;
    }

    // Test 2: Download mapper categorie
    console.log('\n📥 Test 2: Download mapper categorie...');
    const categories = await bigbuyFTP.readCategoryMapper();
    console.log(`✅ ${categories.length} categorie scaricate`);
    console.log('Prime 5 categorie:');
    categories.slice(0, 5).forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });

    // Test 3: Download prodotti categoria benessere (2399)
    console.log('\n📦 Test 3: Download prodotti categoria 2399 (Casa e Giardino)...');
    const products = await bigbuyFTP.readProductsCSV('2399', 'it');
    console.log(`✅ ${products.length} prodotti scaricati`);

    if (products.length > 0) {
      console.log('\nPrimo prodotto:');
      const first = products[0];
      console.log(`  - ID: ${first.id}`);
      console.log(`  - Nome: ${first.name}`);
      console.log(`  - Prezzo: €${first.price}`);
      console.log(`  - Stock: ${first.stock}`);
      console.log(`  - Brand: ${first.brand}`);
    }

    // Test 4: Sincronizzazione multipla
    console.log('\n🔄 Test 4: Sincronizzazione multipla categorie...');
    const syncResult = await bigbuyFTP.syncCategories(['2399'], 'it');
    console.log(`✅ Sincronizzazione completata:`);
    console.log(`  - Prodotti totali: ${syncResult.stats.totalProducts}`);
    console.log(`  - Categorie sync: ${syncResult.stats.categories.length}`);
    syncResult.stats.categories.forEach(cat => {
      console.log(`    • Categoria ${cat.id}: ${cat.productsCount} prodotti`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Tutti i test completati con successo!\n');

  } catch (error) {
    console.error('\n❌ Errore durante i test:', error.message);
    console.error(error.stack);
  }
}

// Esegui test
testFTPSync().then(() => {
  console.log('Test terminato.');
  process.exit(0);
}).catch(error => {
  console.error('Test fallito:', error);
  process.exit(1);
});
