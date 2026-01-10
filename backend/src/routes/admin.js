const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const productsRouter = require('./products');
const orderService = require('../services/OrderService');

// Prisma Client per PostgreSQL
const prisma = new PrismaClient();

// ===== HELPER FUNCTIONS - Normalizzazione prezzi multi-fornitore =====
function getWholesalePrice(product) {
  const source = product.source || product.supplier;
  if (source === 'bigbuy') {
    return parseFloat(product.pvd) || 0;
  } else if (source === 'aw-dropship' || source === 'aw') {
    return parseFloat(product.price) || 0;
  }
  return parseFloat(product.pvd || product.price) || 0;
}

function getRetailPrice(product) {
  const source = product.source || product.supplier;
  if (source === 'bigbuy') {
    return parseFloat(product.price) || 0;
  } else if (source === 'aw-dropship' || source === 'aw') {
    // AW: usa originalPrice se presente, altrimenti calcola 30%
    if (product.originalPrice) {
      return parseFloat(product.originalPrice);
    }
    const wholesale = parseFloat(product.price) || 0;
    return Math.round(wholesale * 1.3 * 100) / 100;
  }
  return parseFloat(product.price) || 0;
}

// Funzione per ricaricare i prodotti (ora da PostgreSQL)
async function reloadProducts() {
  try {
    const products = await prisma.product.findMany();
    logger.info(`🔄 Admin API: Caricati ${products.length} prodotti da PostgreSQL`);
    return products;
  } catch (error) {
    logger.error('❌ Errore ricaricamento prodotti per admin:', error);
    return false;
  }
}

// Array in memoria per velocità (caricato da PostgreSQL)
let PRODUCTS = [];

// Carica top-100-products.json per avere originalPrice dei prodotti AW
let TOP_PRODUCTS = [];
try {
  const productsPath = path.join(__dirname, '../../top-100-products.json');
  if (fs.existsSync(productsPath)) {
    const productsData = fs.readFileSync(productsPath, 'utf-8');
    TOP_PRODUCTS = JSON.parse(productsData);
    logger.info(`✅ Admin: Caricati ${TOP_PRODUCTS.length} prodotti da top-100-products.json`);
  }
} catch (error) {
  logger.error('❌ Errore caricamento top-100-products.json per admin:', error);
}

// Caricamento iniziale da PostgreSQL
(async () => {
  try {
    PRODUCTS = await prisma.product.findMany();
    logger.info(`✅ Admin API: Caricati ${PRODUCTS.length} prodotti da PostgreSQL`);
  } catch (error) {
    logger.error('❌ Errore caricamento prodotti da PostgreSQL per admin:', error);
  }
})();

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

    // Calcola ordini e vendite di oggi dal database
    const allOrders = orderService.getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inizio giornata

    const todayOrdersFiltered = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todayOrders = todayOrdersFiltered.length;
    const todaySales = todayOrdersFiltered.reduce((sum, order) => {
      return sum + (order.totals?.total || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        outOfStock: totalProducts - availableProducts,
        todayOrders,
        todaySales: Math.round(todaySales * 100) / 100, // Arrotonda a 2 decimali
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

// GET /api/admin/products - Lista prodotti con info layout (da PostgreSQL)
router.get('/products', async (req, res) => {
  try {
    const zone = req.query.zone; // home, sidebar, hidden, all
    const category = req.query.category; // smart-living, tech-innovation, etc.

    // Carica TUTTI i prodotti da PostgreSQL
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    logger.info(`✅ Admin API: Caricati ${products.length} prodotti`);

    // Arricchisci prodotti AW con originalPrice da top-100-products.json
    const enrichedProducts = products.map(dbProduct => {
      if ((dbProduct.source === 'aw' || dbProduct.source === 'aw-dropship') && TOP_PRODUCTS.length > 0) {
        const jsonProduct = TOP_PRODUCTS.find(jp => jp.id === dbProduct.id);
        if (jsonProduct && jsonProduct.originalPrice) {
          return { ...dbProduct, originalPrice: jsonProduct.originalPrice };
        }
      }
      return dbProduct;
    });

    // Formatta prodotti per l'admin panel
    const formattedProducts = enrichedProducts.map(p => {
      // Gestisci sia zenovaCategory (stringa) che zenovaCategories (array) per retro-compatibilità
      const zenovaCategory = p.zenovaCategory || (p.zenovaCategories && p.zenovaCategories[0]) || null;
      const zenovaCategories = p.zenovaCategories || (p.zenovaCategory ? [p.zenovaCategory] : []);

      return {
        id: p.id,
        name: p.name,
        brand: p.brand || 'Zenova',
        price: getWholesalePrice(p),  // Prezzo acquisto
        retailPrice: getRetailPrice(p),  // Prezzo vendita (usa originalPrice se presente)
        stock: p.stock,
        available: p.stock > 0,
        image: p.image || (p.images && p.images[0]) || null,
        images: p.images || [],
        category: zenovaCategory || 'Generale',
        zenovaCategory: zenovaCategory,  // Stringa singola per compatibility
        zenovaCategories: zenovaCategories,  // Array per compatibility
        zenovaSubcategory: p.zenovaSubcategory || null,  // IMPORTANTE per la vista categorie
        // Usa direttamente il campo visible dal database
        visible: p.visible !== undefined ? p.visible : true,
        // Usa direttamente il campo zone dal database
        zone: p.zone || getProductZone(p.id),
        isFeatured: isFeatured(p.id)  // Nuovo: indica se è in evidenza
      };
    });

    // Filtra per zona se richiesto
    let filteredProducts = formattedProducts;
    if (zone && zone !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.zone === zone);
    }

    // Filtra per categoria se richiesto
    if (category) {
      filteredProducts = filteredProducts.filter(p =>
        p.zenovaCategories && p.zenovaCategories.includes(category)
      );
    }

    res.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
      total: filteredProducts.length,
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

// Helper: Ricarica prodotti rimosso - ora usa la funzione all'inizio del file

// POST /api/admin/products/import - Importa prodotto da BigBuy per SKU (cerca nei CSV locali)
router.post('/products/import', async (req, res) => {
  try {
    const { sku, category } = req.body;

    if (!sku) {
      return res.status(400).json({
        success: false,
        error: 'SKU richiesto'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Categoria richiesta'
      });
    }

    logger.info(`🔍 Ricerca prodotto nei CSV BigBuy con SKU: ${sku}`);

    // Cerca il prodotto nei CSV locali
    const csv = require('csv-parser');
    const CSV_DIR = path.join(__dirname, '../../bigbuy-data/bigbuy-complete');

    if (!fs.existsSync(CSV_DIR)) {
      return res.status(500).json({
        success: false,
        error: 'Cartella CSV non trovata. Scarica i CSV BigBuy prima.'
      });
    }

    const csvFiles = fs.readdirSync(CSV_DIR)
      .filter(f => f.startsWith('general-products-csv-') && f.endsWith('.csv'));

    let foundProduct = null;

    // Parsing CSV con gestione BOM
    async function parseCSV(filePath) {
      return new Promise((resolve, reject) => {
        const products = [];
        fs.createReadStream(filePath)
          .pipe(csv({ separator: ';' }))
          .on('data', (row) => {
            const cleanedRow = {};
            for (const [key, value] of Object.entries(row)) {
              const cleanKey = key.replace(/^\uFEFF/, '');
              cleanedRow[cleanKey] = value;
            }
            products.push(cleanedRow);
          })
          .on('end', () => resolve(products))
          .on('error', reject);
      });
    }

    // Cerca in tutti i CSV
    for (const file of csvFiles) {
      const filePath = path.join(CSV_DIR, file);
      const products = await parseCSV(filePath);
      const product = products.find(p => p.ID === sku);

      if (product) {
        foundProduct = product;
        break;
      }
    }

    if (!foundProduct) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato nei CSV BigBuy'
      });
    }

    // ✅ Verifica che non esista già su PostgreSQL
    const existingProduct = await prisma.product.findUnique({
      where: { id: sku }
    });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        error: 'Prodotto già presente nel catalogo'
      });
    }

    // Raccogli immagini
    const images = [];
    for (let i = 1; i <= 8; i++) {
      const imgField = `IMAGE${i}`;
      if (foundProduct[imgField]) images.push({ url: foundProduct[imgField] });
    }

    // Mappa sottocategorie di default per ogni categoria principale
    const defaultSubcategories = {
      'smart-living': 'smart-led-illuminazione',
      'beauty': 'profumi-fragranze',
      'health-personal-care': 'set-massaggio',
      'natural-wellness': 'oli-essenziali',
      'tech-innovation': 'gadget-tech'
    };

    // Raccogli URL immagini (array di stringhe per PostgreSQL)
    const imageUrls = images.map(img => img.url || img);

    // ✅ SALVA SU POSTGRESQL
    const newProduct = await prisma.product.create({
      data: {
        id: foundProduct.ID,
        name: foundProduct.NAME || foundProduct.ID,
        description: foundProduct.DESCRIPTION || '',
        brand: foundProduct.BRAND || '',
        category: category,
        zenovaCategory: category,
        zenovaCategories: [category],
        zenovaSubcategory: defaultSubcategories[category] || 'altri',
        price: parseFloat(foundProduct.PVP_BIGBUY || 0),
        retailPrice: parseFloat(foundProduct.PVP_BIGBUY || 0),
        wholesalePrice: parseFloat(foundProduct.PVD || 0),
        stock: parseInt(foundProduct.STOCK || 0),
        images: imageUrls,
        image: imageUrls[0] || null,
        ean: foundProduct.EAN13 || '',
        weight: parseFloat(foundProduct.WEIGHT || 0),
        dimensions: {
          width: parseFloat(foundProduct.WIDTH || 0),
          height: parseFloat(foundProduct.HEIGHT || 0),
          depth: parseFloat(foundProduct.DEPTH || 0)
        },
        visible: true,
        zone: 'sidebar',
        source: 'bigbuy',
        bigbuyId: foundProduct.ID
      }
    });

    // ✅ Aggiungi anche in memoria per compatibilità
    const newProductFormatted = {
      id: newProduct.id,
      sku: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      brand: newProduct.brand,
      category: newProduct.category,
      zenovaCategory: newProduct.zenovaCategory,
      zenovaCategories: newProduct.zenovaCategories,
      zenovaSubcategory: newProduct.zenovaSubcategory,
      price: parseFloat(newProduct.price),
      pvd: parseFloat(newProduct.wholesalePrice),
      stock: newProduct.stock,
      images: newProduct.images.map(url => ({ url })),
      imageCount: newProduct.images.length,
      ean: newProduct.ean,
      width: newProduct.dimensions?.width || 0,
      height: newProduct.dimensions?.height || 0,
      depth: newProduct.dimensions?.depth || 0,
      weight: newProduct.weight,
      visible: newProduct.visible,
      zone: newProduct.zone
    };
    PRODUCTS.push(newProductFormatted);

    // ✅ Aggiungi a productLayout sidebar
    if (!productLayout.sidebar.includes(newProduct.id)) {
      productLayout.sidebar.push(newProduct.id);
      fs.writeFileSync(LAYOUT_FILE, JSON.stringify(productLayout, null, 2));
    }

    logger.info(`✅ Prodotto importato su PostgreSQL: ${newProduct.name}`);

    res.json({
      success: true,
      message: 'Prodotto importato con successo e disponibile online',
      data: newProductFormatted
    });
  } catch (error) {
    logger.error('❌ Errore importazione prodotto:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore importazione prodotto'
    });
  }
});

// GET /api/admin/products/preview/:sku - Ottieni anteprima prodotto da CSV senza importare
router.get('/products/preview/:sku', async (req, res) => {
  try {
    const sku = req.params.sku;

    if (!sku) {
      return res.status(400).json({
        success: false,
        error: 'SKU richiesto'
      });
    }

    logger.info(`🔍 Anteprima prodotto CSV BigBuy con SKU: ${sku}`);

    // Cerca il prodotto nei CSV locali
    const csv = require('csv-parser');
    const CSV_DIR = path.join(__dirname, '../../bigbuy-data/bigbuy-complete');

    if (!fs.existsSync(CSV_DIR)) {
      return res.status(500).json({
        success: false,
        error: 'Cartella CSV non trovata. Scarica i CSV BigBuy prima.'
      });
    }

    const csvFiles = fs.readdirSync(CSV_DIR)
      .filter(f => f.startsWith('general-products-csv-') && f.endsWith('.csv'));

    let foundProduct = null;

    // Parsing CSV con gestione BOM
    async function parseCSV(filePath) {
      return new Promise((resolve, reject) => {
        const products = [];
        fs.createReadStream(filePath)
          .pipe(csv({ separator: ';' }))
          .on('data', (row) => {
            const cleanedRow = {};
            for (const [key, value] of Object.entries(row)) {
              const cleanKey = key.replace(/^\uFEFF/, '');
              cleanedRow[cleanKey] = value;
            }
            products.push(cleanedRow);
          })
          .on('end', () => resolve(products))
          .on('error', reject);
      });
    }

    // Cerca in tutti i CSV
    for (const file of csvFiles) {
      const filePath = path.join(CSV_DIR, file);
      const products = await parseCSV(filePath);
      const product = products.find(p => p.ID === sku);

      if (product) {
        foundProduct = product;
        break;
      }
    }

    if (!foundProduct) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato nei CSV BigBuy'
      });
    }

    // Verifica se già presente nel catalogo
    const existingProduct = PRODUCTS.find(p => p.id === sku);
    const alreadyImported = !!existingProduct;

    // Raccogli immagini
    const images = [];
    for (let i = 1; i <= 8; i++) {
      const imgField = `IMAGE${i}`;
      if (foundProduct[imgField]) images.push(foundProduct[imgField]);
    }

    // Calcola margine
    const price = parseFloat(foundProduct.PVP_BIGBUY || 0);
    const cost = parseFloat(foundProduct.PVD || 0);
    const margin = (price - cost).toFixed(2);

    // Restituisci anteprima
    res.json({
      success: true,
      data: {
        sku: foundProduct.ID,
        name: foundProduct.NAME || foundProduct.ID,
        description: foundProduct.DESCRIPTION || '',
        brand: foundProduct.BRAND || '',
        price: price,
        cost: cost,
        margin: margin,
        stock: parseInt(foundProduct.STOCK || 0),
        images: images,
        imageCount: images.length,
        ean: foundProduct.EAN13 || '',
        alreadyImported: alreadyImported
      }
    });
  } catch (error) {
    logger.error('❌ Errore anteprima prodotto:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Errore anteprima prodotto'
    });
  }
});

// DELETE /api/admin/products/:id - Elimina prodotto dal catalogo
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    logger.info(`🗑️  Richiesta eliminazione prodotto: ${productId}`);

    // Trova il prodotto da PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    const productName = product.name;

    // ✅ ELIMINA DA POSTGRESQL
    await prisma.product.delete({
      where: { id: productId }
    });

    // ✅ Rimuovi anche dalla memoria per compatibilità
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      PRODUCTS.splice(productIndex, 1);
    }

    // Rimuovi anche dal layout se presente
    productLayout.home = productLayout.home.filter(id => id !== productId);
    productLayout.sidebar = productLayout.sidebar.filter(id => id !== productId);
    productLayout.hidden = productLayout.hidden.filter(id => id !== productId);
    if (productLayout.featured) {
      productLayout.featured = productLayout.featured.filter(id => id !== productId);
    }
    fs.writeFileSync(LAYOUT_FILE, JSON.stringify(productLayout, null, 2));

    logger.info(`✅ Prodotto eliminato da PostgreSQL: ${productName}`);

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
router.patch('/products/:id/visibility', async (req, res) => {
  try {
    const productId = req.params.id;
    const { visible } = req.body;

    logger.info(`👁️  Richiesta toggle visibilità prodotto: ${productId} -> ${visible}`);

    // Trova il prodotto da PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Calcola nuova visibilità
    const newVisibility = visible !== undefined ? visible : !product.visible;

    // ✅ AGGIORNA SU POSTGRESQL
    await prisma.product.update({
      where: { id: productId },
      data: { visible: newVisibility }
    });

    // ✅ Aggiorna anche in memoria per compatibilità
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      PRODUCTS[productIndex].visible = newVisibility;
    }

    // ✅ Gestisci array hidden in productLayout
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

    logger.info(`✅ Visibilità prodotto aggiornata su PostgreSQL: ${product.name} -> ${newVisibility ? 'visibile' : 'nascosto'}`);

    res.json({
      success: true,
      message: `Prodotto "${product.name}" ora è ${newVisibility ? 'visibile' : 'nascosto'}`,
      data: {
        id: productId,
        name: product.name,
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

// PATCH /api/admin/products/:id/category - Aggiorna categoria e sottocategoria prodotto
router.patch('/products/:id/category', async (req, res) => {
  try {
    const productId = req.params.id;
    const { category, subcategory } = req.body;

    logger.info(`📂 Richiesta aggiornamento categoria prodotto: ${productId} -> ${category}/${subcategory}`);

    // Trova il prodotto da PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    const oldCategory = product.zenovaCategory;
    const oldSubcategory = product.zenovaSubcategory;

    // ✅ AGGIORNA SU POSTGRESQL
    await prisma.product.update({
      where: { id: productId },
      data: {
        zenovaCategory: category,
        category: category,
        zenovaCategories: [category],
        zenovaSubcategory: subcategory
      }
    });

    // ✅ Aggiorna anche in memoria per compatibilità
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      PRODUCTS[productIndex].zenovaCategory = category;
      PRODUCTS[productIndex].category = category;
      PRODUCTS[productIndex].zenovaCategories = [category];
      PRODUCTS[productIndex].zenovaSubcategory = subcategory;
    }

    logger.info(`✅ Categoria prodotto aggiornata su PostgreSQL: ${product.name}`);
    logger.info(`   ${oldCategory}/${oldSubcategory} → ${category}/${subcategory}`);

    res.json({
      success: true,
      message: `Categoria aggiornata con successo`,
      data: {
        id: productId,
        name: product.name,
        category: category,
        subcategory: subcategory,
        oldCategory: oldCategory,
        oldSubcategory: oldSubcategory
      }
    });
  } catch (error) {
    logger.error('❌ Errore aggiornamento categoria prodotto:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento categoria prodotto'
    });
  }
});

// PATCH /api/admin/products/:id/price - Aggiorna prezzo vendita prodotto
router.patch('/products/:id/price', async (req, res) => {
  try {
    const productId = req.params.id;
    const { retailPrice } = req.body;

    logger.info(`💰 Richiesta aggiornamento prezzo prodotto: ${productId} -> €${retailPrice}`);

    // Validazione prezzo
    if (!retailPrice || isNaN(retailPrice) || parseFloat(retailPrice) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Prezzo non valido (deve essere maggiore di 0)'
      });
    }

    // Trova il prodotto da PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    const oldRetailPrice = parseFloat(product.retailPrice);
    const newRetailPrice = parseFloat(retailPrice);
    const wholesalePrice = parseFloat(product.price);

    // Validazione: prezzo vendita deve essere >= prezzo acquisto
    if (newRetailPrice < wholesalePrice) {
      return res.status(400).json({
        success: false,
        error: `Prezzo vendita (€${newRetailPrice}) non può essere inferiore al prezzo di acquisto (€${wholesalePrice})`
      });
    }

    // ✅ AGGIORNA SU POSTGRESQL
    await prisma.product.update({
      where: { id: productId },
      data: {
        retailPrice: newRetailPrice
      }
    });

    // ✅ Aggiorna anche in memoria per compatibilità
    const productIndex = PRODUCTS.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      PRODUCTS[productIndex].retailPrice = newRetailPrice;
    }

    const margine = ((newRetailPrice - wholesalePrice) / newRetailPrice * 100).toFixed(1);

    logger.info(`✅ Prezzo prodotto aggiornato su PostgreSQL: ${product.name}`);
    logger.info(`   €${oldRetailPrice} → €${newRetailPrice} (margine: ${margine}%)`);

    res.json({
      success: true,
      message: `Prezzo aggiornato con successo`,
      data: {
        id: productId,
        name: product.name,
        retailPrice: newRetailPrice,
        wholesalePrice: wholesalePrice,
        oldRetailPrice: oldRetailPrice,
        margine: parseFloat(margine)
      }
    });
  } catch (error) {
    logger.error('❌ Errore aggiornamento prezzo prodotto:', error);
    res.status(500).json({
      success: false,
      error: 'Errore aggiornamento prezzo prodotto'
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
      'beauty',
      'health-personal-care',
      'natural-wellness',
      'tech-innovation',
      'tech'
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
router.post('/products/:id/featured', async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Verifica che il prodotto esista su PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Prodotto non trovato'
      });
    }

    // Toggle featured nel layout
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
