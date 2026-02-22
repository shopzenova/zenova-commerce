const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

const CODES_TO_IMPORT = [
  'PSH-05', 'BRIW-03', 'ISH-96M', 'BCI-13', 'BIB-17', 'ISH-132M',
  'BRIW-01', 'PSMH-05', 'PSMH-03', 'MIP-01', 'ATIH-05', 'ATIH-04',
  'OBToL-01', 'OBToL-02', 'SoapOB-15', 'OBCW-02'
];

async function main() {
  // 1. Scan portfolio to find these products
  console.log('Cerco i 16 bruciatori nel portfolio AW...');
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

  // Build feed lookup by code
  const feedByCode = new Map();
  for (const item of feedData) {
    // Feed items have indexed fields: [0]=active, [1]=code, [2]=?, [3]=name, [4]=ean, [5]=?, [6]=price, ...
    const code = (item[1] || '').toUpperCase();
    if (codesUpper.has(code)) {
      feedByCode.set(code, item);
    }
  }
  console.log(`Trovati nel data feed: ${feedByCode.size}`);

  // 3. Import each product
  console.log('\n=== IMPORTAZIONE ===');
  let imported = 0;

  for (const code of CODES_TO_IMPORT) {
    const codeUpper = code.toUpperCase();
    const portfolioProduct = found.get(codeUpper);
    const feedProduct = feedByCode.get(codeUpper);

    if (!portfolioProduct && !feedProduct) {
      console.log(`SKIP ${code} - non trovato né nel portfolio né nel feed`);
      continue;
    }

    // Get product details
    const name = portfolioProduct?.name || (feedProduct ? feedProduct[10] || feedProduct[3] : code);
    const ean = feedProduct ? feedProduct[4] : null;
    const wholesalePrice = feedProduct ? parseFloat(feedProduct[6]) || 0 : 0;
    const retailPrice = feedProduct ? parseFloat(feedProduct[11]) || 0 : 0;
    const weight = feedProduct ? parseFloat(feedProduct[12]) || null : null;
    const stock = feedProduct ? parseInt(feedProduct[22]) || 0 : 0;
    const imageUrl = feedProduct ? feedProduct[23] : null;

    // Calculate price: wholesale + markup
    const price = retailPrice > 0 ? retailPrice : (wholesalePrice * 2);

    // Check if already exists
    const existing = await prisma.product.findUnique({ where: { id: code } });
    const existingAw = await prisma.product.findUnique({ where: { id: 'aw-' + code.toLowerCase() } });

    if (existing || existingAw) {
      console.log(`SKIP ${code} - già nel DB (${existing ? existing.id : existingAw.id})`);
      continue;
    }

    // Build product data
    const productData = {
      id: code,
      name: name,
      description: '', // Will need translation later
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
      category: 'Bruciatori',
      zenovaCategory: 'Casa & Atmosfera',
      zenovaSubcategory: 'Bruciatori per Cere',
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
