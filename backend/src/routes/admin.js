const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Carica i prodotti dal file JSON (include prodotti FTP)
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
let productLayout = { home: [], sidebar: [], hidden: [], featured: [] };
try {
  if (fs.existsSync(LAYOUT_FILE)) {
    const layoutData = fs.readFileSync(LAYOUT_FILE, 'utf-8');
    productLayout = JSON.parse(layoutData);
    // Assicura che featured esista (retro-compatibilità)
    if (!productLayout.featured) {
      productLayout.featured = [];
    }
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
    const formattedProducts = PRODUCTS.map(p => {
      // Gestisci sia zenovaCategory (stringa) che zenovaCategories (array) per retro-compatibilità
      const zenovaCategory = p.zenovaCategory || (p.zenovaCategories && p.zenovaCategories[0]) || null;
      const zenovaCategories = p.zenovaCategories || (p.zenovaCategory ? [p.zenovaCategory] : []);

      return {
        id: p.id,
        name: p.name,
        brand: p.brand || 'Zenova',
        price: parseFloat(p.price),
        retailPrice: parseFloat(p.price),
        stock: p.stock,
        available: p.stock > 0,
        image: p.images && p.images[0] ? p.images[0] : (p.image || null),
        images: p.images || [],
        category: zenovaCategory || 'Generale',
        zenovaCategory: zenovaCategory,  // Stringa singola per compatibility
        zenovaCategories: zenovaCategories,  // Array per compatibility
        zenovaSubcategory: p.zenovaSubcategory || null,  // IMPORTANTE per la vista categorie
        // Se il prodotto è in hidden, visible deve essere false
        visible: productLayout.hidden.includes(p.id) ? false : (p.visible !== undefined ? p.visible : true),
        // Determina la zona del prodotto
        zone: getProductZone(p.id),
        isFeatured: isFeatured(p.id)  // Nuovo: indica se è in evidenza
      };
    });

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
  if (productLayout.featured.includes(productId)) return 'featured';
  return 'none'; // Non assegnato
}

// Helper: verifica se un prodotto è featured
function isFeatured(productId) {
  return productLayout.featured && productLayout.featured.includes(productId);
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

    // ✅ NUOVO: Gestisci array hidden in productLayout
    if (!newVisibility) {
      // Se nascondi (visible = false), aggiungi a hidden
      if (!productLayout.hidden.includes(productId)) {
        productLayout.hidden.push(productId);
      }
    } else {
      // Se mostri (visible = true), rimuovi da hidden
      const hiddenIndex = productLayout.hidden.indexOf(productId);
      if (hiddenIndex > -1) {
        productLayout.hidden.splice(hiddenIndex, 1);
      }
    }

    // Salva productLayout aggiornato
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(productLayout, null, 2));

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

// ===== BROWSER CATALOGO BIGBUY FTP =====

// GET /api/admin/catalog/ftp - Lista prodotti dal catalogo BigBuy FTP
router.get('/catalog/ftp', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const category = req.query.category; // Filtro categoria
    const search = req.query.search; // Ricerca nome/SKU

    // Carica catalogo FTP
    const ftpCatalogPath = path.join(__dirname, '../../top-products-updated.json');

    if (!fs.existsSync(ftpCatalogPath)) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        filtered: 0,
        imported: 0,
        page: 1,
        pageSize: pageSize,
        totalPages: 0,
        message: 'Nessun catalogo FTP sincronizzato. Usa la sezione Sincronizzazione per importare categorie.'
      });
    }

    const ftpProducts = JSON.parse(fs.readFileSync(ftpCatalogPath, 'utf-8'));

    // Filtra SOLO prodotti Zenova validi (escludi quelli con categoria "exclude")
    const validZenovaCategories = [
      'smart-living',
      'cura-corpo-skin',
      'meditazione-zen',
      'design-atmosfera',
      'gourmet-tea-coffee'
    ];

    let filtered = ftpProducts.filter(p => {
      if (p.source !== 'bigbuy_ftp') return false;

      // Escludi prodotti con categoria "exclude"
      if (p.zenovaCategories && p.zenovaCategories.includes('exclude')) {
        return false;
      }

      // Includi solo prodotti con almeno una categoria Zenova valida
      if (!p.zenovaCategories || p.zenovaCategories.length === 0) {
        return false;
      }

      return p.zenovaCategories.some(cat => validZenovaCategories.includes(cat));
    });

    // Filtra per categoria se specificata
    if (category && category !== 'all') {
      filtered = filtered.filter(p =>
        p.zenovaCategories && p.zenovaCategories.includes(category)
      );
    }

    // Ricerca per nome o SKU
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.id && p.id.toLowerCase().includes(searchLower))
      );
    }

    // Conta quanti prodotti FTP Zenova validi ci sono in totale
    const totalFtpProducts = ftpProducts.filter(p => {
      if (p.source !== 'bigbuy_ftp') return false;
      if (p.zenovaCategories && p.zenovaCategories.includes('exclude')) return false;
      if (!p.zenovaCategories || p.zenovaCategories.length === 0) return false;
      return p.zenovaCategories.some(cat => validZenovaCategories.includes(cat));
    }).length;

    // Conta quanti prodotti sono già importati nel catalogo curato
    const curatedProductIds = PRODUCTS.map(p => p.id);
    const importedCount = filtered.filter(p => curatedProductIds.includes(p.id)).length;

    // Paginazione
    const filteredCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    // Formatta prodotti e aggiungi flag "imported"
    const formattedProducts = paginatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand || 'BigBuy',
      price: parseFloat(p.price),
      pvd: parseFloat(p.pvd),
      margin: p.margin || '0',
      stock: p.stock,
      images: p.images || [],
      zenovaCategories: p.zenovaCategories || [],
      categoryId: p.categoryId,
      source: p.source,
      imported: curatedProductIds.includes(p.id) // Flag per indicare se già importato
    }));

    res.json({
      success: true,
      data: formattedProducts,
      total: totalFtpProducts,        // Totale prodotti FTP
      filtered: filteredCount,         // Prodotti dopo filtri
      imported: importedCount,         // Prodotti già importati
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredCount / pageSize)
    });

  } catch (error) {
    logger.error('❌ Errore GET /api/admin/catalog/ftp:', error);
    res.status(500).json({
      success: false,
      error: 'Errore caricamento catalogo FTP'
    });
  }
});

// POST /api/admin/catalog/import/:id - Importa prodotto da catalogo FTP a catalogo curato
router.post('/catalog/import/:id', (req, res) => {
  try {
    const productId = req.params.id;

    logger.info(`📥 Richiesta import prodotto FTP: ${productId}`);

    // Carica catalogo FTP
    const ftpCatalogPath = path.join(__dirname, '../../top-products-updated.json');

    if (!fs.existsSync(ftpCatalogPath)) {
      return res.status(404).json({
        success: false,
        error: 'Catalogo FTP non trovato. Sincronizza prima una categoria.'
      });
    }

    const ftpProducts = JSON.parse(fs.readFileSync(ftpCatalogPath, 'utf-8'));

    // Trova prodotto nel catalogo FTP
    const ftpProduct = ftpProducts.find(p => p.id === productId);

    if (!ftpProduct) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato nel catalogo FTP'
      });
    }

    // Verifica se già esiste nel catalogo curato
    const existingIndex = PRODUCTS.findIndex(p => p.id === productId);

    if (existingIndex !== -1) {
      return res.status(409).json({
        success: false,
        error: 'Product already exists in curated catalog',
        data: PRODUCTS[existingIndex]
      });
    }

    // IMPORTANTE: Applica categorizzazione automatica al prodotto prima dell'import
    const { categorizeProduct, getProductSubcategory } = require('../../config/category-mapping');

    const productToImport = { ...ftpProduct };

    // Ri-applica categorizzazione intelligente
    productToImport.zenovaCategories = categorizeProduct(ftpProduct);
    productToImport.zenovaSubcategory = getProductSubcategory(ftpProduct);

    // Imposta campi necessari per l'admin
    productToImport.zone = 'sidebar';  // Di default in sidebar
    productToImport.visible = true;     // Visibile di default

    logger.info(`📂 Categorizzazione applicata: ${JSON.stringify(productToImport.zenovaCategories)}`);

    // Aggiungi al catalogo curato
    PRODUCTS.push(productToImport);

    // Salva nel file JSON
    const jsonPath = path.join(__dirname, '../../top-100-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(PRODUCTS, null, 2));

    // Ricarica prodotti
    reloadProducts();

    logger.info(`✅ Prodotto importato da FTP: ${ftpProduct.name}`);

    res.json({
      success: true,
      message: `Prodotto "${ftpProduct.name}" importato con successo`,
      data: {
        id: ftpProduct.id,
        name: ftpProduct.name,
        totalProducts: PRODUCTS.length
      }
    });

  } catch (error) {
    logger.error('❌ Errore POST /api/admin/catalog/import:', error);
    res.status(500).json({
      success: false,
      error: 'Errore importazione prodotto'
    });
  }
});

// POST /api/admin/products/:id/featured - Toggle prodotto featured
router.post('/products/:id/featured', (req, res) => {
  try {
    const productId = req.params.id;

    // Verifica che il prodotto esista
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Toggle featured
    const index = productLayout.featured.indexOf(productId);
    let action = '';

    if (index > -1) {
      // Rimuovi da featured
      productLayout.featured.splice(index, 1);
      action = 'removed';
      logger.info(`⭐ Prodotto rimosso da featured: ${product.name}`);
    } else {
      // Aggiungi a featured
      productLayout.featured.push(productId);
      action = 'added';
      logger.info(`⭐ Prodotto aggiunto a featured: ${product.name}`);
    }

    // Salva layout
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(productLayout, null, 2));

    res.json({
      success: true,
      message: action === 'added' ? 'Prodotto aggiunto in evidenza' : 'Prodotto rimosso da evidenza',
      data: {
        productId,
        isFeatured: action === 'added',
        totalFeatured: productLayout.featured.length
      }
    });

  } catch (error) {
    logger.error('❌ Errore toggle featured:', error);
    res.status(500).json({
      success: false,
      error: 'Errore modifica prodotto featured'
    });
  }
});

// ===== SINCRONIZZAZIONE AUTOMATICA BEAUTY + HEALTH =====

// POST /api/admin/auto-sync - Avvia sincronizzazione automatica Beauty + Health
router.post('/auto-sync', async (req, res) => {
  try {
    logger.info('🔄 Richiesta sincronizzazione automatica Beauty + Health');

    // Importa servizio auto-sync
    const { autoSync } = require('../services/auto-sync');

    // Avvia sincronizzazione
    const result = await autoSync();

    if (result.success) {
      logger.info(`✅ Sincronizzazione completata: Beauty +${result.stats.beauty.added}, Health +${result.stats.health.added}`);

      res.json({
        success: true,
        message: 'Sincronizzazione automatica completata',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Sincronizzazione fallita',
        data: result
      });
    }

  } catch (error) {
    logger.error('❌ Errore POST /api/admin/auto-sync:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore sincronizzazione automatica'
    });
  }
});

// GET /api/admin/auto-sync/status - Ottieni stato sincronizzazione
router.get('/auto-sync/status', (req, res) => {
  try {
    // Per ora restituiamo info di configurazione
    const { BIGBUY_CATEGORIES, SYNC_LIMITS, QUALITY_FILTERS } = require('../../config/auto-sync-config');

    res.json({
      success: true,
      data: {
        enabled: true,
        categories: {
          beauty: {
            enabled: BIGBUY_CATEGORIES.beauty.enabled,
            categoryCount: BIGBUY_CATEGORIES.beauty.categoryIds.length
          },
          health: {
            enabled: BIGBUY_CATEGORIES.health.enabled,
            categoryCount: BIGBUY_CATEGORIES.health.categoryIds.length
          }
        },
        limits: SYNC_LIMITS,
        filters: {
          minStock: QUALITY_FILTERS.minStock,
          minPrice: QUALITY_FILTERS.minPrice,
          maxPrice: QUALITY_FILTERS.maxPrice,
          requireImages: QUALITY_FILTERS.requireImages
        }
      }
    });

  } catch (error) {
    logger.error('❌ Errore GET /api/admin/auto-sync/status:', error);
    res.status(500).json({
      success: false,
      error: 'Errore recupero stato sincronizzazione'
    });
  }
});

module.exports = router;
