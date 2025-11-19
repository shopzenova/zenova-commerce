const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const logger = require('../utils/logger');

class BigBuyFTP {
  constructor() {
    this.config = {
      host: 'www.dropshippers.com.es',
      user: 'bbCDCSK9mS6i',
      password: 'XgVEDUdao7',
      secure: false
    };

    this.downloadDir = path.join(__dirname, '../../bigbuy-data');

    // Crea directory se non esiste
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  async connect() {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to true for debugging

    try {
      await client.access(this.config);
      logger.info('✅ Connesso al server FTP BigBuy');
      return client;
    } catch (error) {
      logger.error('❌ Errore connessione FTP BigBuy:', error);
      throw error;
    }
  }

  // Scarica il mapper delle categorie
  async downloadCategoryMapper() {
    const client = await this.connect();
    const remotePath = '/files/categories/csv/mapper_category.csv';
    const localPath = path.join(this.downloadDir, 'mapper_category.csv');

    try {
      logger.info(`📥 Download: ${remotePath}`);
      await client.downloadTo(localPath, remotePath);
      logger.info(`✅ Salvato: ${localPath}`);
      return localPath;
    } catch (error) {
      logger.error(`❌ Errore download mapper categorie:`, error);
      throw error;
    } finally {
      client.close();
    }
  }

  // Scarica prodotti per categoria (formato standard CSV)
  async downloadProductsCSV(categoryId, language = 'it') {
    const client = await this.connect();
    const remotePath = `/files/products/csv/standard/product_${categoryId}_${language}.csv`;
    const localPath = path.join(this.downloadDir, `product_${categoryId}_${language}.csv`);

    try {
      logger.info(`📥 Download prodotti categoria ${categoryId} (${language})`);
      await client.downloadTo(localPath, remotePath);
      logger.info(`✅ Salvato: ${localPath}`);
      return localPath;
    } catch (error) {
      logger.error(`❌ Errore download prodotti categoria ${categoryId}:`, error);
      throw error;
    } finally {
      client.close();
    }
  }

  // Scarica prodotti per categoria (formato PrestaShop CSV)
  async downloadProductsPrestaShop(categoryId, language = 'it') {
    const client = await this.connect();
    const remotePath = `/files/products/csv/prestashop/presta_product_${categoryId}_${language}.csv`;
    const localPath = path.join(this.downloadDir, `presta_product_${categoryId}_${language}.csv`);

    try {
      logger.info(`📥 Download prodotti PrestaShop categoria ${categoryId} (${language})`);
      await client.downloadTo(localPath, remotePath);
      logger.info(`✅ Salvato: ${localPath}`);
      return localPath;
    } catch (error) {
      logger.error(`❌ Errore download prodotti PrestaShop categoria ${categoryId}:`, error);
      throw error;
    } finally {
      client.close();
    }
  }

  // Leggi mapper categorie
  async readCategoryMapper() {
    const mapperPath = path.join(this.downloadDir, 'mapper_category.csv');

    // Scarica se non esiste
    if (!fs.existsSync(mapperPath)) {
      await this.downloadCategoryMapper();
    }

    return new Promise((resolve, reject) => {
      const categories = [];

      fs.createReadStream(mapperPath)
        .pipe(csv({ separator: ';' })) // BigBuy usa ; come separatore
        .on('data', (row) => {
          categories.push({
            id: row.id_category || row.ID,
            name: row.IT || row.EN,  // Usa colonna IT (italiano) o EN come fallback
            nameEN: row.EN,
            nameES: row.ES,
            nameIT: row.IT
          });
        })
        .on('end', () => {
          logger.info(`✅ Lette ${categories.length} categorie dal mapper`);
          resolve(categories);
        })
        .on('error', reject);
    });
  }

  // Leggi prodotti da CSV
  async readProductsCSV(categoryId, language = 'it') {
    const csvPath = path.join(this.downloadDir, `product_${categoryId}_${language}.csv`);

    // Scarica se non esiste o è vecchio (più di 12 ore)
    const needsDownload = !fs.existsSync(csvPath) ||
                          (Date.now() - fs.statSync(csvPath).mtimeMs > 12 * 60 * 60 * 1000);

    if (needsDownload) {
      await this.downloadProductsCSV(categoryId, language);
    }

    return new Promise((resolve, reject) => {
      const products = [];

      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' })) // BigBuy usa ; come separatore
        .on('data', (row) => {
          // Formatta prodotto nel formato Zenova
          const product = this._formatProduct(row, categoryId);
          if (product) {
            products.push(product);
          }
        })
        .on('end', () => {
          logger.info(`✅ Letti ${products.length} prodotti dalla categoria ${categoryId}`);
          resolve(products);
        })
        .on('error', reject);
    });
  }

  // Formatta prodotto BigBuy nel formato Zenova
  _formatProduct(row, categoryId) {
    try {
      // Nomi colonne BigBuy CSV (MAIUSCOLE!)
      // NOTA: BigBuy aggiunge BOM UTF-8, quindi la prima colonna è '﻿ID' non 'ID'
      const sku = row['﻿ID'] || row.ID || row.SKU || row.id;
      const name = row.NAME || row.name;
      const price = parseFloat(row.PVP_BIGBUY || row.PRICE || row.price || 0);
      const wholesalePrice = parseFloat(row.PVD || row.wholesale_price || 0);
      const stock = parseInt(row.STOCK || row.stock || 0);
      const description = row.DESCRIPTION || row.description || '';
      const brand = row.BRAND || row.brand || 'BigBuy';
      const ean = row.EAN13 || row.EAN || row.ean || '';
      const weight = row.WEIGHT || row.weight || '0';
      const width = row.WIDTH || row.width || '0';
      const height = row.HEIGHT || row.height || '0';
      const depth = row.DEPTH || row.depth || '0';

      // URL immagini (BigBuy fornisce IMAGE1, IMAGE2, ..., IMAGE8)
      let images = [];
      for (let i = 1; i <= 8; i++) {
        const imgKey = `IMAGE${i}`;
        if (row[imgKey] && row[imgKey].trim()) {
          images.push(row[imgKey].trim());
        }
      }

      // Se non ha SKU o nome, salta
      if (!sku || !name) {
        return null;
      }

      return {
        id: sku,
        name: name,
        description: description,
        brand: brand,
        category: `Category_${categoryId}`,
        zenovaCategories: this._mapToZenovaCategory(categoryId),
        price: price,
        pvd: wholesalePrice,
        margin: wholesalePrice > 0 ? ((price - wholesalePrice) / wholesalePrice * 100).toFixed(2) : '0',
        stock: stock,
        images: images,
        imageCount: images.length,
        video: '0',
        ean: ean,
        width: width,
        height: height,
        depth: depth,
        weight: weight,
        score: 50, // Score default per prodotti FTP
        source: 'bigbuy_ftp',
        categoryId: categoryId,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      logger.error('❌ Errore formattazione prodotto:', error);
      return null;
    }
  }

  // Mappa categoria BigBuy a categoria Zenova
  _mapToZenovaCategory(categoryId) {
    // Mapping categorie BigBuy -> Zenova
    const categoryMap = {
      // Benessere e Salute
      '2399': ['benessere', 'casa-giardino'],
      '2409': ['benessere', 'salute'],
      '2410': ['benessere', 'massaggio'],
      // Elettronica
      '2609': ['tecnologia', 'elettronica'],
      // Aggiungi altre mappature secondo necessità
    };

    return categoryMap[categoryId.toString()] || ['generale'];
  }

  // Sincronizza tutti i prodotti di categorie specifiche
  async syncCategories(categoryIds = ['2399', '2409', '2410'], language = 'it') {
    logger.info(`🔄 Inizio sincronizzazione ${categoryIds.length} categorie`);

    const allProducts = [];
    const stats = {
      totalProducts: 0,
      newProducts: 0,
      updatedProducts: 0,
      errors: 0,
      categories: []
    };

    for (const categoryId of categoryIds) {
      try {
        const products = await this.readProductsCSV(categoryId, language);
        allProducts.push(...products);

        stats.categories.push({
          id: categoryId,
          productsCount: products.length
        });

        stats.totalProducts += products.length;

        logger.info(`✅ Categoria ${categoryId}: ${products.length} prodotti`);
      } catch (error) {
        logger.error(`❌ Errore sincronizzazione categoria ${categoryId}:`, error.message);
        stats.errors++;
      }
    }

    logger.info(`✅ Sincronizzazione completata: ${stats.totalProducts} prodotti da ${categoryIds.length} categorie`);

    return {
      products: allProducts,
      stats: stats
    };
  }

  // Test connessione FTP
  async testConnection() {
    try {
      const client = await this.connect();

      // Prova a listare la directory root
      const list = await client.list('/files');
      logger.info(`✅ Test FTP OK - trovate ${list.length} cartelle`);

      client.close();
      return { success: true, folders: list.length };
    } catch (error) {
      logger.error('❌ Test FTP fallito:', error);
      return { success: false, error: error.message };
    }
  }
}

// Esporta istanza singleton
module.exports = new BigBuyFTP();
