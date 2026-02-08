require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Correzione Descrizioni Bastoncini per Diffusore ===\n');

  // Trova tutti i prodotti Rreed/RReed (bastoncini sfusi)
  const products = await prisma.product.findMany({
    where: {
      zenovaSubcategory: 'diffusori-oli',
      id: { contains: 'reed', mode: 'insensitive' }
    },
    select: { id: true, name: true, description: true }
  });

  console.log(`Prodotti bastoncini trovati: ${products.length}\n`);

  for (const p of products) {
    console.log(`${p.id}: ${p.name}`);

    // Estrai dimensioni dal nome
    const sizeMatch = p.name.match(/(\d+)cm\s*x\s*(\d+\.?\d*)mm/i);
    const weightMatch = p.name.match(/(\d+\.?\d*)\s*(kg|gms)/i);
    const countMatch = p.name.match(/circa\s*(\d+)\s*pezzi/i);

    let length = sizeMatch ? sizeMatch[1] : '25';
    let diameter = sizeMatch ? sizeMatch[2] : '3';
    let weight = weightMatch ? weightMatch[1] + weightMatch[2] : '';
    let count = countMatch ? countMatch[1] : '';

    // Determina colore
    let color = 'Naturale';
    if (p.name.toLowerCase().includes('nero') || p.name.toLowerCase().includes('neri')) color = 'Nero';
    if (p.name.toLowerCase().includes('rosa')) color = 'Rosa';
    if (p.name.toLowerCase().includes('viola')) color = 'Viola';
    if (p.name.toLowerCase().includes('verde') || p.name.toLowerCase().includes('verdi')) color = 'Verde';
    if (p.name.toLowerCase().includes('marrone')) color = 'Marrone Scuro';

    // Crea descrizione appropriata
    let description = `<p>Bastoncini di ricambio per diffusori a bastoncini, realizzati in <b>rattan indonesiano</b> di alta qualità. Ideali per sostituire i bastoncini esauriti o per creare i tuoi diffusori personalizzati.</p>
<ul>
<li>Materiale: Rattan naturale indonesiano</li>
<li>Lunghezza: ${length} cm</li>
<li>Diametro: ${diameter} mm</li>
<li>Colore: ${color}</li>`;

    if (weight) {
      description += `\n<li>Peso: ${weight}</li>`;
    }
    if (count) {
      description += `\n<li>Quantità: circa ${count} bastoncini</li>`;
    }

    description += `
</ul>
<p><i>I bastoncini in rattan assorbono gli oli essenziali e li diffondono gradualmente nell'ambiente. Si consiglia di sostituirli ogni 2-3 ricariche per una diffusione ottimale.</i></p>`;

    await prisma.product.update({
      where: { id: p.id },
      data: { description }
    });

    console.log(`  ✓ Descrizione corretta`);
  }

  console.log('\n=== Completato ===');
  await prisma.$disconnect();
}

main().catch(console.error);
