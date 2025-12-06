/**
 * Servizio di Sincronizzazione Automatica
 * Beauty + Health & Personal Care da BigBuy
 */

const fs = require('fs');
const path = require('path');
const logger = require('winston');
const bigbuyClient = require('../integrations/BigBuyClient');
const { BIGBUY_CATEGORIES, QUALITY_FILTERS, SYNC_LIMITS, isValidProduct } = require('../../config/auto-sync-config');
const { categorizeProduct, getProductSubcategory } = require('../../config/category-mapping');

// Path del file prodotti
const PRODUCTS_FILE = path.join(__dirname, '../../../top-100-products.json');

// ============================================================================
// SINCRONIZZAZIONE AUTOMATICA
// ============================================================================

/**
 * Esegue la sincronizzazione automatica di Beauty + Health
 * @param {Object} options - Opzioni di sincronizzazione
 * @returns {Promise<Object>} Risultato sincronizzazione
 */
async function autoSync(options = {}) {
  const startTime = Date.now();
  const result = {
    success: false,
    timestamp: new Date().toISOString(),
    stats: {
      beauty: { checked: 0, added: 0, updated: 0, skipped: 0 },
      health: { checked: 0, added: 0, updated: 0, skipped: 0 }
    },
    errors: [],
    duration: 0
  };

  try {
    logger.info('🔄 Avvio sincronizzazione automatica Beauty + Health');

    // Carica prodotti esistenti
    const existingProducts = loadProducts();
    const existingIds = new Set(existingProducts.map(p => p.id));

    logger.info(`📦 Prodotti esistenti: ${existingProducts.length}`);

    // Sincronizza Beauty
    if (BIGBUY_CATEGORIES.beauty.enabled) {
      logger.info('💄 Sincronizzazione BEAUTY...');
      const beautyResult = await syncCategory('beauty', existingProducts, existingIds);
      result.stats.beauty = beautyResult;
    }

    // Sincronizza Health
    if (BIGBUY_CATEGORIES.health.enabled) {
      logger.info('🏥 Sincronizzazione HEALTH & PERSONAL CARE...');
      const healthResult = await syncCategory('health', existingProducts, existingIds);
      result.stats.health = healthResult;
    }

    // Salva prodotti aggiornati
    saveProducts(existingProducts);

    result.success = true;
    result.duration = Math.round((Date.now() - startTime) / 1000);

    logger.info(`✅ Sincronizzazione completata in ${result.duration}s`);
    logger.info(`📊 Beauty: +${result.stats.beauty.added} nuovi, ~${result.stats.beauty.updated} aggiornati`);
    logger.info(`📊 Health: +${result.stats.health.added} nuovi, ~${result.stats.health.updated} aggiornati`);

    return result;

  } catch (error) {
    logger.error('❌ Errore sincronizzazione automatica:', error);
    result.errors.push(error.message);
    result.duration = Math.round((Date.now() - startTime) / 1000);
    return result;
  }
}

// ============================================================================
// SINCRONIZZA SINGOLA CATEGORIA
// ============================================================================

/**
 * Sincronizza una singola categoria (beauty o health)
 * @param {string} categoryKey - 'beauty' o 'health'
 * @param {Array} existingProducts - Array prodotti esistenti (modificato in-place)
 * @param {Set} existingIds - Set di ID prodotti esistenti
 * @returns {Promise<Object>} Statistiche sincronizzazione
 */
async function syncCategory(categoryKey, existingProducts, existingIds) {
  const stats = { checked: 0, added: 0, updated: 0, skipped: 0 };
  const config = BIGBUY_CATEGORIES[categoryKey];

  if (!config || !config.enabled) {
    logger.warn(`⚠️ Categoria ${categoryKey} non configurata o disabilitata`);
    return stats;
  }

  try {
    // Per ogni categoria BigBuy
    for (const bigbuyCatId of config.categoryIds) {
      logger.info(`  📁 Scarico prodotti da categoria BigBuy ${bigbuyCatId}...`);

      // Scarica prodotti dalla categoria BigBuy
      // NOTA: Implementazione semplificata - in produzione usare API BigBuy reali
      const products = await fetchProductsFromBigBuyCategory(bigbuyCatId);

      logger.info(`  ✅ Trovati ${products.length} prodotti in categoria ${bigbuyCatId}`);

      // Filtra e processa prodotti
      let addedCount = 0;
      for (const product of products) {
        stats.checked++;

        // Controlla se abbiamo raggiunto il limite
        if (stats.added >= SYNC_LIMITS.maxNewProductsPerCategory) {
          logger.info(`  ⚠️ Raggiunto limite di ${SYNC_LIMITS.maxNewProductsPerCategory} nuovi prodotti per categoria`);
          break;
        }

        // Valida prodotto
        const validation = isValidProduct(product);
        if (!validation.valid) {
          stats.skipped++;
          // Log del motivo dello skip (solo i primi 5 per non spammare)
          if (stats.skipped <= 5) {
            logger.info(`  ⚠️ Prodotto ${product.id || product.sku} saltato: ${validation.reason}`);
          }
          continue;
        }

        const productId = product.id || product.sku;

        // Prodotto già esistente: aggiorna
        if (existingIds.has(productId)) {
          updateExistingProduct(existingProducts, product);
          stats.updated++;
        }
        // Prodotto nuovo: aggiungi
        else {
          const newProduct = formatProductForZenova(product, config.zenovaCategory);
          existingProducts.push(newProduct);
          existingIds.add(productId);
          stats.added++;
          addedCount++;

          if (addedCount % 10 === 0) {
            logger.info(`  📦 ${addedCount} nuovi prodotti aggiunti...`);
          }
        }
      }

      logger.info(`  ✅ Categoria ${bigbuyCatId}: +${addedCount} prodotti`);
    }

    return stats;

  } catch (error) {
    logger.error(`❌ Errore sincronizzazione categoria ${categoryKey}:`, error);
    return stats;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Scarica prodotti da una categoria BigBuy usando API reale
 */
async function fetchProductsFromBigBuyCategory(categoryId) {
  try {
    logger.info(`  🔽 Scarico prodotti BigBuy categoria ${categoryId}...`);

    // Usa API BigBuy reale per scaricare prodotti dalla categoria
    const products = await bigbuyClient.getProductsByCategory(categoryId);

    if (!products || !Array.isArray(products)) {
      logger.warn(`  ⚠️ Nessun prodotto trovato per categoria ${categoryId}`);
      return [];
    }

    logger.info(`  ✅ Scaricati ${products.length} prodotti dalla categoria ${categoryId}`);
    return products;

  } catch (error) {
    logger.error(`  ❌ Errore scaricamento prodotti categoria ${categoryId}:`, error.message);
    // Non lanciare l'errore, continua con la prossima categoria
    return [];
  }
}

/**
 * Formatta prodotto BigBuy per catalogo Zenova
 */
function formatProductForZenova(product, zenovaCategory) {
  // Determina sottocategoria
  const subcategory = getProductSubcategory(product, zenovaCategory);

  return {
    id: product.id || product.sku,
    name: product.name || `Prodotto ${product.id}`,
    description: product.description || '',
    brand: product.brand || product.manufacturer || '',
    category: product.category || '',
    subcategory: product.subcategory || '',
    zenovaCategory: zenovaCategory,
    zenovaSubcategory: subcategory,
    price: parseFloat(product.retailPrice || product.price || 0),
    retailPrice: parseFloat(product.retailPrice || product.price || 0),
    wholesalePrice: parseFloat(product.wholesalePrice || product.price || 0),
    stock: parseInt(product.stock || product.quantity || 0),
    images: product.images || [],
    image: (product.images && product.images[0]) || product.image || '',
    ean: product.ean || '',
    weight: parseFloat(product.weight || 0),
    dimensions: product.dimensions || { width: 0, height: 0, depth: 0 },
    active: true,
    lastSync: new Date().toISOString()
  };
}

/**
 * Aggiorna prodotto esistente con nuovi dati
 */
function updateExistingProduct(products, newData) {
  const index = products.findIndex(p => p.id === (newData.id || newData.sku));
  if (index !== -1) {
    // Aggiorna solo campi che cambiano (prezzo, stock, ecc.)
    products[index].price = parseFloat(newData.retailPrice || newData.price || products[index].price);
    products[index].retailPrice = parseFloat(newData.retailPrice || newData.price || products[index].retailPrice);
    products[index].wholesalePrice = parseFloat(newData.wholesalePrice || products[index].wholesalePrice);
    products[index].stock = parseInt(newData.stock || newData.quantity || products[index].stock);
    products[index].lastSync = new Date().toISOString();
  }
}

/**
 * Carica prodotti da file JSON
 */
function loadProducts() {
  try {
    const rawData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    logger.error('❌ Errore caricamento prodotti:', error);
    return [];
  }
}

/**
 * Salva prodotti su file JSON
 */
function saveProducts(products) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    logger.info(`✅ Salvati ${products.length} prodotti`);
  } catch (error) {
    logger.error('❌ Errore salvataggio prodotti:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  autoSync
};
