require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fixes = [
    {
      id: '8424001970742',
      name: 'Diffusore di Oli Essenziali DKD Home Decor Naturale 550 ml',
      description: `<p>Se ti piace prenderti cura della tua salute e sei alla ricerca di prodotti che ti offrano <b>protezione e benessere</b>, compra <b>Diffusore di Oli Essenziali DKD Home Decor Naturale 550 ml</b> e molti altri <b>prodotti DKD Home Decor</b> ai migliori prezzi!</p>
<ul>
<li>Caratteristiche: Lunga durata</li>
<li>Colore: Naturale</li>
<li>Materiale: ABS</li>
<li>Capacità: 550 ml</li>
<li>Dimensioni appross.: 17 x 17 x 20 cm</li>
</ul>`
    },
    {
      id: '8424002079512',
      name: 'Umidificatore Diffusore di Aromi DKD Home Decor Bianco Naturale 120 ml',
      description: `<p>Se ti piace curare ogni singolo dettaglio della casa ed essere sempre alla moda in tema di prodotti che ti renderanno la vita più facile, compra <b>Umidificatore Diffusore di Aromi DKD Home Decor Bianco Naturale 120 ml</b> al miglior prezzo.</p>
<ul>
<li>Tipo: Umidificatore Diffusore di Aromi</li>
<li>Colore: Bianco, Naturale</li>
<li>Materiale: ABS</li>
<li>Capacità: 120 ml</li>
<li>Dimensioni appross.: 11,5 x 11,5 x 15 cm</li>
</ul>`
    }
  ];

  for (const fix of fixes) {
    await prisma.product.update({
      where: { id: fix.id },
      data: {
        name: fix.name,
        description: fix.description
      }
    });
    console.log('✓', fix.id, '->', fix.name);
  }

  console.log('\nCorretto!');
  await prisma.$disconnect();
}

main().catch(console.error);
