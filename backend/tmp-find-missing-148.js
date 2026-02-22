const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

async function main() {
  // 1. Get all AW products from Zenova DB
  const dbProducts = await prisma.product.findMany({
    where: { source: 'aw' },
    select: { id: true }
  });
  const dbCodes = new Set(dbProducts.map(p => p.id.toUpperCase()));
  // Also check with aw- prefix
  const dbCodesWithPrefix = new Set(dbProducts.map(p => ('aw-' + p.id).toUpperCase()));
  // And without prefix
  const dbCodesWithoutPrefix = new Set(dbProducts.map(p => p.id.replace(/^aw-/i, '').toUpperCase()));

  console.log(`Prodotti AW nel DB Zenova: ${dbProducts.length}`);

  // 2. Get all portfolio products
  let portfolio = [];
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    portfolio.push(...products);
    if (page >= (r.data.meta?.last_page || 1)) break;
    page++;
  }
  console.log(`Portfolio AW totale: ${portfolio.length}`);

  // 3. Find products in portfolio but NOT in DB
  const missing = [];
  for (const p of portfolio) {
    const code = (p.code || '').toUpperCase();
    const codeWithPrefix = ('AW-' + code).toUpperCase();
    const codeWithoutPrefix = code.replace(/^AW-/i, '');

    if (!dbCodes.has(code) && !dbCodes.has(codeWithPrefix) && !dbCodes.has(codeWithoutPrefix) &&
        !dbCodesWithPrefix.has(code) && !dbCodesWithoutPrefix.has(code)) {
      missing.push({
        code: p.code,
        name: (p.name || '').substring(0, 60),
        id: p.id
      });
    }
  }

  console.log(`\nProdotti nel portfolio ma NON nel DB: ${missing.length}\n`);

  // Group by family/prefix
  const byFamily = {};
  for (const m of missing) {
    const prefix = m.code.replace(/-\d+.*$/, '').replace(/-[A-Z]+$/, '');
    if (!byFamily[prefix]) byFamily[prefix] = [];
    byFamily[prefix].push(m);
  }

  for (const [family, products] of Object.entries(byFamily).sort((a,b) => b[1].length - a[1].length)) {
    console.log(`\n=== ${family} (${products.length} prodotti) ===`);
    for (const p of products) {
      console.log(`  ${p.code} - ${p.name}`);
    }
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
