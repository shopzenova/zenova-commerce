require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Correzioni specifiche per nomi prodotti diffusori-oli
const nameCorrections = [
  // Reed Diffuser Sticks (bastoncini)
  { pattern: /Natural Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Naturali per Diffusore' },
  { pattern: /Black Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Neri per Diffusore' },
  { pattern: /Purple Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Viola per Diffusore' },
  { pattern: /Pink Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Rosa per Diffusore' },
  { pattern: /Green Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Verdi per Diffusore' },
  { pattern: /Dark Brown Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Marrone Scuro per Diffusore' },
  { pattern: /Pack of (\d+)mm Indonesia Diffusore a Bastoncini Sticks/gi, replacement: 'Bastoncini Indonesiani $1mm per Diffusore' },
  { pattern: /5kg of (\d+\.?\d*)mm Diffusore a Bastoncinis/gi, replacement: 'Bastoncini per Diffusore $1mm - 5kg' },
  { pattern: /Approx (\d+) Sticks/gi, replacement: 'circa $1 pezzi' },
  { pattern: /approx (\d+)/gi, replacement: 'circa $1' },

  // Essential Oil -> Olio Essenziale
  { pattern: /Essential Oil Diffusore a Bastoncini/gi, replacement: 'Diffusore a Bastoncini con Olio Essenziale' },
  { pattern: /(\d+ml) (.+) Essential Oil Diffusore a Bastoncini/gi, replacement: 'Diffusore a Bastoncini con Olio Essenziale $2 $1' },

  // Fragranze specifiche in inglese
  { pattern: /Lime & Ginger/gi, replacement: 'Lime e Zenzero' },
  { pattern: /Cinnamon & Clove/gi, replacement: 'Cannella e Chiodi di Garofano' },
  { pattern: /Patchouli/gi, replacement: 'Patchouli' },
  { pattern: /Petitgrain & Rosewood/gi, replacement: 'Petitgrain e Palissandro' },
  { pattern: /Sage & Rosemary/gi, replacement: 'Salvia e Rosmarino' },
  { pattern: /Ylang Ylang & Mandarin/gi, replacement: 'Ylang Ylang e Mandarino' },
  { pattern: /Lemon Verbena/gi, replacement: 'Verbena al Limone' },
  { pattern: /Geranium & Rose/gi, replacement: 'Geranio e Rosa' },
  { pattern: /Basil & Maychang/gi, replacement: 'Basilico e Litsea' },
  { pattern: /Peppermint & Frankincense/gi, replacement: 'Menta Piperita e Incenso' },
  { pattern: /Lemon & Nutmeg/gi, replacement: 'Limone e Noce Moscata' },

  // Nomi già parzialmente tradotti
  { pattern: /Heavenly Muschio/gi, replacement: 'Muschio Celeste' },
  { pattern: /Fico & Cassis/gi, replacement: 'Fico e Cassis' },
  { pattern: /Lavanda Fields/gi, replacement: 'Campi di Lavanda' },
  { pattern: /Zenzero Stem & Walnut/gi, replacement: 'Zenzero e Noce' },
  { pattern: /Vaniglia Plantation/gi, replacement: 'Piantagione di Vaniglia' },
  { pattern: /Melograno & Noce Moscata/gi, replacement: 'Melograno e Noce Moscata' },
  { pattern: /On Gelsomino Wings/gi, replacement: 'Ali di Gelsomino' },
  { pattern: /Gold, Incenso & Mirra/gi, replacement: 'Oro, Incenso e Mirra' },
  { pattern: /In Ciliegia Woods/gi, replacement: 'Bosco di Ciliegi' },
  { pattern: /White Fragola & Mora/gi, replacement: 'Fragola Bianca e Mora' },
  { pattern: /Arancia & Melone/gi, replacement: 'Arancia e Melone' },

  // Rotolo Marocchino
  { pattern: /Rotolo Marocchino/gi, replacement: 'Spezie Marocchine' },
  { pattern: /Rotolo Mar.../gi, replacement: 'Spezie Marocchine' }
];

async function main() {
  console.log('=== Correzione Nomi Diffusori-Oli ===\n');

  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'diffusori-oli' },
    select: { id: true, name: true }
  });

  console.log(`Prodotti: ${products.length}\n`);

  let fixed = 0;

  for (const p of products) {
    let newName = p.name;
    let changed = false;

    for (const { pattern, replacement } of nameCorrections) {
      if (pattern.test(newName)) {
        newName = newName.replace(pattern, replacement);
        changed = true;
      }
    }

    if (changed && newName !== p.name) {
      console.log(`${p.id}:`);
      console.log(`  Prima: ${p.name}`);
      console.log(`  Dopo:  ${newName}`);

      await prisma.product.update({
        where: { id: p.id },
        data: { name: newName }
      });

      fixed++;
    }
  }

  console.log(`\n=== Corretti ${fixed} nomi ===`);

  await prisma.$disconnect();
}

main().catch(console.error);
