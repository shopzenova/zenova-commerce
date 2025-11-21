/**
 * Debug: Struttura dati API BigBuy
 */

require('dotenv').config();
const axios = require('axios');

const bigbuyAPI = axios.create({
  baseURL: process.env.BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

async function debugAPI() {
  try {
    console.log('📡 Testing BigBuy API structure...\n');

    const response = await bigbuyAPI.get('/rest/catalog/products.json', {
      params: {
        category: 2507,
        isoCode: 'it',
        pageSize: 5  // Solo 5 prodotti per debug
      }
    });

    console.log('✅ Response received');
    console.log('Total products:', response.data.length);
    console.log('\n📦 SAMPLE PRODUCT STRUCTURE:\n');
    console.log(JSON.stringify(response.data[0], null, 2));

    // Verifica campi disponibili
    const sample = response.data[0];
    console.log('\n🔑 Available fields:');
    Object.keys(sample).forEach(key => {
      console.log(`  - ${key}: ${typeof sample[key]}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.message);
    console.error('Response:', error.response?.data);
  }
}

debugAPI();
