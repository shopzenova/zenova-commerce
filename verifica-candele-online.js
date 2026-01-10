const https = require('https');

console.log('🔍 VERIFICA CANDELE ONLINE - Railway API\n');

const url = 'https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const products = json.products || json.data || [];

      console.log('═'.repeat(70));
      console.log('📊 RISULTATI API RAILWAY:');
      console.log('═'.repeat(70));
      console.log(`📦 Prodotti totali: ${products.length}`);
      console.log('');

      // Trova candele AW
      const candele = products.filter(p => {
        return p.zenovaSubcategory === 'candele-gel-profumati-sali-bagno';
      });

      console.log(`🕯️  CANDELE E SALI DA BAGNO: ${candele.length}`);
      console.log('');

      if (candele.length > 0) {
        console.log('✅ SUCCESSO! Le candele sono nell\'API Railway!');
        console.log('');
        console.log('📋 Prime 10 candele:');
        candele.slice(0, 10).forEach((p, i) => {
          console.log(`   ${i+1}. [${p.sku}] ${p.name}`);
          console.log(`      Stock: ${p.stock} | Prezzo: €${p.price}`);
        });
      } else {
        console.log('❌ PROBLEMA: Railway non ha ancora fatto redeploy!');
        console.log('   Le candele non sono ancora nell\'API.');
      }

      console.log('');
      console.log('═'.repeat(70));
    } catch (e) {
      console.error('❌ Errore:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
