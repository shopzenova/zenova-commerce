const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Rinomina categorie in corso...\n');

  // 1. beauty -> profumi-fragranze
  const r1 = await prisma.product.updateMany({
    where: { zenovaCategory: 'beauty' },
    data: { zenovaCategory: 'profumi-fragranze' }
  });
  console.log('beauty -> profumi-fragranze: ' + r1.count + ' prodotti');

  // 2. health-personal-care -> massaggio-benessere
  const r2 = await prisma.product.updateMany({
    where: { zenovaCategory: 'health-personal-care' },
    data: { zenovaCategory: 'massaggio-benessere' }
  });
  console.log('health-personal-care -> massaggio-benessere: ' + r2.count + ' prodotti');

  // 3. smart-living -> home-ambience
  const r3 = await prisma.product.updateMany({
    where: { zenovaCategory: 'smart-living' },
    data: { zenovaCategory: 'home-ambience' }
  });
  console.log('smart-living -> home-ambience: ' + r3.count + ' prodotti');

  console.log('\nFatto!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
