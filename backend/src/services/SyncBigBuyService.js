/**
 * SINCRONIZZAZIONE BIGBUY → POSTGRESQL
 * Aggiorna stock e prezzi in tempo reale nel database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const BIGBUY_API_URL = process.env.BIGBUY_API_URL;
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

const bigbuyAPI = axios.create({
  baseURL: BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

/**
 * Sincronizza stock e prezzi da BigBuy al database PostgreSQL
 */
async function syncBigBuyToPostgres() {
  const startTime = Date.now();
  console.log('\n🔄 SINCRONIZZAZIONE STOCK BIGBUY → POSTGRESQL');
  console.log('='.repeat(60));
  console.log('⏰', new Date().toLocaleString('it-IT'));
  console.log('📦 Aggiorna solo STOCK (i prezzi rimangono invariati)');
  console.log('');

  const stats = {
    totalProducts: 0,
    updated: 0,
    errors: 0,
    inStock: 0,
    outOfStock: 0
  };

  try {
    // 1. Carica tutti i prodotti BigBuy dal database
    console.log('📦 Caricamento prodotti BigBuy dal database...');

    const bigbuyProducts = await prisma.product.findMany({
      where: {
        source: 'bigbuy',
        bigbuyId: { not: null }
      },
      select: {
        id: true,
        bigbuyId: true,
        name: true
      }
    });

    stats.totalProducts = bigbuyProducts.length;
    console.log(`   ✅ Trovati ${stats.totalProducts} prodotti BigBuy\n`);

    if (stats.totalProducts === 0) {
      console.log('⚠️  Nessun prodotto BigBuy trovato nel database');
      return stats;
    }

    // 2. Estrai IDs BigBuy (possono essere "3058424" o "S3058424")
    // Estrae la parte numerica anche da SKU alfanumerici
    const bigbuyIds = bigbuyProducts
      .map(p => {
        const id = p.bigbuyId;
        if (!id) return null;
        // Estrae solo i numeri dallo SKU (es. "S3058424" -> 3058424)
        const numericPart = id.toString().replace(/\D/g, '');
        return numericPart ? parseInt(numericPart) : null;
      })
      .filter(id => id !== null);

    console.log(`🔑 Richiesta stock per ${bigbuyIds.length} prodotti BigBuy...\n`);

    // 3. Dividi in batch di 100 (limite API BigBuy)
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < bigbuyIds.length; i += BATCH_SIZE) {
      batches.push(bigbuyIds.slice(i, i + BATCH_SIZE));
    }

    console.log(`📊 Batch da processare: ${batches.length}\n`);

    // 4. Processa batch e ottieni stock da BigBuy
    let stockData = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        console.log(`   Batch ${i + 1}/${batches.length} (${batch.length} prodotti)...`);

        // IMPORTANTE: endpoint corretto è /productsstock.json (non productstockavailable)
        // Body format: { products: [array di IDs] }
        const response = await bigbuyAPI.post('/rest/catalog/productsstock.json', {
          products: batch
        });

        if (response.data && Array.isArray(response.data)) {
          stockData.push(...response.data);
          console.log(`      ✅ Ricevuti ${response.data.length} risultati`);
        }

        // Pausa tra batch
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`      ❌ Errore batch ${i + 1}:`, error.message);
        stats.errors++;
      }
    }

    console.log(`\n✅ Ricevuti dati stock per ${stockData.length} prodotti\n`);

    // 5. Crea mappa BigBuyID → Stock
    // NOTA: productsstock.json restituisce solo stock, non prezzi!
    // I prezzi sono già nel database dal CSV FTP
    const stockMap = {};

    if (Array.isArray(stockData)) {
      // Formato response.data diretto: [{ productId, quantity, available }, ...]
      stockData.forEach(item => {
        const id = item.productId || item.id;
        stockMap[id] = {
          stock: item.quantity || 0,
          inStock: item.available || ((item.quantity || 0) > 0)
        };
      });
    } else if (stockData.stocks && Array.isArray(stockData.stocks)) {
      // Formato response.data wrapped: { stocks: [...] }
      stockData.stocks.forEach(item => {
        const id = item.productId || item.id;
        stockMap[id] = {
          stock: item.quantity || 0,
          inStock: item.available || ((item.quantity || 0) > 0)
        };
      });
    }

    // 6. Aggiorna database PostgreSQL
    console.log('💾 Aggiornamento database PostgreSQL...\n');

    for (const product of bigbuyProducts) {
      // Estrae parte numerica (es. "S3058424" -> 3058424)
      const numericId = product.bigbuyId ? parseInt(product.bigbuyId.toString().replace(/\D/g, '')) : null;
      const stockInfo = numericId ? stockMap[numericId] : null;

      if (stockInfo) {
        try {
          // Aggiorna SOLO stock (i prezzi rimangono quelli del database)
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: stockInfo.stock,
              lastSync: new Date()
            }
          });

          stats.updated++;

          if (stockInfo.inStock) {
            stats.inStock++;
          } else {
            stats.outOfStock++;
          }

          // Log ogni 50 prodotti
          if (stats.updated % 50 === 0) {
            console.log(`   Aggiornati ${stats.updated}/${stockData.length} prodotti...`);
          }

        } catch (error) {
          console.error(`   ❌ Errore aggiornamento ${product.id}:`, error.message);
          stats.errors++;
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n📊 RISULTATI FINALI:');
    console.log('='.repeat(60));
    console.log(`   Prodotti nel database: ${stats.totalProducts}`);
    console.log(`   Prodotti aggiornati: ${stats.updated}`);
    console.log(`   Disponibili: ${stats.inStock}`);
    console.log(`   Esauriti: ${stats.outOfStock}`);
    console.log(`   Errori: ${stats.errors}`);
    console.log(`   Durata: ${duration}s`);
    console.log('='.repeat(60));

    // 7. Salva log sincronizzazione
    await prisma.syncLog.create({
      data: {
        syncType: 'bigbuy-stock',  // Solo stock, non prezzi
        status: stats.errors > 0 ? 'completed_with_errors' : 'success',
        itemsProcessed: stats.updated,
        errorMessage: stats.errors > 0 ? `${stats.errors} errori durante sync` : null,
        durationMs: Date.now() - startTime
      }
    });

    console.log('\n✅ SINCRONIZZAZIONE COMPLETATA!\n');

    return stats;

  } catch (error) {
    console.error('\n❌ ERRORE FATALE:', error.message);
    console.error(error.stack);

    // Log errore
    try {
      await prisma.syncLog.create({
        data: {
          syncType: 'bigbuy-stock',
          status: 'error',
          itemsProcessed: stats.updated,
          errorMessage: error.message,
          durationMs: Date.now() - startTime
        }
      });
    } catch (logError) {
      console.error('Errore salvataggio log:', logError.message);
    }

    throw error;

  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  syncBigBuyToPostgres()
    .then(stats => {
      console.log('🎉 Sync completato con successo!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Sync fallito:', error.message);
      process.exit(1);
    });
}

module.exports = { syncBigBuyToPostgres };
