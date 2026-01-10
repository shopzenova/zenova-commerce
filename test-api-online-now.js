const https = require('https');

console.log('🧪 Test API Railway - Verifica Incensi Online\n');

const url = 'https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const products = json.products || json.data || [];

      console.log('✅ RISULTATI API ONLINE:');
      console.log('═'.repeat(60));
      console.log('📦 Prodotti totali:', products.length);
      console.log('');

      // Trova incensi (tutti, non solo AW)
      const incensi = products.filter(p => {
        const str = JSON.stringify(p).toLowerCase();
        return str.includes('incens') || str.includes('incense');
      });

      console.log('🔥 INCENSI TOTALI TROVATI:', incensi.length);

      // Conta per fonte
      const awIncensi = incensi.filter(p => p.id && p.id.startsWith('aw-'));
      const bigbuyIncensi = incensi.filter(p => p.id && !p.id.startsWith('aw-'));

      console.log('   - AW Dropship:', awIncensi.length);
      console.log('   - BigBuy:', bigbuyIncensi.length);
      console.log('');

      if (incensi.length > 0) {
        console.log('📋 Primi 10 incensi trovati:');
        incensi.slice(0, 10).forEach((p, i) => {
          const name = p.name || 'N/A';
          const id = p.id || 'N/A';
          console.log(`   ${i+1}. [${id}] ${name.substring(0, 50)}`);
        });
      } else {
        console.log('❌ PROBLEMA: Nessun incenso trovato online!');
      }

      console.log('\n' + '═'.repeat(60));
    } catch (e) {
      console.error('❌ Errore parsing JSON:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
