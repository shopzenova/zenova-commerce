const https = require('https');

console.log('Verifico Vercel frontend...\n');

// Controlla se il frontend Vercel è online
const options = {
  hostname: 'zenova-ecommerce.vercel.app',
  port: 443,
  path: '/',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log('✅ Frontend Vercel:', res.statusCode === 200 ? 'ONLINE' : 'OFFLINE');
  console.log('Status Code:', res.statusCode);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    // Cerca il config.js nel HTML
    if (data.includes('config.js')) {
      console.log('✅ config.js presente nel HTML');
    }

    // Cerca l'API_BASE_URL nel HTML
    if (data.includes('localhost')) {
      console.log('⚠️  Trovato riferimento a "localhost" nel frontend');
    }

    console.log('\nHTML length:', data.length, 'characters');
  });
});

req.on('error', (e) => {
  console.error('❌ Errore:', e.message);
});

req.end();

// Controlla anche config.js su Vercel
setTimeout(() => {
  console.log('\n--- Verifico config.js su Vercel ---\n');

  const configReq = https.request({
    hostname: 'zenova-ecommerce.vercel.app',
    port: 443,
    path: '/config.js',
    method: 'GET'
  }, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ config.js trovato su Vercel\n');
        console.log(data);

        if (data.includes('localhost')) {
          console.log('\n⚠️⚠️⚠️  PROBLEMA: config.js su Vercel usa LOCALHOST!');
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
}, 1000);
