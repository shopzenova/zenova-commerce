const axios = require('axios');
const logger = require('../utils/logger');

class BigBuyClient {
  constructor() {
    this.baseURL = process.env.BIGBUY_API_URL || 'https://api.bigbuy.eu';
    this.apiKey = process.env.BIGBUY_API_KEY;

    // Verifica se siamo in modalità mock
    this.isMockMode = !this.apiKey ||
                      this.apiKey === 'your_bigbuy_api_key_here' ||
                      this.apiKey === 'mock_key_for_development';

    if (this.isMockMode) {
      logger.warn('⚠️  BigBuy in MOCK MODE - usando dati finti');
    } else {
      logger.info('✅ BigBuy in REAL API MODE - usando API reali');
    }

    // Cache per ridurre chiamate API (24 ore - aggressivo per rispettare rate limits)
    this.cache = new Map();
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore

    // Rate limiting - ritardo tra richieste per evitare 429
    this.lastRequestTime = 0;
    this.MIN_REQUEST_DELAY = 3000; // 3 secondi tra ogni richiesta (aumentato)
    this.requestQueue = Promise.resolve();

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 90000 // 90 secondi timeout (BigBuy può essere lento)
    });
  }

  _getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info(`📦 Cache HIT: ${key}`);
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Rate limiting: ritarda la richiesta se necessario
  async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
      const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
      logger.info(`⏳ Rate limit: attendo ${waitTime}ms prima della prossima richiesta`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  // Esegue una richiesta con rate limiting automatico
  async _makeRequest(method, url, config = {}) {
    // Accoda la richiesta per eseguirla in sequenza
    return this.requestQueue = this.requestQueue.then(async () => {
      await this._waitForRateLimit();
      return this.client[method](url, config);
    });
  }

  // ===== PRODOTTI =====

  async getProducts(page = 1, pageSize = 10) { // Ridotto da 20 a 10 per risparmiare API calls
    if (this.isMockMode) {
      return this._getMockProducts(page, pageSize);
    }

    // Controlla cache
    const cacheKey = this._getCacheKey('getProducts', { page, pageSize });
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      logger.info(`🔄 Richiesta BigBuy: getProducts (page=${page}, pageSize=${pageSize})`);

      // Usa solo l'endpoint products.json (singola chiamata, più veloce!)
      const productsResponse = await this._makeRequest('get', '/rest/catalog/products.json', {
        params: { isoCode: 'it', page, pageSize }
      });

      const baseProducts = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      logger.info(`✅ BigBuy: Ricevuti ${baseProducts.length} prodotti`);

      if (baseProducts.length === 0) {
        this._setCache(cacheKey, []);
        return [];
      }

      // Arricchisci i prodotti con dati leggibili generati dai campi disponibili
      const enrichedProducts = baseProducts.map(product => this._enrichProduct(product));

      logger.info(`✅ BigBuy: ${enrichedProducts.length} prodotti pronti`);

      // Salva in cache
      this._setCache(cacheKey, enrichedProducts);

      return enrichedProducts;
    } catch (error) {
      logger.error('❌ Errore BigBuy getProducts:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // Se rate limit o errore auth, usa dati mock temporaneamente
      if (error.response?.status === 429 || error.response?.status === 401 || error.response?.status === 403) {
        logger.warn(`⚠️  BigBuy error ${error.response?.status} - uso dati MOCK temporanei`);
        return this._getMockProducts(page, pageSize);
      }
      // Per altri errori, usa comunque mock come fallback
      logger.warn('⚠️  Errore API BigBuy - uso dati MOCK come fallback');
      return this._getMockProducts(page, pageSize);
    }
  }

  // Arricchisce un prodotto BigBuy con dati leggibili
  _enrichProduct(product) {
    const productFilters = require('../../config/product-filters');

    // Genera nome leggibile dal SKU o usa ID
    const name = this._generateProductName(product);

    // Mappa category ID a nome leggibile
    const categoryName = productFilters.categoryMapping[product.category] || 'Wellness';

    // Genera descrizione base
    const description = `${name} - Codice: ${product.sku}`;

    // Usa immagine placeholder se non disponibile
    const images = this._getProductImages(product, categoryName);

    // Costruisci categorie array (frontend si aspetta questo formato)
    const categories = [{ id: product.category, name: categoryName }];

    return {
      ...product,
      name,
      description,
      categories,
      images
    };
  }

  // Genera nome prodotto leggibile
  _generateProductName(product) {
    // Se c'è un part number, usalo
    if (product.partNumber) {
      return product.partNumber.replace(/_/g, ' ').replace(/-/g, ' ');
    }
    // Altrimenti usa SKU formattato
    return `Prodotto ${product.sku}`;
  }

  // Ottiene immagini prodotto o placeholder
  _getProductImages(product, categoryName) {
    // Per ora usa placeholder basati sulla categoria
    const placeholders = {
      'Aromatherapy': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
      'Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
      'Fitness': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
      'Beauty': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop',
      'Lighting': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=600&fit=crop'
    };

    const placeholderUrl = placeholders[categoryName] || placeholders['Wellness'];

    return [{ url: placeholderUrl }];
  }

  async getProduct(productId) {
    if (this.isMockMode) {
      return this._getMockProduct(productId);
    }

    try {
      const response = await this.client.get(
        `/rest/catalog/product/${productId}.json`,
        { params: { isoCode: 'it' } }
      );
      return response.data;
    } catch (error) {
      logger.error(`Errore BigBuy getProduct ${productId}:`, error.message);
      throw error;
    }
  }

  async getProductsByCategory(categoryId, page = 1) {
    if (this.isMockMode) {
      return this._getMockProducts(page, 100);
    }

    try {
      const response = await this.client.get('/rest/catalog/products.json', {
        params: { isoCode: 'it', categoryId, page, pageSize: 100 }
      });
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getProductsByCategory:', error.message);
      throw error;
    }
  }

  // ===== STOCK =====

  async getProductStock(productId) {
    if (this.isMockMode) {
      return { productId, quantity: 100, available: true };
    }

    try {
      const response = await this.client.get(
        `/rest/catalog/productstock/${productId}.json`
      );
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getProductStock:', error.message);
      throw error;
    }
  }

  async checkMultipleStock(productIds) {
    if (this.isMockMode) {
      return {
        stocks: productIds.map(id => ({
          productId: id,
          quantity: 100,
          available: true
        }))
      };
    }

    try {
      const response = await this.client.post(
        '/rest/catalog/productsstock.json',
        { products: productIds }
      );
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy checkMultipleStock:', error.message);
      throw error;
    }
  }

  // ===== ORDINI =====

  async createOrder(orderData) {
    if (this.isMockMode) {
      logger.info('MOCK: Ordine creato', orderData);
      return {
        orderId: Math.floor(Math.random() * 1000000),
        orderReference: `BB-MOCK-${Date.now()}`,
        status: 'processing',
        total: orderData.products.reduce((sum, p) => sum + (p.price || 15) * p.quantity, 0),
        shippingCost: 5.50,
        createdAt: new Date().toISOString()
      };
    }

    try {
      const response = await this.client.post('/rest/order', orderData);
      logger.info(`BigBuy: Ordine creato ${response.data.orderId}`);
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy createOrder:', error.message);
      throw error;
    }
  }

  async getOrder(orderId) {
    if (this.isMockMode) {
      return {
        orderId,
        status: 'processing',
        createdAt: new Date().toISOString()
      };
    }

    try {
      const response = await this.client.get(`/rest/order/${orderId}`);
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getOrder:', error.message);
      throw error;
    }
  }

  async getOrderTracking(orderId) {
    if (this.isMockMode) {
      return {
        orderId,
        trackingNumber: `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}IT`,
        carrier: { id: 11, name: 'GLS Mock', trackingUrl: 'https://gls-group.eu' },
        shippedAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_transit'
      };
    }

    try {
      const response = await this.client.get(
        `/rest/order/${orderId}/delivery-note`
      );
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getOrderTracking:', error.message);
      throw error;
    }
  }

  // ===== CATEGORIE =====

  async getCategories() {
    if (this.isMockMode) {
      return {
        categories: [
          {
            id: 100,
            name: 'Home & Living',
            children: [
              { id: 456, name: 'Aromatherapy' },
              { id: 457, name: 'Wellness Tech' }
            ]
          }
        ]
      };
    }

    try {
      const response = await this.client.get('/rest/catalog/categories.json', {
        params: { isoCode: 'it' }
      });
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getCategories:', error.message);
      throw error;
    }
  }

  // ===== MOCK DATA (per sviluppo) =====

  _getMockProducts(page = 1, pageSize = 100) {
    const mockProducts = [
      { id: 1, sku: 'ZN-001', name: 'Olio Essenziale Lavanda', description: 'Olio essenziale puro di lavanda biologica. Perfetto per rilassamento e sonno.', retailPrice: 24.90, category: 456, categories: [{ id: 456, name: 'Aromatherapy' }], images: [{ url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop' }] },
      { id: 2, sku: 'ZN-002', name: 'Diffusore Ultrasonico', description: 'Diffusore elegante con luci LED. Silenzioso e efficace per ogni ambiente.', retailPrice: 49.90, categories: [{ id: 456, name: 'Aromatherapy' }], images: [{ url: 'https://images.unsplash.com/photo-1584993766449-a40e2ec95e99?w=600&h=600&fit=crop' }] },
      { id: 3, sku: 'ZN-003', name: 'Nebulizzatore Premium', description: 'Tecnologia avanzata per diffusione ottimale degli oli essenziali.', retailPrice: 89.90, categories: [{ id: 456, name: 'Aromatherapy' }], images: [{ url: 'https://images.unsplash.com/photo-1600428854537-7ea552fb4371?w=600&h=600&fit=crop' }] },
      { id: 4, sku: 'ZN-004', name: 'Candela Profumata Vaniglia', description: 'Candela in cera di soia naturale con fragranza di vaniglia e legno di sandalo.', retailPrice: 34.90, categories: [{ id: 457, name: 'Home Fragrance' }], images: [{ url: 'https://images.unsplash.com/photo-1602874801006-2c9a268d0d6e?w=600&h=600&fit=crop' }] },
      { id: 5, sku: 'ZN-005', name: 'Lampada di Sale Himalayano', description: 'Autentica lampada di sale con effetto ionizzante e luce calda.', retailPrice: 45.90, categories: [{ id: 457, name: 'Home Fragrance' }], images: [{ url: 'https://images.unsplash.com/photo-1578332617099-390b6a6e8b8b?w=600&h=600&fit=crop' }] },
      { id: 6, sku: 'ZN-006', name: 'Incensi Naturali Sandalo', description: 'Set di 50 bastoncini di incenso naturale al legno di sandalo.', retailPrice: 19.90, categories: [{ id: 457, name: 'Home Fragrance' }], images: [{ url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop' }] },
      { id: 7, sku: 'ZN-007', name: 'Tappetino Yoga Premium', description: 'Tappetino yoga ecologico in gomma naturale, antiscivolo e confortevole.', retailPrice: 54.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop' }] },
      { id: 8, sku: 'ZN-008', name: 'Cuscino Meditazione Zafu', description: 'Cuscino rotondo tradizionale per meditazione, imbottitura in grano saraceno.', retailPrice: 39.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=600&fit=crop' }] },
      { id: 9, sku: 'ZN-009', name: 'Massaggiatore Smart Cervicale', description: 'Massaggiatore intelligente con controllo app e funzione calore.', retailPrice: 79.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop' }] },
      { id: 10, sku: 'ZN-010', name: 'Lampada Smart RGB', description: 'Lampada Wi-Fi controllabile da app con 16 milioni di colori.', retailPrice: 64.90, categories: [{ id: 459, name: 'Smart Lighting' }], images: [{ url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=600&fit=crop' }] },
      { id: 11, sku: 'ZN-011', name: 'Lampada Sensoriale Aurora', description: 'Proiettore di luci aurora boreale con suoni rilassanti integrati.', retailPrice: 99.90, categories: [{ id: 459, name: 'Smart Lighting' }], images: [{ url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop' }] },
      { id: 12, sku: 'ZN-012', name: 'Campana Tibetana Artigianale', description: 'Campana tibetana fatta a mano con batacchio in legno incluso.', retailPrice: 69.90, categories: [{ id: 460, name: 'Sound Therapy' }], images: [{ url: 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=600&h=600&fit=crop' }] },
      { id: 13, sku: 'ZN-013', name: 'Sound Machine White Noise', description: 'Generatore di suoni rilassanti con 20 tracce naturali.', retailPrice: 59.90, categories: [{ id: 460, name: 'Sound Therapy' }], images: [{ url: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&h=600&fit=crop' }] },
      { id: 14, sku: 'ZN-014', name: "Purificatore d'Aria HEPA", description: 'Purificatore con filtro HEPA H13 e ionizzatore integrato.', retailPrice: 149.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop' }] },
      { id: 15, sku: 'ZN-015', name: 'Umidificatore Smart', description: 'Umidificatore ultrasonico con controllo umidità automatico.', retailPrice: 89.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=600&fit=crop' }] },
      { id: 16, sku: 'ZN-016', name: 'Diffusore Smart Alexa', description: 'Diffusore intelligente con controllo vocale Alexa e Google Home, programmazione automatica.', retailPrice: 119.90, categories: [{ id: 456, name: 'Aromatherapy' }], images: [{ url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop' }] },
      { id: 17, sku: 'ZN-017', name: 'Smart Speaker Meditazione', description: 'Speaker intelligente con 500+ meditazioni guidate, suoni binaurali e controllo app dedicata.', retailPrice: 159.90, categories: [{ id: 460, name: 'Sound Therapy' }], images: [{ url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop' }] },
      { id: 18, sku: 'ZN-018', name: 'Smartwatch Wellness Pro', description: 'Smartwatch per tracking stress, HRV, qualità sonno, respirazione guidata e mindfulness.', retailPrice: 249.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop' }] },
      { id: 19, sku: 'ZN-019', name: 'Anello Smart Sleep Tracker', description: 'Anello intelligente per monitoraggio avanzato del sonno, temperatura corporea e recupero.', retailPrice: 299.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=600&h=600&fit=crop' }] },
      { id: 20, sku: 'ZN-020', name: 'Lampada Circadiana Smart', description: 'Lampada che simula il ciclo solare naturale per migliorare sonno e energia durante il giorno.', retailPrice: 179.90, categories: [{ id: 459, name: 'Smart Lighting' }], images: [{ url: 'https://images.unsplash.com/photo-1565183928294-7d22ff5c4212?w=600&h=600&fit=crop' }] },
      { id: 21, sku: 'ZN-021', name: 'Occhiali Light Therapy', description: 'Occhiali per terapia della luce contro jet-lag, disturbi stagionali e per boost energetico.', retailPrice: 199.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop' }] },
      { id: 22, sku: 'ZN-022', name: 'Braccialetto Respirazione Zen', description: 'Dispositivo indossabile che vibra dolcemente per guidare la respirazione e ridurre stress.', retailPrice: 79.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop' }] },
      { id: 23, sku: 'ZN-023', name: 'Tappetino Yoga Smart', description: 'Tappetino con sensori di pressione e app per correzione posture in tempo reale.', retailPrice: 189.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop' }] },
      { id: 24, sku: 'ZN-024', name: 'Specchio Smart Yoga', description: 'Specchio interattivo con lezioni live di yoga, pilates e meditazione. AI personal trainer.', retailPrice: 1299.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop' }] },
      { id: 25, sku: 'ZN-025', name: 'Monitor Qualità Aria Smart', description: 'Monitora CO2, VOC, PM2.5, temperatura e umidità. Notifiche app e integrazione smart home.', retailPrice: 129.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop' }] },
      { id: 26, sku: 'ZN-026', name: 'Termometro Ambientale Smart', description: 'Sensore smart per temperatura e umidità con storico dati e automazioni.', retailPrice: 59.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop' }] },
      { id: 27, sku: 'ZN-027', name: 'Bilancia Smart Wellness', description: 'Bilancia intelligente che misura peso, massa grassa, muscolare, idratazione e metabolismo.', retailPrice: 89.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=600&h=600&fit=crop' }] },
      { id: 28, sku: 'ZN-028', name: 'Ionizzatore Portatile', description: 'Ionizzatore personale USB per purificare aria intorno a te. Perfetto per ufficio e viaggi.', retailPrice: 69.90, categories: [{ id: 461, name: 'Wellness Tech' }], images: [{ url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=600&fit=crop' }] },
      { id: 29, sku: 'ZN-029', name: 'Cuffie Meditazione Neurosensoriali', description: 'Cuffie con tecnologia neurosensoriale per meditazione profonda e miglioramento focus.', retailPrice: 349.90, categories: [{ id: 460, name: 'Sound Therapy' }], images: [{ url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop' }] },
      { id: 30, sku: 'ZN-030', name: 'Pod Meditazione Immersiva', description: 'Capsula di meditazione con luci, suoni 3D, aromaterapia e vibrazione per esperienza totale.', retailPrice: 2499.90, categories: [{ id: 458, name: 'Mindfulness' }], images: [{ url: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&h=600&fit=crop' }] }
    ];

    // Ritorna solo l'array (come fa BigBuy reale)
    return mockProducts;
  }

  _getMockProduct(productId) {
    const products = this._getMockProducts();
    return products.find(p => p.id === parseInt(productId)) || products[0];
  }
}

module.exports = new BigBuyClient();
