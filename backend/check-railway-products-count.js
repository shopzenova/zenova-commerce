const https = require('https');

console.log('=== VERIFICA PRODOTTI SU RAILWAY ===\n');
console.log('URL: https://zenova-backend-production.up.railway.app/api/products\n');

const req = https.request({
  hostname: 'zenova-backend-production.up.railway.app',
  port: 443,
  path: '/api/products?pageSize=10000',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Zenova-Check/1.0'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);

  if (res.statusCode !== 200) {
    console.log('❌ Errore HTTP:', res.statusCode);
    return;
  }

  let data = '';
  let chunks = 0;

  res.on('data', (chunk) => {
    data += chunk;
    chunks++;
  });

  res.on('end', () => {
    try {
      console.log(`\n✅ Dati ricevuti (${chunks} chunks, ${(data.length / 1024 / 1024).toFixed(2)} MB)\n`);

      const products = JSON.parse(data);

      console.log('📊 TOTALE PRODOTTI SU RAILWAY:', products.length);

      // Conta per source
      const sources = {};
      products.forEach(p => {
        const src = p.source || 'undefined';
        sources[src] = (sources[src] || 0) + 1;
      });

      console.log('\n📦 Prodotti per fornitore:');
      Object.entries(sources).sort((a,b) => b[1] - a[1]).forEach(([src, count]) => {
        console.log(`  ${src}: ${count}`);
      });

      // Conta prodotti AW specifici
      const aw = products.filter(p => p.source === 'aw');
      console.log(`\n🌿 Prodotti AW totali: ${aw.length}`);

      // Cerca candele e coni
      const candele = aw.filter(p =>
        p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
      );
      const coni = aw.filter(p =>
        p.name && (p.name.toLowerCase().includes('coni') || p.name.toLowerCase().includes('cone'))
      );

      console.log(`  🕯️  Candele: ${candele.length}`);
      console.log(`  🔥 Incensi a coni: ${coni.length}`);

      // Mostra esempi
      if (candele.length > 0) {
        console.log('\n  Esempi candele su Railway:');
        candele.slice(0, 3).forEach(p => {
          console.log(`    - ${p.name.substring(0, 60)}`);
        });
      }

      if (coni.length > 0) {
        console.log('\n  Esempi coni su Railway:');
        coni.slice(0, 3).forEach(p => {
          console.log(`    - ${p.name.substring(0, 60)}`);
        });
      }

      // Confronta con locale
      console.log('\n\n📊 CONFRONTO:');
      console.log(`  Locale: 4,434 prodotti totali`);
      console.log(`  Railway: ${products.length} prodotti totali`);
      console.log(`  Differenza: ${4434 - products.length} prodotti`);

      if (products.length < 4434) {
        console.log('\n⚠️  Railway ha MENO prodotti del locale!');
        console.log('   Le 42 candele + 32 incensi potrebbero NON essere su Railway.');
      } else if (products.length === 4434) {
        console.log('\n✅ Railway è AGGIORNATO!');
      }

    } catch (e) {
      console.error('❌ Errore parsing JSON:', e.message);
      console.log('Primi 500 caratteri:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Errore connessione:', e.message);
});

req.setTimeout(60000, () => {
  console.log('❌ Timeout (60s)');
  req.abort();
});

req.end();
