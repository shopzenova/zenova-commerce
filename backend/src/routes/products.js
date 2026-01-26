const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
// Force Railway redeploy - products DB updated
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');
const productFilters = require('../../config/product-filters');

// Prisma Client per PostgreSQL
const prisma = new PrismaClient();

logger.info(`✅ PostgreSQL Database connesso - products API ready`);

// ===== HELPER FUNCTIONS - Normalizzazione prezzi multi-fornitore =====
// Gestisce automaticamente formati diversi da BigBuy e AW Dropship

function getWholesalePrice(product) {
  // Riconosce automaticamente il formato in base al fornitore
  const source = product.source || product.supplier;

  if (source === 'bigbuy') {
    // BigBuy: pvd = prezzo di acquisto/ingrosso
    return parseFloat(product.pvd) || 0;
  } else if (source === 'aw-dropship' || source === 'aw') {
    // AW Dropship: price = prezzo di acquisto/ingrosso
    return parseFloat(product.price) || 0;
  }

  // Fallback: prova pvd prima, poi price
  return parseFloat(product.pvd || product.price) || 0;
}

function getRetailPrice(product) {
  // SEMPRE usa retailPrice dal database (già calcolato con margine)
  // Questo permette di modificare i prezzi direttamente nel DB
  if (product.retailPrice) {
    return parseFloat(product.retailPrice) || 0;
  }

  // Fallback per prodotti senza retailPrice (legacy)
  const source = product.source || product.supplier;

  if (source === 'bigbuy') {
    return parseFloat(product.price) || 0;
  } else if (source === 'aw-dropship' || source === 'aw') {
    if (product.originalPrice) {
      return parseFloat(product.originalPrice);
    }
    const wholesale = parseFloat(product.price) || 0;
    return Math.round(wholesale * 1.3 * 100) / 100;
  }

  return parseFloat(product.price) || 0;
}

// GET /api/products/categories - Ottieni categorie (da PostgreSQL)
router.get('/categories', async (req, res) => {
  try {
    // Query prodotti visibili da PostgreSQL
    const visibleProducts = await prisma.product.findMany({
      where: { visible: true },
      select: {
        zenovaCategory: true,
        zenovaSubcategory: true,
        zenovaCategories: true
      }
    });

    const categories = {};

    visibleProducts.forEach(product => {
      const cats = product.zenovaCategories || (product.zenovaCategory ? [product.zenovaCategory] : ['Generale']);
      const subcat = product.zenovaSubcategory || null;

      cats.forEach(cat => {
        if (!categories[cat]) {
          categories[cat] = {
            name: cat,
            displayName: getCategoryDisplayName(cat),
            icon: getCategoryIcon(cat),
            count: 0,
            subcategories: {}
          };
        }

        categories[cat].count++;

        if (subcat) {
          if (!categories[cat].subcategories[subcat]) {
            categories[cat].subcategories[subcat] = {
              name: subcat,
              displayName: getSubcategoryDisplayName(subcat),
              count: 0
            };
          }
          categories[cat].subcategories[subcat].count++;
        }
      });
    });

    const categoriesArray = Object.values(categories).map(cat => ({
      ...cat,
      subcategories: Object.values(cat.subcategories)
    }));

    res.json({
      success: true,
      data: categoriesArray
    });
  } catch (error) {
    logger.error('Errore /api/products/categories:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero categorie'
    });
  }
});

// Helper functions
function getCategoryDisplayName(cat) {
  const names = {
    'benessere': 'Benessere',
    'bellezza': 'Bellezza',
    'smartHome': 'Smart Home',
    'design': 'Design'
  };
  return names[cat] || cat;
}

function getCategoryIcon(cat) {
  const icons = {
    'benessere': '💆',
    'bellezza': '💄',
    'smartHome': '🏠',
    'design': '🎨'
  };
  return icons[cat] || '📦';
}

function getSubcategoryDisplayName(subcat) {
  const names = {
    'cura-pelle-mani-piedi': 'Mani e Piedi',
    'cura-pelle-set-regalo': 'Set Regalo',
    'cura-pelle-solare': 'Protezione Solare',
    'cura-pelle-corpo': 'Cura Corpo',
    'cura-pelle-viso': 'Cura Viso',
    'cura-pelle-labbra': 'Labbra',
    'diffusori-elettronici': 'Diffusori Elettronici',
    'diffusori-bastoncini': 'Diffusori a Bastoncini'
  };
  return names[subcat] || subcat;
}

// Carica layout prodotti
let productLayout = { home: [], sidebar: [], hidden: [], featured: [] };
try {
  const layoutPath = path.join(__dirname, '../../config/product-layout.json');
  if (fs.existsSync(layoutPath)) {
    const layoutData = fs.readFileSync(layoutPath, 'utf-8');
    productLayout = JSON.parse(layoutData);
    logger.info(`✅ Layout caricato: ${productLayout.home.length} home, ${productLayout.sidebar.length} sidebar, ${productLayout.hidden.length} hidden`);
  }
} catch (error) {
  logger.error('❌ Errore caricamento layout:', error);
}

// Carica top-100-products.json per avere originalPrice dei prodotti AW
let TOP_PRODUCTS = [];
try {
  const productsPath = path.join(__dirname, '../../top-100-products.json');
  if (fs.existsSync(productsPath)) {
    const productsData = fs.readFileSync(productsPath, 'utf-8');
    TOP_PRODUCTS = JSON.parse(productsData);
    logger.info(`✅ Caricati ${TOP_PRODUCTS.length} prodotti da top-100-products.json`);
  }
} catch (error) {
  logger.error('❌ Errore caricamento top-100-products.json:', error);
}

// GET /api/products/layout - Restituisce il layout dal DATABASE (persistente tra deploy)
router.get('/layout', async (req, res) => {
  try {
    // Leggi zone dal database PostgreSQL (fonte primaria, persistente)
    const homeProducts = await prisma.product.findMany({
      where: { zone: 'home', visible: true },
      select: { id: true }
    });
    const sidebarProducts = await prisma.product.findMany({
      where: { zone: 'sidebar', visible: true },
      select: { id: true }
    });
    const hiddenProducts = await prisma.product.findMany({
      where: { zone: 'hidden' },
      select: { id: true }
    });
    const featuredProducts = await prisma.product.findMany({
      where: { zone: 'featured', visible: true },
      select: { id: true }
    });

    const dbLayout = {
      home: homeProducts.map(p => p.id),
      sidebar: sidebarProducts.map(p => p.id),
      hidden: hiddenProducts.map(p => p.id),
      featured: featuredProducts.map(p => p.id)
    };

    // Se il DB ha prodotti home, usa il DB (fonte affidabile)
    if (dbLayout.home.length > 0) {
      logger.info(`📋 Layout da DB: ${dbLayout.home.length} home, ${dbLayout.sidebar.length} sidebar`);
      return res.json({ success: true, data: dbLayout });
    }

    // Fallback: usa file JSON se il DB non ha zone configurate
    logger.info(`📋 Layout da file JSON (fallback): ${productLayout.home.length} home`);
    res.json({ success: true, data: productLayout });

  } catch (error) {
    logger.error('Errore /api/products/layout:', error);
    // Fallback al file JSON in caso di errore DB
    res.json({ success: true, data: productLayout });
  }
});

// GET /api/products - Lista tutti i prodotti (da PostgreSQL)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const category = req.query.category; // Filtro per categoria Zenova
    const zone = req.query.zone; // Filtro per zona (home, sidebar, hidden)

    // Build Prisma where clause
    const where = {
      visible: true // Solo prodotti visibili
    };

    // Filtra per ZONA se richiesto
    if (zone && zone !== 'all') {
      where.zone = zone;
      logger.info(`Filtro zona: ${zone}`);
    }

    // Filtra per categoria Zenova se richiesto
    if (category) {
      where.zenovaCategory = category;
      logger.info(`Filtro categoria: ${category}`);
    }

    // Query PostgreSQL con paginazione
    const skip = (page - 1) * pageSize;
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    logger.info(`Query prodotti: ${products.length} risultati (totale: ${totalCount})`);

    const paginatedProducts = products;

    // Arricchisci prodotti AW con originalPrice da top-100-products.json
    const enrichedProducts = paginatedProducts.map(dbProduct => {
      if ((dbProduct.source === 'aw' || dbProduct.source === 'aw-dropship') && TOP_PRODUCTS.length > 0) {
        const jsonProduct = TOP_PRODUCTS.find(jp => jp.id === dbProduct.id);
        if (jsonProduct && jsonProduct.originalPrice) {
          return { ...dbProduct, originalPrice: jsonProduct.originalPrice };
        }
      }
      return dbProduct;
    });

    // Trasforma nel formato che si aspetta il frontend
    const formattedProducts = enrichedProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand || 'Zenova',
      category: p.raw && p.raw.CATEGORY ? p.raw.CATEGORY : p.category,  // USA categorie ID BigBuy raw
      price: getWholesalePrice(p),        // Prezzo di acquisto (BigBuy o AW)
      retailPrice: getRetailPrice(p),     // Prezzo di vendita (BigBuy o AW)
      stock: p.stock,
      images: p.images,
      image: p.images && p.images[0] && p.images[0].url ? p.images[0].url : (p.images && p.images[0] ? p.images[0] : null),
      ean: p.ean,
      weight: parseFloat(p.weight) || 0,
      weightUnit: p.weightUnit || null,  // "kg", "g", "pz" (pezzi)
      dimensions: {
        width: parseFloat(p.width) || 0,
        height: parseFloat(p.height) || 0,
        depth: parseFloat(p.depth) || 0
      },
      // IMPORTANTE: Includiamo zenovaSubcategory e zenovaCategories per filtrare nel frontend
      // Fix: converte stringa "undefined" in undefined vero (bug import AW)
      zenovaSubcategory: p.zenovaSubcategory === 'undefined' ? undefined : p.zenovaSubcategory,
      zenovaCategory: p.zenovaCategory === 'undefined' ? undefined : p.zenovaCategory,
      zenovaCategories: p.zenovaCategories || (p.zenovaCategory ? [p.zenovaCategory] : []),
      subcategory: p.subcategory,  // Categorie BigBuy raw per backward compatibility
      // Fornitori - IMPORTANTE per PayPal stock verification
      source: p.source || 'bigbuy',
      bigbuyId: p.bigbuyId || (p.source === 'bigbuy' ? p.id : null),
      awId: p.awId || (p.source === 'aw' ? p.id : null),
      active: true
    }));

    // Disabilita cache per forzare ricaricamento dopo modifiche
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

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

    // Cerca nel database PostgreSQL (cerca per ID)
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Nascondi prodotti con visible: false
    if (product.visible === false) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non disponibile'
      });
    }

    // Arricchisci con originalPrice da JSON se è prodotto AW
    let enrichedProduct = product;
    if ((product.source === 'aw' || product.source === 'aw-dropship') && TOP_PRODUCTS.length > 0) {
      const jsonProduct = TOP_PRODUCTS.find(jp => jp.id === product.id);
      if (jsonProduct && jsonProduct.originalPrice) {
        enrichedProduct = { ...product, originalPrice: jsonProduct.originalPrice };
      }
    }

    // Formatta nel formato atteso
    const formattedProduct = {
      id: enrichedProduct.id,
      name: enrichedProduct.name,
      description: enrichedProduct.description,
      brand: enrichedProduct.brand || 'Zenova',
      category: enrichedProduct.zenovaCategories ? enrichedProduct.zenovaCategories.join(', ') : enrichedProduct.category,
      price: getWholesalePrice(enrichedProduct),        // Prezzo di acquisto (BigBuy o AW)
      retailPrice: getRetailPrice(enrichedProduct),     // Prezzo di vendita (BigBuy o AW)
      stock: enrichedProduct.stock,
      available: enrichedProduct.available !== false,   // Disponibilità per acquisto (default true se non specificato)
      images: enrichedProduct.images,
      video: enrichedProduct.video,
      ean: enrichedProduct.ean,
      weight: parseFloat(enrichedProduct.weight) || 0,
      weightUnit: enrichedProduct.weightUnit || null,  // "kg", "g", "pz" (pezzi)
      dimensions: {
        width: parseFloat(enrichedProduct.width) || 0,
        height: parseFloat(enrichedProduct.height) || 0,
        depth: parseFloat(enrichedProduct.depth) || 0
      },
      zenovaSubcategory: enrichedProduct.zenovaSubcategory,  // Sotto-categoria per filtri
      zenovaCategories: enrichedProduct.zenovaCategories || [],
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
