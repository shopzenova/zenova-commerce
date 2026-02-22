const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all products with MyMemory error in description
  const affected = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { description: { contains: 'mymemory', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, description: true, source: true, category: true, visible: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Prodotti con errore MyMemory: ${affected.length}\n`);

  for (const p of affected) {
    const descPreview = (p.description || '').substring(0, 100).replace(/\n/g, ' ');
    console.log(`${p.id} | ${p.source} | ${(p.name || '').substring(0, 50)}`);
    console.log(`  Desc: ${descPreview}...`);
    console.log(`  Cat: ${p.category} | Visible: ${p.visible}`);
    console.log('');
  }

  // Also check for empty or very short descriptions
  const emptyDesc = await prisma.product.count({
    where: {
      OR: [
        { description: null },
        { description: '' },
      ]
    }
  });
  console.log(`Prodotti senza descrizione: ${emptyDesc}`);

  // Check for other translation errors
  const translationErrors = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'USAGELIMITS', mode: 'insensitive' } },
        { description: { contains: 'TRANSLATED.NET', mode: 'insensitive' } },
        { description: { contains: 'FREE TRANSLATIONS', mode: 'insensitive' } },
        { description: { contains: 'YOU USED ALL', mode: 'insensitive' } },
      ]
    },
    select: { id: true },
  });
  console.log(`Prodotti con errori traduzione (alt search): ${translationErrors.length}`);

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
