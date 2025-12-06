const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const bigbuyFTP = require('../integrations/BigBuyFTP');

// GET /api/admin/sync/test - Test connessione FTP BigBuy
router.get('/test', async (req, res) => {
  try {
    logger.info('🔍 Test connessione FTP BigBuy');
    const result = await bigbuyFTP.testConnection();

    if (result.success) {
      res.json({
        success: true,
        message: 'Connessione FTP BigBuy OK',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('❌ Errore test FTP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/admin/sync/categories - Scarica lista categorie BigBuy
router.get('/categories', async (req, res) => {
  try {
    logger.info('📥 Download mapper categorie BigBuy');
    const categories = await bigbuyFTP.readCategoryMapper();

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    logger.error('❌ Errore download categorie:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/admin/sync/products - Sincronizza prodotti da BigBuy FTP
router.post('/products', async (req, res) => {
  try {
    const { categoryIds, language } = req.body;

    // Categorie default (benessere)
    const categories = categoryIds || ['2399', '2409', '2410'];
    const lang = language || 'it';

    logger.info(`🔄 Inizio sincronizzazione categorie: ${categories.join(', ')}`);

    // Sincronizza prodotti
    const result = await bigbuyFTP.syncCategories(categories, lang);

    // Carica prodotti attuali
    const jsonPath = path.join(__dirname, '../../top-products-updated.json');
    let currentProducts = [];

    try {
      if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        currentProducts = JSON.parse(rawData);
      }
    } catch (error) {
      logger.warn('⚠️  File prodotti non trovato, creo nuovo file');
    }

    // Merge: aggiungi solo prodotti nuovi, aggiorna esistenti
    const updatedProducts = [...currentProducts];
    let newCount = 0;
    let updatedCount = 0;

    result.products.forEach(newProduct => {
      const existingIndex = updatedProducts.findIndex(p => p.id === newProduct.id);

      if (existingIndex === -1) {
        // Prodotto nuovo
        updatedProducts.push(newProduct);
        newCount++;
      } else {
        // Prodotto esistente - aggiorna
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          ...newProduct,
          lastSync: new Date().toISOString()
        };
        updatedCount++;
      }
    });

    // Salva file
    fs.writeFileSync(jsonPath, JSON.stringify(updatedProducts, null, 2));

    logger.info(`✅ Sincronizzazione completata: ${newCount} nuovi, ${updatedCount} aggiornati`);

    res.json({
      success: true,
      message: 'Sincronizzazione completata',
      data: {
        totalProducts: updatedProducts.length,
        newProducts: newCount,
        updatedProducts: updatedCount,
        categoriesSync: result.stats.categories,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('❌ Errore sincronizzazione prodotti:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/admin/sync/category - Sincronizza singola categoria
router.post('/category', async (req, res) => {
  try {
    const { categoryId, language } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'ID categoria richiesto'
      });
    }

    const lang = language || 'it';

    logger.info(`🔄 Sincronizzazione categoria ${categoryId}`);

    // Scarica prodotti della categoria
    const products = await bigbuyFTP.readProductsCSV(categoryId, lang);

    // Carica prodotti attuali
    const jsonPath = path.join(__dirname, '../../top-products-updated.json');
    let currentProducts = [];

    try {
      if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        currentProducts = JSON.parse(rawData);
      }
    } catch (error) {
      logger.warn('⚠️  File prodotti non trovato, creo nuovo file');
    }

    const updatedProducts = [...currentProducts];
    let newCount = 0;
    let updatedCount = 0;

    products.forEach(newProduct => {
      const existingIndex = updatedProducts.findIndex(p => p.id === newProduct.id);

      if (existingIndex === -1) {
        updatedProducts.push(newProduct);
        newCount++;
      } else {
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          ...newProduct,
          lastSync: new Date().toISOString()
        };
        updatedCount++;
      }
    });

    // Salva file
    fs.writeFileSync(jsonPath, JSON.stringify(updatedProducts, null, 2));

    logger.info(`✅ Categoria ${categoryId}: ${newCount} nuovi, ${updatedCount} aggiornati`);

    res.json({
      success: true,
      message: `Categoria ${categoryId} sincronizzata`,
      data: {
        categoryId,
        totalProducts: products.length,
        newProducts: newCount,
        updatedProducts: updatedCount,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`❌ Errore sincronizzazione categoria:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
