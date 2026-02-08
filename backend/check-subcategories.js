require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  // Tutte le sottocategorie natural-wellness
  const subcats = await prisma.product.groupBy({
    by: ['zenovaSubcategory'],
    where: {
      zenovaCategories: { has: 'natural-wellness' }
    },
    _count: true
  });

  console.log('=== Sottocategorie Natural Wellness nel DB ===\n');
  subcats.sort((a,b) => b._count - a._count).forEach(s => {
    console.log(`  - ${s.zenovaSubcategory || '(null)'}: ${s._count} prodotti`);
  });

  // Verifica specifiche
  console.log('\n=== Verifica specifiche ===');
  const kit = await prisma.product.count({where:{zenovaSubcategory:'kit-benessere-cofanetti-regalo'}});
  const oli = await prisma.product.count({where:{zenovaSubcategory:'oli-per-fragranza'}});
  console.log(`kit-benessere-cofanetti-regalo: ${kit}`);
  console.log(`oli-per-fragranza: ${oli}`);

  // Tutte le sottocategorie uniche
  console.log('\n=== TUTTE le sottocategorie uniche nel DB ===\n');
  const all = await prisma.product.groupBy({
    by: ['zenovaSubcategory'],
    _count: true
  });
  all.sort((a,b) => b._count - a._count).forEach(s => {
    console.log(`  ${s.zenovaSubcategory || '(null)'}: ${s._count}`);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
