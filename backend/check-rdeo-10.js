const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const diffusore = await prisma.product.findUnique({
      where: { id: 'RDEO-10' }
    });

    if (diffusore) {
      console.log('Diffusore RDEO-10 (Geranio e Rosa):');
      console.log('');
      console.log('ID:', diffusore.id);
      console.log('Nome:', diffusore.name);
      console.log('price (wholesale):', diffusore.price);
      console.log('retailPrice:', diffusore.retailPrice);
      console.log('originalPrice:', diffusore.originalPrice);
      console.log('source:', diffusore.source);
      console.log('');
      console.log('Calcolo attuale:');
      const wholesale = parseFloat(diffusore.price);
      const retail = diffusore.originalPrice || Math.round(wholesale * 1.3 * 100) / 100;
      console.log('Wholesale: €' + wholesale);
      console.log('Retail (se no originalPrice, 30%): €' + retail);
      console.log('');
      console.log('Prezzo CORRETTO dovrebbe essere: €22.50');
    } else {
      console.log('RDEO-10 non trovato');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Errore:', error);
    process.exit(1);
  }
})();
