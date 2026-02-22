const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const affected = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, source: true, visible: true },
  });

  console.log(`Totale prodotti con errore MyMemory: ${affected.length}`);

  // Per source
  const bySource = {};
  for (const p of affected) {
    bySource[p.source || 'null'] = (bySource[p.source || 'null'] || 0) + 1;
  }
  console.log('\nPer fornitore:');
  for (const [s, c] of Object.entries(bySource)) {
    console.log(`  ${s}: ${c}`);
  }

  // Per visibilità
  const visible = affected.filter(p => p.visible).length;
  const hidden = affected.filter(p => !p.visible).length;
  console.log(`\nVisibili sul sito: ${visible}`);
  console.log(`Nascosti: ${hidden}`);

  // Anche nel nome?
  const nameAffected = affected.filter(p => (p.name || '').toUpperCase().includes('MYMEMORY'));
  console.log(`\nCon errore anche nel NOME: ${nameAffected.length}`);
  if (nameAffected.length > 0) {
    nameAffected.slice(0, 5).forEach(p => console.log(`  ${p.id} - ${p.name.substring(0, 80)}`));
  }

  // Prodotti AW colpiti
  const awAffected = affected.filter(p => p.source === 'aw');
  console.log(`\nProdotti AW colpiti: ${awAffected.length}`);
  awAffected.forEach(p => console.log(`  ${p.id} - ${(p.name || '').substring(0, 60)} | visible: ${p.visible}`));

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
