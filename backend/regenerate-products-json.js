const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function regenerateProductsJSON() {
  try {
    console.log('🔄 Rigenerazione products.json dal database...\n');

    // Carica TUTTI i prodotti dal database
    const products = await prisma.product.findMany({
      where: {
        visible: { not: false }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Caricati ${products.length} prodotti dal database\n`);

    // Conta per categoria
    const candeleGel = products.filter(p => p.zenovaSubcategory === 'candele-gel-profumati-sali-bagno');
    const candeleProfumate = products.filter(p => p.zenovaSubcategory === 'candele-profumate');
    const diffusori = products.filter(p => p.zenovaSubcategory === 'diffusori');

    console.log('Verifica categorie:');
    console.log(`  candele-gel-profumati-sali-bagno: ${candeleGel.length}`);
    console.log(`  candele-profumate: ${candeleProfumate.length}`);
    console.log(`  diffusori: ${diffusori.length}\n`);

    // Formatta per il frontend (stesso formato dell'API)
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand || 'Zenova',
      price: parseFloat(p.price) || 0,
      retailPrice: p.retailPrice ? parseFloat(p.retailPrice) : null,
      stock: p.stock,
      images: p.images,
      image: p.images && p.images[0] ? p.images[0] : null,
      zenovaSubcategory: p.zenovaSubcategory,
      zenovaCategory: p.zenovaCategory,
      zenovaCategories: p.zenovaCategories || [],
      subcategory: p.subcategory,
      source: p.source || 'bigbuy',
      zone: 'sidebar', // Default
      visible: p.visible !== false
    }));

    // Salva nella root del progetto
    const outputPath = path.join(__dirname, '../products.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedProducts, null, 2));

    console.log(`✅ File salvato: ${outputPath}`);
    console.log(`📦 ${formattedProducts.length} prodotti esportati\n`);

    // Verifica finale
    const savedData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    const savedCandeleGel = savedData.filter(p => p.zenovaSubcategory === 'candele-gel-profumati-sali-bagno');
    console.log(`Verifica file salvato: ${savedCandeleGel.length} prodotti candele-gel ✅`);

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateProductsJSON();
