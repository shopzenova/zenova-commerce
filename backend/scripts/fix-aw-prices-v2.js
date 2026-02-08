/**
 * Fix AW prices v2 - usa originalPrice dal DB o JSON
 * retailPrice = originalPrice + 4
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fix() {
  console.log('🔧 Fix prezzi AW v2 - usa originalPrice dal DB...\n');

  const jsonProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../top-100-products.json'), 'utf-8')
  );

  const awProducts = await prisma.product.findMany({
    where: { source: { in: ['aw', 'aw-dropship'] } },
    select: { id: true, name: true, price: true, retailPrice: true, originalPrice: true }
  });

  console.log(`Prodotti AW: ${awProducts.length}\n`);

  let fixed = 0;
  let skipped = 0;

  for (const p of awProducts) {
    const dbOriginal = p.originalPrice ? parseFloat(p.originalPrice) : null;
    const jsonP = jsonProducts.find(jp => jp.id === p.id);
    const jsonOriginal = (jsonP && jsonP.originalPrice && String(jsonP.originalPrice) !== 'undefined')
      ? parseFloat(jsonP.originalPrice) : null;

    // Priorità: DB originalPrice > JSON originalPrice > DB price
    const originalPrice = dbOriginal || jsonOriginal || parseFloat(p.price);
    const correctRetail = Math.round((originalPrice + 4) * 100) / 100;
    const currentRetail = parseFloat(p.retailPrice);

    if (Math.abs(currentRetail - correctRetail) > 0.1) {
      await prisma.product.update({
        where: { id: p.id },
        data: { retailPrice: correctRetail }
      });
      fixed++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Corretti: ${fixed}`);
  console.log(`✓ Già ok: ${skipped}`);

  // Verifica
  console.log('\n🔍 Verifica prodotti esempio:');
  const samples = ['RIH-04', 'LWMelt-08', 'BackF-08', 'GBBB-04'];
  for (const id of samples) {
    const p = await prisma.product.findUnique({
      where: { id },
      select: { name: true, retailPrice: true, originalPrice: true }
    });
    if (p) {
      const orig = p.originalPrice ? parseFloat(p.originalPrice).toFixed(2) : 'n/a';
      console.log(`  [${id}] ${p.name.substring(0, 40)} → €${parseFloat(p.retailPrice).toFixed(2)} (orig: €${orig})`);
    }
  }

  await prisma.$disconnect();
}

fix()
  .then(() => { console.log('\n🎉 Done!'); process.exit(0); })
  .catch(err => { console.error('❌', err); process.exit(1); });
