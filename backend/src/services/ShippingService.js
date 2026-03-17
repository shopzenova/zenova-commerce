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

    // Tariffe Italia per fascia di peso
    this.italyWeightRates = [
      { maxKg: 2,  cost: 5.00 },
      { maxKg: 5,  cost: 7.00 },
      { maxKg: 30, cost: 9.00 }
    ];

    // Tariffe per paese (costo fisso - spedizione gratis DISATTIVATA per ora)
    // NOTA: freeAbove impostato a 99999 = spedizione sempre a pagamento
    this.shippingRates = {
      // Zone 1: Italia — tariffe a fasce di peso (vedi italyWeightRates)
      'IT': { cost: 5.00, freeAbove: 99999, zone: 'Italia' },

      // Zone 2: Spagna + Paesi vicini EU (era 12.90)
      'ES': { cost: 8.90, freeAbove: 99999, zone: 'EU Zone 1' },
      'PT': { cost: 8.90, freeAbove: 99999, zone: 'EU Zone 1' },
      'FR': { cost: 8.90, freeAbove: 99999, zone: 'EU Zone 1' },

      // Zone 3: Europa Centrale (era 14.90)
      'DE': { cost: 10.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'AT': { cost: 10.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'BE': { cost: 10.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'NL': { cost: 10.90, freeAbove: 99999, zone: 'EU Zone 2' },
      'LU': { cost: 10.90, freeAbove: 99999, zone: 'EU Zone 2' },

      // Zone 4: Europa Est (era 16.90/18.90)
      'PL': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'CZ': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'SK': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'HU': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'SI': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'HR': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'RO': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 3' },
      'BG': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 3' },

      // Zone 5: Europa Nord/Sud (era 16.90-22.90)
      'GR': { cost: 15.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'CY': { cost: 18.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'MT': { cost: 18.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'DK': { cost: 12.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'SE': { cost: 14.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'FI': { cost: 15.90, freeAbove: 99999, zone: 'EU Zone 4' },
      'NO': { cost: 18.90, freeAbove: 99999, zone: 'Extra EU' },
      'CH': { cost: 18.90, freeAbove: 99999, zone: 'Extra EU' },

      // Zone 6: Baltico (era 18.90-19.90)
      'EE': { cost: 15.90, freeAbove: 99999, zone: 'EU Baltic' },
      'LV': { cost: 15.90, freeAbove: 99999, zone: 'EU Baltic' },
      'LT': { cost: 15.90, freeAbove: 99999, zone: 'EU Baltic' },
      'IE': { cost: 14.90, freeAbove: 99999, zone: 'EU West' },

      // Zone 7: UK (era 19.90)
      'GB': { cost: 15.90, freeAbove: 99999, zone: 'UK' },

      // Zone 8: Extra EU (era 29.90/34.90)
      'US': { cost: 25.90, freeAbove: 99999, zone: 'USA' },
      'AU': { cost: 30.90, freeAbove: 99999, zone: 'Australia' }
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

      // Per l'Italia: tariffa a fasce di peso
      let shippingCost = rate.cost;
      if (countryCode === 'IT' && totalWeightKg !== null) {
        const tier = this.italyWeightRates.find(t => totalWeightKg <= t.maxKg) || this.italyWeightRates[this.italyWeightRates.length - 1];
        shippingCost = tier.cost;
        logger.info(`⚖️ IT peso ${totalWeightKg.toFixed(2)} kg → fascia ≤${tier.maxKg}kg → €${shippingCost}`);
      }

      // Spedizione gratis sopra soglia?
      const isFree = orderTotal >= rate.freeAbove;
      if (isFree) shippingCost = 0;

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
