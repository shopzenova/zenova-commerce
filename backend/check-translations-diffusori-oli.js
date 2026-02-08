require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const englishWords = ['the ', ' and ', ' with ', ' for ', ' this ', 'essential oil', 'reed diffuser', 'fragrance', 'aroma', 'scent'];
  return englishWords.some(w => lower.includes(w));
}

async function main() {
  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'diffusori-oli' },
    select: { id: true, name: true, description: true }
  });

  console.log('Prodotti diffusori-oli:', products.length);

  let englishName = 0;
  let englishDesc = 0;
  const problematic = [];

  products.forEach(p => {
    const nameEn = isEnglish(p.name);
    const descEn = isEnglish(p.description);

    if (nameEn) englishName++;
    if (descEn) englishDesc++;

    if (nameEn || descEn) {
      problematic.push({
        id: p.id,
        name: p.name,
        nameEn,
        descEn
      });
    }
  });

  console.log('\nProblemi trovati:');
  console.log('- Nomi in inglese:', englishName);
  console.log('- Descrizioni in inglese:', englishDesc);

  console.log('\n=== Prodotti con problemi ===\n');
  problematic.slice(0, 20).forEach(p => {
    console.log(`${p.id}: ${p.name.substring(0, 60)}...`);
    console.log(`  Nome EN: ${p.nameEn}, Desc EN: ${p.descEn}`);
  });

  if (problematic.length > 20) {
    console.log(`\n... e altri ${problematic.length - 20} prodotti`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
