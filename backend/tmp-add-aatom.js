const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 30000 });

async function main() {
  // 1. Get full catalog and find AATOM-11 numeric ID
  console.log('Loading catalog to find AATOM products...');
  let catalog = new Map();
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && p.code.toUpperCase().includes('AATOM')) {
        catalog.set(p.code.toUpperCase(), p.id);
      }
    }
    const lastPage = r.data.meta?.last_page || 1;
    if (page >= lastPage) break;
    page++;
  }

  console.log(`AATOM nel catalogo generale: ${catalog.size}`);
  for (const [code, id] of catalog) {
    console.log(`  ${code} → catalog ID ${id}`);
  }

  // 2. Try to add AATOM-11 to my-products using catalog ID
  const testCode = 'AATOM-11';
  const testId = catalog.get(testCode);

  if (testId) {
    console.log(`\nProvo ad aggiungere ${testCode} (catalog ID ${testId}) al portfolio...`);
    try {
      const res = await client.post(`/dropshipping/products/my-products/${testId}/store`);
      console.log('SUCCESS:', JSON.stringify(res.data).substring(0, 500));
    } catch (err) {
      console.log('ERROR:', err.response?.status, JSON.stringify(err.response?.data)?.substring(0, 300));
    }
  } else {
    console.log(`${testCode} NON trovato nel catalogo generale`);
  }
}

main().catch(e => console.error('FATAL:', e.message));
