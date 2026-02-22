const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const translations = {
  // FLCand - Candeline Galleggianti
  'FLCand-04': 'Candeline Galleggianti - Lavanda',

  // ACBFC - Candele di Soia Botanica Agnes + Cat
  'ACBFC-01': 'Candela di Soia Botanica Agnes + Cat - Rose di Samarcanda',
  'ACBFC-02': 'Candela di Soia Botanica Agnes + Cat - Windermere',
  'ACBFC-03': 'Candela di Soia Botanica Agnes + Cat - Brughiera',
  'ACBFC-04': 'Candela di Soia Botanica Agnes + Cat - Rydal Oud',
  'ACBFC-05': 'Candela di Soia Botanica Agnes + Cat - Bacche di Brughiera',
  'ACBFC-06': 'Candela di Soia Botanica Agnes + Cat - Sale Marino e Muschio',
  'ACBFC-07': 'Candela di Soia Botanica Agnes + Cat - Nebbia del Lakeland',

  // ACJJ - Candela in Vasetto
  'ACJJ-01': 'Candela in Vasetto - Windermere',
  'ACJJ-02': 'Candela in Vasetto - Roll Marocchino',
  'ACJJ-03': 'Candela in Vasetto - Bacche di Brughiera',
  'ACJJ-04': 'Candela in Vasetto - Rabarbaro',
  'ACJJ-05': 'Candela in Vasetto - Tè e Rose',
  'ACJJ-07': 'Candela in Vasetto - Fiore di Ciliegio Giapponese',
  'ACJJ-10': 'Candela in Vasetto - Pietra di Luna',
  'ACJJ-13': 'Candela in Vasetto - Luna di Velluto',
  'ACJJ-20': 'Candela in Vasetto - Fico Bianco',
  'ACJJ-22': 'Candela in Vasetto - Provenza',
  'ACJJ-23': 'Candela in Vasetto - Clementina',
  'ACJJ-26': 'Candela in Vasetto - Agrumi',

  // ACKC - Candela in Barattolo Kilner
  'ACKC-02': 'Candela in Barattolo Kilner - Roll Marocchino',
  'ACKC-03': 'Candela in Barattolo Kilner - Bacche di Brughiera',
  'ACKC-06': 'Candela in Barattolo Kilner - Sale Marino e Muschio',
  'ACKC-07': 'Candela in Barattolo Kilner - Fiore di Ciliegio Giapponese',
  'ACKC-17': 'Candela in Barattolo Kilner - Blu Delicato',
  'ACKC-20': 'Candela in Barattolo Kilner - Fico Bianco',
  'ACKC-22': 'Candela in Barattolo Kilner - Provenza',

  // BotC - Grande Candela Botanica
  'BotC-04': 'Grande Candela Botanica - Peonia Vittoriana',
  'BotC-05': 'Grande Candela Botanica - Gelsomino Selvatico',
  'BotC-06': 'Grande Candela Botanica - Violetta di Palude',
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
