/**
 * Fix AW prices v3 - Corregge prodotti SENZA originalPrice
 * Per questi: retailPrice = price * 1.3 + 4 (margine 30% + €4)
 * Per quelli CON originalPrice: retailPrice = originalPrice + 4
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fix() {
  console.log('🔧 Fix prezzi AW v3 - corregge prodotti senza originalPrice\n');

  const jsonProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../top-100-products.json'), 'utf-8')
  );

  const awProducts = await prisma.product.findMany({
    where: { source: { in: ['aw', 'aw-dropship'] } },
    select: { id: true, name: true, price: true, retailPrice: true, originalPrice: true }
  });

  let fixedWithOriginal = 0;
  let fixedWithFormula = 0;
  let alreadyOk = 0;

  for (const p of awProducts) {
    const dbOriginal = p.originalPrice ? parseFloat(p.originalPrice) : null;
    const jsonP = jsonProducts.find(jp => jp.id === p.id);
    const jsonOriginal = (jsonP && jsonP.originalPrice && String(jsonP.originalPrice) !== 'undefined')
      ? parseFloat(jsonP.originalPrice) : null;

    let correctRetail;
    const wholesale = parseFloat(p.price);

    if (dbOriginal || jsonOriginal) {
      // Ha originalPrice -> usa quello + 4
      const origPrice = dbOriginal || jsonOriginal;
      correctRetail = Math.round((origPrice + 4) * 100) / 100;
    } else {
      // Nessun originalPrice -> usa formula: wholesale * 1.3 + 4
      correctRetail = Math.round((wholesale * 1.3 + 4) * 100) / 100;
    }

    const currentRetail = parseFloat(p.retailPrice);

    if (Math.abs(currentRetail - correctRetail) > 0.05) {
      await prisma.product.update({
        where: { id: p.id },
        data: { retailPrice: correctRetail }
      });

      if (dbOriginal || jsonOriginal) {
        fixedWithOriginal++;
      } else {
        fixedWithFormula++;
      }
    } else {
      alreadyOk++;
    }
  }

  console.log(`✅ Corretti con originalPrice + 4: ${fixedWithOriginal}`);
  console.log(`✅ Corretti con formula (price*1.3 + 4): ${fixedWithFormula}`);
  console.log(`✓ Già ok: ${alreadyOk}`);

  // Verifica
  console.log('\n🔍 Verifica:');
  const samples = ['BackF-08', 'RIH-04', 'LWMelt-08', 'GBBB-04'];
  for (const id of samples) {
    const p = await prisma.product.findUnique({
      where: { id },
      select: { name: true, price: true, retailPrice: true, originalPrice: true }
    });
    if (p) {
      const wholesale = parseFloat(p.price).toFixed(2);
      const orig = p.originalPrice ? '€' + parseFloat(p.originalPrice).toFixed(2) : 'n/a (formula)';
      console.log(`  [${id}] €${parseFloat(p.retailPrice).toFixed(2)} (ingrosso: €${wholesale}, orig: ${orig})`);
    }
  }

  await prisma.$disconnect();
}

fix()
  .then(() => { console.log('\n🎉 Done!'); process.exit(0); })
  .catch(err => { console.error('❌', err); process.exit(1); });
