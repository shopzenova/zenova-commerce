const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDBStatus() {
  try {
    console.log('🔍 Controllo stato database PostgreSQL...\n');

    // Conta prodotti per zenovaSubcategory
    const candeleGel = await prisma.product.count({
      where: { zenovaSubcategory: 'candele-gel-profumati-sali-bagno' }
    });

    const candeleProfumate = await prisma.product.count({
      where: { zenovaSubcategory: 'candele-profumate' }
    });

    const diffusori = await prisma.product.count({
      where: { zenovaSubcategory: 'diffusori' }
    });

    const total = await prisma.product.count();

    console.log('📊 Conteggio prodotti nel database:');
    console.log(`   candele-gel-profumati-sali-bagno: ${candeleGel}`);
    console.log(`   candele-profumate: ${candeleProfumate}`);
    console.log(`   diffusori: ${diffusori}`);
    console.log(`   TOTALE: ${total}\n`);

    // Mostra alcuni esempi
    const examples = await prisma.product.findMany({
      where: { zenovaSubcategory: 'candele-gel-profumati-sali-bagno' },
      take: 3,
      select: { id: true, name: true, zenovaSubcategory: true }
    });

    console.log('Esempi prodotti candele-gel:');
    examples.forEach(p => console.log(`  - [${p.id}] ${p.name}`));

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDBStatus();
