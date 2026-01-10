const https = require('https');

console.log('🔍 DEBUG: Cosa restituisce l\'API per gli incensi AW?');
console.log('═══════════════════════════════════════\n');

https.get('https://zenova-commerce-production.up.railway.app/api/products?pageSize=5000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const allProducts = json.data || json;

    console.log('✅ API restituisce', allProducts.length, 'prodotti totali\n');

    // Trova incensi AW nell'API
    const awIncensi = allProducts.filter(p =>
      p.id && p.id.startsWith('aw-') &&
      (p.subcategory === 'incenso' ||
       (p.subcategory && p.subcategory.includes('incens')))
    );

    console.log('🔥 Incensi AW con subcategory="incenso" o simile:', awIncensi.length);

    if (awIncensi.length > 0) {
      console.log('\n📋 Primi 5 incensi AW - DATI ESATTI DALL\'API:');
      awIncensi.slice(0, 5).forEach((p, i) => {
        console.log(`\n${i+1}. ID: ${p.id}`);
        console.log(`   Nome: ${p.name.substring(0, 50)}`);
        console.log(`   subcategory: "${p.subcategory}"`);
        console.log(`   zenovaSubcategory: "${p.zenovaSubcategory}"`);
        console.log(`   category: "${p.category}"`);
      });
    }

    // Conta TUTTI gli incensi (anche non AW)
    console.log('\n═══════════════════════════════════════');
    const tuttiIncensi = allProducts.filter(p =>
      p.subcategory === 'incenso'
    );
    console.log('📦 TOTALE prodotti con subcategory="incenso":', tuttiIncensi.length);

    const awCount = tuttiIncensi.filter(p => p.id && p.id.startsWith('aw-')).length;
    console.log('   - Di cui AW:', awCount);
    console.log('   - Di cui altri:', tuttiIncensi.length - awCount);

    if (tuttiIncensi.length === 89) {
      console.log('\n❌ PROBLEMA: L\'API restituisce solo 89 incensi!');
      console.log('   Gli incensi AW NON hanno subcategory="incenso"!');
    } else {
      console.log('\n✅ API ha più di 89 incensi, problema è nel frontend!');
    }
  });
}).on('error', e => console.error('Errore:', e.message));
