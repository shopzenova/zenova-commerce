const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixWrongCategory() {
  try {
    console.log('🔧 Correzione categoria prodotti sali/bombe/cere/portacandele...\n');

    // Parole chiave per identificare prodotti da spostare
    const keywords = ['sale', 'sali', 'bagno', 'bomba', 'bombe', 'candela', 'candele', 'gel', 'profumat', 'cera', 'cere', 'portacandele'];

    // Trova tutti i prodotti con zenovaSubcategory = "diffusori"
    const products = await prisma.product.findMany({
      where: {
        zenovaSubcategory: 'diffusori'
      },
      select: {
        id: true,
        name: true
      }
    });

    // Filtra solo quelli che contengono parole chiave
    const toUpdate = products.filter(p => {
      const nameLower = p.name.toLowerCase();
      return keywords.some(keyword => nameLower.includes(keyword));
    });

    console.log(`📊 Prodotti da aggiornare: ${toUpdate.length}\n`);

    if (toUpdate.length === 0) {
      console.log('✅ Nessun prodotto da aggiornare');
      return;
    }

    // Mostra primi 5 prodotti come esempio
    console.log('Esempi di prodotti che verranno aggiornati:');
    toUpdate.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
    });
    console.log(`... e altri ${toUpdate.length - 5} prodotti\n`);

    // Aggiorna in batch
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: toUpdate.map(p => p.id)
        }
      },
      data: {
        zenovaSubcategory: 'candele-gel-profumati-sali-bagno'
      }
    });

    console.log(`✅ Aggiornati ${result.count} prodotti!`);
    console.log(`   Da: "diffusori"`);
    console.log(`   A:  "candele-gel-profumati-sali-bagno"\n`);

    // Verifica
    const verify = await prisma.product.count({
      where: {
        zenovaSubcategory: 'diffusori'
      }
    });

    console.log(`📊 Prodotti rimasti in "diffusori": ${verify}`);

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  fixWrongCategory();
}

module.exports = fixWrongCategory;
