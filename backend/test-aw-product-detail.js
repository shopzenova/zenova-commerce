/**
 * Test dettaglio singolo prodotto AW per vedere struttura completa
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

async function testProductDetail() {
  console.log('🔍 Test dettaglio prodotto AW...\n');

  const awClient = new AWDropshipClient();

  try {
    // Prendi un prodotto dalla lista
    const products = await awClient.getProducts(1, 5);
    console.log(`📦 Trovati ${products.data.length} prodotti\n`);

    if (products.data.length > 0) {
      const firstProduct = products.data[0];
      console.log(`🔍 Scaricamento dettagli per prodotto: ${firstProduct.id}`);
      console.log(`   Nome: ${firstProduct.name}`);
      console.log(`   Code: ${firstProduct.code}\n`);

      // Ottieni dettaglio completo
      const detail = await awClient.getProduct(firstProduct.id);

      console.log('📋 DETTAGLIO COMPLETO:');
      console.log(JSON.stringify(detail, null, 2));

      console.log('\n\n✅ Test completato!\n');
    }

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testProductDetail().then(() => {
  process.exit(0);
});
