const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Carica i prodotti dal file JSON
let PRODUCTS = [];
try {
  const jsonPath = path.join(__dirname, '../../top-100-products.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  PRODUCTS = JSON.parse(rawData);
  logger.info(`✅ Admin API: Caricati ${PRODUCTS.length} prodotti`);
} catch (error) {
  logger.error('❌ Errore caricamento prodotti per admin:', error);
}

// File per salvare il layout dei prodotti
const LAYOUT_FILE = path.join(__dirname, '../../config/product-layout.json');

// Carica layout salvato (se esiste)
let productLayout = { home: [], sidebar: [], hidden: [] };
try {
  if (fs.existsSync(LAYOUT_FILE)) {
    const layoutData = fs.readFileSync(LAYOUT_FILE, 'utf-8');
    productLayout = JSON.parse(layoutData);
  }
} catch (error) {
  logger.error('❌ Errore caricamento layout:', error);
}

// GET /api/admin/stats - Statistiche per dashboard
router.get('/stats', (req, res) => {
  try {
    // Calcola statistiche reali dai prodotti
    const totalProducts = PRODUCTS.length;
    const availableProducts = PRODUCTS.filter(p => p.stock > 0).length;

    // Per ora ordini e vendite sono mock (verranno dal database quando implementato)
    const todayOrders = 0;  // TODO: da database ordini
    const todaySales = 0;   // TODO: da database ordini

    res.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        outOfStock: totalProducts - availableProducts,
        todayOrders,
        todaySales,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Errore /api/admin/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero statistiche'
    });
  }
});

// GET /api/admin/products - Lista prodotti con info layout
router.get('/products', (req, res) => {
  try {
    const zone = req.query.zone; // home, sidebar, hidden, all

    // Formatta prodotti per l'admin panel
    const formattedProducts = PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand || 'Zenova',
      price: parseFloat(p.price),
      retailPrice: parseFloat(p.price),
      stock: p.stock,
      available: p.stock > 0,
      image: p.images && p.images[0] ? p.images[0] : null,
      category: p.zenovaCategories ? p.zenovaCategories[0] : 'Generale',
      visible: p.visible !== undefined ? p.visible : true, // Default true per retro-compatibilità
      // Determina la zona del prodotto
      zone: getProductZone(p.id)
    }));

    // Filtra per zona se richiesto
    let filteredProducts = formattedProducts;
    if (zone && zone !== 'all') {
      filteredProducts = formattedProducts.filter(p => p.zone === zone);
    }

    res.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
      layout: productLayout
    });
  } catch (error) {
    logger.error('Errore /api/admin/products:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero prodotti'
    });
  }
});

// Helper: determina zona del prodotto
function getProductZone(productId) {
  if (productLayout.home.includes(productId)) return 'home';
  if (productLayout.sidebar.includes(productId)) return 'sidebar';
  if (productLayout.hidden.includes(productId)) return 'hidden';
  return 'none'; // Non assegnato
}

// PUT /api/admin/products/layout - Salva layout prodotti
router.put('/products/layout', (req, res) => {
  try {
    const { layout } = req.body;

    if (!layout || !layout.home || !layout.sidebar || !layout.hidden) {
      return res.status(400).json({
        success: false,
        error: 'Layout non valido'
      });
    }

    // Salva nel file
    productLayout = layout;
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(layout, null, 2));

    logger.info('✅ Layout prodotti salvato');

    res.json({
      success: true,
      message: 'Layout salvato con successo'
    });
  } catch (error) {
    logger.error('Errore /api/admin/products/layout:', error);
    res.status(500).json({
      success: false,
      error: 'Errore salvataggio layout'
    });
  }
});

// GET /api/admin/sync/status - Stato sincronizzazione
router.get('/sync/status', (req, res) => {
  try {
    // Per ora restituisce stato mock
    // TODO: implementare sincronizzazione reale con BigBuy
    res.json({
      success: true,
      data: {
        status: 'synced',
        lastSync: new Date().toISOString(),
        nextSync: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // +6 ore
        productsUpdated: PRODUCTS.length,
        newProducts: 0,
        outOfStock: PRODUCTS.filter(p => p.stock === 0).length
      }
    });
  } catch (error) {
    logger.error('Errore /api/admin/sync/status:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero stato sync'
    });
  }
});

// POST /api/admin/sync/now - Avvia sincronizzazione manuale
router.post('/sync/now', async (req, res) => {
  try {
    // Per ora simula sync
    // TODO: implementare sincronizzazione reale con BigBuy

    logger.info('🔄 Sincronizzazione manuale avviata');

    // Simula delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: 'Sincronizzazione completata',
      data: {
        productsUpdated: PRODUCTS.length,
        newProducts: 0,
        priceUpdates: 0,
        stockUpdates: 0
      }
    });
  } catch (error) {
    logger.error('Errore /api/admin/sync/now:', error);
    res.status(500).json({
      success: false,
      error: 'Errore sincronizzazione'
    });
  }
});

// GET /api/admin/categories - Ottieni tutte le categorie con conteggio
router.get('/categories', (req, res) => {
  try {
    // Raggruppa prodotti per categoria
    const categories = {};

    PRODUCTS.forEach(product => {
      const cats = product.zenovaCategories || ['Generale'];
      const subcat = product.zenovaSubcategory || null;

      cats.forEach(cat => {
        if (!categories[cat]) {
          categories[cat] = {
            name: cat,
            displayName: getCategoryDisplayName(cat),
            count: 0,
            subcategories: {}
          };
        }

        categories[cat].count++;

        // Aggiungi sottocategoria se esiste
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

    // Converti in array
    const categoriesArray = Object.values(categories).map(cat => ({
      ...cat,
      subcategories: Object.values(cat.subcategories)
    }));

    res.json({
      success: true,
      data: categoriesArray
    });
  } catch (error) {
    logger.error('Errore /api/admin/categories:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero categorie'
    });
  }
});

// Helper: Nomi categorie user-friendly
function getCategoryDisplayName(cat) {
  const names = {
    'benessere': 'Benessere',
    'bellezza': 'Bellezza',
    'smartHome': 'Smart Home',
    'design': 'Design'
  };
  return names[cat] || cat;
}

// Helper: Nomi sottocategorie user-friendly
function getSubcategoryDisplayName(subcat) {
  const names = {
    'cura-pelle-mani-piedi': 'Mani e Piedi',
    'cura-pelle-set-regalo': 'Set Regalo',
    'cura-pelle-solare': 'Protezione Solare',
    'cura-pelle-corpo': 'Cura Corpo',
    'cura-pelle-viso': 'Cura Viso',
    'cura-pelle-labbra': 'Labbra'
  };
  return names[subcat] || subcat;
}

// GET /api/admin/activity - Log attività recenti
router.get('/activity', (req, res) => {
  try {
    // Per ora restituisce attività mock
    // TODO: implementare log attività reale
    const activities = [
      {
        icon: '🔄',
        title: 'Sincronizzazione completata',
        description: `${PRODUCTS.length} prodotti aggiornati`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        icon: '⚠️',
        title: `${PRODUCTS.filter(p => p.stock === 0).length} prodotti esauriti`,
        description: 'Stock BigBuy aggiornato',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    logger.error('Errore /api/admin/activity:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero attività'
    });
  }
});

// ===== NUOVE FUNZIONALITÀ: IMPORTAZIONE ED ELIMINAZIONE =====

// Helper: Ricarica prodotti dal file JSON
function reloadProducts() {
  try {
    const jsonPath = path.join(__dirname, '../../top-100-products.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    PRODUCTS = JSON.parse(rawData);
    logger.info(`✅ Prodotti ricaricati: ${PRODUCTS.length} prodotti`);
    return true;
  } catch (error) {
    logger.error('❌ Errore ricaricamento prodotti:', error);
    return false;
  }
}

// POST /api/admin/products/import - Importa prodotto da BigBuy per SKU
router.post('/products/import', async (req, res) => {
  try {
    const { sku } = req.body;

    if (!sku) {
      return res.status(400).json({
        success: false,
        error: 'SKU richiesto'
      });
    }

    logger.info(`🔍 Ricerca prodotto BigBuy con SKU: ${sku}`);

    // Importa BigBuyClient (è già un'istanza)
    const bigbuy = require('../integrations/BigBuyClient');

    // Cerca il prodotto su BigBuy
    const product = await bigbuy.getProduct(sku);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato su BigBuy'
      });
    }

    // Verifica che non esista già
    const existingProduct = PRODUCTS.find(p => p.id === sku);
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        error: 'Prodotto già presente nel catalogo'
      });
    }

    // Formatta il prodotto nel formato del catalogo
    const newProduct = {
      id: sku,
      name: product.name || `Prodotto ${sku}`,
      description: product.description || '',
      brand: product.brand || 'BigBuy',
      category: product.category || 'Generale',
      zenovaCategories: ['benessere'],
      price: parseFloat(product.retailPrice || product.price || 0),
      pvd: parseFloat(product.wholesalePrice || product.price || 0),
      margin: product.margin || '0',
      stock: product.quantity || 0,
      imageCount: product.images ? product.images.length : 0,
      images: product.images ? product.images.map(img => img.url || img) : [],
      video: '0',
      ean: product.ean || '',
      width: product.width || '0',
      height: product.height || '0',
      depth: product.depth || '0',
      weight: product.weight || '0',
      score: 100,
      raw: product
    };

    // Aggiungi al file JSON
    const jsonPath = path.join(__dirname, '../../top-100-products.json');
    PRODUCTS.push(newProduct);
    fs.writeFileSync(jsonPath, JSON.stringify(PRODUCTS, null, 2));

    // Ricarica prodotti
    reloadProducts();

    logger.info(`✅ Prodotto importato: ${newProduct.name}`);

    res.json({
      success: true,
      message: 'Prodotto importato con successo',
      data: newProduct
    });
  } catch (error) {
    logger.error('❌ Errore importazione prodotto:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore importazione prodotto'
    });
  }
});

// DELETE /api/admin/products/:id - Elimina prodotto dal catalogo
router.delete('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;

    logger.info(`🗑️  Richiesta eliminazione prodotto: ${productId}`);

    // Trova il prodotto
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    const productName = PRODUCTS[productIndex].name;

    // Rimuovi dall'array
    PRODUCTS.splice(productIndex, 1);

    // Salva nel file JSON
    const jsonPath = path.join(__dirname, '../../top-100-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(PRODUCTS, null, 2));

    // Rimuovi anche dal layout se presente
    productLayout.home = productLayout.home.filter(id => id !== productId);
    productLayout.sidebar = productLayout.sidebar.filter(id => id !== productId);
    productLayout.hidden = productLayout.hidden.filter(id => id !== productId);
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(productLayout, null, 2));

    // Ricarica prodotti
    reloadProducts();

    logger.info(`✅ Prodotto eliminato: ${productName}`);

    res.json({
      success: true,
      message: `Prodotto "${productName}" eliminato con successo`,
      data: {
        id: productId,
        name: productName,
        totalProducts: PRODUCTS.length
      }
    });
  } catch (error) {
    logger.error('❌ Errore eliminazione prodotto:', error);
    res.status(500).json({
      success: false,
      error: 'Errore eliminazione prodotto'
    });
  }
});

// PATCH /api/admin/products/:id/visibility - Toggle visibilità prodotto
router.patch('/products/:id/visibility', (req, res) => {
  try {
    const productId = req.params.id;
    const { visible } = req.body;

    logger.info(`👁️  Richiesta toggle visibilità prodotto: ${productId} -> ${visible}`);

    // Trova il prodotto
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Aggiorna campo visible
    PRODUCTS[productIndex].visible = visible !== undefined ? visible : !PRODUCTS[productIndex].visible;

    const productName = PRODUCTS[productIndex].name;
    const newVisibility = PRODUCTS[productIndex].visible;

    // Salva nel file JSON
    const jsonPath = path.join(__dirname, '../../top-100-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(PRODUCTS, null, 2));

    // Ricarica prodotti
    reloadProducts();

    logger.info(`✅ Visibilità prodotto aggiornata: ${productName} -> ${newVisibility ? 'visibile' : 'nascosto'}`);

    res.json({
      success: true,
      message: `Prodotto "${productName}" ora è ${newVisibility ? 'visibile' : 'nascosto'}`,
      data: {
        id: productId,
        name: productName,
        visible: newVisibility
      }
    });
  } catch (error) {
    logger.error('❌ Errore toggle visibilità prodotto:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento visibilità prodotto'
    });
  }
});

module.exports = router;
