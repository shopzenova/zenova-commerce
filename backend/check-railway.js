const https = require('https');

console.log('Verifico Railway backend...\n');

// Controlla endpoint products
const options = {
  hostname: 'zenova-backend-production.up.railway.app',
  port: 443,
  path: '/api/products',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const products = JSON.parse(data);
        console.log('\n✅ Backend Railway ONLINE');
        console.log('Prodotti totali su Railway:', products.length);

        const aw = products.filter(p => p.source === 'aw');
        console.log('Prodotti AW su Railway:', aw.length);

        const candele = products.filter(p => p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle')) && p.source === 'aw');
        const coni = products.filter(p => p.name && (p.name.toLowerCase().includes('coni') || p.name.toLowerCase().includes('cone')) && p.source === 'aw');

        console.log('Candele AW su Railway:', candele.length);
        console.log('Incensi coni AW su Railway:', coni.length);

      } catch (e) {
        console.log('❌ Errore parsing JSON:', e.message);
        console.log('Data ricevuta (primi 500 char):', data.substring(0, 500));
      }
    } else {
      console.log('❌ Errore HTTP:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Errore connessione:', e.message);
});

req.setTimeout(30000, () => {
  console.log('❌ Timeout - Railway non risponde');
  req.abort();
});

req.end();
