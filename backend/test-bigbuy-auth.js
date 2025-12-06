// Test autenticazione BigBuy e vari endpoint
require('dotenv').config();
const axios = require('axios');

const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;
const BIGBUY_API_URL = 'https://api.bigbuy.eu';

async function testEndpoint(name, method, endpoint, data = null) {
  try {
    console.log(`\n🔍 Test ${name}...`);
    console.log(`   ${method} ${endpoint}`);

    const config = {
      headers: {
        'Authorization': `Bearer ${BIGBUY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    let response;
    if (method === 'GET') {
      response = await axios.get(`${BIGBUY_API_URL}${endpoint}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${BIGBUY_API_URL}${endpoint}`, data, config);
    }

    console.log(`✅ SUCCESS - Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data).substring(0, 200));
    return true;

  } catch (error) {
    console.log(`❌ FAILED - ${error.response?.status || 'NO_RESPONSE'}: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('TEST AUTENTICAZIONE BIGBUY API');
  console.log('========================================');
  console.log(`API Key: ${BIGBUY_API_KEY ? BIGBUY_API_KEY.substring(0, 15) + '...' : 'NON TROVATA'}`);
  console.log('========================================');

  if (!BIGBUY_API_KEY || BIGBUY_API_KEY === 'your_bigbuy_api_key_here') {
    console.error('❌ ERRORE: Chiave API BigBuy non configurata');
    process.exit(1);
  }

  const results = {};

  // Test 1: Carriers (lista corrieri)
  results.carriers = await testEndpoint(
    'Carriers List',
    'GET',
    '/rest/shipping/carriers.json'
  );
  await sleep(1000);

  // Test 2: Categories
  results.categories = await testEndpoint(
    'Categories List',
    'GET',
    '/rest/catalog/categories.json?isoCode=it'
  );
  await sleep(1000);

  // Test 3: Products (primi 5)
  results.products = await testEndpoint(
    'Products List',
    'GET',
    '/rest/catalog/products.json?isoCode=it&pageSize=5&page=1'
  );
  await sleep(1000);

  // Test 4: Single Product Stock
  results.stock = await testEndpoint(
    'Product Stock',
    'GET',
    '/rest/catalog/productstock/1249483.json'
  );
  await sleep(1000);

  // Test 5: Shipping Costs (endpoint problematico)
  results.shipping = await testEndpoint(
    'Shipping Costs',
    'POST',
    '/rest/shipping/costs.json',
    {
      products: [{
        reference: '1249483',
        quantity: 1
      }],
      destination: {
        country: 'IT',
        postcode: '00100'
      }
    }
  );

  console.log('\n========================================');
  console.log('RIEPILOGO RISULTATI');
  console.log('========================================');
  Object.entries(results).forEach(([name, success]) => {
    console.log(`${success ? '✅' : '❌'} ${name.padEnd(15)}`);
  });
  console.log('========================================');

  if (!results.shipping && (results.carriers || results.products)) {
    console.log('\n⚠️  ATTENZIONE:');
    console.log('    Altri endpoint funzionano ma shipping costs NO!');
    console.log('    Possibili cause:');
    console.log('    1. Account BigBuy non ha accesso a shipping API');
    console.log('    2. Formato richiesta shipping errato');
    console.log('    3. Endpoint shipping costs non più disponibile');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
