const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Connessione Prisma (usa DATABASE_URL da .env)
const prisma = new PrismaClient();

async function migrateProducts() {
  console.log('===================================');
  console.log('🚀 MIGRAZIONE PRODOTTI → PostgreSQL');
  console.log('===================================\n');

  try {
    // 1. Leggi products.json
    console.log('📂 Caricamento products.json...');
    const jsonPath = path.join(__dirname, 'data/products.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const products = JSON.parse(rawData);
    console.log(`✅ ${products.length} prodotti caricati dal JSON\n`);

    // 2. Pulisci tabella esistente (ATTENZIONE: cancella tutto!)
    console.log('🗑️  Pulizia tabella products...');
    const deleted = await prisma.product.deleteMany({});
    console.log(`✅ ${deleted.count} prodotti esistenti eliminati\n`);

    // 3. Inserisci prodotti uno per uno (con gestione errori)
    console.log('📥 Inserimento prodotti in PostgreSQL...\n');

    let inserted = 0;
    let errors = 0;
    const errorDetails = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      try {
        // Converti images da oggetti a stringhe (solo URL)
        let imageUrls = [];
        if (p.images && Array.isArray(p.images)) {
          imageUrls = p.images.map(img => {
            if (typeof img === 'string') {
              return img;
            } else if (img && img.url) {
              return img.url;
            }
            return '';
          }).filter(url => url !== '');
        }

        // Converti dimensions da stringa a JSON se necessario
        let dimensionsJson = null;
        if (p.dimensions) {
          if (typeof p.dimensions === 'object') {
            dimensionsJson = p.dimensions;
          } else if (typeof p.dimensions === 'string') {
            // Lascia come stringa (non JSON valido)
            dimensionsJson = null;
          }
        }

        // Converti i dati al formato Prisma
        await prisma.product.create({
          data: {
            id: p.id || `unknown-${i}`,
            name: p.name || 'Nome non disponibile',
            description: p.description || null,
            brand: p.brand || null,
            category: p.category || null,
            subcategory: p.subcategory || null,
            zenovaCategory: p.zenovaCategory || null,
            zenovaSubcategory: p.zenovaSubcategory || null,
            price: parseFloat(p.price) || 0,
            retailPrice: parseFloat(p.retailPrice || p.price || 0),
            wholesalePrice: p.wholesalePrice ? parseFloat(p.wholesalePrice) : null,
            stock: parseInt(p.stock) || 0,
            images: imageUrls,
            image: p.image || (imageUrls.length > 0 ? imageUrls[0] : null),
            ean: p.ean || null,
            weight: p.weight ? parseFloat(p.weight) : null,
            dimensions: dimensionsJson,
            active: p.active !== undefined ? p.active : true,
            visible: p.visible !== undefined ? p.visible : true,
            zone: p.zone || null,
            source: p.source || null,
            bigbuyId: p.bigbuyId ? String(p.bigbuyId) : null,
            lastSync: p.lastSync ? new Date(p.lastSync) : null,
            zenovaCategories: p.zenovaCategories || [],
          }
        });

        inserted++;

        // Progress report ogni 100 prodotti
        if (inserted % 100 === 0) {
          console.log(`   ✅ ${inserted}/${products.length} prodotti inseriti...`);
        }

      } catch (error) {
        errors++;
        errorDetails.push({
          product: p.id || p.name,
          error: error.message
        });

        if (errors <= 5) {
          console.error(`   ❌ Errore prodotto ${p.id}: ${error.message}`);
        }
      }
    }

    console.log('\n===================================');
    console.log('✅ MIGRAZIONE COMPLETATA!');
    console.log('===================================');
    console.log(`✅ Prodotti inseriti: ${inserted}`);
    console.log(`❌ Errori: ${errors}`);

    if (errors > 0 && errors <= 10) {
      console.log('\nDettagli errori:');
      errorDetails.forEach(e => {
        console.log(`  - ${e.product}: ${e.error}`);
      });
    }

    // 4. Verifica finale
    console.log('\n📊 Verifica database...');
    const totalInDb = await prisma.product.count();
    const visibleCount = await prisma.product.count({ where: { visible: true } });
    const sidebarCount = await prisma.product.count({ where: { zone: 'sidebar' } });
    const awProducts = await prisma.product.count({ where: { source: 'aw' } });
    const bigbuyProducts = await prisma.product.count({ where: { source: 'bigbuy' } });

    console.log(`   Total prodotti: ${totalInDb}`);
    console.log(`   Visible: ${visibleCount}`);
    console.log(`   Sidebar: ${sidebarCount}`);
    console.log(`   Source AW: ${awProducts}`);
    console.log(`   Source BigBuy: ${bigbuyProducts}`);

    // 5. Verifica le 42 candele e 31 incensi specifici
    console.log('\n🕯️  Verifica candele AW (aw-asc-*)...');
    const candele = await prisma.product.findMany({
      where: {
        id: { startsWith: 'aw-asc' }
      }
    });
    console.log(`   Trovate ${candele.length} candele`);

    if (candele.length > 0) {
      const allCorrect = candele.every(c => c.visible === true && c.zone === 'sidebar' && c.source === 'aw');
      console.log(`   Campi corretti: ${allCorrect ? '✅ SÌ' : '❌ NO'}`);
    }

    console.log('\n✅ Migrazione completata con successo!\n');

  } catch (error) {
    console.error('❌ ERRORE FATALE:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui migrazione
migrateProducts()
  .then(() => {
    console.log('🎉 Processo terminato con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Processo terminato con errori:', error);
    process.exit(1);
  });
