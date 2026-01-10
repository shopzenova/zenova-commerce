const https = require('https');

console.log('=== DIAGNOSI: Perché non vedi i prodotti online? ===\n');

// Step 1: Verifica che shop.zenova.ovh sia online
console.log('1️⃣  Verifico shop.zenova.ovh...\n');

https.request({
  hostname: 'shop.zenova.ovh',
  port: 443,
  path: '/',
  method: 'GET',
  rejectUnauthorized: false
}, (res) => {
  console.log(`   Status: ${res.statusCode}`);

  let html = '';
  res.on('data', chunk => html += chunk);

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ shop.zenova.ovh ONLINE\n');

      // Verifica quali file JS carica
      const scripts = html.match(/<script[^>]*src="([^"]+)"/g);
      if (scripts) {
        console.log('   Script caricati:');
        scripts.forEach(s => {
          const match = s.match(/src="([^"]+)"/);
          if (match) console.log(`     - ${match[1]}`);
        });
      }

      console.log('\n');

      // Step 2: Verifica script.js
      setTimeout(() => {
        console.log('2️⃣  Verifico script.js su OVH...\n');

        https.request({
          hostname: 'shop.zenova.ovh',
          port: 443,
          path: '/script.js',
          method: 'GET',
          rejectUnauthorized: false
        }, (res2) => {
          let js = '';
          res2.on('data', chunk => js += chunk);

          res2.on('end', () => {
            // Cerca l'URL API
            const apiMatch = js.match(/zenova-[^.]+\.up\.railway\.app/g);
            if (apiMatch) {
              console.log(`   URL API trovato: ${apiMatch[0]}`);

              // Verifica se è quello corretto
              if (apiMatch[0] === 'zenova-commerce-production.up.railway.app') {
                console.log('   ✅ URL API CORRETTO\n');
              } else {
                console.log('   ❌ URL API SBAGLIATO!\n');
              }
            }

            // Cerca errori o console.log
            const hasConsoleLog = js.includes('console.log') && js.includes('products');
            if (hasConsoleLog) {
              console.log('   ℹ️  Script ha console.log per debug\n');
            }

            // Step 3: Simula il caricamento come fa il browser
            setTimeout(() => {
              console.log('3️⃣  Simulo caricamento prodotti (come fa il browser)...\n');

              const apiUrl = 'zenova-commerce-production.up.railway.app';

              https.request({
                hostname: apiUrl,
                port: 443,
                path: '/api/products?pageSize=5000',
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Origin': 'https://shop.zenova.ovh',
                  'User-Agent': 'Mozilla/5.0'
                },
                rejectUnauthorized: false
              }, (res3) => {
                console.log(`   Railway risponde: ${res3.statusCode}`);
                console.log(`   CORS headers:`);
                console.log(`     Access-Control-Allow-Origin: ${res3.headers['access-control-allow-origin'] || 'NON PRESENTE!'}`);

                if (!res3.headers['access-control-allow-origin']) {
                  console.log('\n   🚨🚨🚨 PROBLEMA CORS! 🚨🚨🚨');
                  console.log('   Il browser BLOCCA la richiesta perché Railway non');
                  console.log('   permette shop.zenova.ovh (manca header CORS)!\n');
                }

                let data = '';
                res3.on('data', chunk => data += chunk);

                res3.on('end', () => {
                  if (res3.statusCode === 200) {
                    try {
                      const response = JSON.parse(data);
                      const products = response.data || response;

                      console.log(`\n   ✅ Prodotti ricevuti: ${products.length}`);

                      // Cerca candele e incensi
                      const aw = products.filter(p => p.source === 'aw');
                      const candele = aw.filter(p =>
                        p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
                      );
                      const incensi = aw.filter(p =>
                        p.name && (p.name.toLowerCase().includes('coni') || p.name.toLowerCase().includes('cone'))
                      );

                      console.log(`   Candele AW: ${candele.length}`);
                      console.log(`   Incensi coni: ${incensi.length}`);

                      if (candele.length > 0) {
                        console.log(`\n   📦 Esempio candela ricevuta da Railway:`);
                        console.log(`      Nome: ${candele[0].name}`);
                        console.log(`      ID: ${candele[0].id}`);
                        console.log(`      Categoria: ${candele[0].zenovaCategory}`);
                        console.log(`      Sottocategoria: ${candele[0].zenovaSubcategory}`);
                        console.log(`      Visibile: ${candele[0].visible}`);
                        console.log(`      Zone: ${candele[0].zone}`);
                      }

                      // Verifica se sono "visible"
                      const candeleVisibili = candele.filter(p => p.visible !== false);
                      const incensiVisibili = incensi.filter(p => p.visible !== false);

                      console.log(`\n   Candele VISIBILI: ${candeleVisibili.length}/${candele.length}`);
                      console.log(`   Incensi VISIBILI: ${incensiVisibili.length}/${incensi.length}`);

                      if (candeleVisibili.length < candele.length) {
                        console.log(`\n   ⚠️  ${candele.length - candeleVisibili.length} candele sono NASCOSTE (visible=false)!`);
                      }

                    } catch(e) {
                      console.log(`\n   ❌ Errore parsing: ${e.message}`);
                    }
                  }

                  console.log('\n' + '='.repeat(60));
                  console.log('🎯 DIAGNOSI COMPLETATA');
                  console.log('='.repeat(60) + '\n');
                });
              }).end();
            }, 1000);
          });
        }).end();
      }, 1000);
    }
  });
}).end();
