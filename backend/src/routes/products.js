const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');
const productFilters = require('../../config/product-filters');

// Carica i TOP 100 prodotti dal file JSON
let TOP_PRODUCTS = [];
try {
  const jsonPath = path.join(__dirname, '../../top-100-products.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  TOP_PRODUCTS = JSON.parse(rawData);
  logger.info(`✅ Caricati ${TOP_PRODUCTS.length} prodotti TOP dal file JSON`);
} catch (error) {
  logger.error('❌ Errore caricamento top-100-products.json:', error);
}

// GET /api/products - Lista tutti i prodotti (da JSON locale)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const category = req.query.category; // Filtro per categoria Zenova

    let products = [...TOP_PRODUCTS];

    // Filtra per categoria Zenova se richiesto
    if (category) {
      products = products.filter(p =>
        p.zenovaCategories && p.zenovaCategories.includes(category)
      );
      logger.info(`Filtrati per categoria '${category}': ${products.length} prodotti`);
    }

    // Paginazione
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Trasforma nel formato che si aspetta il frontend
    const formattedProducts = paginatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand || 'Zenova',
      category: p.zenovaCategories ? p.zenovaCategories.join(', ') : p.category,
      price: parseFloat(p.price),
      retailPrice: parseFloat(p.pvd) || parseFloat(p.price) * 2.5, // Se non c'è PVD, markup 2.5x
      stock: p.stock,
      images: p.images,
      image: p.images && p.images[0] ? p.images[0] : null,
      ean: p.ean,
      weight: parseFloat(p.weight) || 0,
      dimensions: {
        width: parseFloat(p.width) || 0,
        height: parseFloat(p.height) || 0,
        depth: parseFloat(p.depth) || 0
      },
      active: true
    }));

    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length,
      total: products.length,
      page: page,
      pageSize: pageSize,
      source: 'json-file'
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

    // Cerca prima nel JSON locale
    const product = TOP_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Formatta nel formato atteso
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand || 'Zenova',
      category: product.zenovaCategories ? product.zenovaCategories.join(', ') : product.category,
      price: parseFloat(product.price),
      retailPrice: parseFloat(product.pvd) || parseFloat(product.price) * 2.5,
      stock: product.stock,
      images: product.images,
      video: product.video,
      ean: product.ean,
      weight: parseFloat(product.weight) || 0,
      dimensions: {
        width: parseFloat(product.width) || 0,
        height: parseFloat(product.height) || 0,
        depth: parseFloat(product.depth) || 0
      },
      active: true
    };

    res.json({
      success: true,
      data: formattedProduct
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
