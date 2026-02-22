const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const CODES = [
  'PSH-05', 'BRIW-03', 'ISH-96M', 'BCI-13', 'BIB-17', 'ISH-132M',
  'BRIW-01', 'PSMH-05', 'PSMH-03', 'MIP-01', 'ATIH-05', 'ATIH-04',
  'OBToL-01', 'OBToL-02', 'SoapOB-15', 'OBCW-02'
];

async function main() {
  console.log('Formula: retailPrice + 22% IVA + €3 spedizione\n');
  console.log('Codice       | Retail AW | + IVA 22% | + €3 sped | Prezzo finale');
  console.log('-'.repeat(70));

  for (const code of CODES) {
    const p = await prisma.product.findUnique({ where: { id: code }, select: { id: true, retailPrice: true, wholesalePrice: true, price: true } });
    if (!p) { console.log(`${code} - NON TROVATO`); continue; }

    const retail = parseFloat(p.retailPrice) || 0;
    const conIva = retail * 1.22;
    const prezzoFinale = Math.round((conIva + 3) * 100) / 100;

    console.log(`${code.padEnd(12)} | €${retail.toFixed(2).padStart(6)} | €${conIva.toFixed(2).padStart(6)} | +€3.00    | €${prezzoFinale.toFixed(2)}`);

    await prisma.product.update({
      where: { id: code },
      data: { price: prezzoFinale }
    });
  }

  console.log('\nFatto! Solo i prezzi dei 16 bruciatori aggiornati.');
  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
