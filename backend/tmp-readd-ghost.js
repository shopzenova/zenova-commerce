const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 30000 });

async function main() {
  // Scan the full catalog for AATOM products
  console.log('=== Scansione catalogo per AATOM ===');
  let page = 1;
  let aatomProducts = [];
  while (true) {
    const r = await client.get('/dropshipping/products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && p.code.toUpperCase().startsWith('AATOM')) {
        aatomProducts.push({ code: p.code, id: p.id, name: (p.name || '').substring(0, 50) });
      }
    }
    const lastPage = r.data.meta?.last_page || 1;
    if (page >= lastPage) break;
    page++;
    // Show progress every 5 pages
    if (page % 5 === 0) process.stdout.write(`  Page ${page}/${lastPage}...\r`);
  }

  console.log(`\nAATOM trovati nel catalogo: ${aatomProducts.length}`);
  for (const p of aatomProducts) {
    console.log(`  ${p.code} - catalog ID: ${p.id} - ${p.name}`);
  }

  if (aatomProducts.length === 0) {
    console.log('Nessun AATOM nel catalogo! Il catalogo API non li restituisce.');

    // Try individual product endpoint
    console.log('\n=== Provo endpoint singolo prodotto ===');
    // Try a range of IDs
    for (const testId of [1, 100, 1000, 5000, 10000]) {
      try {
        const r = await client.get(`/dropshipping/products/${testId}`);
        console.log(`  ID ${testId}: ${r.data.data?.code || r.data.code || 'found'}`);
      } catch (err) {
        console.log(`  ID ${testId}: ${err.response?.status}`);
      }
    }

    // Try to use the CSV to get info and then store
    console.log('\n=== Provo a usare il CSV feed ===');
    const csvRes = await axios.get('https://www.aw-dropship.eu/aatom-dssk/data-feed.csv', { timeout: 30000 });
    const lines = csvRes.data.split('\n').filter(l => l.trim());
    const header = lines[0];

    // Parse AATOM-11 row to get barcode/EAN
    for (let i = 1; i < Math.min(lines.length, 5); i++) {
      const match = lines[i].match(/"([^"]*)"/g);
      if (match) {
        const code = match[1].replace(/"/g, '');
        const barcode = match[3].replace(/"/g, '');
        console.log(`  ${code} - barcode: ${barcode}`);
      }
    }

    // Try store endpoint with product code directly
    console.log('\n=== Provo store con codice diretto ===');
    try {
      const r = await client.post('/dropshipping/products/my-products/store', { code: 'AATOM-11' });
      console.log('SUCCESS:', JSON.stringify(r.data).substring(0, 300));
    } catch (err) {
      console.log('POST store:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }

    // Try with barcode
    try {
      const r = await client.post('/dropshipping/products/my-products/store', { barcode: '5055796505364' });
      console.log('SUCCESS barcode:', JSON.stringify(r.data).substring(0, 300));
    } catch (err) {
      console.log('POST barcode:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }
  } else {
    // Found in catalog, try to add first one
    const test = aatomProducts[0];
    console.log(`\nProvo ad aggiungere ${test.code} (ID ${test.id}) al portfolio...`);
    try {
      const res = await client.post(`/dropshipping/products/my-products/${test.id}/store`);
      console.log('SUCCESS:', JSON.stringify(res.data).substring(0, 300));
    } catch (err) {
      console.log('ERROR:', err.response?.status, JSON.stringify(err.response?.data).substring(0, 300));
    }
  }
}
main().catch(e => console.error('ERROR:', e.message));
