/**
 * Configurazione Sincronizzazione Automatica
 * Beauty + Health & Personal Care da BigBuy
 */

// ============================================================================
// CATEGORIE BIGBUY DA SINCRONIZZARE
// ============================================================================

const BIGBUY_CATEGORIES = {
  // BEAUTY - 7 categorie principali
  beauty: {
    categoryIds: ['2507', '2508', '2509', '2510', '2527', '2547', '2555'],
    zenovaCategory: 'beauty',
    enabled: true
  },

  // HEALTH & PERSONAL CARE - 4 categorie principali
  health: {
    categoryIds: ['2501', '2502', '2520', '2540'],
    zenovaCategory: 'health-personal-care',
    enabled: true
  }
};

// ============================================================================
// FILTRI DI QUALITÀ
// ============================================================================

const QUALITY_FILTERS = {
  // Stock minimo richiesto
  minStock: 1,

  // Prezzo minimo (evita prodotti troppo economici/di bassa qualità)
  minPrice: 2.00,

  // Prezzo massimo (evita prodotti troppo costosi)
  maxPrice: 500.00,

  // Immagini richieste
  requireImages: true,
  minImages: 1,

  // Descrizione richiesta
  requireDescription: true,
  minDescriptionLength: 50,

  // Brand richiesto (evita prodotti senza brand)
  requireBrand: false, // Opzionale per ora

  // EAN richiesto
  requireEAN: false, // Opzionale

  // Filtra prodotti con parole blacklist nel nome
  blacklistKeywords: [
    // Prodotti non Zenova
    'ebook', 'e-book', 'libro digitale',
    'giocattolo', 'peluche',
    'abbigliamento generico',
    // Aggiungi altre blacklist se necessario
  ]
};

// ============================================================================
// LIMITI DI SINCRONIZZAZIONE
// ============================================================================

const SYNC_LIMITS = {
  // Max prodotti nuovi per categoria per sincronizzazione
  maxNewProductsPerCategory: 50,

  // Max prodotti nuovi totali per sincronizzazione
  maxNewProductsTotal: 100,

  // Intervallo minimo tra sincronizzazioni (in ore)
  minSyncIntervalHours: 24,

  // Priorità sincronizzazione (ordine)
  syncPriority: ['beauty', 'health']
};

// ============================================================================
// FUNZIONE DI VALIDAZIONE PRODOTTO
// ============================================================================

/**
 * Verifica se un prodotto BigBuy soddisfa i criteri di qualità
 * @param {Object} product - Prodotto BigBuy
 * @returns {Object} { valid: boolean, reason: string }
 */
function isValidProduct(product) {
  // 1. Controlla stock
  if (product.stock < QUALITY_FILTERS.minStock) {
    return { valid: false, reason: 'Stock insufficiente' };
  }

  // 2. Controlla prezzo
  const price = parseFloat(product.price || product.retailPrice || 0);
  if (price < QUALITY_FILTERS.minPrice) {
    return { valid: false, reason: 'Prezzo troppo basso' };
  }
  if (price > QUALITY_FILTERS.maxPrice) {
    return { valid: false, reason: 'Prezzo troppo alto' };
  }

  // 3. Controlla immagini
  if (QUALITY_FILTERS.requireImages) {
    const images = product.images || [];
    if (images.length < QUALITY_FILTERS.minImages) {
      return { valid: false, reason: 'Immagini mancanti' };
    }
  }

  // 4. Controlla descrizione
  if (QUALITY_FILTERS.requireDescription) {
    const desc = product.description || '';
    if (desc.length < QUALITY_FILTERS.minDescriptionLength) {
      return { valid: false, reason: 'Descrizione insufficiente' };
    }
  }

  // 5. Controlla brand (se richiesto)
  if (QUALITY_FILTERS.requireBrand && !product.brand) {
    return { valid: false, reason: 'Brand mancante' };
  }

  // 6. Controlla blacklist keywords
  const productText = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  for (const keyword of QUALITY_FILTERS.blacklistKeywords) {
    if (productText.includes(keyword.toLowerCase())) {
      return { valid: false, reason: `Keyword blacklist: ${keyword}` };
    }
  }

  // ✅ Prodotto valido
  return { valid: true, reason: 'OK' };
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  BIGBUY_CATEGORIES,
  QUALITY_FILTERS,
  SYNC_LIMITS,
  isValidProduct
};
