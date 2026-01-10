const https = require('https');

console.log('🧪 Testing API /products endpoint...\n');

const options = {
  hostname: 'zenova-commerce-production.up.railway.app',
  port: 443,
  path: '/api/products?pageSize=10000',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const products = json.data || [];
      const bundles = products.filter(p => p.source === 'zenova-bundle' || p.bundleContents);

      console.log('📊 API Response:');
      console.log('Total products returned:', products.length);
      console.log('Bundles found:', bundles.length);

      if (bundles.length > 0) {
        console.log('\n🎁 Bundles in API:');
        bundles.forEach(b => {
          console.log('  -', b.id, '|', b.name);
          console.log('    bundleContents:', b.bundleContents ? b.bundleContents.length + ' items' : 'MISSING');
        });
      } else {
        console.log('\n❌ NO BUNDLES IN API RESPONSE!');
      }

      console.log('\n✅ Test completato');
    } catch (error) {
      console.error('❌ Error parsing JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();
