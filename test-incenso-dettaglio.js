const https = require('https');

console.log('🔍 TEST DETTAGLIO INCENSO API\n');

const url = 'https://zenova-commerce-production.up.railway.app/api/products/aw-aromabf-01';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const product = json.data;

      console.log('═'.repeat(70));
      console.log('📦 PRODOTTO:', product.name);
      console.log('═'.repeat(70));
      console.log('');
      console.log('✅ DATI PRINCIPALI:');
      console.log(`   ID: ${product.id}`);
      console.log(`   SKU: ${product.sku || 'NON PRESENTE'}`);
      console.log(`   Prezzo wholesale: €${product.price}`);
      console.log(`   Prezzo retail: €${product.retailPrice}`);
      console.log(`   Stock: ${product.stock}`);
      console.log('');
      console.log('✅ CATEGORIE:');
      console.log(`   zenovaCategories: ${JSON.stringify(product.zenovaCategories)}`);
      console.log(`   category: ${product.category}`);
      console.log('');
      console.log('✅ IMMAGINI:');
      console.log(`   Totale: ${product.images ? product.images.length : 0}`);
      if (product.images) {
        product.images.slice(0, 2).forEach((img, i) => {
          console.log(`   ${i+1}. ${img}`);
        });
      }
      console.log('');
      console.log('═'.repeat(70));

      // Verifica problemi
      const problemi = [];
      if (!product.price || product.price === 0) problemi.push('❌ Prezzo wholesale mancante');
      if (!product.retailPrice || product.retailPrice === 0) problemi.push('❌ Prezzo retail mancante');
      if (!product.zenovaCategories || product.zenovaCategories.length === 0) problemi.push('❌ Categorie mancanti');

      if (problemi.length > 0) {
        console.log('⚠️  PROBLEMI TROVATI:');
        problemi.forEach(p => console.log(`   ${p}`));
      } else {
        console.log('✅ TUTTO OK! Prodotto completo e pronto per la vendita!');
      }
      console.log('═'.repeat(70));

    } catch (e) {
      console.error('❌ Errore parsing:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('❌ Errore richiesta:', e.message);
});
