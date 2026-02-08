const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Stima dimensioni in base al peso
function estimateDimensions(weight) {
    if (!weight || weight === 0) {
        return { h: 12, w: 10, d: 10 }; // Default medio
    }

    if (weight < 0.15) {
        return { h: 10, w: 8, d: 8 };       // Molto piccolo
    } else if (weight < 0.25) {
        return { h: 12, w: 10, d: 10 };     // Piccolo
    } else if (weight < 0.4) {
        return { h: 15, w: 12, d: 12 };     // Medio
    } else if (weight < 0.6) {
        return { h: 18, w: 14, d: 14 };     // Grande
    } else {
        return { h: 22, w: 16, d: 16 };     // Molto grande
    }
}

async function addDimensions() {
    console.log('🔧 Aggiunta dimensioni a TUTTI i bruciatori backflow...\n');

    // Trova tutti i prodotti BackF-*
    const products = await prisma.product.findMany({
        where: {
            id: { startsWith: 'BackF-' }
        },
        select: {
            id: true,
            name: true,
            weight: true,
            description: true
        }
    });

    console.log(`Trovati ${products.length} bruciatori backflow\n`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
        // Controlla se le dimensioni sono già presenti
        if (product.description && product.description.includes('Dimensioni:') && !product.description.includes('- x - x -')) {
            console.log(`⏭️  ${product.name} - già presente`);
            skipped++;
            continue;
        }

        const dims = estimateDimensions(product.weight);

        // Rimuovi eventuale testo "Dimensioni: - x - x -" esistente
        let desc = product.description || '';
        desc = desc.replace(/Dimensioni:?\s*-?\s*x\s*-?\s*x\s*-?\s*(cm)?/gi, '');
        desc = desc.replace(/<strong>Dimensioni:<\/strong>\s*circa\s*\d+\s*x\s*\d+\s*x\s*\d+\s*cm[^<]*/gi, '');

        // Aggiungi le nuove dimensioni
        const dimensionText = `\n\n<strong>Dimensioni:</strong> circa ${dims.h} x ${dims.w} x ${dims.d} cm (A x L x P)`;
        const newDescription = desc.trim() + dimensionText;

        await prisma.product.update({
            where: { id: product.id },
            data: { description: newDescription }
        });

        console.log(`✅ ${product.name}`);
        console.log(`   Peso: ${product.weight || '?'}kg → Dimensioni: ${dims.h} x ${dims.w} x ${dims.d} cm`);
        updated++;
    }

    console.log(`\n✨ Fatto! Aggiornati: ${updated}, Saltati: ${skipped}`);
    await prisma.$disconnect();
}

addDimensions().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
