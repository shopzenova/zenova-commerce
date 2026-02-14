/**
 * STOCK SYNC JOB
 * Sincronizza automaticamente lo stock di tutti i prodotti da BigBuy e AW
 *
 * Flusso:
 * 1. Sync BigBuy: scarica CSV stock via FTP (product_2399_it.csv)
 * 2. Sync AW: usa Data Feed API /my-products-data-feed-json (catalogo completo)
 * 3. Rileva prodotti andati a stock 0 (prima avevano stock > 0)
 * 4. Salva log in SyncLog table
 * 5. Invia email admin con riepilogo (prodotti esauriti, aggiornati, errori)
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const ftp = require('basic-ftp');
const { Readable } = require('stream');
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
   * Sync stock BigBuy: scarica CSV via FTP e aggiorna stock
   * File: /files/products/csv/standard/product_2399_it.csv
   * Formato CSV (separatore ;):
   *   Col 0: ID (SKU), Col 20: STOCK, Col 15: EAN13
   */
  async _syncBigBuy(stats) {
    try {
      logger.info('StockSyncJob: inizio sync BigBuy via FTP/CSV...');

      // Carica tutti i prodotti BigBuy dal database
      const bigbuyProducts = await prisma.product.findMany({
        where: { source: 'bigbuy' },
        select: { id: true, bigbuyId: true, ean: true, name: true, stock: true }
      });

      stats.bigbuy.total = bigbuyProducts.length;

      if (bigbuyProducts.length === 0) {
        logger.info('StockSyncJob: nessun prodotto BigBuy trovato nel DB');
        return;
      }

      logger.info(`StockSyncJob: ${bigbuyProducts.length} prodotti BigBuy da sincronizzare`);

      // Crea mappe per match: bigbuyId -> product, id -> product, ean -> product
      const byBigbuyId = {};
      const byId = {};
      const byEan = {};
      for (const p of bigbuyProducts) {
        if (p.bigbuyId) byBigbuyId[p.bigbuyId.toUpperCase()] = p;
        byId[p.id.toUpperCase()] = p;
        if (p.ean) byEan[p.ean.toUpperCase()] = p;
      }
      const totalKeys = Object.keys(byBigbuyId).length + Object.keys(byId).length;
      logger.info(`StockSyncJob: mappe match create — ${Object.keys(byBigbuyId).length} bigbuyId, ${Object.keys(byId).length} id, ${Object.keys(byEan).length} ean`);

      // Scarica CSV via FTP
      const ftpHost = process.env.BIGBUY_FTP_HOST || 'www.dropshippers.com.es';
      const ftpUser = process.env.BIGBUY_FTP_USER;
      const ftpPass = process.env.BIGBUY_FTP_PASSWORD;

      if (!ftpUser || !ftpPass) {
        logger.error('StockSyncJob: credenziali FTP BigBuy non configurate!');
        stats.bigbuy.errors++;
        return;
      }

      const stockBySku = {};
      const client = new ftp.Client();
      client.ftp.verbose = false;

      try {
        await client.access({
          host: ftpHost,
          user: ftpUser,
          password: ftpPass,
          secure: false
        });

        logger.info('StockSyncJob: connesso al FTP BigBuy');

        // Scarica CSV da tutte le categorie rilevanti
        // 2507=Profumeria/Cosmesi, 2501=Salute/Bellezza, 2399=Casa/Giardino, 2609=Elettronica
        const csvFiles = [
          'product_2507_it.csv',
          'product_2501_it.csv',
          'product_2399_it.csv',
          'product_2609_it.csv'
        ];

        const matchedProductIds = new Set();

        for (const csvFile of csvFiles) {
          const csvPath = `/files/products/csv/standard/${csvFile}`;
          const chunks = [];

          const writable = new (require('stream').Writable)({
            write(chunk, encoding, callback) {
              chunks.push(chunk);
              callback();
            }
          });

          try {
            await client.downloadTo(writable, csvPath);
            const csvContent = Buffer.concat(chunks).toString('utf-8');

            logger.info(`StockSyncJob: ${csvFile} scaricato (${Math.round(csvContent.length / 1024)} KB)`);

            const lines = csvContent.split('\n');
            const header = lines[0].replace(/^\uFEFF/, '');
            const columns = header.split(';');

            const idIdx = columns.findIndex(c => c.trim().toUpperCase() === 'ID');
            const stockIdx = columns.findIndex(c => c.trim().toUpperCase() === 'STOCK');
            const eanIdx = columns.findIndex(c => c.trim().toUpperCase() === 'EAN13');

            if (idIdx === -1 || stockIdx === -1) {
              logger.warn(`StockSyncJob: colonne non trovate in ${csvFile}, skip`);
              continue;
            }

            let fileMatched = 0;
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;

              const fields = this._parseCSVLine(line, ';');
              if (fields.length <= Math.max(idIdx, stockIdx)) continue;

              const csvId = (fields[idIdx] || '').replace(/"/g, '').trim().toUpperCase();
              const stockVal = parseInt((fields[stockIdx] || '').replace(/"/g, '').trim()) || 0;
              const csvEan = eanIdx >= 0 && fields[eanIdx] ? fields[eanIdx].replace(/"/g, '').trim().toUpperCase() : '';

              const product = byBigbuyId[csvId] || byId[csvId] || (csvEan && byEan[csvEan]) || null;

              if (product && !matchedProductIds.has(product.id)) {
                matchedProductIds.add(product.id);
                stockBySku[product.id] = stockVal;
                fileMatched++;
              }
            }

            logger.info(`StockSyncJob: ${csvFile} — ${fileMatched} nuovi match (totale: ${matchedProductIds.size})`);
          } catch (dlError) {
            logger.warn(`StockSyncJob: errore download ${csvFile}: ${dlError.message}`);
          }
        }

        logger.info(`StockSyncJob: BigBuy CSV — ${matchedProductIds.size} prodotti matchati totali`);

      } catch (error) {
        logger.error(`StockSyncJob: errore FTP BigBuy: ${error.message}`);
        stats.bigbuy.errors++;
        return;
      } finally {
        client.close();
      }

      // Aggiorna database
      let matched = 0;
      let unmatched = 0;

      for (const product of bigbuyProducts) {
        const newStock = stockBySku[product.id];

        if (newStock !== undefined) {
          try {
            const previousStock = product.stock || 0;

            await prisma.product.update({
              where: { id: product.id },
              data: {
                stock: newStock,
                lastSync: new Date()
              }
            });

            stats.bigbuy.updated++;
            matched++;

            if (newStock > 0) {
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
        } else {
          unmatched++;
        }
      }

      logger.info(`StockSyncJob: BigBuy completato — ${matched}/${bigbuyProducts.length} matchati, ${stats.bigbuy.updated} aggiornati, ${stats.bigbuy.outOfStock} esauriti, ${stats.bigbuy.errors} errori`);

    } catch (error) {
      logger.error(`StockSyncJob: errore fatale sync BigBuy: ${error.message}`);
      stats.bigbuy.errors++;
    }
  }

  /**
   * Parsa una riga CSV rispettando i campi tra virgolette
   */
  _parseCSVLine(line, separator) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current);
    return fields;
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
