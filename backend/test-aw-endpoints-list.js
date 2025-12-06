/**
 * Prova vari endpoint per trovare categorie e struttura catalogo
 */
require('dotenv').config();
const axios = require('axios');

const baseURL = process.env.AW_API_URL;
const token = process.env.AW_API_TOKEN;

const client = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

async function testEndpoints() {
  console.log('🔧 Test endpoint per categorie AW...\n');

  const endpoints = [
    '/dropshipping/departments',
    '/dropshipping/families',
    '/dropshipping/categories',
    '/dropshipping/catalogue',
    '/dropshipping/shops',
    '/departments',
    '/families',
    '/catalogue',
    '/categories',
    '/dropshipping',
    '/dropshipping/products/departments',
    '/dropshipping/products/families'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 GET ${endpoint}`);
      const response = await client.get(endpoint);

      console.log(`✅ SUCCESSO! Status: ${response.status}`);
      console.log(`   Tipo dato: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);

      if (Array.isArray(response.data)) {
        console.log(`   Elementi: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log(`   Primo elemento:`, JSON.stringify(response.data[0], null, 2).substring(0, 300));
        }
      } else if (response.data && typeof response.data === 'object') {
        console.log(`   Keys:`, Object.keys(response.data).join(', '));
        console.log(`   Dati:`, JSON.stringify(response.data, null, 2).substring(0, 300));
      }

    } catch (error) {
      console.log(`❌ ${error.response?.status || 'ERR'}: ${error.response?.data?.message || error.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Test completati\n');
}

testEndpoints().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
