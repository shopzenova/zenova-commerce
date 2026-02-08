const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.product.groupBy({
    by: ['zenovaCategory'],
    where: { visible: true },
    _count: true,
    orderBy: { _count: { id: 'desc' } }
  });

  console.log('CATEGORIE VISIBILI:');
  cats.forEach(c => console.log('  ' + (c.zenovaCategory || 'null') + ' - ' + c._count + ' prodotti'));

  console.log('\n--- Dettaglio subcategorie ---\n');

  for (const cat of cats) {
    if (!cat.zenovaCategory) continue;
    const subs = await prisma.product.groupBy({
      by: ['zenovaSubcategory'],
      where: { zenovaCategory: cat.zenovaCategory, visible: true },
      _count: true,
      orderBy: { _count: { id: 'desc' } }
    });
    console.log(cat.zenovaCategory + ':');
    subs.forEach(s => console.log('  - ' + s.zenovaSubcategory + ' (' + s._count + ')'));
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
