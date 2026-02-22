const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const translations = {
  // OliveC - Candele in Cera d'Oliva
  'OliveC-02': 'Candela in Cera d\'Oliva Pura 90x60 - Grigio',
  'OliveC-07': 'Candela in Cera d\'Oliva in Barattolo 120x70 - Bianco',
  'OliveC-09': 'Candela in Cera d\'Oliva in Barattolo 120x70 - Mandarino',
  'OliveC-10': 'Candela in Cera d\'Oliva in Barattolo 120x70 - Rosa Antico',
  'OliveC-11': 'Candela in Cera d\'Oliva in Barattolo 120x70 - Turchese',

  // CWC - Candele di Soia in Cemento
  'CWC-01': 'Grande Candela di Soia in Cemento - Patchouli e Ambra Scura',
  'CWC-02': 'Grande Candela di Soia in Cemento - Vaniglia e Arancia',
  'CWC-03': 'Grande Candela di Soia in Cemento - Lime Speziato dei Mari del Sud',
  'CWC-04': 'Grande Candela di Soia in Cemento - Chiodi di Garofano e Sandalo Scuro',
  'CWC-05': 'Candela di Soia in Cemento Media - Amore - Fico Viola e Cassis',
  'CWC-06': 'Candela di Soia in Cemento Media - Frutti di Bosco - Ginepro e Gin Dolce',
  'CWC-07': 'Candela di Soia in Cemento Media - Cervo - Whiskey e Legno Affumicato',
  'CWC-08': 'Candela di Soia in Cemento Vasetto - Verde - Muschio Marino ed Erbe',
  'CWC-09': 'Candela di Soia in Cemento Vasetto - Nero - Burro al Brandy',
  'CWC-10': 'Candela di Soia in Cemento Vasetto - Grigio - Caffè al Club',

  // WLSoyC - Candele di Soia White Label
  'WLSoyC-03': 'Candela di Soia in Barattolo - Melograno e Arancia',
  'WLSoyC-04': 'Candela di Soia in Barattolo - Giglio e Gelsomino',
  'WLSoyC-05': 'Candela di Soia in Barattolo - Cetriolo e Menta',
  'WLSoyC-06': 'Candela di Soia in Barattolo - Pompelmo e Zenzero',
  'WLSoyC-07': 'Candela di Soia in Barattolo - Bamboo',
  'WLSoyC-09': 'Candela di Soia in Barattolo - Talco per Bambini',
  'WLSoyC-10': 'Candela di Soia in Barattolo - Dolci Fatti in Casa',

  // RJC - Candele Arcobaleno in Barattolo
  'RJC-03': 'Candela Arcobaleno in Barattolo - Fiore di Cactus',
  'RJC-05': 'Candela Arcobaleno in Barattolo - Vaniglia',
  'RJC-06': 'Candela Arcobaleno in Barattolo - Fragola',
  'RJC-07': 'Candela Arcobaleno in Barattolo - Rosa',
  'RJC-08': 'Candela Arcobaleno in Barattolo - Lavanda',

  // HHC - Candela Cristallo Magico
  'HHC-02': 'Candela Cristallo Magico Hop Hare - Il Mago',
};

async function main() {
  let updated = 0;
  for (const [id, italianName] of Object.entries(translations)) {
    try {
      await prisma.product.update({ where: { id }, data: { name: italianName } });
      console.log(`OK ${id}: ${italianName}`);
      updated++;
    } catch (err) {
      console.log(`ERR ${id}: ${err.message.substring(0, 80)}`);
    }
  }
  console.log(`\nTradotti: ${updated}/${Object.keys(translations).length}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
