const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

async function main() {
  // 1. Conta totale catalogo
  const r1 = await client.get('/dropshipping/products', { params: { page: 1, per_page: 1, sort: 'code' } });
  console.log('Catalogo totale:', r1.data.meta?.total);

  // 2. Conta totale portfolio
  const r2 = await client.get('/dropshipping/products/my-products', { params: { page: 1, per_page: 1, sort: 'code' } });
  console.log('Portfolio totale:', r2.data.meta?.total);

  // 3. Data feed JSON totale
  const r3 = await client.get('/dropshipping/my-products-data-feed-json');
  console.log('Data feed JSON totale:', r3.data.data?.length || r3.data?.length);

  // 4. Prova tutti gli endpoint possibili per trovare AATOM-11
  console.log('\n=== RICERCA AATOM-11 su tutti gli endpoint ===');

  const tests = [
    { name: 'Catalogo con sort code, prima pagina', url: '/dropshipping/products', params: { page: 1, per_page: 10, sort: 'code' } },
    { name: 'Portfolio con sort code, prima pagina', url: '/dropshipping/products/my-products', params: { page: 1, per_page: 10, sort: 'code' } },
    { name: 'Catalogo senza sort', url: '/dropshipping/products', params: { page: 1, per_page: 10 } },
    { name: 'Portfolio senza sort', url: '/dropshipping/products/my-products', params: { page: 1, per_page: 10 } },
  ];

  for (const t of tests) {
    try {
      const r = await client.get(t.url, { params: t.params });
      const products = r.data.data || [];
      console.log(`\n${t.name}:`);
      console.log(`  Totale: ${r.data.meta?.total}, Pagine: ${r.data.meta?.last_page}`);
      console.log(`  Primi codici: ${products.slice(0, 5).map(p => p.code).join(', ')}`);
    } catch (err) {
      console.log(`${t.name}: ERROR ${err.response?.status}`);
    }
  }

  // 5. Prova a cercare un prodotto che SAPPIAMO essere nel portfolio (es. BackF-08)
  console.log('\n=== CONFRONTO: prodotto funzionante vs fantasma ===');

  // Scan portfolio for BackF-08 and AATOM-11
  let foundBackF = false, foundAATOM = false;
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code === 'BackF-08') { foundBackF = true; console.log('BackF-08 TROVATO nel portfolio - my_product_id:', p.my_product_id, 'id:', p.id); }
      if (p.code && p.code.toUpperCase().startsWith('AATOM')) { foundAATOM = true; console.log('AATOM trovato!:', p.code, p.id); }
    }
    if (page >= (r.data.meta?.last_page || 1)) break;
    page++;
  }
  if (!foundBackF) console.log('BackF-08 NON trovato nel portfolio');
  if (!foundAATOM) console.log('Nessun AATOM trovato nel portfolio');

  // 6. Scan catalog for AATOM
  console.log('\n=== CATALOGO: cerca AATOM ===');
  page = 1;
  let catalogAATOM = false;
  while (true) {
    const r = await client.get('/dropshipping/products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && p.code.toUpperCase().startsWith('AATOM')) {
        catalogAATOM = true;
        console.log('AATOM in catalogo:', p.code, p.id);
      }
    }
    if (page >= (r.data.meta?.last_page || 1)) break;
    page++;
  }
  if (!catalogAATOM) console.log('Nessun AATOM nel catalogo generale');

  // 7. Check CSV feed for other families too
  console.log('\n=== CSV FEEDS ===');
  const csvUrl = 'https://www.aw-dropship.eu/aatom-dssk/data-feed.csv';
  try {
    const csv = await axios.get(csvUrl, { timeout: 15000 });
    const lines = csv.data.split('\n').filter(l => l.trim());
    console.log(`AATOM CSV: ${lines.length - 1} prodotti`);
  } catch (e) {
    console.log('CSV error:', e.message);
  }

  // 8. Provo endpoint diversi
  console.log('\n=== ENDPOINT ALTERNATIVI ===');
  const altEndpoints = [
    '/dropshipping/products?filter[slug]=aatom-11',
    '/dropshipping/products?filter[code]=AATOM-11',
    '/dropshipping/products?q=AATOM',
  ];
  for (const ep of altEndpoints) {
    try {
      const r = await client.get(ep);
      const count = r.data.data?.length || r.data?.length || 0;
      console.log(`  ${ep}: ${count} risultati`);
    } catch (err) {
      console.log(`  ${ep}: ERROR ${err.response?.status}`);
    }
  }
}
main().catch(e => console.error('ERROR:', e.message));
