require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Analisi prodotti con errore MYMEMORY ===\n');

  const products = await prisma.product.findMany({
    where: {
      description: { contains: 'MYMEMORY' },
      zenovaSubcategory: 'diffusori-aromatici'
    },
    select: { id: true, name: true, source: true, zenovaSubcategory: true }
  });

  console.log(`Prodotti affetti: ${products.length}\n`);

  const bySource = {};
  const byCat = {};

  products.forEach(p => {
    bySource[p.source || 'unknown'] = (bySource[p.source || 'unknown'] || 0) + 1;
    byCat[p.zenovaSubcategory || 'unknown'] = (byCat[p.zenovaSubcategory || 'unknown'] || 0) + 1;
  });

  console.log('Per source:');
  Object.entries(bySource).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(' ', k, ':', v));

  console.log('\nPer categoria:');
  Object.entries(byCat).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(' ', k, ':', v));

  // Ripristina descrizione vuota per ora (meglio di MYMEMORY error)
  console.log('\n=== Pulizia descrizioni con errore ===');

  const result = await prisma.product.updateMany({
    where: {
      description: { contains: 'MYMEMORY' },
      zenovaSubcategory: 'diffusori-aromatici'
    },
    data: { description: null }
  });

  console.log(`Puliti ${result.count} prodotti (descrizione impostata a null)`);

  await prisma.$disconnect();
}

main().catch(console.error);
