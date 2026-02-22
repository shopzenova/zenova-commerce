const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

const CODES = [];
for (let i = 1; i <= 14; i++) CODES.push('SoyP-' + String(i).padStart(2, '0'));

const translations = {
  'SoyP-01': 'Candela di Soia Profumata in Vasetto - Lavanda',
  'SoyP-02': 'Candela di Soia Profumata in Vasetto - Lino Fresco',
  'SoyP-03': 'Candela di Soia Profumata in Vasetto - Cetriolo',
  'SoyP-04': 'Candela di Soia Profumata in Vasetto - Violetta',
  'SoyP-05': 'Candela di Soia Profumata in Vasetto - Frutti Invernali',
  'SoyP-06': 'Candela di Soia Profumata in Vasetto - Caprifoglio',
  'SoyP-07': 'Candela di Soia Profumata in Vasetto - Muschio Mistico',
  'SoyP-08': 'Candela di Soia Profumata in Vasetto - Ali di Gelsomino',
  'SoyP-09': 'Candela di Soia Profumata in Vasetto - Melograno',
  'SoyP-10': 'Candela di Soia Profumata in Vasetto - Rosa di Mezzanotte',
  'SoyP-11': 'Candela di Soia Profumata in Vasetto - Mela e Cannella',
  'SoyP-12': 'Candela di Soia Profumata in Vasetto - Burro al Brandy',
  'SoyP-13': 'Candela di Soia Profumata in Vasetto - Vaniglia',
  'SoyP-14': 'Candela di Soia Profumata in Vasetto - Arancia Speziata',
};

async function main() {
  const feedRes = await client.get('/dropshipping/my-products-data-feed-json');
  const feedData = feedRes.data.data || feedRes.data || [];
  const codesUpper = new Set(CODES.map(c => c.toUpperCase()));

  let imported = 0;
  for (const item of feedData) {
    const code = (item[1] || '').toUpperCase();
    if (!codesUpper.has(code)) continue;

    const realCode = item[1];
    const ean = item[4];
    const wholesalePrice = parseFloat(item[6]) || 0;
    const retailPrice = parseFloat(item[11]) || 0;
    const weight = parseFloat(item[12]) || null;
    const stock = parseInt(item[22]) || 0;
    const imageUrl = item[23];
    const price = retailPrice > 0 ? retailPrice : (wholesalePrice * 2);
    const finalRetail = (retailPrice || price || 10) + 3;
    const italianName = translations[realCode] || item[10] || item[3] || realCode;

    const existing = await prisma.product.findUnique({ where: { id: realCode } });
    if (existing) { console.log('SKIP ' + realCode + ' - gia nel DB'); continue; }

    await prisma.product.create({ data: {
      id: realCode, name: italianName, description: '',
      price: wholesalePrice || price || 10,
      retailPrice: finalRetail,
      wholesalePrice: wholesalePrice || null,
      stock, source: 'aw', active: true, visible: true,
      image: imageUrl || null, images: imageUrl ? [imageUrl] : [],
      ean: ean || null, weight, category: 'Candele Profumate',
      zenovaCategory: 'natural-wellness', zenovaSubcategory: 'candele-profumate',
      minQuantity: finalRetail < 7 ? 3 : 1,
    }});
    console.log(`IMPORT ${realCode}: ${italianName.substring(0, 55)} | costo:€${wholesalePrice} retail:€${finalRetail.toFixed(2)} | stock:${stock} | minQty:${finalRetail < 7 ? 3 : 1}`);
    imported++;
  }
  console.log(`\nImportati: ${imported}/${CODES.length}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
