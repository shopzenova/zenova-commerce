/**
 * Aggiorna descrizioni set oli essenziali nel database PostgreSQL
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const oilSetDescriptions = {
  'EOSet-01': `Il set di oli essenziali per aromaterapia è un regalo fantastico per la casa e la mente. Questo set contiene 12 oli essenziali (5 ml ciascuno) e 2 contagocce. Il nostro set regalo combina una varietà di fragranze floreali, mentolate, legnose, speziate ed erbacee.

✓ 100% puro
✓ Fatto a mano
✓ Adatto ai vegani
✓ Cruelty free

𝗖𝗼𝘀𝗮 𝗰'𝗲̀ 𝗻𝗲𝗹𝗹𝗮 𝘀𝗰𝗮𝘁𝗼𝗹𝗮:
• Olio essenziale di Limone (Italia)
• Olio essenziale di Mandarino (Argentina)
• Olio essenziale di Legno di Ho (Cina)
• Olio essenziale di Ylang III (Comore)
• Olio essenziale di Gaultheria (Cina)
• Olio essenziale di May Chang (Cina)
• Olio essenziale di Eucalipto (Cina)
• Olio essenziale di Menta Piperita (India)
• Olio essenziale di Tea Tree (Australia)
• Olio essenziale di Lavanda (Francia)
• Olio essenziale di Anice Stellato (Italia)
• Olio essenziale di Canfora (Argentina)
• 2 Contagocce`,

  'EOSet-02': `Il set di oli essenziali per aromaterapia I 12 Migliori è un regalo straordinario per la casa e la mente. Questo set contiene 12 oli essenziali (5 ml ciascuno) e 2 contagocce. Il nostro set regalo combina una varietà di fragranze floreali, mentolate, legnose, speziate ed erbacee.

✓ 100% puro
✓ Fatto a mano
✓ Adatto ai vegani
✓ Cruelty free

𝗖𝗼𝘀𝗮 𝗰'𝗲̀ 𝗻𝗲𝗹𝗹𝗮 𝘀𝗰𝗮𝘁𝗼𝗹𝗮:
• Olio essenziale di Ylang III (Comore)
• Olio essenziale di Limone (Italia)
• Olio essenziale di Tea Tree (Australia)
• Olio essenziale di Citronella (India)
• Olio essenziale di Eucalipto (Cina)
• Olio essenziale di Lavanda (Francia)
• Olio essenziale di Rosmarino (Spagna)
• Olio essenziale di Bergamotto (Italia)
• Olio essenziale di Lemongrass (Vietnam)
• Olio essenziale di Arancia (Brasile)
• Olio essenziale di Patchouli (Indonesia)
• Olio essenziale di Sandalo Amyris (Haiti)
• 2 Contagocce`,

  'EOSet-03': `Il set di oli essenziali per aromaterapia è un regalo fantastico per la casa e la mente. Questo set contiene 12 oli essenziali (5 ml ciascuno) e 2 contagocce. Il nostro set regalo combina una varietà di fragranze floreali, mentolate, legnose, speziate ed erbacee.

✓ 100% puro
✓ Fatto a mano
✓ Adatto ai vegani
✓ Cruelty free

𝗖𝗼𝘀𝗮 𝗰'𝗲̀ 𝗻𝗲𝗹𝗹𝗮 𝘀𝗰𝗮𝘁𝗼𝗹𝗮:
• Olio essenziale di Noce Moscata (Indonesia)
• Olio essenziale di Cipresso (Italia)
• Olio essenziale di Bergamotto (Italia)
• Olio essenziale di Ginepro (Croazia)
• Olio essenziale di Chiodi di Garofano (Indonesia)
• Olio essenziale di Zenzero (India)
• Olio essenziale di Arancia (Brasile)
• Olio essenziale di Legno di Cedro (Stati Uniti)
• Olio essenziale di Salvia Sclarea (Francia)
• Olio essenziale di Pino (Austria)
• Olio essenziale di Cannella (Sri Lanka)
• Olio essenziale di Lavanda (Francia)
• 2 Contagocce`,

  'EOSET-04': `Il set di oli essenziali per aromaterapia Primavera è un regalo straordinario per la casa e la mente. Questo set contiene 12 oli essenziali (5 ml ciascuno) e 2 contagocce. Il nostro set regalo combina una varietà di fragranze floreali, mentolate ed erbacee.

✓ 100% puro
✓ Fatto a mano
✓ Adatto ai vegani
✓ Cruelty free

𝗖𝗼𝘀𝗮 𝗰'𝗲̀ 𝗻𝗲𝗹𝗹𝗮 𝘀𝗰𝗮𝘁𝗼𝗹𝗮:
• Olio essenziale di Maggiorana
• Olio essenziale di Eucalipto
• Olio essenziale di Bergamotto
• Olio essenziale di Mandarino
• Olio essenziale di Menta Verde
• Olio essenziale di Ginepro
• Olio essenziale di Petitgrain
• Olio essenziale di Citronella
• Olio essenziale di Lavanda
• Olio essenziale di Melaleuca
• Olio essenziale di May Chang
• Olio essenziale di Ylang Ylang III
• 2 Contagocce`,

  'EOSET-05': `Scopri l'incantevole set di oli essenziali per aromaterapia Estate, una deliziosa offerta sia per il rifugio della casa che per la tranquillità della mente.

Questa selezione attentamente curata comprende 12 oli essenziali in flaconi da 5 ml, corredati da 2 pratici contagocce. La nostra collezione combina armoniosamente aromi floreali, mentolati, legnosi, speziati ed erbacei, garantendo un viaggio sensoriale che rivitalizza e rinvigorisce lo spirito.

✓ 100% puro
✓ Fatto a mano
✓ Adatto ai vegani
✓ Cruelty free

𝗖𝗼𝘀𝗮 𝗰'𝗲̀ 𝗻𝗲𝗹𝗹𝗮 𝘀𝗰𝗮𝘁𝗼𝗹𝗮:
• Olio essenziale di Semi di Carota
• Olio essenziale di Citronella
• Olio essenziale di Cipresso
• Olio essenziale di Pompelmo
• Olio essenziale di Limone
• Olio essenziale di Lime
• Olio essenziale di Lemongrass
• Olio essenziale di Arancia
• Olio essenziale di Menta di Mais
• Olio essenziale di Menta Verde
• Olio essenziale di Mandarino
• Olio essenziale di Palmarosa
• 2 Contagocce`
};

async function updateOilSetDescriptions() {
  console.log('🛢️ Aggiornamento descrizioni set oli essenziali...\n');

  for (const [productId, newDescription] of Object.entries(oilSetDescriptions)) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        console.log(`❌ Prodotto ${productId} non trovato nel database`);
        continue;
      }

      await prisma.product.update({
        where: { id: productId },
        data: { description: newDescription }
      });

      console.log(`✅ ${productId} - ${product.name} - Descrizione aggiornata!`);
    } catch (error) {
      console.error(`❌ Errore aggiornamento ${productId}:`, error.message);
    }
  }

  console.log('\n🎉 Aggiornamento completato!');
}

updateOilSetDescriptions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
