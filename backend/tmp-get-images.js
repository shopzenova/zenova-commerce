const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  // Diffusori aromatici - AATOM
  const diffusori = await prisma.product.findMany({
    where: { id: { startsWith: 'AATOM' }, visible: true },
    select: { id: true, name: true, image: true, images: true },
    take: 5
  });
  console.log('=== DIFFUSORI (AATOM) ===');
  for (const p of diffusori) {
    console.log(`${p.id} - ${(p.name || '').substring(0, 50)}`);
    console.log(`  image: ${p.image}`);
    if (p.images && p.images.length > 0) console.log(`  images[0]: ${p.images[0]}`);
  }

  // Incensi - BackF, BinC, BincS
  const incensi = await prisma.product.findMany({
    where: {
      OR: [
        { id: { startsWith: 'BackF' } },
        { id: { startsWith: 'BinC' } },
        { name: { contains: 'incenso', mode: 'insensitive' } },
      ],
      visible: true
    },
    select: { id: true, name: true, image: true, images: true },
    take: 5
  });
  console.log('\n=== INCENSI ===');
  for (const p of incensi) {
    console.log(`${p.id} - ${(p.name || '').substring(0, 50)}`);
    console.log(`  image: ${p.image}`);
    if (p.images && p.images.length > 0) console.log(`  images[0]: ${p.images[0]}`);
  }

  // AATOM-24 specifically (Himalaya)
  const himalaya = await prisma.product.findFirst({
    where: { id: 'AATOM-24' },
    select: { id: true, name: true, image: true, images: true }
  });
  console.log('\n=== HIMALAYA (AATOM-24) ===');
  if (himalaya) {
    console.log(`image: ${himalaya.image}`);
    if (himalaya.images) console.log(`images: ${JSON.stringify(himalaya.images)}`);
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
