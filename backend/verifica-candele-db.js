const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificaCandele() {
  console.log('=== VERIFICA CANDELE E INCENSI NEL DATABASE ===\n');

  try {
    // Trova tutte le candele AW (qualsiasi ID che inizia con aw-)
    const candeleAW = await prisma.product.findMany({
      where: {
        id: { startsWith: 'aw-' }
      },
      select: {
        id: true,
        name: true,
        visible: true,
        zone: true,
        source: true,
        zenovaSubcategory: true
      }
    });

    console.log(`Prodotti AW (id aw-*): ${candeleAW.length}\n`);

    // Raggruppa per subcategory
    const byCat = {};
    candeleAW.forEach(p => {
      const cat = p.zenovaSubcategory || 'undefined';
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(p);
    });

    for (const [cat, prods] of Object.entries(byCat)) {
      console.log(`\n📦 ${cat}: ${prods.length} prodotti`);
      prods.slice(0, 3).forEach(p => {
        console.log(`   - ${p.id}: ${p.name.substring(0, 50)}...`);
        console.log(`     visible=${p.visible}, zone=${p.zone}, source=${p.source}`);
      });
    }

    // Verifica specifiche: candele-profumate
    const candele = await prisma.product.count({
      where: {
        zenovaSubcategory: 'candele-profumate',
        source: 'aw'
      }
    });

    console.log(`\n🕯️  Candele profumate AW: ${candele}`);

    // Verifica incensi
    const incensiConi = await prisma.product.count({
      where: {
        zenovaSubcategory: { in: ['incenso-coni', 'incenso-riflusso'] },
        source: 'aw'
      }
    });

    console.log(`🔥 Incensi a coni AW: ${incensiConi}\n`);

  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificaCandele();
