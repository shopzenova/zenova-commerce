const axios = require('axios');
require('dotenv').config();

async function main() {
  // 1. CSV feed - tutti i prodotti AW con status e stock
  const csvRes = await axios.get('https://www.aw-dropship.eu/aatom-dssk/data-feed.csv', { timeout: 30000 });
  const lines = csvRes.data.split('\n').filter(l => l.trim());
  const header = lines[0];

  // Find column indices
  // Status, Product code, Family, Barcode, CPNP, Price, Units per outer, Unit label, Unit price, Unit Name, Unit RRP, ...Stock(col 21), Available Quantity(col 27)
  console.log('=== CSV FEED: tutti i diffusori AATOM ===');
  console.log('Status | Codice | Prezzo | Stock | Nome');
  console.log('-'.repeat(80));

  let activeCount = 0, discCount = 0, withStock = 0;
  for (let i = 1; i < lines.length; i++) {
    const match = lines[i].match(/"([^"]*)"/g);
    if (!match) continue;
    const fields = match.map(f => f.replace(/"/g, ''));
    const status = fields[0];
    const code = fields[1];
    const price = fields[5] || fields[8] || '?';
    const name = fields[9] || '';
    const stock = fields[21] || '?';
    const availQty = fields[27] || '?';

    if (status === 'Active') activeCount++;
    else discCount++;
    if (stock !== '0' && stock !== '?' && stock !== '') withStock++;

    console.log(`${status.padEnd(15)} | ${code.padEnd(10)} | €${price.padEnd(6)} | stock:${stock.padEnd(5)} qty:${availQty.padEnd(5)} | ${name.substring(0, 45)}`);
  }
  console.log('-'.repeat(80));
  console.log(`Totale: ${lines.length - 1} | Active: ${activeCount} | Discontinuing: ${discCount} | Con stock: ${withStock}`);

  // 2. Portfolio API - quali AATOM ci sono
  const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
  const token = process.env.AW_API_TOKEN;
  const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

  let portfolioAATOM = [];
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    for (const p of (r.data.data || [])) {
      if (p.code && p.code.toUpperCase().startsWith('AATOM')) {
        portfolioAATOM.push(p.code);
      }
    }
    if (page >= (r.data.meta?.last_page || 1)) break;
    page++;
  }
  console.log(`\n=== NEL PORTFOLIO API: ${portfolioAATOM.length} AATOM ===`);
  console.log(portfolioAATOM.sort().join(', '));

  // 3. Zenova DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const dbAATOM = await prisma.product.findMany({
    where: { id: { startsWith: 'AATOM' } },
    select: { id: true, visible: true, stock: true },
    orderBy: { id: 'asc' }
  });
  console.log(`\n=== NEL DB ZENOVA: ${dbAATOM.length} AATOM ===`);
  console.log(dbAATOM.map(p => `${p.id}(v:${p.visible},s:${p.stock})`).join(', '));

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
