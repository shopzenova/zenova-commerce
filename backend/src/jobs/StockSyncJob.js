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

      // Estrai IDs BigBuy (parte numerica, filtra valori invalidi)
      const bigbuyIds = bigbuyProducts
        .map(p => {
          const id = p.bigbuyId;
          if (!id) return null;
          const numericPart = id.toString().replace(/\D/g, '');
          return numericPart ? parseInt(numericPart) : null;
        })
        .filter(id => id !== null && id > 0 && !isNaN(id));

      logger.info(`StockSyncJob: ${bigbuyIds.length} IDs BigBuy validi (campione: ${bigbuyIds.slice(0, 5).join(', ')})`);

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
          // Formato: { products: [{ id: 12345 }, { id: 12346 }, ...] }
          const response = await this.bigbuyAPI.post('/rest/catalog/productsstock.json', {
            products: batches[i].map(id => ({ id }))
          });

          if (response.data && Array.isArray(response.data)) {
            stockData.push(...response.data);
          }
        } catch (error) {
          // Log dettagliato solo per il primo errore
          if (stats.bigbuy.errors === 0) {
            logger.error(`StockSyncJob: dettaglio errore BigBuy batch ${i + 1}: ${JSON.stringify(error.response?.data || error.message)}`);
            logger.error(`StockSyncJob: IDs inviati nel batch (primi 5): ${batches[i].slice(0, 5).join(', ')}`);
          }
          logger.error(`StockSyncJob: errore batch BigBuy ${i + 1}/${batches.length}: ${error.response?.status} ${error.message}`);
          stats.bigbuy.errors++;

          // Se primo batch fallisce con 400, prova formato alternativo (array diretto)
          if (i === 0 && error.response?.status === 400) {
            logger.info('StockSyncJob: BigBuy 400 - provo formato alternativo (array diretto)...');
            try {
              const retryResponse = await this.bigbuyAPI.post('/rest/catalog/productsstock.json', {
                products: batches[i]
              });
              if (retryResponse.data && Array.isArray(retryResponse.data)) {
                stockData.push(...retryResponse.data);
                // Formato array diretto funziona, usa quello per i prossimi batch
                logger.info('StockSyncJob: formato array diretto funziona!');
                this._bigbuyStockFormat = 'array';
                stats.bigbuy.errors--; // annulla errore precedente
              }
            } catch (retryError) {
              logger.error(`StockSyncJob: anche formato alternativo fallito: ${JSON.stringify(retryError.response?.data || retryError.message)}`);
            }
          }
        }

        // 500ms pausa tra batch
        if (i < batches.length - 1) {
          await this._delay(500);
        }
      }

      // Se il primo batch ha scoperto il formato giusto, riprocessa i batch falliti
      if (this._bigbuyStockFormat === 'array' && stats.bigbuy.errors > 0) {
        logger.info('StockSyncJob: riprocesso batch BigBuy con formato array diretto...');
        for (let i = 1; i < batches.length; i++) {
          try {
            const response = await this.bigbuyAPI.post('/rest/catalog/productsstock.json', {
              products: batches[i]
            });
            if (response.data && Array.isArray(response.data)) {
              stockData.push(...response.data);
              stats.bigbuy.errors--;
            }
          } catch (error) {
            // gia' contato come errore
          }
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
   * Sync stock AW: scarica tutti i prodotti via getProducts paginato e aggiorna stock
   * (Non usa getProduct singolo perche' gli ID nel DB sono SKU Zenova, non portfolio ID AW)
   */
  async _syncAW(stats) {
    try {
      logger.info('StockSyncJob: inizio sync AW...');

      // Carica tutti i prodotti AW dal database (source puo' essere 'aw' o 'aw-dropship')
      const awProducts = await prisma.product.findMany({
        where: {
          source: { startsWith: 'aw' }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          ean: true
        }
      });

      stats.aw.total = awProducts.length;

      if (awProducts.length === 0) {
        logger.info('StockSyncJob: nessun prodotto AW trovato');
        return;
      }

      logger.info(`StockSyncJob: ${awProducts.length} prodotti AW da sincronizzare`);

      // 1. Scarica tutti i prodotti AW dall'API con paginazione
      const awApiProducts = [];
      let page = 1;
      let lastPage = 1;

      do {
        try {
          const result = await awDropship.getProducts(page, 100);
          if (result.data && result.data.length > 0) {
            awApiProducts.push(...result.data);
            lastPage = result.pagination?.lastPage || 1;
            logger.info(`StockSyncJob: AW pagina ${page}/${lastPage} — ${result.data.length} prodotti`);
          } else {
            break;
          }
        } catch (error) {
          logger.error(`StockSyncJob: errore AW pagina ${page}: ${error.message}`);
          stats.aw.errors++;
          break;
        }
        page++;
        await this._delay(2000); // 2s rate limit
      } while (page <= lastPage);

      logger.info(`StockSyncJob: scaricati ${awApiProducts.length} prodotti AW dall'API`);

      if (awApiProducts.length === 0) {
        logger.warn('StockSyncJob: nessun prodotto AW ricevuto dall\'API, skip aggiornamento');
        return;
      }

      // 2. Crea mappe di lookup per matching (code, id, slug, name)
      const awByCode = {};
      const awById = {};
      const awByName = {};

      awApiProducts.forEach(p => {
        if (p.code) awByCode[p.code.toLowerCase()] = p;
        if (p.id) awById[String(p.id)] = p;
        if (p.slug) awByCode[p.slug.toLowerCase()] = p;
        if (p.name) awByName[p.name.toLowerCase().trim()] = p;
      });

      // 3. Matcha prodotti DB con prodotti API e aggiorna stock
      let matched = 0;
      let unmatched = 0;

      for (const product of awProducts) {
        // Prova diversi modi di matching
        const idLower = product.id.toLowerCase();
        const idClean = idLower.replace(/^aw-/, '');
        const awMatch =
          awByCode[idLower] ||
          awByCode[idClean] ||
          awById[product.id] ||
          awById[idClean] ||
          (product.name ? awByName[product.name.toLowerCase().trim()] : null);

        if (awMatch) {
          try {
            const previousStock = product.stock || 0;
            // Stock puo' essere in diversi campi
            const newStock = awMatch.stock ?? awMatch.quantity ?? awMatch.total_stock ?? 0;

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
        }
      }

      logger.info(`StockSyncJob: AW completato — ${matched} matchati, ${unmatched} non trovati nell'API, ${stats.aw.updated} aggiornati, ${stats.aw.outOfStock} esauriti, ${stats.aw.errors} errori`);

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
