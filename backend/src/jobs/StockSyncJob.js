/**
 * STOCK SYNC JOB
 * Sincronizza automaticamente lo stock di tutti i prodotti da BigBuy e AW
 *
 * Flusso:
 * 1. Sync BigBuy: batch di 100 prodotti via POST /rest/catalog/productsstock.json
 * 2. Sync AW: per ogni prodotto AW, chiama getProduct(id) e legge il campo stock
 * 3. Rileva prodotti andati a stock 0 (prima avevano stock > 0)
 * 4. Salva log in SyncLog table
 * 5. Invia email admin con riepilogo (prodotti esauriti, aggiornati, errori)
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const AWDropshipClient = require('../integrations/AWDropshipClient');
const emailService = require('../integrations/EmailService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const awDropship = new AWDropshipClient();

class StockSyncJob {

  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    // Intervallo configurabile via env (default 4 ore)
    this.intervalMs = parseInt(process.env.STOCK_SYNC_INTERVAL_MS) || 4 * 60 * 60 * 1000;

    // BigBuy API setup
    this.bigbuyAPI = axios.create({
      baseURL: process.env.BIGBUY_API_URL || 'https://api.bigbuy.eu',
      headers: {
        'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
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
          syncData: {
            bigbuy: stats.bigbuy,
            aw: stats.aw,
            newlyOutOfStock: stats.newlyOutOfStock.length
          },
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
   * Sync stock BigBuy: batch di 100 prodotti via API
   */
  async _syncBigBuy(stats) {
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

      // Estrai IDs BigBuy (parte numerica)
      const bigbuyIds = bigbuyProducts
        .map(p => {
          const id = p.bigbuyId;
          if (!id) return null;
          const numericPart = id.toString().replace(/\D/g, '');
          return numericPart ? parseInt(numericPart) : null;
        })
        .filter(id => id !== null);

      // Dividi in batch di 100
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < bigbuyIds.length; i += BATCH_SIZE) {
        batches.push(bigbuyIds.slice(i, i + BATCH_SIZE));
      }

      // Processa batch e ottieni stock
      let stockData = [];

      for (let i = 0; i < batches.length; i++) {
        try {
          const response = await this.bigbuyAPI.post('/rest/catalog/productsstock.json', {
            products: batches[i]
          });

          if (response.data && Array.isArray(response.data)) {
            stockData.push(...response.data);
          }
        } catch (error) {
          logger.error(`StockSyncJob: errore batch BigBuy ${i + 1}/${batches.length}: ${error.message}`);
          stats.bigbuy.errors++;
        }

        // 500ms pausa tra batch
        if (i < batches.length - 1) {
          await this._delay(500);
        }
      }

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
        const numericId = product.bigbuyId ? parseInt(product.bigbuyId.toString().replace(/\D/g, '')) : null;
        const stockInfo = numericId ? stockMap[numericId] : null;

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
   * Sync stock AW: per ogni prodotto AW chiama getProduct e legge stock
   */
  async _syncAW(stats) {
    try {
      logger.info('StockSyncJob: inizio sync AW...');

      // Carica tutti i prodotti AW dal database
      const awProducts = await prisma.product.findMany({
        where: {
          source: 'aw'
        },
        select: {
          id: true,
          name: true,
          stock: true
        }
      });

      stats.aw.total = awProducts.length;

      if (awProducts.length === 0) {
        logger.info('StockSyncJob: nessun prodotto AW trovato');
        return;
      }

      logger.info(`StockSyncJob: ${awProducts.length} prodotti AW da sincronizzare`);

      for (const product of awProducts) {
        try {
          // Chiama getProduct per ottenere stock aggiornato
          const awProduct = await awDropship.getProduct(product.id);

          if (awProduct) {
            const previousStock = product.stock || 0;
            // Il campo stock puo' essere in diversi posti a seconda della risposta AW
            const newStock = awProduct.stock ?? awProduct.quantity ?? awProduct.data?.stock ?? 0;

            await prisma.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                lastSync: new Date()
              }
            });

            stats.aw.updated++;

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
          }

        } catch (error) {
          logger.error(`StockSyncJob: errore sync AW prodotto ${product.id}: ${error.message}`);
          stats.aw.errors++;
        }

        // 2s pausa tra richieste (rate limit AW)
        await this._delay(2000);
      }

      logger.info(`StockSyncJob: AW completato — ${stats.aw.updated} aggiornati, ${stats.aw.outOfStock} esauriti, ${stats.aw.errors} errori`);

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
