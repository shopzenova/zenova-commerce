const axios = require('axios');

const BIGBUY_API_KEY = 'NmU4OGIwNzk4N2NhNDY4ODQ0ZTU5ZDYwYWZmNTVhNjkyMWIyNTI2YWE3MGE4YzFiMzZhMjVhYWE1NmMzNmU3Mg';
const BIGBUY_API_URL = 'https://api.bigbuy.eu';

async function testStock() {
  try {
    console.log('🔍 Testing BigBuy API with GEL-06 (prodotto AW che non esiste su BigBuy)...\n');

    const response = await axios.post(
      `${BIGBUY_API_URL}/rest/catalog/productsstock.json`,
      { products: ['GEL-06'] },
      {
        headers: {
          'Authorization': `Bearer ${BIGBUY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Risposta BigBuy:');
    console.log(JSON.stringify(response.data, null, 2));

    const stocks = response.data.stocks || [];
    const gel06Stock = stocks.find(s => s.productId === 'GEL-06');

    console.log('\n📊 Analisi GEL-06:');
    console.log('- Trovato in risposta:', !!gel06Stock);
    if (gel06Stock) {
      console.log('- Available:', gel06Stock.available);
      console.log('- Quantity:', gel06Stock.quantity);
    }

  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

testStock();
