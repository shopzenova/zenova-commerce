/**
 * AGGIORNAMENTO STOCK E PREZZI IN TEMPO REALE DA BIGBUY API
 * Mantiene catalogo base, aggiorna solo stock/prezzi
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
 * Aggiorna stock e prezzi per lista prodotti
 */
async function updateStockAndPrices() {
  console.log('\n🔄 AGGIORNAMENTO STOCK E PREZZI');
  console.log('='.repeat(60));
  console.log('⏰', new Date().toLocaleString('it-IT'));
  console.log('');

  try {
    // Carica catalogo attuale
    const catalogPath = path.join(__dirname, 'top-100-products.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    console.log(`📦 Catalogo caricato: ${catalog.length} prodotti`);

    // Estrai IDs prodotti
    const productIds = catalog.map(p => parseInt(p.id));
    console.log(`🔑 Aggiornamento per ${productIds.length} prodotti...`);

    // Dividi in batch di 100 (limite API BigBuy)
    const BATCH_SIZE = 100;
    const batches = [];
    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      batches.push(productIds.slice(i, i + BATCH_SIZE));
    }

    console.log(`📊 Batch da processare: ${batches.length}\n`);

    let totalUpdated = 0;
    let stockData = [];

    // Processa batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        console.log(`   Batch ${i + 1}/${batches.length} (${batch.length} prodotti)...`);

        const response = await bigbuyAPI.post('/rest/catalog/productstockavailable.json', batch);

        if (response.data && Array.isArray(response.data)) {
          stockData.push(...response.data);
          totalUpdated += response.data.length;
        }

        // Piccola pausa tra batch per non sovraccaricare API
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`   ❌ Errore batch ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Ricevuti dati per ${stockData.length} prodotti`);

    // Crea mappa ID → stock/prezzo
    const stockMap = {};
    stockData.forEach(item => {
      stockMap[item.id] = {
        stock: item.quantity || 0,
        inStock: (item.quantity || 0) > 0,
        price: item.price || 0,
        wholesalePrice: item.wholesalePrice || 0
      };
    });

    // Aggiorna catalogo
    let updated = 0;
    let outOfStock = 0;

    catalog.forEach(product => {
      const stockInfo = stockMap[product.id];
      if (stockInfo) {
        product.stock = stockInfo.stock;
        product.inStock = stockInfo.inStock;
        product.price = stockInfo.price;
        product.retailPrice = stockInfo.price;
        product.wholesalePrice = stockInfo.wholesalePrice;
        product.lastStockUpdate = new Date().toISOString();

        updated++;

        if (!stockInfo.inStock) {
          outOfStock++;
        }
      }
    });

    // Salva catalogo aggiornato
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

    console.log('\n📊 RISULTATI:');
    console.log(`   Prodotti aggiornati: ${updated}`);
    console.log(`   Disponibili: ${updated - outOfStock}`);
    console.log(`   Esauriti: ${outOfStock}`);

    // Salva statistiche
    const stats = {
      lastUpdate: new Date().toISOString(),
      totalProducts: catalog.length,
      productsUpdated: updated,
      inStock: updated - outOfStock,
      outOfStock: outOfStock,
      updateDuration: 'N/A'
    };

    fs.writeFileSync('last-stock-update.json', JSON.stringify(stats, null, 2));

    console.log('\n✅ AGGIORNAMENTO COMPLETATO!');
    console.log('='.repeat(60));

    return stats;

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    throw error;
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  updateStockAndPrices()
    .then(() => {
      console.log('\n🎉 Update completato!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Update fallito:', error);
      process.exit(1);
    });
}

module.exports = { updateStockAndPrices };
