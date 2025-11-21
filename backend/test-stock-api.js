/**
 * Test diversi endpoint BigBuy per stock
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

async function testStockEndpoints() {
  console.log('🧪 TEST ENDPOINT STOCK BIGBUY\n');

  // Test 1: Stock per singolo prodotto (GET)
  console.log('Test 1: Stock singolo prodotto (GET)...');
  try {
    const response = await bigbuyAPI.get('/rest/catalog/productstockavailable/123.json');
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Errore:', error.response?.status, error.message);
  }

  // Test 2: Stock multipli con array di ID
  console.log('\nTest 2: Stock multipli (POST con array)...');
  try {
    const response = await bigbuyAPI.post('/rest/catalog/productstockavailable.json', [
      123, 456, 789
    ]);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Errore:', error.response?.status, error.message);
  }

  // Test 3: Stock con oggetto products
  console.log('\nTest 3: Stock con oggetto products...');
  try {
    const response = await bigbuyAPI.post('/rest/catalog/productstockavailable.json', {
      products: [123, 456, 789]
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Errore:', error.response?.status, error.message);
  }

  // Test 4: Lista catalogo con stock
  console.log('\nTest 4: Catalogo prodotti con stock (GET)...');
  try {
    const response = await bigbuyAPI.get('/rest/catalog/products.json', {
      params: {
        category: 2507,
        isoCode: 'it',
        pageSize: 10
      }
    });
    console.log('✅ Success: ricevuti', response.data.length, 'prodotti');
    if (response.data[0]) {
      console.log('Esempio prodotto:', {
        id: response.data[0].id,
        sku: response.data[0].sku,
        active: response.data[0].active,
        wholesalePrice: response.data[0].wholesalePrice,
        retailPrice: response.data[0].retailPrice
      });
    }
  } catch (error) {
    console.log('❌ Errore:', error.response?.status, error.message);
  }

  // Test 5: Stock disponibile per categoria
  console.log('\nTest 5: Stock per categoria...');
  try {
    const response = await bigbuyAPI.get('/rest/catalog/stockavailable.json', {
      params: {
        category: 2507,
        pageSize: 10
      }
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Errore:', error.response?.status, error.message);
  }
}

testStockEndpoints();
