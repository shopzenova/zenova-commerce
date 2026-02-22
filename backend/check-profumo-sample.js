const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const sample = await prisma.product.findFirst({
    where: { zenovaSubcategory: 'profumi-uomini', id: { startsWith: 'M' } }
  });
  console.log('ID:', sample.id);
  console.log('Name:', sample.name);
  console.log('BigBuyId:', sample.bigbuyId);
  console.log('EAN:', sample.ean);
  console.log('Source:', sample.source);
  console.log('Desc (150):', (sample.description || '').substring(0, 150));

  // Conta totale profumi BigBuy
  const count = await prisma.product.count({
    where: {
      zenovaSubcategory: { in: ['profumi-uomini', 'profumi-donne'] },
      source: 'bigbuy'
    }
  });
  console.log('\nTotale profumi BigBuy:', count);

  await prisma.$disconnect();
}
test().catch(e => { console.error(e); process.exit(1); });
