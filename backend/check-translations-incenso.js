require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const englishWords = ['the ', ' and ', ' with ', ' for ', ' this ', ' when ', ' you ', ' its ', ' each ', 'incense', 'stick', 'pack', 'contains', 'scent', 'smell', 'burn', 'ancient', 'popular', 'approximately'];
  return englishWords.some(w => lower.includes(w));
}

async function main() {
  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'incenso' },
    select: { id: true, name: true, description: true }
  });

  console.log('Prodotti incenso:', products.length);

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
        descEn,
        descPreview: p.description ? p.description.substring(0, 80) : 'NULL'
      });
    }
  });

  console.log('\nProblemi trovati:');
  console.log('- Nomi in inglese:', englishName);
  console.log('- Descrizioni in inglese:', englishDesc);

  console.log('\n=== Prodotti con problemi ===\n');
  problematic.forEach((p, i) => {
    console.log(`${i + 1}. ${p.id}`);
    console.log(`   Nome: ${p.name}`);
    console.log(`   Nome EN: ${p.nameEn}, Desc EN: ${p.descEn}`);
    if (p.descEn) console.log(`   Desc: ${p.descPreview}...`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
