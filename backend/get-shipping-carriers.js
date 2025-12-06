// Ottieni dettagli completi sui corrieri BigBuy
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;
const BIGBUY_API_URL = 'https://api.bigbuy.eu';

async function getCarriers() {
  try {
    console.log('🚚 Richiesta corrieri BigBuy...\n');

    const response = await axios.get(
      `${BIGBUY_API_URL}/rest/shipping/carriers.json`,
      {
        headers: {
          'Authorization': `Bearer ${BIGBUY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Risposta ricevuta!\n');

    // Salva risposta completa in file
    fs.writeFileSync('bigbuy-carriers.json', JSON.stringify(response.data, null, 2));
    console.log('💾 Dati salvati in: bigbuy-carriers.json\n');

    console.log('========================================');
    console.log('CORRIERI DISPONIBILI BIGBUY');
    console.log('========================================\n');

    response.data.forEach(carrier => {
      console.log(`📦 ${carrier.name} (ID: ${carrier.id})`);

      if (carrier.shippingServices && carrier.shippingServices.length > 0) {
        console.log('   Servizi:');
        carrier.shippingServices.forEach(service => {
          console.log(`   - ${service.name} | Tempi: ${service.delay} | POD: ${service.pod ? 'Sì' : 'No'}`);
        });
      }

      console.log('');
    });

    console.log('========================================');
    console.log(`Totale corrieri: ${response.data.length}`);
    console.log('========================================');

  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

getCarriers();
