const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  // These 8 products have no description in CSV - they're duplicates or discontinued
  // Check if their duplicate (by bigbuyId) has a good description
  const remaining = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, bigbuyId: true, visible: true, description: true },
  });

  console.log(`Rimasti: ${remaining.length}`);

  for (const p of remaining) {
    console.log(`\n${p.id} (bigbuyId: ${p.bigbuyId}, visible: ${p.visible})`);
    console.log(`  Nome: ${(p.name || '').substring(0, 60)}`);

    // Find sibling with same bigbuyId that has good description
    if (p.bigbuyId) {
      const siblings = await prisma.product.findMany({
        where: { bigbuyId: p.bigbuyId, NOT: { id: p.id } },
        select: { id: true, name: true, description: true },
      });

      for (const s of siblings) {
        const hasGoodDesc = s.description && !s.description.toUpperCase().includes('MYMEMORY');
        console.log(`  Sibling: ${s.id} - desc ok: ${hasGoodDesc}`);
        if (hasGoodDesc) {
          // Copy description from sibling
          const updateData = { description: s.description };
          if (p.name && p.name.toUpperCase().includes('MYMEMORY')) {
            updateData.name = s.name;
          }
          await prisma.product.update({ where: { id: p.id }, data: updateData });
          console.log(`  → Copiata descrizione da ${s.id}`);
        }
      }
    }
  }

  // Final check
  const stillBroken = await prisma.product.count({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    }
  });
  console.log(`\n=== Ancora con errore MyMemory: ${stillBroken} ===`);

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
