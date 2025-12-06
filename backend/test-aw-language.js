/**
 * Test per verificare se l'API AW supporta nomi prodotti in italiano
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

async function testLanguage() {
  console.log('🔍 Test lingua italiana per prodotti AW...\n');

  const testCases = [
    { name: 'Default (senza lingua)', params: { page: 1, per_page: 5 } },
    { name: 'Con locale=it', params: { page: 1, per_page: 5, locale: 'it' } },
    { name: 'Con language=it', params: { page: 1, per_page: 5, language: 'it' } },
    { name: 'Con lang=it', params: { page: 1, per_page: 5, lang: 'it' } },
    { name: 'Con Accept-Language header', params: { page: 1, per_page: 5 }, headers: { 'Accept-Language': 'it-IT,it;q=0.9' } }
  ];

  for (const test of testCases) {
    try {
      console.log(`\n📡 Test: ${test.name}`);
      console.log(`   Params:`, test.params);

      const config = { params: test.params };
      if (test.headers) {
        config.headers = test.headers;
      }

      const response = await client.get('/dropshipping/products', config);

      if (response.data.data && response.data.data.length > 0) {
        console.log(`✅ Risposta ricevuta (${response.data.data.length} prodotti)`);

        // Mostra primi 3 prodotti
        response.data.data.slice(0, 3).forEach((p, i) => {
          console.log(`\n   Prodotto ${i+1}:`);
          console.log(`     Code: ${p.code}`);
          console.log(`     Name: ${p.name}`);

          // Mostra tutti i campi che potrebbero contenere traduzioni
          if (p.name_it) console.log(`     name_it: ${p.name_it}`);
          if (p.description) console.log(`     description: ${p.description.substring(0, 60)}...`);
          if (p.description_it) console.log(`     description_it: ${p.description_it.substring(0, 60)}...`);
          if (p.translations) console.log(`     translations:`, p.translations);
        });
      } else {
        console.log(`⚠️  Nessun prodotto nella risposta`);
      }

    } catch (error) {
      console.log(`❌ Errore: ${error.response?.status || 'ERR'} - ${error.response?.data?.message || error.message}`);
    }

    await new Promise(r => setTimeout(r, 2500));
  }

  console.log('\n✅ Test completati\n');
}

testLanguage().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
