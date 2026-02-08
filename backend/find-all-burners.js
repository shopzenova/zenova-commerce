const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBurners() {
    const products = await prisma.product.findMany({
        where: {
            zenovaSubcategory: 'incenso'
        },
        select: {
            id: true,
            name: true,
            weight: true
        }
    });

    // Filtra solo i bruciatori (non i coni)
    const burners = products.filter(p =>
        p.name.toLowerCase().includes('bruciatore') ||
        p.name.toLowerCase().includes('burner')
    );

    console.log('Trovati:', burners.length, 'bruciatori\n');
    burners.forEach(p => {
        console.log(`${p.id} | ${p.name} | ${p.weight}kg`);
    });

    await prisma.$disconnect();
}

findBurners();
