const https = require('https');

console.log('🧪 Test API Railway dopo fix .dockerignore\n');

const url = 'https://zenova-ecommerce-backend-production.up.railway.app/api/products?pageSize=5000';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);

      console.log('✅ RISULTATI:');
      console.log('═'.repeat(60));
      console.log('📦 Prodotti totali ricevuti:', json.data ? json.data.length : 0);
      console.log('📊 Total dichiarato dalla API:', json.total || 'N/A');
      console.log('🗂️  Source:', json.source || 'N/A');
      console.log('');

      if (json.data && json.data.length > 0) {
        const awIncensi = json.data.filter(p =>
          p.id && p.id.startsWith('aw-') &&
          JSON.stringify(p).toLowerCase().includes('incens')
        );

        console.log('🔥 INCENSI AW TROVATI:', awIncensi.length, '/ 31 attesi');
        console.log('═'.repeat(60));

        if (awIncensi.length === 31) {
          console.log('🎉 SUCCESSO! Tutti i 31 incensi AW sono online!');
        } else if (awIncensi.length > 0) {
          console.log('⚠️  Trovati', awIncensi.length, 'incensi, ma ne servono 31');
        } else {
          console.log('❌ Nessun incenso AW trovato');
        }

        if (awIncensi.length > 0) {
          console.log('\n📋 Primi 5 incensi:');
          awIncensi.slice(0, 5).forEach((p, i) => {
            const name = p.name || 'N/A';
            console.log(`   ${i+1}. ${p.id} - ${name.substring(0, 45)}`);
          });
        }
      } else {
        console.log('❌ PROBLEMA: API restituisce 0 prodotti!');
        console.log('   Il file data/products.json non è stato caricato.');
      }

      console.log('\n' + '═'.repeat(60));
    } catch (e) {
      console.error('❌ Errore parsing JSON:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
