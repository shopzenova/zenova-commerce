require('dotenv').config();
const axios = require('axios');

const BIGBUY_API_URL = process.env.BIGBUY_API_URL;
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

const bigbuyAPI = axios.create({
  baseURL: BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

(async () => {
  console.log('\n🧪 TEST API BIGBUY - Singolo prodotto');
  console.log('=====================================\n');

  // SKU menzionato dall'utente: S0421974
  const testProductId = 421974; // Rimossi gli zeri iniziali

  console.log(`Testo con ID: ${testProductId} (Giradischi Denver)\n`);

  try {
    // IMPORTANTE: endpoint corretto con body format { products: [...] }
    const response = await bigbuyAPI.post('/rest/catalog/productsstock.json', {
      products: [testProductId]
    });

    console.log('✅ Risposta API:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Errore API:');
    console.error('   Status:', error.response?.status);
    console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('   Message:', error.message);
  }
})();
