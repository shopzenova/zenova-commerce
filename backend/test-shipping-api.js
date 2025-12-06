// Test API BigBuy Shipping per diversi paesi
require('dotenv').config();
const axios = require('axios');

const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;
const BIGBUY_API_URL = 'https://api.bigbuy.eu';

// Test con un prodotto di esempio
const TEST_PRODUCT_EAN = '3473311415653'; // EAN dal database
const TEST_PRODUCT_ID = 'M0100360'; // ID dal database

const TEST_COUNTRIES = [
  { code: 'IT', name: 'Italia' },
  { code: 'CH', name: 'Svizzera' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Germania' },
  { code: 'ES', name: 'Spagna' },
  { code: 'GB', name: 'Regno Unito' },
  { code: 'US', name: 'Stati Uniti' },
  { code: 'PT', name: 'Portogallo' },
  { code: 'NL', name: 'Paesi Bassi' }
];

async function testShippingCost(country) {
  try {
    console.log(`\n🔍 Test spedizione verso: ${country.name} (${country.code})`);

    const response = await axios.post(
      `${BIGBUY_API_URL}/rest/shipping/costs.json`,
      {
        products: [{
          reference: TEST_PRODUCT_EAN,  // Prova con EAN invece di ID
          quantity: 1
        }],
        destination: {
          country: country.code,
          postcode: country.code === 'IT' ? '00100' : ''
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BIGBUY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ Risposta ricevuta:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.shippingCosts && response.data.shippingCosts.length > 0) {
      const cheapest = response.data.shippingCosts.reduce((min, curr) =>
        curr.cost < min.cost ? curr : min
      );
      console.log(`💰 Costo più economico: €${cheapest.cost} (${cheapest.carrierName})`);
      return cheapest.cost;
    } else {
      console.log(`⚠️  Nessuna opzione di spedizione disponibile`);
      return null;
    }

  } catch (error) {
    console.error(`❌ Errore per ${country.name}:`, error.response?.data || error.message);
    return 'ERROR';
  }
}

async function main() {
  console.log('========================================');
  console.log('TEST API BIGBUY - CALCOLO SPEDIZIONI');
  console.log('========================================');
  console.log(`Prodotto test: ${TEST_PRODUCT_ID}`);
  console.log(`API Key: ${BIGBUY_API_KEY ? BIGBUY_API_KEY.substring(0, 10) + '...' : 'NON TROVATA'}`);
  console.log('========================================');

  if (!BIGBUY_API_KEY || BIGBUY_API_KEY === 'your_bigbuy_api_key_here') {
    console.error('❌ ERRORE: Chiave API BigBuy non configurata nel file .env');
    process.exit(1);
  }

  const results = {};

  for (const country of TEST_COUNTRIES) {
    const cost = await testShippingCost(country);
    results[country.code] = cost;

    // Pausa di 2 secondi tra le richieste per evitare rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n========================================');
  console.log('RIEPILOGO RISULTATI');
  console.log('========================================');

  Object.entries(results).forEach(([code, cost]) => {
    const country = TEST_COUNTRIES.find(c => c.code === code);
    const status = cost === null ? '⚠️  NO SHIPPING' :
                   cost === 'ERROR' ? '❌ ERRORE' :
                   cost === 0 ? '🎉 GRATIS' :
                   `💰 €${cost}`;
    console.log(`${country.name.padEnd(20)} ${code.padEnd(4)} → ${status}`);
  });

  console.log('========================================');
}

main().catch(console.error);
