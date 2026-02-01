/**
 * STOCK SYNC JOB
 * Sincronizza automaticamente lo stock di tutti i prodotti da BigBuy e AW
 *
 * Flusso:
 * 1. Sync BigBuy: DISABILITATO (API richiede ID interni non disponibili)
 * 2. Sync AW: usa Data Feed API /my-products-data-feed-json (catalogo completo)
 * 3. Rileva prodotti andati a stock 0 (prima avevano stock > 0)
 * 4. Salva log in SyncLog table
 * 5. Invia email admin con riepilogo (prodotti esauriti, aggiornati, errori)
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const bigbuy = require('../integrations/BigBuyClient');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class StockSyncJob {

  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    // Intervallo configurabile via env (default 4 ore)
    this.intervalMs = parseInt(process.env.STOCK_SYNC_INTERVAL_MS) || 4 * 60 * 60 * 1000;
  }

  /**
   * Avvia il job periodico
   */
  start() {
    if (this.intervalId) {
      logger.warn('StockSyncJob: gia\' in esecuzione, skip');
      return;
    }

    logger.info(`StockSyncJob: avviato (intervallo: ${this.intervalMs / 1000}s)`);

    // Esegui dopo 60s per far partire il server
    setTimeout(() => this.run(), 60000);

    // Poi esegui periodicamente
    this.intervalId = setInterval(() => this.run(), this.intervalMs);
  }

  /**
   * Ferma il job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('StockSyncJob: fermato');
    }
  }

  /**
   * Esegue il sync completo
   */
  async run() {
    if (this.isRunning) {
      logger.info('StockSyncJob: ciclo precedente ancora in corso, skip');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    const stats = {
      bigbuy: { total: 0, updated: 0, errors: 0, inStock: 0, outOfStock: 0 },
      aw: { total: 0, updated: 0, errors: 0, inStock: 0, outOfStock: 0 },
      newlyOutOfStock: []
    };

    try {
      logger.info('StockSyncJob: inizio sincronizzazione stock...');

      // 1. Sync BigBuy
      await this._syncBigBuy(stats);

      // 2. Sync AW
      await this._syncAW(stats);

      // 3. Salva log
      const durationMs = Date.now() - startTime;
      const totalErrors = stats.bigbuy.errors + stats.aw.errors;
      const totalUpdated = stats.bigbuy.updated + stats.aw.updated;

      await prisma.syncLog.create({
        data: {
          syncType: 'stock-sync-job',
          status: totalErrors > 0 ? 'completed_with_errors' : 'success',
          itemsProcessed: totalUpdated,
          errorMessage: totalErrors > 0 ? `${totalErrors} errori durante sync` : null,
          syncData: JSON.stringify({
            bigbuy: stats.bigbuy,
            aw: stats.aw,
            newlyOutOfStock: stats.newlyOutOfStock.length
          }),
          durationMs
        }
      });

      // 4. Email admin con riepilogo
      if (stats.newlyOutOfStock.length > 0 || totalErrors > 0) {
        await emailService.sendStockAlertEmail({
          bigbuy: stats.bigbuy,
          aw: stats.aw,
          newlyOutOfStock: stats.newlyOutOfStock,
          durationMs,
          totalUpdated,
          totalErrors
        });
      }

      logger.info(`StockSyncJob: completato in ${durationMs}ms — BB: ${stats.bigbuy.updated} aggiornati, AW: ${stats.aw.updated} aggiornati, ${stats.newlyOutOfStock.length} esauriti, ${totalErrors} errori`);

    } catch (error) {
      logger.error(`StockSyncJob: errore fatale: ${error.message}`);

      try {
        await prisma.syncLog.create({
          data: {
            syncType: 'stock-sync-job',
            status: 'error',
            itemsProcessed: stats.bigbuy.updated + stats.aw.updated,
            errorMessage: error.message,
            durationMs: Date.now() - startTime
          }
        });
      } catch (logError) {
        logger.error('StockSyncJob: errore salvataggio log:', logError.message);
      }

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Sync stock BigBuy: usa BigBuyClient.checkMultipleStock (stesso client usato dal checkout)
   * TEMPORANEAMENTE DISABILITATO - API BigBuy richiede ID interni non disponibili nei CSV
   */
  async _syncBigBuy(stats) {
    // TODO: Riabilitare quando avremo gli ID corretti per l'API BigBuy productsstock
    logger.info('StockSyncJob: sync BigBuy DISABILITATO (API richiede ID interni non disponibili)');
    return;

    try {
      logger.info('StockSyncJob: inizio sync BigBuy...');

      // Carica tutti i prodotti BigBuy dal database
      const bigbuyProducts = await prisma.product.findMany({
        where: {
          source: 'bigbuy',
          bigbuyId: { not: null }
        },
        select: {
          id: true,
          bigbuyId: true,
          name: true,
          stock: true
        }
      });

      stats.bigbuy.total = bigbuyProducts.length;

      if (bigbuyProducts.length === 0) {
        logger.info('StockSyncJob: nessun prodotto BigBuy trovato');
        return;
      }

      logger.info(`StockSyncJob: ${bigbuyProducts.length} prodotti BigBuy da sincronizzare`);

      // Estrai IDs BigBuy come stringhe (es. "M0125658", "S0563513")
      const bigbuyIds = bigbuyProducts
        .map(p => p.bigbuyId?.toString().trim())
        .filter(id => id && id.length > 0);

      logger.info(`StockSyncJob: ${bigbuyIds.length} IDs BigBuy validi (campione: ${bigbuyIds.slice(0, 5).join(', ')})`);

      // Dividi in batch di 100
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < bigbuyIds.length; i += BATCH_SIZE) {
        batches.push(bigbuyIds.slice(i, i + BATCH_SIZE));
      }

      logger.info(`StockSyncJob: ${batches.length} batch da processare`);

      // Processa batch usando BigBuyClient (stesso client del checkout, gia' testato)
      let stockData = [];

      for (let i = 0; i < batches.length; i++) {
        try {
          const result = await bigbuy.checkMultipleStock(batches[i]);

          // Il risultato puo' essere { stocks: [...] } o direttamente [...]
          if (Array.isArray(result)) {
            stockData.push(...result);
          } else if (result && result.stocks && Array.isArray(result.stocks)) {
            stockData.push(...result.stocks);
          } else if (result) {
            // Log formato inatteso per debug
            logger.warn(`StockSyncJob: BigBuy batch ${i + 1} formato inatteso: ${JSON.stringify(result).substring(0, 200)}`);
          }

          if (i === 0) {
            logger.info(`StockSyncJob: BigBuy batch 1 OK — formato risposta: ${Array.isArray(result) ? 'array' : typeof result}`);
          }
        } catch (error) {
          if (stats.bigbuy.errors === 0) {
            logger.error(`StockSyncJob: BigBuy batch ${i + 1} dettaglio errore: ${JSON.stringify(error.response?.data || error.message).substring(0, 500)}`);
          }
          logger.error(`StockSyncJob: errore batch BigBuy ${i + 1}/${batches.length}: ${error.response?.status || ''} ${error.message}`);
          stats.bigbuy.errors++;
        }

        // 500ms pausa tra batch
        if (i < batches.length - 1) {
          await this._delay(500);
        }
      }

      logger.info(`StockSyncJob: ricevuti dati stock per ${stockData.length} prodotti BigBuy`);

      // Crea mappa BigBuyID → Stock
      const stockMap = {};
      stockData.forEach(item => {
        const id = item.productId || item.id;
        stockMap[id] = {
          stock: item.quantity || 0,
          inStock: item.available || ((item.quantity || 0) > 0)
        };
      });

      // Aggiorna database
      for (const product of bigbuyProducts) {
        // Prova match con ID stringa o ID numerico (BigBuy API potrebbe restituire entrambi)
        const stringId = product.bigbuyId?.toString().trim();
        const numericId = stringId ? stringId.replace(/\D/g, '') : null;
        const stockInfo = stockMap[stringId] || stockMap[numericId] || null;

        if (stockInfo) {
          try {
            const previousStock = product.stock || 0;
            const newStock = stockInfo.stock;

            await prisma.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                lastSync: new Date()
              }
            });

            stats.bigbuy.updated++;

            if (stockInfo.inStock) {
              stats.bigbuy.inStock++;
            } else {
              stats.bigbuy.outOfStock++;
            }

            // Rileva prodotti appena andati a stock 0
            if (previousStock > 0 && newStock === 0) {
              stats.newlyOutOfStock.push({
                id: product.id,
                name: product.name || product.id,
                source: 'bigbuy',
                previousStock
              });
            }

          } catch (error) {
            logger.error(`StockSyncJob: errore aggiornamento BigBuy ${product.id}: ${error.message}`);
            stats.bigbuy.errors++;
          }
        }
      }

      logger.info(`StockSyncJob: BigBuy completato — ${stats.bigbuy.updated} aggiornati, ${stats.bigbuy.outOfStock} esauriti, ${stats.bigbuy.errors} errori`);

    } catch (error) {
      logger.error(`StockSyncJob: errore fatale sync BigBuy: ${error.message}`);
      stats.bigbuy.errors++;
    }
  }

  /**
   * Sync stock AW: usa Data Feed API per scaricare catalogo completo
   * Endpoint: /dropshipping/my-products-data-feed-json
   * Campi feed: [0]=active, [1]=code, [4]=ean, [10]=name, [22]=stock
   */
  async _syncAW(stats) {
    try {
      logger.info('StockSyncJob: inizio sync AW via Data Feed API...');

      // Carica tutti i prodotti AW dal database
      const awProducts = await prisma.product.findMany({
        where: {
          source: { startsWith: 'aw' }
        },
        select: {
          id: true,
          name: true,
          stock: true
        }
      });

      stats.aw.total = awProducts.length;

      if (awProducts.length === 0) {
        logger.info('StockSyncJob: nessun prodotto AW trovato nel DB');
        return;
      }

      logger.info(`StockSyncJob: ${awProducts.length} prodotti AW da sincronizzare`);

      // 1. Scarica Data Feed completo dall'API AW
      const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
      const token = process.env.AW_API_TOKEN;

      if (!token) {
        logger.error('StockSyncJob: AW_API_TOKEN non configurato!');
        stats.aw.errors++;
        return;
      }

      const feedUrl = `${baseURL}/dropshipping/my-products-data-feed-json`;
      logger.info(`StockSyncJob: scaricamento feed da ${feedUrl}...`);

      let feedProducts;
      try {
        const response = await axios.get(feedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: 120000 // 2 minuti timeout per catalogo grande
        });

        feedProducts = response.data.data || response.data;

        if (!Array.isArray(feedProducts)) {
          logger.error('StockSyncJob: risposta feed AW non valida');
          stats.aw.errors++;
          return;
        }

        logger.info(`StockSyncJob: ricevuti ${feedProducts.length} prodotti dal feed AW`);

      } catch (error) {
        logger.error(`StockSyncJob: errore download feed AW: ${error.response?.status || ''} ${error.message}`);
        stats.aw.errors++;
        return;
      }

      // 2. Crea mappa code → stock dal feed
      // Struttura feed: [0]=active, [1]=code, [4]=ean, [10]=name, [22]=stock
      const feedByCode = {};

      feedProducts.forEach(p => {
        // Il feed puo' avere indici numerici o chiavi stringa
        const code = (p[1] || p['1'] || '').toString().toLowerCase();
        const stock = parseInt(p[22] ?? p['22'] ?? 0) || 0;
        const name = p[10] || p['10'] || '';

        if (code) {
          feedByCode[code] = { stock, name };
        }
      });

      logger.info(`StockSyncJob: mappa feed AW creata con ${Object.keys(feedByCode).length} prodotti`);

      // Log campione per debug
      const sampleCodes = Object.keys(feedByCode).slice(0, 5);
      logger.info(`StockSyncJob: campione codici feed: ${sampleCodes.join(', ')}`);

      // 3. Matcha e aggiorna prodotti DB
      let matched = 0;
      let unmatched = 0;
      const unmatchedSamples = [];

      for (const product of awProducts) {
        const idLower = product.id.toLowerCase();
        // Prova match diretto, poi senza prefisso "aw-"
        const idWithoutPrefix = idLower.replace(/^aw-/, '');

        const feedMatch = feedByCode[idLower] || feedByCode[idWithoutPrefix];

        if (feedMatch) {
          try {
            const previousStock = product.stock || 0;
            const newStock = feedMatch.stock;

            await prisma.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                lastSync: new Date()
              }
            });

            stats.aw.updated++;
            matched++;

            if (newStock > 0) {
              stats.aw.inStock++;
            } else {
              stats.aw.outOfStock++;
            }

            // Rileva prodotti appena andati a stock 0
            if (previousStock > 0 && newStock === 0) {
              stats.newlyOutOfStock.push({
                id: product.id,
                name: product.name || product.id,
                source: 'aw',
                previousStock
              });
            }

          } catch (error) {
            logger.error(`StockSyncJob: errore aggiornamento AW ${product.id}: ${error.message}`);
            stats.aw.errors++;
          }
        } else {
          unmatched++;
          if (unmatchedSamples.length < 5) {
            unmatchedSamples.push(product.id);
          }
        }
      }

      if (unmatchedSamples.length > 0) {
        logger.warn(`StockSyncJob: AW prodotti non matchati (campione): ${unmatchedSamples.join(', ')}`);
      }

      logger.info(`StockSyncJob: AW completato — ${matched}/${awProducts.length} matchati, ${stats.aw.updated} aggiornati, ${stats.aw.outOfStock} esauriti, ${stats.aw.errors} errori`);

    } catch (error) {
      logger.error(`StockSyncJob: errore fatale sync AW: ${error.message}`);
      stats.aw.errors++;
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new StockSyncJob();
