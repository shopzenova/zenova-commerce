const https = require('https');

console.log('🔍 TEST DETTAGLIO CANDELA API\n');

const url = 'https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const products = json.products || json.data || [];

      const candela = products.find(p => p.sku === 'ASC-02');

      if (candela) {
        console.log('✅ Candela ASC-02 trovata!\n');
        console.log('DETTAGLI COMPLETI:');
        console.log(JSON.stringify(candela, null, 2));
      } else {
        console.log('❌ Candela ASC-02 NON trovata!');
      }
    } catch (e) {
      console.error('❌ Errore:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
