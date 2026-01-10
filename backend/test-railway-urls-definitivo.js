const https = require('https');

console.log('=== TEST DEFINITIVO RAILWAY URLs ===\n');

const urls = [
  'zenova-commerce-production.up.railway.app',
  'zenova-backend-production.up.railway.app'
];

function testUrl(hostname) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testo: https://${hostname}`);
    console.log('─'.repeat(60));

    // Test 1: Root /
    const rootReq = https.request({
      hostname: hostname,
      port: 443,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false
    }, (res) => {
      console.log(`  GET /               → Status: ${res.statusCode}`);

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`  ✅ ROOT FUNZIONA`);
        } else {
          console.log(`  ❌ ${data.substring(0, 60)}`);
        }

        // Test 2: /api/health
        setTimeout(() => {
          const healthReq = https.request({
            hostname: hostname,
            port: 443,
            path: '/api/health',
            method: 'GET',
            rejectUnauthorized: false
          }, (res2) => {
            console.log(`  GET /api/health     → Status: ${res2.statusCode}`);

            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
              if (res2.statusCode === 200) {
                console.log(`  ✅ HEALTH FUNZIONA: ${data2.substring(0, 60)}`);
              }

              // Test 3: /api/products (solo primi 100)
              setTimeout(() => {
                const prodReq = https.request({
                  hostname: hostname,
                  port: 443,
                  path: '/api/products?pageSize=10',
                  method: 'GET',
                  headers: { 'Accept': 'application/json' },
                  rejectUnauthorized: false
                }, (res3) => {
                  console.log(`  GET /api/products   → Status: ${res3.statusCode}`);

                  let data3 = '';
                  res3.on('data', chunk => data3 += chunk);
                  res3.on('end', () => {
                    if (res3.statusCode === 200) {
                      try {
                        const products = JSON.parse(data3);
                        console.log(`  ✅ PRODUCTS FUNZIONA: ${products.length} prodotti ricevuti`);
                      } catch(e) {
                        console.log(`  ⚠️  Risposta non JSON`);
                      }
                    }

                    // Risultato finale
                    console.log('\n📊 RISULTATO:');
                    if (res.statusCode === 200 || res2.statusCode === 200 || res3.statusCode === 200) {
                      console.log(`  ✅✅✅ ${hostname} FUNZIONA!`);
                    } else {
                      console.log(`  ❌❌❌ ${hostname} NON FUNZIONA`);
                    }

                    resolve();
                  });
                });

                prodReq.on('error', () => {
                  console.log(`  ❌ Errore connessione /api/products`);
                  resolve();
                });

                prodReq.setTimeout(10000, () => {
                  console.log(`  ❌ Timeout /api/products`);
                  prodReq.abort();
                });

                prodReq.end();
              }, 500);
            });
          });

          healthReq.on('error', () => {
            console.log(`  ❌ Errore connessione /api/health`);
          });

          healthReq.setTimeout(10000, () => {
            healthReq.abort();
          });

          healthReq.end();
        }, 500);
      });
    });

    rootReq.on('error', (e) => {
      console.log(`  ❌ Errore connessione: ${e.message}`);
      resolve();
    });

    rootReq.setTimeout(10000, () => {
      console.log(`  ❌ Timeout`);
      rootReq.abort();
    });

    rootReq.end();
  });
}

// Test entrambi gli URL in sequenza
(async () => {
  await testUrl(urls[0]);
  await testUrl(urls[1]);

  console.log('\n\n' + '='.repeat(60));
  console.log('🎯 CONCLUSIONE:');
  console.log('='.repeat(60));
  console.log('\nControlla i risultati sopra per vedere quale URL FUNZIONA davvero.\n');
})();
