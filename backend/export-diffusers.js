const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportDiffusers() {
  try {
    console.log('📤 Esportazione diffusori per Vercel...\n');

    // Leggi tutti i diffusori AATOM dal database
    const diffusers = await prisma.product.findMany({
      where: {
        sku: {
          startsWith: 'AATOM-'
        }
      },
      orderBy: {
        sku: 'asc'
      }
    });

    console.log(`✅ Trovati ${diffusers.length} diffusori\n`);

    // Converti in formato frontend
    const productsForFrontend = diffusers.map(d => {
      const images = JSON.parse(d.images || '[]');
      const features = JSON.parse(d.features || '{}');

      return {
        id: d.id,
        name: d.name,
        category: 'Natural Wellness',
        subcategory: 'diffusori-elettronici',
        price: parseFloat(d.price),
        description: d.description || d.name, // Keep full HTML description from AW
        icon: '💧',
        image: images[0] || '',
        images: images,
        sku: d.sku,
        stock: d.stock,
        weight: parseFloat(d.weight || 0),
        dimensions: d.dimensions,
        features: features,
        badge: d.stock > 50 ? 'Available' : d.stock > 0 ? 'Limited Stock' : 'Out of Stock'
      };
    });

    // Leggi products.json esistente
    const productsPath = path.join(__dirname, '..', 'products.json');
    let existingProducts = [];

    if (fs.existsSync(productsPath)) {
      const data = fs.readFileSync(productsPath, 'utf8');
      existingProducts = JSON.parse(data);
      console.log(`📦 Products.json esistente: ${existingProducts.length} prodotti\n`);
    }

    // Rimuovi vecchi diffusori AATOM
    const filteredProducts = existingProducts.filter(p => !p.sku?.startsWith('AATOM-'));
    console.log(`🗑️  Rimossi ${existingProducts.length - filteredProducts.length} vecchi diffusori\n`);

    // Aggiungi nuovi diffusori
    const updatedProducts = [...filteredProducts, ...productsForFrontend];
    console.log(`✅ Totale prodotti: ${updatedProducts.length}\n`);

    // Salva products.json
    fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');
    console.log(`✅ Products.json aggiornato: ${productsPath}\n`);

    // Stampa riepilogo
    console.log('📊 Riepilogo:');
    console.log(`   - Diffusori esportati: ${productsForFrontend.length}`);
    console.log(`   - Altri prodotti: ${filteredProducts.length}`);
    console.log(`   - Totale: ${updatedProducts.length}\n`);

  } catch (error) {
    console.error('❌ Errore durante l\'esportazione:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDiffusers();
