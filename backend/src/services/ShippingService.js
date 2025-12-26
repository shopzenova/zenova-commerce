// Servizio per calcolo costi spedizione usando API BigBuy (no CSV!)
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');

class ShippingService {
  constructor() {
    this.shippingCache = new Map(); // Cache in memoria per velocità
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minuti cache

    // Paesi supportati da BigBuy
    this.supportedCountries = [
      'AT', 'AU', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE',
      'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT',
      'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI',
      'SK', 'US'
    ];

    logger.info('✅ ShippingService inizializzato (API BigBuy)');
  }

  /**
   * Calcola costo spedizione per un ordine usando API BigBuy
   * @param {Array} products - Array di {reference, quantity}
   * @param {Object} destination - {country, postcode}
   * @returns {Object} - {success, cost, carrier, breakdown}
   */
  async calculateShippingCost(products, destination) {
    const countryCode = destination.country.toUpperCase();

    // Verifica paese supportato
    if (!this.supportedCountries.includes(countryCode)) {
      logger.warn(`⚠️  Paese ${countryCode} non supportato da BigBuy`);
      return {
        success: false,
        error: `Spedizione non disponibile per ${countryCode}`,
        supportedCountries: this.supportedCountries
      };
    }

    // Controlla cache
    const cacheKey = `shipping_${countryCode}_${JSON.stringify(products)}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      logger.info(`📦 Cache HIT per spedizione ${countryCode}`);
      return cached;
    }

    try {
      logger.info(`🚚 Calcolo spedizione per ${products.length} prodotti verso ${countryCode}`);

      // Prepara dati prodotti per API BigBuy
      const bigbuyProducts = products.map(p => ({
        reference: p.reference || p.id,
        quantity: p.quantity || 1
      }));

      // Chiama API BigBuy per calcolo spedizione
      const bigbuyResponse = await bigbuy.calculateShippingCost(bigbuyProducts, {
        country: countryCode,
        postcode: destination.postcode || ''
      });

      logger.info(`📦 Risposta BigBuy shipping:`, bigbuyResponse);

      // Gestisci risposta BigBuy
      if (!bigbuyResponse || !bigbuyResponse.shippingCosts || bigbuyResponse.shippingCosts.length === 0) {
        throw new Error('Nessuna opzione di spedizione disponibile da BigBuy');
      }

      // Prendi l'opzione più economica
      const cheapestOption = bigbuyResponse.shippingCosts.reduce((min, option) =>
        option.cost < min.cost ? option : min
      );

      const result = {
        success: true,
        cost: parseFloat(cheapestOption.cost.toFixed(2)),
        carrier: cheapestOption.carrierName || 'Standard',
        carrierId: cheapestOption.carrierId,
        country: countryCode,
        breakdown: bigbuyResponse.shippingCosts.map(option => ({
          carrier: option.carrierName,
          cost: option.cost,
          carrierId: option.carrierId
        })),
        productsCount: products.length
      };

      logger.info(`✅ Costo spedizione calcolato: €${result.cost} (${result.carrier})`);

      // Salva in cache
      this._setCache(cacheKey, result);

      return result;

    } catch (error) {
      logger.error(`❌ Errore calcolo spedizione per ${countryCode}:`, error.message);

      // Fallback: costi fissi ragionevoli se API fallisce
      const fallbackCosts = {
        'IT': 9.90,
        'ES': 9.90,
        'FR': 12.90,
        'DE': 12.90,
        'AT': 14.90,
        'BE': 14.90,
        'NL': 14.90,
        'PT': 14.90,
        'GB': 16.90,
        'US': 24.90,
        'CH': 18.90
      };

      const fallbackCost = fallbackCosts[countryCode] || 14.90;

      logger.warn(`⚠️  Uso costo fallback per ${countryCode}: €${fallbackCost}`);

      return {
        success: true,
        cost: fallbackCost,
        carrier: 'Standard',
        country: countryCode,
        isFallback: true,
        error: error.message,
        productsCount: products.length
      };
    }
  }

  /**
   * Cache helpers
   */
  _getCacheKey(key) {
    return `cache_${key}`;
  }

  _getFromCache(key) {
    const cached = this.shippingCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.shippingCache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.shippingCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Ottieni lista paesi supportati
   */
  getSupportedCountries() {
    return this.supportedCountries;
  }

  /**
   * Pulisci cache (utile per aggiornamenti)
   */
  clearCache() {
    this.shippingCache.clear();
    logger.info('🧹 Cache tariffe pulita');
  }
}

module.exports = new ShippingService();
