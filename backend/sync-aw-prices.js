/**
 * Sincronizza prezzi prodotti AW da API reale a PostgreSQL
 * Esegui: node sync-aw-prices.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const AWDropshipClient = require('./src/integrations/AWDropshipClient');
const logger = require('./src/utils/logger');

const prisma = new PrismaClient();
const awClient = new AWDropshipClient();

async function syncAWPrices() {
  try {
    console.log('========================================');
    console.log('🔄 SYNC PREZZI AW: API REALE → PostgreSQL');
    console.log('========================================\n');

    // 1. Scarica TUTTI i prodotti dall'API AW reale
    console.log('📥 Download catalogo completo AW dall\'API reale...');
    let allAwProducts = [];
    let currentPage = 1;

    const firstPage = await awClient.getProducts(1, 100);
    const totalPages = firstPage.pagination.lastPage;
    const totalProducts = firstPage.pagination.total;

    console.log(`   Totale prodotti API AW: ${totalProducts} (${totalPages} pagine)\n`);

    allAwProducts = [...firstPage.data];

    for (let page = 2; page <= totalPages; page++) {
      const pageData = await awClient.getProducts(page, 100);
      allAwProducts = [...allAwProducts, ...pageData.data];
      console.log(`   Pagina ${page}/${totalPages} - ${allAwProducts.length} prodotti scaricati`);
    }

    console.log(`\n✅ Download completato: ${allAwProducts.length} prodotti dall'API AW\n`);

    // 2. Crea mappa code -> prezzo API per lookup veloce
    const priceMap = new Map();
    allAwProducts.forEach(p => {
      priceMap.set(p.code, {
        price: parseFloat(p.price),
        name: p.name
      });
    });

    console.log(`📋 Mappa prezzi creata: ${priceMap.size} prodotti\n`);

    // 3. Trova tutti i prodotti AW nel database
    console.log('🔍 Query prodotti AW da PostgreSQL...');
    const dbAwProducts = await prisma.product.findMany({
      where: {
        source: 'aw'
      },
      select: {
        id: true,
        name: true,
        price: true,
        retailPrice: true,
        originalPrice: true
      }
    });

    console.log(`   Trovati ${dbAwProducts.length} prodotti AW nel database\n`);

    // 4. Aggiorna database con prezzi API
    console.log('💾 Aggiornamento PostgreSQL con prezzi API reali...\n');

    let updated = 0;
    let notFound = 0;
    const notFoundList = [];

    for (const dbProduct of dbAwProducts) {
      const apiData = priceMap.get(dbProduct.id);

      if (apiData) {
        // Prodotto trovato nell'API - aggiorna con prezzo reale
        try {
          await prisma.product.update({
            where: { id: dbProduct.id },
            data: {
              originalPrice: apiData.price
            }
          });

          updated++;

          if (updated % 10 === 0) {
            console.log(`   ✅ ${updated} prodotti aggiornati con prezzi API...`);
          }

        } catch (error) {
          console.error(`   ❌ Errore aggiornamento ${dbProduct.id}:`, error.message);
        }

      } else {
        // Prodotto NON trovato nell'API corrente (vecchio catalogo)
        // Imposta originalPrice = null (userà fallback 30%)
        notFound++;
        notFoundList.push({
          id: dbProduct.id,
          name: dbProduct.name.substring(0, 50)
        });

        try {
          await prisma.product.update({
            where: { id: dbProduct.id },
            data: {
              originalPrice: null
            }
          });
        } catch (error) {
          console.error(`   ❌ Errore aggiornamento ${dbProduct.id}:`, error.message);
        }
      }
    }

    console.log('\n========================================');
    console.log('✅ SINCRONIZZAZIONE COMPLETATA!');
    console.log('========================================');
    console.log(`✅ Prodotti aggiornati con API reale: ${updated}`);
    console.log(`⚠️  Prodotti non in API (vecchi): ${notFound}`);
    console.log(`📊 Totale prodotti AW: ${dbAwProducts.length}\n`);

    if (notFound > 0 && notFound <= 20) {
      console.log('Prodotti non trovati in API (useranno margine 30%):');
      notFoundList.forEach(p => {
        console.log(`   - ${p.id}: ${p.name}`);
      });
      console.log('');
    }

    // 5. Verifica candela zodiaco come test
    console.log('🔍 Verifica prezzi candele zodiaco dopo sync:\n');
    const candele = await prisma.product.findMany({
      where: {
        id: { startsWith: 'aw-zcc-' }
      },
      select: {
        id: true,
        name: true,
        price: true,
        retailPrice: true,
        originalPrice: true
      },
      take: 3
    });

    candele.forEach(c => {
      console.log(`   ${c.id}:`);
      console.log(`      Wholesale: €${c.price}`);
      console.log(`      Original (API): €${c.originalPrice || 'null (userà fallback 30%)'}`);
      console.log('');
    });

    console.log('🎉 Sync completato con successo!\n');

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRORE SYNC:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Esegui sync
syncAWPrices();
