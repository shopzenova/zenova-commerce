require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'diffusori-aromatici' },
    select: { id: true, name: true, description: true }
  });

  console.log('Prodotti diffusori-aromatici:', products.length);

  let errors = 0;
  products.forEach(p => {
    const nameHasError = p.name && p.name.includes('MYMEMORY');
    const descHasError = p.description && p.description.includes('MYMEMORY');

    if (nameHasError || descHasError) {
      errors++;
      console.log('\n=== ERRORE ===');
      console.log('ID:', p.id);
      console.log('Name:', p.name);
      console.log('Desc:', p.description ? p.description.substring(0, 150) : 'NULL');
    }
  });

  console.log('\nTotale errori:', errors);

  await prisma.$disconnect();
}

main().catch(console.error);
