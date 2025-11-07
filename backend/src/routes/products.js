const express = require('express');
const router = express.Router();
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');
const productFilters = require('../../config/product-filters');

// GET /api/products - Lista tutti i prodotti (filtrati per Zenova)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const filtered = req.query.filtered !== 'false'; // Default: true

    let products = await bigbuy.getProducts(page, pageSize);

    // Applica filtri Zenova se richiesto
    if (filtered && products && Array.isArray(products)) {
      products = filterProductsForZenova(products);
      logger.info(`Filtrati ${products.length} prodotti per Zenova`);
    }

    res.json({
      success: true,
      data: products,
      count: products ? products.length : 0,
      filtered: filtered
    });
  } catch (error) {
    logger.error('Errore /api/products:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero prodotti'
    });
  }
});

// Funzione per filtrare prodotti secondo i criteri Zenova
function filterProductsForZenova(products) {
  return products.filter(product => {
    // Filtro 1: Categoria ammessa
    // Nota: product.categories può essere true, false, o un array
    let hasValidCategory = false;

    if (product.categories && Array.isArray(product.categories)) {
      hasValidCategory = product.categories.some(cat =>
        productFilters.categoryIds.includes(cat.id || cat)
      );
    } else if (product.category) {
      // Singola categoria
      hasValidCategory = productFilters.categoryIds.includes(product.category);
    }

    if (!hasValidCategory) return false;

    // Filtro 2: Range prezzo
    const price = product.retailPrice || product.price || 0;
    const inPriceRange = price >= productFilters.priceRange.min &&
                         price <= productFilters.priceRange.max;

    if (!inPriceRange) return false;

    // Filtro 3: Prodotto attivo (se richiesto)
    if (productFilters.import.activeOnly && product.active === 0) {
      return false;
    }

    // Filtro 4: Stock minimo (se richiesto)
    // (questo lo controlleremo meglio con API stock separata)

    return true;
  });
}

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
