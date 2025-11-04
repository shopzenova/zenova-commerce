const express = require('express');
const router = express.Router();
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');

// GET /api/products - Lista tutti i prodotti
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;

    const products = await bigbuy.getProducts(page, pageSize);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    logger.error('Errore /api/products:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero prodotti'
    });
  }
});

// GET /api/products/:id - Dettaglio prodotto
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await bigbuy.getProduct(productId);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error(`Errore /api/products/${req.params.id}:`, error);
    res.status(404).json({
      success: false,
      error: 'Prodotto non trovato'
    });
  }
});

// GET /api/products/:id/stock - Verifica stock prodotto
router.get('/:id/stock', async (req, res) => {
  try {
    const productId = req.params.id;
    const stock = await bigbuy.getProductStock(productId);

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    logger.error(`Errore /api/products/${req.params.id}/stock:`, error);
    res.status(500).json({
      success: false,
      error: 'Errore verifica stock'
    });
  }
});

// POST /api/products/stock - Verifica stock multipli prodotti
router.post('/stock', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: 'productIds array richiesto'
      });
    }

    const stocks = await bigbuy.checkMultipleStock(productIds);

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Errore /api/products/stock:', error);
    res.status(500).json({
      success: false,
      error: 'Errore verifica stock'
    });
  }
});

module.exports = router;
