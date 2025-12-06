// Ottieni lista paesi supportati da BigBuy per spedizioni
require('dotenv').config();
const axios = require('axios');

const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;
const BIGBUY_API_URL = 'https://api.bigbuy.eu';

async function getShippingCountries() {
  try {
    console.log('🌍 Richiesta lista paesi supportati da BigBuy...\n');

    // BigBuy ha un endpoint per ottenere i paesi
    const response = await axios.get(
      `${BIGBUY_API_URL}/rest/shipping/countries.json`,
      {
        headers: {
          'Authorization': `Bearer ${BIGBUY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Risposta ricevuta!\n');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data)) {
      console.log(`\n📊 Totale paesi supportati: ${response.data.length}\n`);

      console.log('Lista paesi (per checkout.html):');
      console.log('========================================');

      response.data.forEach(country => {
        console.log(`<option value="${country.isoCode}">${country.name}</option>`);
      });

      console.log('========================================');
    }

  } catch (error) {
    if (error.response?.status === 404) {
      console.error('❌ Endpoint /rest/shipping/countries.json non trovato');
      console.log('\n💡 Proviamo con endpoint alternativo /rest/catalog/countries.json...\n');

      try {
        const response2 = await axios.get(
          `${BIGBUY_API_URL}/rest/catalog/countries.json`,
          {
            headers: {
              'Authorization': `Bearer ${BIGBUY_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log('✅ Risposta ricevuta!\n');
        console.log(JSON.stringify(response2.data, null, 2));

      } catch (error2) {
        console.error('❌ Anche endpoint alternativo ha fallito:', error2.response?.data || error2.message);
      }

    } else {
      console.error('❌ Errore:', error.response?.data || error.message);
    }
  }
}

async function testWithKnownProduct() {
  console.log('\n🧪 Test alternativo: calcolo spedizione con prodotto conosciuto\n');
  console.log('Testerò i 4 paesi che funzionavano prima:\n');

  const workingCountries = [
    { code: 'IT', name: 'Italia' },
    { code: 'CH', name: 'Svizzera' },
    { code: 'SM', name: 'San Marino' },
    { code: 'VA', name: 'Città del Vaticano' }
  ];

  const testProductId = 'D2000003';

  for (const country of workingCountries) {
    try {
      const response = await axios.post(
        `${BIGBUY_API_URL}/rest/shipping/costs.json`,
        {
          products: [{
            reference: testProductId,
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

      console.log(`✅ ${country.name} (${country.code}): Funziona!`);
      if (response.data.shippingCosts?.[0]) {
        console.log(`   Costo: €${response.data.shippingCosts[0].cost}`);
      }

    } catch (error) {
      console.log(`❌ ${country.name} (${country.code}): ${error.response?.data?.message || error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  if (!BIGBUY_API_KEY || BIGBUY_API_KEY === 'your_bigbuy_api_key_here') {
    console.error('❌ ERRORE: Chiave API BigBuy non configurata nel file .env');
    process.exit(1);
  }

  await getShippingCountries();
  await testWithKnownProduct();
}

main().catch(console.error);
