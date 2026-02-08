require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('\n=== IMMAGINI CANDELE PROFUMATE ===\n');

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Candela', mode: 'insensitive' } },
        { zenovaSubcategory: 'candele-profumate' }
      ]
    },
    select: { id: true, name: true, image: true, source: true },
    take: 10
  });

  console.log(`Trovati ${products.length} prodotti candele\n`);

  products.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Source: ${p.source}`);
    console.log(`Image: ${p.image ? p.image.substring(0, 100) : 'NULL'}`);
    console.log('---');
  });

  await prisma.$disconnect();
}

check().catch(console.error);
