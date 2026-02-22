const axios = require('axios');
require('dotenv').config();

async function main() {
  // Fetch the AATOM CSV feed
  const csvRes = await axios.get('https://www.aw-dropship.eu/aatom-dssk/data-feed.csv', { timeout: 30000 });
  const lines = csvRes.data.split('\n').filter(l => l.trim());

  console.log('=== AATOM CSV FEED ===');
  console.log('Header:', lines[0]);
  console.log('\nProdotti:');
  for (let i = 1; i < lines.length; i++) {
    // Parse CSV - basic
    const match = lines[i].match(/"([^"]*)"/g);
    if (match && match.length >= 3) {
      const status = match[0].replace(/"/g, '');
      const code = match[1].replace(/"/g, '');
      const family = match[2].replace(/"/g, '');
      const price = match[4] ? match[4].replace(/"/g, '') : '';
      const name = match[9] ? match[9].replace(/"/g, '') : '';
      console.log(`  ${code} - ${status} - €${price} - ${name.substring(0, 50)}`);
    }
  }

  // Now check: do these products have a page on the AW API where we can get their ID?
  const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
  const token = process.env.AW_API_TOKEN;
  const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

  // Try searching for AATOM-11 in different ways
  console.log('\n=== SEARCHING FOR AATOM-11 ===');

  // Try filter/search params
  const searchMethods = [
    { url: '/dropshipping/products', params: { filter: 'AATOM-11', per_page: 5 } },
    { url: '/dropshipping/products', params: { search: 'AATOM-11', per_page: 5 } },
    { url: '/dropshipping/products', params: { 'filter[code]': 'AATOM-11', per_page: 5 } },
    { url: '/dropshipping/my-products-data-feed-json', params: { filter: 'AATOM' } },
  ];

  for (const method of searchMethods) {
    try {
      const r = await client.get(method.url, { params: method.params });
      const data = r.data.data || r.data;
      const count = Array.isArray(data) ? data.length : 'obj';
      console.log(`  ${method.url} ${JSON.stringify(method.params)}: ${count} results`);
      if (Array.isArray(data) && data.length > 0 && data.length < 10) {
        data.forEach(p => console.log(`    ${p.code || p.Code} - ID:${p.id || p.Id}`));
      }
    } catch (err) {
      console.log(`  ${method.url}: ERROR ${err.response?.status}`);
    }
  }

  // Check data feed JSON structure - what fields does it have?
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feed = feedRes.data.data;
  if (feed.length > 0) {
    console.log('\n=== DATA FEED JSON STRUCTURE ===');
    console.log('Fields:', Object.keys(feed[0]));
    console.log('Sample:', JSON.stringify(feed[0]).substring(0, 500));
  }
}
main().catch(e => console.error('ERROR:', e.message));
