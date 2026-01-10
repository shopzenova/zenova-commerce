const https = require('https');

console.log('🔍 VERIFICA API DOPO FIX - Controllo incensi\n');

const url = 'https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const products = json.products || json.data || [];

      // Trova incensi AW
      const incensiAW = products.filter(p => {
        if (!p.id || !p.id.startsWith('aw-')) return false;
        const name = (p.name || '').toLowerCase();
        const hasIncense = name.includes('incens') || name.includes('coni');
        const isPerfume = name.includes('profumo') || name.includes('perfume');
        return hasIncense && !isPerfume;
      });

      // Controlla categorie
      const conCategoria = incensiAW.filter(p => p.zenovaCategories && p.zenovaCategories.length > 0);
      const senzaCategoria = incensiAW.filter(p => !p.zenovaCategories || p.zenovaCategories.length === 0);

      console.log('═'.repeat(70));
      console.log('📊 RISULTATI API ONLINE (dopo fix):');
      console.log('═'.repeat(70));
      console.log(`📦 Prodotti totali: ${products.length}`);
      console.log(`🔥 Incensi AW trovati: ${incensiAW.length}`);
      console.log(`   ✅ Con categoria: ${conCategoria.length}`);
      console.log(`   ❌ Senza categoria: ${senzaCategoria.length}`);
      console.log('');

      if (senzaCategoria.length > 0) {
        console.log('⚠️  PROBLEMA: Railway non ha ancora fatto redeploy!');
        console.log('   I 28 incensi NON hanno ancora la categoria online.');
        console.log('');
        console.log('🔄 SOLUZIONE: Force redeploy Railway');
      } else {
        console.log('✅ SUCCESSO! Tutti gli incensi hanno la categoria!');
      }

      console.log('═'.repeat(70));
    } catch (e) {
      console.error('❌ Errore:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
