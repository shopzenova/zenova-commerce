// Servizio per calcolo costi spedizione con tariffe fisse intelligenti
const logger = require('../utils/logger');

class ShippingService {
  constructor() {
    this.shippingCache = new Map();
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minuti cache

    // Paesi supportati
    this.supportedCountries = [
      'AT', 'BE', 'BG', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
      'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'NL', 'PL',
      'PT', 'RO', 'SE', 'SI', 'SK'
    ];

    // Tariffe per paese a fasce di peso — tariffe reali AW Dropship
    // IT: tariffe agevolate (costo spalmato nel prezzo prodotto)
    // Tutti gli altri paesi: tariffe reali AW
    this.countryWeightRates = {
      'IT': [ { maxKg: 2, cost: 5.00 }, { maxKg: 5, cost: 7.00 }, { maxKg: 30, cost: 9.00 } ],
      'SK': [ { maxKg: 1, cost: 2.70 }, { maxKg: 2, cost: 2.80 }, { maxKg: 5, cost: 2.90 }, { maxKg: 15, cost: 3.00 }, { maxKg: 30, cost: 3.50 } ],
      'CZ': [ { maxKg: 1, cost: 3.90 }, { maxKg: 2, cost: 4.30 }, { maxKg: 5, cost: 4.85 }, { maxKg: 15, cost: 5.85 }, { maxKg: 30, cost: 6.20 } ],
      'AT': [ { maxKg: 1, cost: 5.10 }, { maxKg: 2, cost: 5.30 }, { maxKg: 5, cost: 5.70 }, { maxKg: 30, cost: 6.20 } ],
      'PL': [ { maxKg: 1, cost: 4.40 }, { maxKg: 2, cost: 4.80 }, { maxKg: 5, cost: 5.00 }, { maxKg: 10, cost: 6.00 }, { maxKg: 15, cost: 7.00 }, { maxKg: 30, cost: 7.50 } ],
      'HU': [ { maxKg: 1, cost: 4.50 }, { maxKg: 2, cost: 4.70 }, { maxKg: 5, cost: 4.80 }, { maxKg: 10, cost: 5.60 }, { maxKg: 30, cost: 6.20 } ],
      'DE': [ { maxKg: 1, cost: 5.85 }, { maxKg: 2, cost: 5.90 }, { maxKg: 3, cost: 7.55 }, { maxKg: 30, cost: 7.85 } ],
      'FR': [ { maxKg: 0.25, cost: 7.50 }, { maxKg: 2, cost: 7.80 }, { maxKg: 5, cost: 12.90 }, { maxKg: 30, cost: 13.20 } ],
      'BG': [ { maxKg: 1, cost: 5.30 }, { maxKg: 2, cost: 5.60 }, { maxKg: 5, cost: 6.35 }, { maxKg: 10, cost: 8.55 }, { maxKg: 15, cost: 9.70 }, { maxKg: 30, cost: 11.40 } ],
      'RO': [ { maxKg: 1, cost: 6.90 }, { maxKg: 2, cost: 7.00 }, { maxKg: 5, cost: 9.50 }, { maxKg: 10, cost: 11.60 }, { maxKg: 30, cost: 12.00 } ],
      'SI': [ { maxKg: 2, cost: 5.40 }, { maxKg: 5, cost: 5.50 }, { maxKg: 10, cost: 6.56 }, { maxKg: 15, cost: 6.80 }, { maxKg: 30, cost: 8.20 } ],
      'ES': [ { maxKg: 2, cost: 7.85 }, { maxKg: 5, cost: 8.20 }, { maxKg: 10, cost: 9.90 }, { maxKg: 15, cost: 10.80 }, { maxKg: 30, cost: 15.00 } ],
      'BE': [ { maxKg: 1, cost: 6.00 }, { maxKg: 2, cost: 6.30 }, { maxKg: 5, cost: 10.70 }, { maxKg: 30, cost: 11.00 } ],
      'LU': [ { maxKg: 2, cost: 6.70 }, { maxKg: 5, cost: 10.50 }, { maxKg: 30, cost: 11.00 } ],
      'NL': [ { maxKg: 2, cost: 6.70 }, { maxKg: 5, cost: 10.50 }, { maxKg: 30, cost: 11.00 } ],
      'DK': [ { maxKg: 2, cost: 6.50 }, { maxKg: 5, cost: 10.65 }, { maxKg: 30, cost: 10.95 } ],
      'HR': [ { maxKg: 1, cost: 4.90 }, { maxKg: 2, cost: 5.80 }, { maxKg: 5, cost: 5.95 }, { maxKg: 10, cost: 6.30 }, { maxKg: 30, cost: 6.90 } ],
      'EE': [ { maxKg: 2, cost: 8.60 }, { maxKg: 5, cost: 9.40 }, { maxKg: 10, cost: 11.90 }, { maxKg: 15, cost: 12.70 }, { maxKg: 30, cost: 14.30 } ],
      'FI': [ { maxKg: 2, cost: 11.45 }, { maxKg: 5, cost: 16.85 }, { maxKg: 30, cost: 17.20 } ],
      'SE': [ { maxKg: 2, cost: 9.60 }, { maxKg: 5, cost: 15.10 }, { maxKg: 10, cost: 16.30 }, { maxKg: 30, cost: 17.00 } ],
      'IE': [ { maxKg: 1, cost: 10.70 }, { maxKg: 2, cost: 10.80 }, { maxKg: 5, cost: 14.60 }, { maxKg: 30, cost: 16.10 } ],
      'LT': [ { maxKg: 2, cost: 6.30 }, { maxKg: 5, cost: 6.80 }, { maxKg: 10, cost: 8.40 }, { maxKg: 30, cost: 9.50 } ],
      'LV': [ { maxKg: 2, cost: 6.30 }, { maxKg: 5, cost: 7.50 }, { maxKg: 10, cost: 8.20 }, { maxKg: 15, cost: 8.90 }, { maxKg: 30, cost: 12.00 } ],
      'PT': [ { maxKg: 2, cost: 7.80 }, { maxKg: 5, cost: 8.20 }, { maxKg: 10, cost: 10.90 }, { maxKg: 15, cost: 11.70 }, { maxKg: 30, cost: 13.90 } ],
      'GR': [ { maxKg: 1, cost: 6.10 }, { maxKg: 2, cost: 6.80 }, { maxKg: 5, cost: 9.15 }, { maxKg: 10, cost: 13.30 }, { maxKg: 15, cost: 18.35 }, { maxKg: 30, cost: 22.99 } ],
    };

    // Compatibilità: mantieni riferimento per codice esistente
    this.shippingRates = {};
    this.italyWeightRates = this.countryWeightRates['IT'];

    logger.info('✅ ShippingService inizializzato (Tariffe fisse intelligenti)');
  }

  /**
   * Calcola costo spedizione per un ordine
   * @param {Array} products - Array di {reference, quantity}
   * @param {Object} destination - {country, postcode}
   * @param {Number} orderTotal - Totale ordine (opzionale, per spedizione gratis)
   * @returns {Object} - {success, cost, carrier, isFree}
   */
  async calculateShippingCost(products, destination, orderTotal = 0, totalWeightKg = null) {
    const countryCode = destination.country.toUpperCase();

    // Verifica paese supportato
    if (!this.supportedCountries.includes(countryCode)) {
      logger.warn(`⚠️  Paese ${countryCode} non supportato`);
      return {
        success: false,
        error: `Spedizione non disponibile per ${countryCode}`,
        supportedCountries: this.supportedCountries
      };
    }

    try {
      const tiers = this.countryWeightRates[countryCode];

      if (!tiers) {
        logger.warn(`⚠️  Tariffe non trovate per ${countryCode}, uso default EU`);
        return {
          success: true,
          cost: 14.90,
          carrier: 'Standard',
          country: countryCode,
          isFree: false,
          zone: 'EU Default'
        };
      }

      // Usa peso passato o default 0.5kg
      const weightKg = totalWeightKg !== null ? totalWeightKg : 0.5;
      const tier = tiers.find(t => weightKg <= t.maxKg) || tiers[tiers.length - 1];
      const shippingCost = tier.cost;

      logger.info(`🚚 Spedizione ${countryCode}: peso ${weightKg.toFixed(2)} kg → fascia ≤${tier.maxKg}kg → €${shippingCost}`);

      return {
        success: true,
        cost: shippingCost,
        carrier: 'Standard',
        country: countryCode,
        isFree: false,
        weightKg: weightKg,
        productsCount: products ? products.length : 0
      };

    } catch (error) {
      logger.error(`❌ Errore calcolo spedizione per ${countryCode}:`, error.message);

      return {
        success: false,
        error: error.message,
        country: countryCode
      };
    }
  }

  /**
   * Ottieni info tariffa per un paese
   */
  getShippingRate(countryCode) {
    return this.shippingRates[countryCode.toUpperCase()] || null;
  }

  /**
   * Ottieni lista paesi supportati
   */
  getSupportedCountries() {
    return this.supportedCountries;
  }

  /**
   * Pulisci cache
   */
  clearCache() {
    this.shippingCache.clear();
    logger.info('🧹 Cache tariffe pulita');
  }
}

module.exports = new ShippingService();
