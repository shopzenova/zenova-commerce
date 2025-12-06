/**
 * Test endpoint singolo prodotto per vedere se ha più dettagli
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

async function testSingleProduct() {
  console.log('🔍 Test prodotto singolo AW per dettagli completi...\n');

  const awClient = new AWDropshipClient();

  try {
    // Test con alcuni product ID per vedere la struttura completa
    const productIds = [187060, 187050, 187007]; // Bay Leaf, Aniseed, Basil

    for (const productId of productIds) {
      console.log(`\n📦 Richiesta dettagli prodotto ID: ${productId}`);

      const product = await awClient.getProduct(productId);

      if (product) {
        console.log('✅ Dati ricevuti:\n');
        console.log(JSON.stringify(product, null, 2));
      } else {
        console.log('❌ Nessun dato ricevuto');
      }

      await new Promise(r => setTimeout(r, 2500));
    }

    console.log('\n✅ Test completato!\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

testSingleProduct().then(() => {
  process.exit(0);
});
