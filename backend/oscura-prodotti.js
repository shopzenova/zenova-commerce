const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subcatsToHide = [
    'creme-viso-notte',
    'correttore',
    'crema-mani',
    'protezione-solare-corpo'
  ];

  console.log('Oscuramento prodotti in corso...\n');

  for (const sub of subcatsToHide) {
    const result = await prisma.product.updateMany({
      where: { zenovaSubcategory: sub },
      data: { visible: false }
    });
    console.log(sub + ': ' + result.count + ' prodotti oscurati');
  }

  console.log('\nFatto!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
