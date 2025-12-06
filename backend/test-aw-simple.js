/**
 * Test semplice AW Dropship - prova vari endpoint
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
  console.log('🔧 Test vari endpoint AW...\n');

  // Prova 1: Endpoint base prodotti
  const endpoints = [
    '/dropshipping/products',
    '/dropshipping/products?per_page=10',
    '/dropshipping/products?sort=name',
    '/dropshipping/products?per_page=10&sort=name',
    '/dropshipping/products/my-products',
    '/products',
    '/dropshipping'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Tentativo: GET ${endpoint}`);
      const response = await client.get(endpoint);

      console.log(`✅ SUCCESSO!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Dati ricevuti:`, JSON.stringify(response.data, null, 2).substring(0, 500));

      // Se funziona, fermati qui
      console.log('\n\n🎉 TROVATO ENDPOINT FUNZIONANTE!');
      console.log(`👉 Usa: ${endpoint}`);
      break;

    } catch (error) {
      console.log(`❌ Errore: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Attendi un po' tra le richieste
    await new Promise(r => setTimeout(r, 2000));
  }
}

testEndpoints().then(() => {
  console.log('\n✅ Test completati\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
