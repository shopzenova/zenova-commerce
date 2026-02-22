const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  // Bruciatori incenso a cascata (BackFlow) - hanno foto con fumo
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { id: { startsWith: 'BackF' } },
        { name: { contains: 'bruciatore', mode: 'insensitive' } },
        { name: { contains: 'cascata', mode: 'insensitive' } },
        { name: { contains: 'backflow', mode: 'insensitive' } },
        { name: { contains: 'back flow', mode: 'insensitive' } },
        { id: { startsWith: 'aw-backfi' } },
      ],
      visible: true
    },
    select: { id: true, name: true, image: true, images: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Bruciatori/BackFlow trovati: ${products.length}\n`);
  for (const p of products) {
    console.log(`${p.id} - ${(p.name || '').substring(0, 55)}`);
    console.log(`  image: ${p.image}`);
    if (p.images && p.images.length > 1) {
      p.images.forEach((img, i) => console.log(`  img[${i}]: ${img}`));
    }
    console.log('');
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
