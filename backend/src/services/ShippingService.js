// Servizio per calcolo costi spedizione con tariffe fisse intelligenti
const logger = require('../utils/logger');

class ShippingService {
  constructor() {
    this.shippingCache = new Map();
    this.CACHE_TTL = 30 * 60 * 1000; // 30 minuti cache

    // Paesi supportati
    this.supportedCountries = [
      'AT', 'AU', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE',
      'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT',
      'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI',
      'SK', 'US'
    ];

    // Tariffe per paese (costo fisso - spedizione gratis DISATTIVATA per ora)
    // NOTA: freeAbove impostato a 99999 = spedizione sempre a pagamento
    this.shippingRates = {
      // Zone 1: Italia (priorità)
      'IT': { cost: 9.90, freeAbove: 99999, zone: 'Italia' },

      // Zone 2: Spagna + Paesi vicini EU
      'ES': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 1' },
      'PT': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 1' },
      'FR': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 1' },

      // Zone 3: Europa Centrale
      'DE': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'AT': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'BE': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'NL': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'LU': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 2' },

      // Zone 4: Europa Est
      'PL': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'CZ': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'SK': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'HU': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'SI': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'HR': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'RO': { cost: 18.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'BG': { cost: 18.90, freeAbove: 99999, zone: 'EU Zone 3' },

      // Zone 5: Europa Nord/Sud
      'GR': { cost: 19.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'CY': { cost: 22.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'MT': { cost: 22.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'DK': { cost: 16.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'SE': { cost: 18.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'FI': { cost: 19.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'NO': { cost: 22.90, freeAbove: 99999, zone: 'Extra EU' },
      'CH': { cost: 22.90, freeAbove: 99999, zone: 'Extra EU' },

      // Zone 6: Baltico
      'EE': { cost: 19.90, freeAbove: 99999, zone: 'EU Baltic' },
      'LV': { cost: 19.90, freeAbove: 99999, zone: 'EU Baltic' },
      'LT': { cost: 19.90, freeAbove: 99999, zone: 'EU Baltic' },
      'IE': { cost: 18.90, freeAbove: 99999, zone: 'EU West' },

      // Zone 7: UK
      'GB': { cost: 19.90, freeAbove: 99999, zone: 'UK' },

      // Zone 8: Extra EU
      'US': { cost: 29.90, freeAbove: 99999, zone: 'USA' },
      'AU': { cost: 34.90, freeAbove: 99999, zone: 'Australia' }
    };

    logger.info('✅ ShippingService inizializzato (Tariffe fisse intelligenti)');
  }

  /**
   * Calcola costo spedizione per un ordine
   * @param {Array} products - Array di {reference, quantity}
   * @param {Object} destination - {country, postcode}
   * @param {Number} orderTotal - Totale ordine (opzionale, per spedizione gratis)
   * @returns {Object} - {success, cost, carrier, isFree}
   */
  async calculateShippingCost(products, destination, orderTotal = 0) {
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
      // Ottieni tariffa per il paese
      const rate = this.shippingRates[countryCode];

      if (!rate) {
        // Paese supportato ma senza tariffa specifica, usa default EU
        logger.warn(`⚠️  Tariffa non trovata per ${countryCode}, uso default EU`);
        return {
          success: true,
          cost: 14.90,
          carrier: 'Standard',
          country: countryCode,
          isFree: false,
          zone: 'EU Default'
        };
      }

      // Calcola totale carrello se non fornito
      if (!orderTotal && products && products.length > 0) {
        // Se products ha field price, calcolalo
        orderTotal = products.reduce((sum, p) => {
          const price = p.price || 0;
          const qty = p.quantity || 1;
          return sum + (price * qty);
        }, 0);
      }

      // Spedizione gratis sopra soglia?
      const isFree = orderTotal >= rate.freeAbove;
      const shippingCost = isFree ? 0 : rate.cost;

      logger.info(`🚚 Spedizione ${countryCode} (${rate.zone}): €${shippingCost} ${isFree ? '(GRATIS! Ordine > €' + rate.freeAbove + ')' : ''}`);

      const result = {
        success: true,
        cost: shippingCost,
        carrier: 'Standard',
        country: countryCode,
        zone: rate.zone,
        isFree: isFree,
        freeAbove: rate.freeAbove,
        orderTotal: orderTotal,
        productsCount: products ? products.length : 0
      };

      return result;

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
