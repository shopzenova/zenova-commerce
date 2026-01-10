const https = require('https');

https.get('https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const products = json.data || json;

    console.log('🌐 API RAILWAY:');
    console.log('═══════════════════════════════════════');
    console.log('Prodotti totali ricevuti:', products.length);

    // Cerca incensi AW
    const awIncensi = products.filter(p =>
      p.id && p.id.startsWith('aw-') &&
      p.subcategory === 'incenso'
    );

    console.log('Incensi AW (subcategory=incenso):', awIncensi.length);

    if (awIncensi.length > 0) {
      console.log('');
      console.log('✅ Primi 5 incensi AW nell\'API:');
      awIncensi.slice(0, 5).forEach((p, i) => {
        console.log(`${i+1}. ${p.id} - ${p.name.substring(0, 45)}`);
      });
    } else {
      console.log('');
      console.log('❌ PROBLEMA: API Railway NON restituisce incensi AW!');
      console.log('Verifichiamo se ci sono prodotti AW in generale:');
      const anyAW = products.filter(p => p.id && p.id.startsWith('aw-'));
      console.log('Prodotti AW totali:', anyAW.length);
      if (anyAW.length > 0) {
        console.log('Primi 3 prodotti AW:');
        anyAW.slice(0, 3).forEach(p => {
          console.log(`- ${p.id} | subcat: ${p.subcategory}`);
        });
      }
    }
  });
}).on('error', e => console.error('Errore:', e.message));
