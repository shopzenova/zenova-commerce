// Servizio per calcolo costi spedizione usando CSV BigBuy
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const logger = require('../utils/logger');

class ShippingService {
  constructor() {
    this.shippingCache = new Map(); // Cache in memoria per velocità
    this.csvPath = path.join(__dirname, '../../bigbuy-data');

    // Paesi supportati da BigBuy (dai file CSV scaricati)
    this.supportedCountries = [
      'AT', 'AU', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE',
      'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT',
      'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI',
      'SK', 'US'
    ];

    logger.info('✅ ShippingService inizializzato');
  }

  /**
   * Carica tariffe da CSV per un paese specifico
   */
  async loadShippingRates(countryCode) {
    const cacheKey = `rates_${countryCode}`;

    // Controlla cache
    if (this.shippingCache.has(cacheKey)) {
      logger.info(`📦 Cache HIT per paese ${countryCode}`);
      return this.shippingCache.get(cacheKey);
    }

    const fileName = `reference_shipping_cost_${countryCode.toLowerCase()}.csv`;
    const filePath = path.join(this.csvPath, fileName);

    // Verifica esistenza file
    if (!fs.existsSync(filePath)) {
      logger.warn(`⚠️  File tariffe non trovato per ${countryCode}: ${filePath}`);
      return null;
    }

    logger.info(`📂 Caricamento tariffe da ${fileName}...`);

    return new Promise((resolve, reject) => {
      const rates = new Map(); // Map: productId -> { cost, carrier, service }

      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          const productRef = row['﻿reference'] || row['reference'];
          const cost = parseFloat(row.cost);
          const carrier = row.carrier;
          const service = row.carrier_service;

          if (productRef && !isNaN(cost)) {
            // Se prodotto ha già una tariffa, tiene la più economica
            if (!rates.has(productRef) || rates.get(productRef).cost > cost) {
              rates.set(productRef, { cost, carrier, service });
            }
          }
        })
        .on('end', () => {
          logger.info(`✅ Caricate ${rates.size} tariffe per ${countryCode}`);

          // Salva in cache
          this.shippingCache.set(cacheKey, rates);

          resolve(rates);
        })
        .on('error', (error) => {
          logger.error(`❌ Errore caricamento CSV ${countryCode}:`, error);
          reject(error);
        });
    });
  }

  /**
   * Calcola costo spedizione per un ordine
   * @param {Array} products - Array di {id, quantity}
   * @param {Object} destination - {country, postcode}
   * @returns {Object} - {cost, carrier, breakdown, error}
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

    try {
      // Carica tariffe per il paese
      const rates = await this.loadShippingRates(countryCode);

      if (!rates) {
        throw new Error(`Tariffe non disponibili per ${countryCode}`);
      }

      let totalCost = 0;
      const breakdown = [];
      const notFoundProducts = [];

      // Calcola costo per ogni prodotto
      for (const product of products) {
        const productRef = product.reference || product.id;
        const quantity = product.quantity || 1;

        if (rates.has(productRef)) {
          const rate = rates.get(productRef);
          const productCost = rate.cost * quantity;

          totalCost += productCost;

          breakdown.push({
            productId: productRef,
            quantity,
            unitCost: rate.cost,
            totalCost: productCost,
            carrier: rate.carrier,
            service: rate.service
          });

          logger.info(`  ✓ ${productRef} (x${quantity}): €${productCost.toFixed(2)} (${rate.carrier})`);
        } else {
          notFoundProducts.push(productRef);
          logger.warn(`  ⚠️  Tariffa non trovata per prodotto: ${productRef}`);
        }
      }

      // Se alcuni prodotti non hanno tariffa, usa media del paese
      if (notFoundProducts.length > 0) {
        logger.warn(`⚠️  ${notFoundProducts.length} prodotti senza tariffa, uso media paese`);

        // Calcola costo medio dal CSV
        const allCosts = Array.from(rates.values()).map(r => r.cost);
        const avgCost = allCosts.reduce((a, b) => a + b, 0) / allCosts.length;

        notFoundProducts.forEach(productRef => {
          const product = products.find(p => (p.reference || p.id) === productRef);
          const quantity = product?.quantity || 1;
          const productCost = avgCost * quantity;

          totalCost += productCost;

          breakdown.push({
            productId: productRef,
            quantity,
            unitCost: avgCost,
            totalCost: productCost,
            carrier: 'Standard',
            service: '2-5',
            estimated: true
          });
        });
      }

      // Trova corriere più comune
      const carriers = breakdown.map(b => b.carrier);
      const mainCarrier = carriers.sort((a, b) =>
        carriers.filter(c => c === a).length - carriers.filter(c => c === b).length
      ).pop();

      logger.info(`💰 Costo spedizione totale per ${countryCode}: €${totalCost.toFixed(2)} (${mainCarrier})`);

      return {
        success: true,
        cost: parseFloat(totalCost.toFixed(2)),
        carrier: mainCarrier,
        country: countryCode,
        breakdown,
        productsCount: products.length,
        notFoundCount: notFoundProducts.length
      };

    } catch (error) {
      logger.error(`❌ Errore calcolo spedizione per ${countryCode}:`, error);

      return {
        success: false,
        error: error.message,
        country: countryCode
      };
    }
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
