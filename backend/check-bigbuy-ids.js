const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const products = await prisma.product.findMany({
    where: { source: 'bigbuy', bigbuyId: { not: null } },
    select: { id: true, bigbuyId: true },
    take: 5
  });

  console.log('Esempi bigbuyId nel database:');
  products.forEach(p => {
    console.log(`  id: ${p.id} | bigbuyId: "${p.bigbuyId}" | parsed: ${parseInt(p.bigbuyId) || 'NaN'}`);
  });

  await prisma.$disconnect();
})();
