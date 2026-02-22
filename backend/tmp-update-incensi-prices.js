const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

const IDS = [
  'GoldNCS-01','GoldNCS-02','GoldNCS-03','GoldNCS-04','GoldNCS-05','GoldNCS-06',
  'SMI-01','SMI-02','SMI-03','SMI-04','SMI-05','SMI-06','SMI-07','SMI-08',
  'NBoti-01','NBoti-02','NBoti-03','NBoti-04','NBoti-05','NBoti-06','NBoti-07','NBoti-08','NBoti-09',
  'RitRinc-03','RitRinc-04','RitRinc-05','RitRinc-06','RitRinc-07','RitRinc-08',
  'RitRinc-09','RitRinc-10','RitRinc-11','RitRinc-12','RitRinc-13','RitRinc-14','RitRinc-15','RitRinc-16',
  'TribalSi-01','TribalSi-02','TribalSi-03','TribalSi-04','TribalSi-05',
  'TribalSi-06','TribalSi-07','TribalSi-08','TribalSi-09','TribalSi-10',
];

const SHIPPING = 3.00;

async function main() {
  const products = await prisma.product.findMany({
    where: { id: { in: IDS } },
    select: { id: true, price: true, retailPrice: true }
  });

  console.log(`Trovati: ${products.length} prodotti\n`);
  console.log('ID              | Costo  | Retail PRIMA | Retail DOPO (+€3)');
  console.log('-'.repeat(65));

  let updated = 0;
  for (const p of products) {
    const oldRetail = parseFloat(p.retailPrice);
    const newRetail = oldRetail + SHIPPING;

    await prisma.product.update({
      where: { id: p.id },
      data: { retailPrice: newRetail }
    });

    console.log(`${p.id.padEnd(16)}| €${parseFloat(p.price).toFixed(2).padEnd(6)}| €${oldRetail.toFixed(2).padEnd(12)}| €${newRetail.toFixed(2)}`);
    updated++;
  }

  console.log(`\nAggiornati: ${updated}/${IDS.length}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
