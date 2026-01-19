/**
 * Sincronizza traduzioni incenso AW dal JSON a PostgreSQL
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Dizionario traduzioni per descrizioni
const descTranslations = {
  'In the modern world, it can be challenging to make time for ourselves': 'Nel mondo moderno, può essere difficile trovare tempo per noi stessi',
  'escape from the difficult requirements of everyday life': 'sfuggire alle difficili esigenze della vita quotidiana',
  'Burning incense sticks is an effective way to beat stress': 'Bruciare bastoncini di incenso è un modo efficace per combattere lo stress',
  'encourage balance and inner peace': 'favorire equilibrio e pace interiore',
  'Fill your home with the sweet fruity scent': 'Riempi la tua casa con il dolce profumo fruttato',
  'sit back and just relax': 'siediti e rilassati',
  'These Indian Incense Cones with their amazing colour and exotic fragrance are really awsome': 'Questi coni di incenso indiano con il loro colore straordinario e la fragranza esotica sono davvero fantastici',
  'With 25 mm high they are larger than average': 'Con 25 mm di altezza sono più grandi della media',
  'Light the tip of the cone': 'Accendi la punta del cono',
  'blow out the flame': 'soffia sulla fiamma',
  'allow the incense cone to smoulder': 'lascia che il cono di incenso bruci lentamente',
  'releasing the smoke': 'rilasciando il fumo',
  'infused with the scent': 'infuso con il profumo',
  'peach mango': 'pesca mango',
  'honeysuckle': 'caprifoglio',
  'lavender': 'lavanda',
  'jasmine': 'gelsomino',
  'sandalwood': 'sandalo',
  'vanilla': 'vaniglia',
  'cinnamon': 'cannella',
  'lemon': 'limone',
  'orange': 'arancia',
  'strawberry': 'fragola',
  'coconut': 'cocco',
  'rose': 'rosa',
  'amber': 'ambra',
  'incense sticks': 'bastoncini di incenso',
  'incense cones': 'coni di incenso',
  'Each pack contains': 'Ogni confezione contiene',
  'approximately': 'circa',
  'sticks': 'bastoncini',
  'cones': 'coni'
};

function translateDescription(text) {
  if (!text) return text;
  let translated = text;

  // Ordina per lunghezza decrescente
  const sorted = Object.entries(descTranslations).sort((a, b) => b[0].length - a[0].length);

  for (const [eng, ita] of sorted) {
    const regex = new RegExp(eng, 'gi');
    translated = translated.replace(regex, ita);
  }

  return translated;
}

async function syncToPostgres() {
  console.log('🔄 Sincronizzazione traduzioni incenso AW → PostgreSQL\n');

  // Carica prodotti dal JSON (già tradotti)
  const jsonProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));
  const incensoAW = jsonProducts.filter(p => p.source === 'aw' && p.zenovaSubcategory === 'incenso');

  console.log(`📦 Trovati ${incensoAW.length} prodotti incenso AW nel JSON\n`);

  let updated = 0;
  let errors = 0;

  for (const product of incensoAW) {
    try {
      // Traduci descrizione se presente
      const translatedDesc = translateDescription(product.description);

      // Prepara dati aggiornamento
      const updateData = {
        name: product.name,
        description: translatedDesc
      };

      // Aggiungi peso solo per i coni (BinC-XX)
      if (product.id.startsWith('BinC-') && product.weight) {
        updateData.weight = product.weight;
      }

      // Aggiorna su PostgreSQL
      await prisma.product.update({
        where: { id: product.id },
        data: updateData
      });

      console.log(`✅ ${product.id}: ${product.name.substring(0, 50)}...`);
      updated++;

    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`⚠️  ${product.id}: non trovato in PostgreSQL (skip)`);
      } else {
        console.error(`❌ ${product.id}: ${error.message}`);
        errors++;
      }
    }
  }

  console.log(`\n✅ Sincronizzazione completata!`);
  console.log(`   Aggiornati: ${updated}`);
  console.log(`   Errori: ${errors}`);

  await prisma.$disconnect();
}

syncToPostgres().catch(console.error);
