const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Get all EOUL products from Zenova DB
  const dbProducts = await prisma.product.findMany({
    where: { id: { startsWith: 'EOUL' } },
    select: { id: true, name: true, active: true, visible: true },
    orderBy: { id: 'asc' }
  });
  console.log('EOUL in Zenova DB: ' + dbProducts.length);
  for (const p of dbProducts) {
    console.log(`  ${p.id} - active:${p.active} visible:${p.visible} - ${(p.name||'').substring(0,50)}`);
  }

  // Get portfolio and check which EOUL are there
  let portfolio = new Map();
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && p.code.toUpperCase().startsWith('EOUL')) {
        portfolio.set(p.code.toUpperCase(), p);
      }
    }
    const lastPage = r.data.meta?.last_page || 1;
    if (page >= lastPage) break;
    page++;
  }
  console.log('\nEOUL nel portfolio AW: ' + portfolio.size);
  for (const [code, p] of [...portfolio].sort((a,b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${code} - ${(p.name||'').substring(0,50)}`);
  }

  // Check which DB ones are missing from portfolio
  const missingCodes = ['EOUL-32','EOUL-37','EOUL-40','EOUL-44','EOUL-45','EOUL-50','EOUL-55'];
  console.log('\n--- 7 EOUL mancanti ---');
  for (const code of missingCodes) {
    const inDb = dbProducts.find(p => p.id === code);
    const inPortfolio = portfolio.has(code.toUpperCase());
    console.log(`  ${code}: DB=${inDb ? 'SI' : 'NO'}, Portfolio=${inPortfolio ? 'SI' : 'NO'}`);
  }

  // Also check the general catalog for these missing ones
  console.log('\n--- Cerco nel catalogo generale AW ---');
  let catalogPage = 1;
  let foundInCatalog = [];
  while (true) {
    const r = await client.get('/dropshipping/products', { params: { page: catalogPage, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && p.code.toUpperCase().startsWith('EOUL')) {
        const code = p.code.toUpperCase();
        if (missingCodes.includes(code) || missingCodes.map(c => c.toUpperCase()).includes(code)) {
          foundInCatalog.push({ code: p.code, id: p.id, name: (p.name||'').substring(0,50) });
        }
      }
    }
    const lastPage = r.data.meta?.last_page || 1;
    if (catalogPage >= lastPage) break;
    catalogPage++;
  }
  console.log('Trovati nel catalogo generale: ' + foundInCatalog.length);
  for (const p of foundInCatalog) {
    console.log(`  ${p.code} (ID ${p.id}) - ${p.name}`);
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
