const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

function generateCodes(prefix, from, to) {
  const codes = [];
  for (let i = from; i <= to; i++) {
    codes.push(`${prefix}${String(i).padStart(2, '0')}`);
  }
  return codes;
}

const CODES_TO_IMPORT = [
  ...generateCodes('OliveC-', 2, 11),     // OliveC-02 to 11
  ...generateCodes('SoiaP-', 1, 15),      // SoiaP-01 to 15
  ...generateCodes('CWC-', 1, 10),        // CWC-01 to 10
  ...generateCodes('WLSoyC-', 3, 10),     // WLSoyC-03 to 10
  ...generateCodes('RJC-', 3, 8),         // RJC-03 to 08
  'HHC-02',                                // HHC-02 singolo
];

console.log(`Codici da importare: ${CODES_TO_IMPORT.length}`);
console.log(CODES_TO_IMPORT.join(', '));

async function main() {
  // 1. Scan portfolio
  console.log('\nCerco i prodotti nel portfolio AW...');
  const codesUpper = new Set(CODES_TO_IMPORT.map(c => c.toUpperCase()));
  const found = new Map();

  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code && codesUpper.has(p.code.toUpperCase())) {
        found.set(p.code.toUpperCase(), p);
      }
    }
    if (page >= (r.data.meta?.last_page || 1)) break;
    page++;
  }

  console.log(`Trovati nel portfolio: ${found.size}/${CODES_TO_IMPORT.length}`);
  const notFound = CODES_TO_IMPORT.filter(c => !found.has(c.toUpperCase()));
  if (notFound.length > 0) console.log('NON trovati:', notFound.join(', '));

  // 2. Data feed
  console.log('\nScarico data feed...');
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feedData = feedRes.data.data || feedRes.data || [];

  const feedByCode = new Map();
  for (const item of feedData) {
    const code = (item[1] || '').toUpperCase();
    if (codesUpper.has(code)) feedByCode.set(code, item);
  }
  console.log(`Trovati nel data feed: ${feedByCode.size}`);

  // 3. Import
  console.log('\n=== IMPORTAZIONE CANDELE PROFUMATE ===');
  let imported = 0, skipped = 0, errors = 0;

  for (const code of CODES_TO_IMPORT) {
    const codeUpper = code.toUpperCase();
    const portfolioProduct = found.get(codeUpper);
    const feedProduct = feedByCode.get(codeUpper);

    if (!portfolioProduct && !feedProduct) {
      console.log(`SKIP ${code} - non trovato`);
      skipped++;
      continue;
    }

    const name = portfolioProduct?.name || (feedProduct ? feedProduct[10] || feedProduct[3] : code);
    const ean = feedProduct ? feedProduct[4] : null;
    const wholesalePrice = feedProduct ? parseFloat(feedProduct[6]) || 0 : 0;
    const retailPrice = feedProduct ? parseFloat(feedProduct[11]) || 0 : 0;
    const weight = feedProduct ? parseFloat(feedProduct[12]) || null : null;
    const stock = feedProduct ? parseInt(feedProduct[22]) || 0 : 0;
    const imageUrl = feedProduct ? feedProduct[23] : null;
    const price = retailPrice > 0 ? retailPrice : (wholesalePrice * 2);

    // +€3 spedizione spalmata
    const finalRetail = (retailPrice || price || 10) + 3;

    const existing = await prisma.product.findUnique({ where: { id: code } });
    if (existing) { console.log(`SKIP ${code} - già nel DB`); skipped++; continue; }

    try {
      await prisma.product.create({ data: {
        id: code, name, description: '',
        price: wholesalePrice || price || 10,
        retailPrice: finalRetail,
        wholesalePrice: wholesalePrice || null,
        stock, source: 'aw', active: true, visible: true,
        image: imageUrl || null, images: imageUrl ? [imageUrl] : [],
        ean: ean || null, weight, category: 'Candele Profumate',
        zenovaCategory: 'natural-wellness', zenovaSubcategory: 'candele-profumate',
        minQuantity: finalRetail < 7 ? 3 : 1,
      }});
      console.log(`IMPORT ${code}: ${name.substring(0, 55)} | costo:€${wholesalePrice} retail:€${finalRetail.toFixed(2)} | stock:${stock} | minQty:${finalRetail < 7 ? 3 : 1}`);
      imported++;
    } catch (err) {
      console.log(`  ERROR ${code}: ${err.message.substring(0, 100)}`);
      errors++;
    }
  }

  console.log(`\n=== RISULTATO ===`);
  console.log(`Importati: ${imported}`);
  console.log(`Skippati: ${skipped}`);
  console.log(`Errori: ${errors}`);

  await prisma.$disconnect();
}
main().catch(e => { console.error('FATAL:', e.message); prisma.$disconnect(); });
