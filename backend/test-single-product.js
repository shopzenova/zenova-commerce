const axios = require('axios');
require('dotenv').config();

async function testSingleProduct() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';
  const testSku = 'M0311542'; // Auricolari Corsair

  console.log(`🔍 Test prodotto SKU: ${testSku}\n`);

  try {
    const response = await axios.get(`${baseURL}/rest/catalog/products.json`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: {
        isoCode: 'it',
        sku: testSku
      },
      timeout: 30000
    });

    console.log('✅ Risposta API ricevuta\n');
    console.log('📦 DATI COMPLETI:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && response.data.length > 0) {
      const product = response.data[0];
      console.log('\n📊 RIEPILOGO:');
      console.log(`Nome: ${product.name}`);
      console.log(`Prezzo retail: ${product.retailPrice}`);
      console.log(`Prezzo wholesale: ${product.wholesalePrice}`);
      console.log(`Prezzo (price): ${product.price}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Brand: ${product.brand}`);
      console.log(`Categoria: ${product.category}`);
      console.log(`Immagini: ${product.images?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSingleProduct();
