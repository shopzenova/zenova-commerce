/**
 * Test paginazione AW - verifica se ci sono più prodotti oltre i primi 100
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

async function testPagination() {
  console.log('📄 Test paginazione AW...\n');

  const awClient = new AWDropshipClient();

  try {
    // Prova diverse pagine
    for (let page = 1; page <= 3; page++) {
      console.log(`\n📄 Pagina ${page}:`);
      const result = await awClient.getProducts(page, 10);

      console.log(`   Prodotti ricevuti: ${result.data.length}`);
      console.log(`   Paginazione:`);
      console.log(`     - currentPage: ${result.pagination.currentPage}`);
      console.log(`     - lastPage: ${result.pagination.lastPage}`);
      console.log(`     - total: ${result.pagination.total}`);
      console.log(`     - perPage: ${result.pagination.perPage}`);

      if (result.data.length > 0) {
        console.log(`   Primi 2 prodotti:`);
        result.data.slice(0, 2).forEach(p => {
          console.log(`     - [${p.code}] ${p.name.substring(0, 60)}...`);
        });
      }

      // Se non ci sono prodotti o è l'ultima pagina, ferma
      if (result.data.length === 0 || page >= result.pagination.lastPage) {
        console.log(`\n⚠️  Raggiunta ultima pagina o nessun prodotto`);
        break;
      }

      // Attendi tra le richieste
      await new Promise(r => setTimeout(r, 2500));
    }

    console.log('\n✅ Test paginazione completato!\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

testPagination().then(() => {
  process.exit(0);
});
