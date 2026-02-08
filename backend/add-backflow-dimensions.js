const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dimensioni stimate per bruciatori backflow basate sul peso
const backflowDimensions = {
    'BackF-01': { h: 12, w: 8, d: 8, desc: 'Mano con fiore di loto' },      // 110g - piccolo
    'BackF-02': { h: 10, w: 8, d: 8, desc: 'Piccolo con sassolini' },       // 125g - piccolo
    'BackF-03': { h: 18, w: 12, d: 12, desc: 'Grande con piscina' },        // 308g - grande
    'BackF-04': { h: 15, w: 10, d: 10, desc: 'Fontana bambù' },             // 207g - medio
    'BackF-05': { h: 16, w: 12, d: 12, desc: 'Bambù con piscina' },         // 316g - grande
    'BackF-07': { h: 14, w: 10, d: 10, desc: 'Rotondo quadrato' },          // 200g - medio
    'BackF-08': { h: 16, w: 12, d: 12, desc: 'Grande pools to pools' },     // 234g - medio-grande
};

async function addDimensions() {
    console.log('🔧 Aggiunta dimensioni ai bruciatori backflow...\n');

    for (const [id, dims] of Object.entries(backflowDimensions)) {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { id: true, name: true, description: true }
        });

        if (!product) {
            console.log(`❌ Prodotto ${id} non trovato`);
            continue;
        }

        // Controlla se le dimensioni sono già presenti
        if (product.description && product.description.includes('Dimensioni:')) {
            console.log(`⏭️  ${product.name} - dimensioni già presenti`);
            continue;
        }

        // Aggiungi le dimensioni alla descrizione
        const dimensionText = `\n\n<strong>Dimensioni:</strong> circa ${dims.h} x ${dims.w} x ${dims.d} cm (altezza x larghezza x profondità)`;

        const newDescription = (product.description || '') + dimensionText;

        await prisma.product.update({
            where: { id },
            data: { description: newDescription }
        });

        console.log(`✅ ${product.name}`);
        console.log(`   Dimensioni: ${dims.h} x ${dims.w} x ${dims.d} cm\n`);
    }

    console.log('\n✨ Fatto!');
    await prisma.$disconnect();
}

addDimensions().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
