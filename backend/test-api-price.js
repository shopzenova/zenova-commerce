const http = require('http');

console.log('🔍 Test API - Verifica prezzo AATOM-29 dal server\n');

http.get('http://localhost:3000/api/products', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('Tipo risposta:', typeof response);
    console.log('È array?', Array.isArray(response));
    if (typeof response === 'object' && !Array.isArray(response)) {
      console.log('Chiavi:', Object.keys(response).slice(0, 5));
    }

    const products = Array.isArray(response) ? response : (response.data || response.products || []);
    console.log('Numero prodotti:', products.length);

    if (products.length > 0) {
      console.log('Primo prodotto SKU:', products[0].sku);
    }

    const p29 = products.find(p => p && p.sku === 'AATOM-29');

    if (p29) {
      console.log('✅ AATOM-29 trovato dal server API:');
      console.log('   Nome:', p29.name);
      console.log('   Prezzo dal server: €' + p29.price);
      console.log('\n📡 Il server sta inviando: €' + p29.price);
      console.log('   (Dovrebbe essere €65.75)\n');

      if (p29.price === 65.75) {
        console.log('✅ PREZZO CORRETTO dal server!');
        console.log('\n💡 Se vedi ancora €38.58 nel browser, è SICURAMENTE la cache.');
        console.log('   Devi svuotarla premendo: Ctrl + Shift + Delete\n');
      } else {
        console.log('❌ PREZZO ERRATO dal server!');
      }
    } else {
      console.log('❌ AATOM-29 non trovato');
    }
  });
}).on('error', (err) => {
  console.error('Errore:', err.message);
});
