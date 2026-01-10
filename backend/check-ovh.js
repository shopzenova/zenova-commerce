const https = require('https');

console.log('Verifico shop.zenova.ovh...\n');

// Controlla config.js su OVH
const configReq = https.request({
  hostname: 'shop.zenova.ovh',
  port: 443,
  path: '/config.js',
  method: 'GET',
  rejectUnauthorized: false // Per eventuali problemi SSL
}, (res) => {
  console.log('Status Code config.js:', res.statusCode);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ config.js trovato su OVH\n');
      console.log(data);

      if (data.includes('localhost')) {
        console.log('\n🚨🚨🚨 PROBLEMA TROVATO!');
        console.log('config.js su shop.zenova.ovh usa LOCALHOST!');
        console.log('Il frontend NON può caricare prodotti perché chiama localhost invece del backend online!');
      } else if (data.includes('railway')) {
        console.log('\n✅ config.js usa Railway');
      } else if (data.includes('render')) {
        console.log('\n✅ config.js usa Render');
      }
    } else {
      console.log('❌ config.js non trovato:', res.statusCode);
    }
  });
});

configReq.on('error', (e) => {
  console.error('❌ Errore:', e.message);
});

configReq.end();

// Controlla anche script.js per vedere da dove carica i prodotti
setTimeout(() => {
  console.log('\n--- Verifico script.js su OVH ---\n');

  const scriptReq = https.request({
    hostname: 'shop.zenova.ovh',
    port: 443,
    path: '/script.js',
    method: 'GET',
    rejectUnauthorized: false
  }, (res) => {
    let data = '';
    let chunks = 0;

    res.on('data', (chunk) => {
      if (chunks < 50) { // Limita a primi 50 chunk per non stampare tutto
        data += chunk;
        chunks++;
      }
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ script.js trovato su OVH');

        // Cerca riferimenti a come carica i prodotti
        const lines = data.split('\n');
        const relevantLines = lines.filter(line =>
          line.includes('products.json') ||
          line.includes('API_BASE_URL') ||
          line.includes('fetch(') ||
          line.includes('/api/products')
        );

        if (relevantLines.length > 0) {
          console.log('\nRighe rilevanti per caricamento prodotti:');
          relevantLines.slice(0, 10).forEach(line => {
            console.log('  ', line.trim().substring(0, 100));
          });
        }
      }
    });
  });

  scriptReq.on('error', (e) => {
    console.error('❌ Errore:', e.message);
  });

  scriptReq.end();
}, 2000);
