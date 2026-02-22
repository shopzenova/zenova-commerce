const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

const CODES = ['GoldNCS-01','GoldNCS-02','GoldNCS-03','GoldNCS-04','GoldNCS-05','GoldNCS-06'];

async function main() {
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feedData = feedRes.data.data || feedRes.data || [];
  const codesUpper = new Set(CODES.map(c => c.toUpperCase()));

  let imported = 0;
  for (const item of feedData) {
    const code = (item[1] || '').toUpperCase();
    if (!codesUpper.has(code)) continue;

    const realCode = item[1];
    const name = item[10] || item[3] || realCode;
    const ean = item[4];
    const wholesalePrice = parseFloat(item[6]) || 0;
    const retailPrice = parseFloat(item[11]) || 0;
    const weight = parseFloat(item[12]) || null;
    const stock = parseInt(item[22]) || 0;
    const imageUrl = item[23];
    const price = retailPrice > 0 ? retailPrice : (wholesalePrice * 2);

    const existing = await prisma.product.findUnique({ where: { id: realCode } });
    if (existing) { console.log('SKIP ' + realCode + ' - gia nel DB'); continue; }

    await prisma.product.create({ data: {
      id: realCode, name, description: '', price: wholesalePrice || price || 10,
      retailPrice: retailPrice || price || 10, wholesalePrice: wholesalePrice || null,
      stock, source: 'aw', active: true, visible: true,
      image: imageUrl || null, images: imageUrl ? [imageUrl] : [],
      ean: ean || null, weight, category: 'Incenso',
      zenovaCategory: 'natural-wellness', zenovaSubcategory: 'incenso', minQuantity: 1
    }});
    console.log(`IMPORT ${realCode}: ${name.substring(0,55)} | cost:€${wholesalePrice} retail:€${retailPrice} stock:${stock}`);
    imported++;
  }
  console.log(`\nImportati: ${imported}/${CODES.length}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
