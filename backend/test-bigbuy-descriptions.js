const axios = require('axios');

const BIGBUY_API_URL = process.env.BIGBUY_API_URL || 'https://api.bigbuy.eu';
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

const client = axios.create({
  baseURL: BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testEndpoints() {
  const testId = 'M0113847'; // Profumo Uomo Givenchy

  const endpoints = [
    { name: 'Product info (SKU)', url: `/rest/catalog/productinformation/${testId}.json`, params: { isoCode: 'it' } },
    { name: 'Product (SKU)', url: `/rest/catalog/product/${testId}.json`, params: { isoCode: 'it' } },
    { name: 'Products batch info', url: '/rest/catalog/productsinformation.json', params: { isoCode: 'it', pageSize: 2, page: 0 } },
    { name: 'Products list', url: '/rest/catalog/products.json', params: { isoCode: 'it', pageSize: 2, page: 1 } },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`\n🔍 Test: ${ep.name}`);
      console.log(`   URL: ${ep.url}`);
      const response = await client.get(ep.url, { params: ep.params });
      const data = response.data;

      if (Array.isArray(data)) {
        console.log(`   ✅ OK - Array di ${data.length} elementi`);
        if (data[0]) {
          console.log(`   Keys: ${Object.keys(data[0]).join(', ')}`);
          if (data[0].description) console.log(`   Description: ${String(data[0].description).substring(0, 150)}`);
          if (data[0].descriptions) console.log(`   Descriptions: ${JSON.stringify(data[0].descriptions).substring(0, 200)}`);
        }
      } else if (typeof data === 'object') {
        console.log(`   ✅ OK - Object`);
        console.log(`   Keys: ${Object.keys(data).join(', ')}`);
        if (data.description) console.log(`   Description: ${String(data.description).substring(0, 150)}`);
        if (data.descriptions) console.log(`   Descriptions: ${JSON.stringify(data.descriptions).substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 150)}`);
      }
    }
    await delay(3000);
  }
}

testEndpoints().catch(e => console.error(e));
