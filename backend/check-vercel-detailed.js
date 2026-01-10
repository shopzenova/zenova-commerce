const https = require('https');

console.log('=== VERIFICA VERCEL ===\n');

// Prova diversi possibili URL Vercel
const possibleUrls = [
  'zenova-ecommerce.vercel.app',
  'zenova-commerce.vercel.app',
  'zenova.vercel.app',
  'shop-zenova.vercel.app'
];

possibleUrls.forEach((hostname, index) => {
  setTimeout(() => {
    console.log(`\nProvo: https://${hostname}`);

    const req = https.request({
      hostname: hostname,
      port: 443,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log(`Status: ${res.statusCode}`);

      if (res.statusCode === 200) {
        console.log('✅ ONLINE!');

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (data.includes('<html')) {
            console.log('✅ HTML ricevuto');

            // Verifica se carica script.js
            if (data.includes('script.js')) {
              console.log('✅ Carica script.js');
            }

            // Verifica riferimenti API
            if (data.includes('railway')) {
              console.log('✅ Riferimento a Railway trovato');
            }
            if (data.includes('localhost')) {
              console.log('⚠️  Riferimento a localhost trovato');
            }
          }
        });
      } else if (res.statusCode === 308 || res.statusCode === 301) {
        console.log(`↪️  Redirect a: ${res.headers.location}`);
      } else {
        console.log('❌ Non disponibile');
      }
    });

    req.on('error', (e) => {
      console.log(`❌ Errore: ${e.message}`);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Timeout');
      req.abort();
    });

    req.end();
  }, index * 1000);
});
