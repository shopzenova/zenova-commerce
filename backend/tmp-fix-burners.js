const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const CODES = [
  'PSH-05', 'BRIW-03', 'ISH-96M', 'BCI-13', 'BIB-17', 'ISH-132M',
  'BRIW-01', 'PSMH-05', 'PSMH-03', 'MIP-01', 'ATIH-05', 'ATIH-04',
  'OBToL-01', 'OBToL-02', 'SoapOB-15', 'OBCW-02'
];

const TRANSLATIONS = {
  'PSH-05': 'Bruciatore Palo Santo - Legno di Teak - Design Mandala',
  'BRIW-03': 'Bruciatore Resina Incenso in Ottone - Fisso',
  'ISH-96M': 'Torre Incenso Esagonale - Legno di Mango',
  'BCI-13': 'Giara Incenso a Carbone Chakra Alta - Sacrale',
  'BIB-17': 'Grande Bruciatore Incenso Incensiere in Ferro su Supporto - Oro',
  'ISH-132M': 'Torre Incenso Affusolata - Legno di Mango',
  'BRIW-01': 'Bruciatore Resina Incenso in Ottone - Regolabile',
  'PSMH-05': 'Porta Palo Santo e Smudge - Mandala - Rosso',
  'PSMH-03': 'Porta Palo Santo e Smudge - Mandala - Sabbia',
  'MIP-01': 'Piatto Incenso Buddha Multiuso - Terracotta Naturale',
  'ATIH-05': 'Bruciatore Tibetano in Ottone - Otto Simboli Quadrato Sospeso',
  'ATIH-04': 'Bruciatore Tibetano in Ottone Verdigris - Quattro Simboli Quadrato',
  'OBToL-01': 'Bruciatore Oli Albero della Vita - Blu',
  'OBToL-02': 'Bruciatore Oli Albero della Vita - Miele',
  'SoapOB-15': 'Piccolo Bruciatore Oli in Pietra Saponaria 8cm - Tre Lune Pentagono',
  'OBCW-02': 'Grande Bruciatore Oli Classico Bianco - Luna e Stella',
};

async function main() {
  for (const code of CODES) {
    const name = TRANSLATIONS[code] || code;
    await prisma.product.update({
      where: { id: code },
      data: {
        name: name,
        category: 'Incenso',
        zenovaCategory: 'Natural Wellness',
        zenovaSubcategory: 'Incenso',
      }
    });
    console.log(`${code} → ${name} | cat: Incenso`);
  }

  console.log('\nFatto! 16 bruciatori aggiornati.');
  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
