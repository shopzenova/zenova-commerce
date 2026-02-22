const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

// Genera i codici dai range
function generateCodes(prefix, from, to) {
  const codes = [];
  for (let i = from; i <= to; i++) {
    codes.push(`${prefix}${String(i).padStart(2, '0')}`);
  }
  return codes;
}

const CODES_TO_IMPORT = [
  ...generateCodes('OroNCS-', 1, 6),      // OroNCS-01 to 06
  ...generateCodes('SMI-', 1, 8),          // SMI-01 to 08
  ...generateCodes('NBoti-', 1, 9),        // NBoti-01 to 09
  ...generateCodes('RitRinc-', 3, 16),     // RitRinc-03 to 16
  ...generateCodes('TribalSi-', 1, 10),    // TribalSi-01 to 10
];

console.log(`Codici da importare: ${CODES_TO_IMPORT.length}`);
console.log(CODES_TO_IMPORT.join(', '));

async function main() {
  // 1. Scan portfolio to find these products
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
  if (notFound.length > 0) {
    console.log('NON trovati nel portfolio:', notFound.join(', '));
  }

  // 2. Get data feed for more details (images, description, price)
  console.log('\nScarico data feed per dettagli...');
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feedData = feedRes.data.data || feedRes.data || [];

  // Build feed lookup by code
  const feedByCode = new Map();
  for (const item of feedData) {
    const code = (item[1] || '').toUpperCase();
    if (codesUpper.has(code)) {
      feedByCode.set(code, item);
    }
  }
  console.log(`Trovati nel data feed: ${feedByCode.size}`);

  // 3. Import each product
  console.log('\n=== IMPORTAZIONE INCENSI ===');
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const code of CODES_TO_IMPORT) {
    const codeUpper = code.toUpperCase();
    const portfolioProduct = found.get(codeUpper);
    const feedProduct = feedByCode.get(codeUpper);

    if (!portfolioProduct && !feedProduct) {
      console.log(`SKIP ${code} - non trovato né nel portfolio né nel feed`);
      skipped++;
      continue;
    }

    // Get product details from feed
    // Feed fields: [0]=active, [1]=code, [2]=?, [3]=name, [4]=ean, [5]=?, [6]=price(wholesale),
    // ...[10]=name_alt, [11]=retailPrice, [12]=weight, ...[22]=stock, [23]=image
    const name = portfolioProduct?.name || (feedProduct ? feedProduct[10] || feedProduct[3] : code);
    const ean = feedProduct ? feedProduct[4] : null;
    const wholesalePrice = feedProduct ? parseFloat(feedProduct[6]) || 0 : 0;
    const retailPrice = feedProduct ? parseFloat(feedProduct[11]) || 0 : 0;
    const weight = feedProduct ? parseFloat(feedProduct[12]) || null : null;
    const stock = feedProduct ? parseInt(feedProduct[22]) || 0 : 0;
    const imageUrl = feedProduct ? feedProduct[23] : null;

    // Calculate price: retailPrice from AW, or wholesale * 2 as fallback
    const price = retailPrice > 0 ? retailPrice : (wholesalePrice * 2);

    // Check if already exists
    const existing = await prisma.product.findUnique({ where: { id: code } });
    if (existing) {
      console.log(`SKIP ${code} - già nel DB`);
      skipped++;
      continue;
    }

    // Build product data
    const productData = {
      id: code,
      name: name,
      description: '',
      price: wholesalePrice || price || 10,
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
      category: 'Incenso',
      zenovaCategory: 'natural-wellness',
      zenovaSubcategory: 'incenso',
      minQuantity: 1, // Default, lo imposteremo dopo il test
    };

    console.log(`IMPORT ${code}: ${name.substring(0, 55)} | costo:€${wholesalePrice} retail:€${price} | stock:${stock}`);

    try {
      await prisma.product.create({ data: productData });
      imported++;
    } catch (err) {
      console.log(`  ERROR: ${err.message.substring(0, 100)}`);
      errors++;
    }
  }

  console.log(`\n=== RISULTATO ===`);
  console.log(`Importati: ${imported}`);
  console.log(`Skippati: ${skipped}`);
  console.log(`Errori: ${errors}`);
  console.log(`Totale: ${CODES_TO_IMPORT.length}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error('FATAL ERROR:', e.message); prisma.$disconnect(); });
