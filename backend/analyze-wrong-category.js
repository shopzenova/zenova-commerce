const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeWrongCategory() {
  try {
    console.log('🔍 Cercando prodotti con categoria "diffusori" che sono sali/bombe da bagno...\n');

    // Trova prodotti con zenovaSubcategory = "diffusori"
    const products = await prisma.product.findMany({
      where: {
        zenovaSubcategory: 'diffusori'
      },
      select: {
        id: true,
        name: true,
        source: true,
        zenovaSubcategory: true
      }
    });

    console.log(`📊 Trovati ${products.length} prodotti con zenovaSubcategory = "diffusori"\n`);

    // Filtra quelli che nel nome contengono parole chiave di sali/bombe/candele
    const keywords = ['sale', 'sali', 'bagno', 'bomba', 'bombe', 'candela', 'candele', 'gel', 'profumat'];

    const wrongCategory = products.filter(p => {
      const nameLower = p.name.toLowerCase();
      return keywords.some(keyword => nameLower.includes(keyword));
    });

    console.log(`❌ Prodotti con categoria SBAGLIATA (${wrongCategory.length}):\n`);
    wrongCategory.forEach((p, i) => {
      console.log(`${i + 1}. [${p.source}] ${p.name}`);
    });

    // Prodotti che sono davvero diffusori
    const realDiffusori = products.filter(p => {
      const nameLower = p.name.toLowerCase();
      return !keywords.some(keyword => nameLower.includes(keyword));
    });

    console.log(`\n✅ Prodotti che sono DAVVERO diffusori (${realDiffusori.length}):\n`);
    realDiffusori.forEach((p, i) => {
      console.log(`${i + 1}. [${p.source}] ${p.name}`);
    });

    console.log(`\n📋 RIEPILOGO:`);
    console.log(`   - Da spostare a "candele-gel-profumati-sali-bagno": ${wrongCategory.length}`);
    console.log(`   - Da lasciare in "diffusori": ${realDiffusori.length}`);

    return { wrongCategory, realDiffusori };

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeWrongCategory();
