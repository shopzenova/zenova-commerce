/**
 * Fix retailPrice per prodotti AW
 * Usa originalPrice da top-100-products.json + €4
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixAW() {
  console.log('🔧 Fix retailPrice per prodotti AW...\n');

  // Carica originalPrice da JSON
  const jsonProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../top-100-products.json'), 'utf-8')
  );

  // Prodotti AW dal DB
  const awProducts = await prisma.product.findMany({
    where: { source: { in: ['aw', 'aw-dropship'] } },
    select: { id: true, name: true, price: true, retailPrice: true }
  });

  console.log(`Prodotti AW nel DB: ${awProducts.length}\n`);

  let updated = 0;
  let withOriginal = 0;
  let calculated = 0;

  for (const dbProduct of awProducts) {
    const jsonProduct = jsonProducts.find(jp => jp.id === dbProduct.id);
    let newRetailPrice;

    if (jsonProduct && jsonProduct.originalPrice && jsonProduct.originalPrice !== 'undefined' && !isNaN(parseFloat(jsonProduct.originalPrice))) {
      // Ha originalPrice nel JSON -> usa quello + 4
      newRetailPrice = parseFloat(jsonProduct.originalPrice) + 4;
      withOriginal++;
    } else {
      // Nessun originalPrice -> usa prezzo ingrosso * 1.3 + 4
      const wholesale = parseFloat(dbProduct.price) || 0;
      newRetailPrice = Math.round((wholesale * 1.3 + 4) * 100) / 100;
      calculated++;
    }

    await prisma.product.update({
      where: { id: dbProduct.id },
      data: { retailPrice: newRetailPrice }
    });
    updated++;
  }

  console.log(`✅ Aggiornati: ${updated} prodotti AW`);
  console.log(`   Con originalPrice da JSON: ${withOriginal}`);
  console.log(`   Calcolati (wholesale * 1.3 + 4): ${calculated}`);

  // Verifica candele
  console.log('\n🕯️ Verifica candele Chakra:');
  const candles = await prisma.product.findMany({
    where: { name: { contains: 'Candela Cristallo Chakra' } },
    select: { name: true, retailPrice: true }
  });
  candles.forEach(p => {
    console.log(`  ${p.name.substring(0, 50)} -> €${parseFloat(p.retailPrice).toFixed(2)}`);
  });

  await prisma.$disconnect();
}

fixAW()
  .then(() => {
    console.log('\n🎉 Fix AW completato!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err);
    process.exit(1);
  });
