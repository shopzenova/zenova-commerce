require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('\n=== CANDELE ARTISTICHE IN LATTA ===\n');

  const products = await prisma.product.findMany({
    where: {
      name: { contains: 'Latta', mode: 'insensitive' }
    },
    select: { id: true, name: true, image: true, source: true },
    take: 10
  });

  console.log(`Trovati ${products.length} prodotti\n`);

  products.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Source: ${p.source}`);
    console.log(`Image: ${p.image || 'NULL'}`);
    console.log('---');
  });

  await prisma.$disconnect();
}

check().catch(console.error);
