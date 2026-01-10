const https = require('https');

console.log('=== DIAGNOSI COMPLETA FRONTEND + BACKEND ===\n');

// 1. Controlla script.js su OVH per vedere quale API URL usa
console.log('1. Verifico script.js su shop.zenova.ovh...\n');

const scriptReq = https.request({
  hostname: 'shop.zenova.ovh',
  port: 443,
  path: '/script.js',
  method: 'GET',
  rejectUnauthorized: false
}, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ script.js trovato\n');

      // Cerca l'URL dell'API
      const lines = data.split('\n');

      // Cerca righe con URL o API
      const apiLines = lines.filter(line =>
        line.includes('railway') ||
        line.includes('render') ||
        line.includes('localhost') ||
        line.includes('api/products') ||
        line.includes('API_BASE_URL') ||
        line.includes('apiUrl')
      );

      if (apiLines.length > 0) {
        console.log('📍 Righe rilevanti per URL API:');
        apiLines.slice(0, 15).forEach(line => {
          console.log('  ', line.trim().substring(0, 120));
        });
      }

      // Cerca una stringa specifica dell'URL
      if (data.includes('zenova-commerce-production.up.railway.app')) {
        console.log('\n✅ TROVATO: Frontend usa Railway (zenova-commerce-production.up.railway.app)');
      } else if (data.includes('railway.app')) {
        const match = data.match(/https?:\/\/[a-z0-9-]+\.up\.railway\.app/);
        if (match) {
          console.log(`\n✅ TROVATO: Frontend usa Railway (${match[0]})`);
        }
      } else if (data.includes('localhost')) {
        console.log('\n⚠️  Frontend usa LOCALHOST (non funziona online!)');
      }

      // Testa anche l'URL direttamente
      setTimeout(() => {
        testRailwayAPI();
      }, 1000);
    }
  });
});

scriptReq.on('error', (e) => {
  console.error('❌ Errore:', e.message);
});

scriptReq.end();

// Funzione per testare Railway API
function testRailwayAPI() {
  console.log('\n\n2. Testo Railway API direttamente...\n');

  const urls = [
    'zenova-commerce-production.up.railway.app',
    'zenova-backend-production.up.railway.app'
  ];

  urls.forEach(url => {
    console.log(`Provo: ${url}`);

    const req = https.request({
      hostname: url,
      port: 443,
      path: '/api/products?pageSize=10',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }, (res) => {
      console.log(`  Status: ${res.statusCode}`);

      if (res.statusCode === 200) {
        let count = 0;
        res.on('data', () => { count++; });
        res.on('end', () => {
          console.log(`  ✅ RISPONDE! (${count} chunks di dati ricevuti)`);
        });
      } else {
        console.log(`  ❌ Errore HTTP ${res.statusCode}`);
      }
    });

    req.on('error', (e) => {
      console.log(`  ❌ Connessione fallita: ${e.message}`);
    });

    req.setTimeout(5000, () => {
      console.log(`  ❌ Timeout`);
      req.abort();
    });

    req.end();
  });
}
