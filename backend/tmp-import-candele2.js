const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

const CODES_TO_IMPORT = [
  'HHC-02',
  'FLCand-04',
  'ACBFC-01', 'ACBFC-02', 'ACBFC-03', 'ACBFC-04', 'ACBFC-05', 'ACBFC-06', 'ACBFC-07',
  'ACJJ-01', 'ACJJ-02', 'ACJJ-03', 'ACJJ-04', 'ACJJ-05', 'ACJJ-06', 'ACJJ-07', 'ACJJ-08',
  'ACJJ-09', 'ACJJ-10', 'ACJJ-11', 'ACJJ-12', 'ACJJ-13', 'ACJJ-14', 'ACJJ-15', 'ACJJ-16',
  'ACJJ-17', 'ACJJ-18', 'ACJJ-19', 'ACJJ-20', 'ACJJ-21', 'ACJJ-22', 'ACJJ-23', 'ACJJ-24',
  'ACJJ-25', 'ACJJ-26',
  'ACKC-02', 'ACKC-03', 'ACKC-04', 'ACKC-05', 'ACKC-06', 'ACKC-07', 'ACKC-08', 'ACKC-09',
  'ACKC-10', 'ACKC-11', 'ACKC-12', 'ACKC-13', 'ACKC-14', 'ACKC-15', 'ACKC-16', 'ACKC-17',
  'ACKC-18', 'ACKC-19', 'ACKC-20', 'ACKC-21', 'ACKC-22',
  'BotC-04', 'BotC-05', 'BotC-06',
];

async function main() {
  // 1. Scan portfolio to find these products
  console.log(`Cerco ${CODES_TO_IMPORT.length} candele nel portfolio AW...`);
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
  if (notFound.length > 0) {
    console.log('NON trovati:', notFound.join(', '));
  }

  // 2. Get data feed for more details (images, description, price)
  console.log('\nScarico data feed per dettagli...');
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feedData = feedRes.data.data || feedRes.data || [];

  const feedByCode = new Map();
  for (const item of feedData) {
    const code = (item[1] || '').toUpperCase();
    if (codesUpper.has(code)) {
      feedByCode.set(code, item);
    }
  }
  console.log(`Trovati nel data feed: ${feedByCode.size}`);

  // 3. Import each product
  console.log('\n=== IMPORTAZIONE CANDELE ===');
  let imported = 0;

  for (const code of CODES_TO_IMPORT) {
    const codeUpper = code.toUpperCase();
    const portfolioProduct = found.get(codeUpper);
    const feedProduct = feedByCode.get(codeUpper);

    if (!portfolioProduct && !feedProduct) {
      console.log(`SKIP ${code} - non trovato né nel portfolio né nel feed`);
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

    // Check if already exists
    const existing = await prisma.product.findUnique({ where: { id: code } });
    const existingAw = await prisma.product.findUnique({ where: { id: 'aw-' + code.toLowerCase() } });

    if (existing || existingAw) {
      console.log(`SKIP ${code} - già nel DB (${existing ? existing.id : existingAw.id})`);
      continue;
    }

    const productData = {
      id: code,
      name: name,
      description: '',
      price: price || 10,
      retailPrice: retailPrice || price || 10,
      wholesalePrice: wholesalePrice || null,
      stock: stock,
      source: 'aw',
      active: true,
      visible: true,
      image: imageUrl || null,
      images: imageUrl ? [imageUrl] : [],
      ean: ean || null,
      weight: weight,
      category: 'Candele Profumate',
      zenovaCategory: 'natural-wellness',
      zenovaSubcategory: 'candele-profumate',
    };

    console.log(`IMPORT ${code}: ${name.substring(0, 50)} | €${price} | stock:${stock}`);
    console.log(`  image: ${imageUrl ? imageUrl.substring(0, 60) + '...' : 'NONE'}`);

    try {
      await prisma.product.create({ data: productData });
      imported++;
    } catch (err) {
      console.log(`  ERROR: ${err.message.substring(0, 100)}`);
    }
  }

  console.log(`\n=== Importati: ${imported}/${CODES_TO_IMPORT.length} ===`);

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
