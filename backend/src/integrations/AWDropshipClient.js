const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Client per API AW Dropship (Retina)
 * Documentazione: https://app.aiku.io/app/re-api/docs
 * Autenticazione: Laravel Sanctum (Bearer Token)
 */
class AWDropshipClient {
  constructor() {
    this.baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
    this.apiToken = process.env.AW_API_TOKEN;

    // Verifica se siamo in modalità mock
    this.isMockMode = !this.apiToken || this.apiToken === 'your_aw_token_here';

    if (this.isMockMode) {
      logger.warn('⚠️  AW Dropship in MOCK MODE - usando dati finti');
    } else {
      logger.info('✅ AW Dropship in REAL API MODE - usando API reali');
    }

    // Cache per ridurre chiamate API (24 ore)
    this.cache = new Map();
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore

    // Rate limiting
    this.lastRequestTime = 0;
    this.MIN_REQUEST_DELAY = 2000; // 2 secondi tra richieste
    this.requestQueue = Promise.resolve();

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 secondi timeout
    });
  }

  _getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info(`📦 AW Cache HIT: ${key}`);
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
      const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
      logger.info(`⏳ AW Rate limit: attendo ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  async _makeRequest(method, url, data = null, config = {}) {
    return this.requestQueue = this.requestQueue.then(async () => {
      await this._waitForRateLimit();

      try {
        let response;
        if (method === 'get') {
          response = await this.client.get(url, config);
        } else if (method === 'post') {
          response = await this.client.post(url, data, config);
        } else if (method === 'put') {
          response = await this.client.put(url, data, config);
        } else if (method === 'delete') {
          response = await this.client.delete(url, config);
        }

        return response;
      } catch (error) {
        logger.error(`❌ AW API Error (${method} ${url}):`, error.response?.data || error.message);
        throw error;
      }
    });
  }

  // ===== PRODOTTI =====

  /**
   * Ottiene lista prodotti con paginazione
   * @param {number} page - Pagina (default 1)
   * @param {number} perPage - Prodotti per pagina (default 50)
   * @param {string} type - Tipo filtro (default 'department')
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async getProducts(page = 1, perPage = 50, filters = {}) {
    if (this.isMockMode) {
      return this._getMockProducts(page, perPage);
    }

    const cacheKey = this._getCacheKey('getProducts', { page, perPage, ...filters });
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      logger.info(`🔄 AW Dropship: getProducts (page=${page}, perPage=${perPage})`);

      const response = await this._makeRequest('get', '/dropshipping/products', null, {
        params: { page, per_page: perPage, sort: 'name', ...filters }
      });

      const result = {
        data: response.data.data || [],
        pagination: {
          currentPage: response.data.current_page || page,
          lastPage: response.data.last_page || 1,
          perPage: response.data.per_page || perPage,
          total: response.data.total || 0
        }
      };

      this._setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Errore AW getProducts:', error.message);
      return { data: [], pagination: { currentPage: 1, lastPage: 1, perPage, total: 0 } };
    }
  }

  /**
   * Ottiene dettaglio singolo prodotto
   * @param {string} productId - ID del prodotto
   * @returns {Promise<Object>}
   */
  async getProduct(productId) {
    if (this.isMockMode) {
      return this._getMockProduct(productId);
    }

    const cacheKey = this._getCacheKey('getProduct', { productId });
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      logger.info(`🔄 AW Dropship: getProduct (${productId})`);

      const response = await this._makeRequest('get', `/dropshipping/products/${productId}`);

      this._setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      logger.error(`Errore AW getProduct (${productId}):`, error.message);
      return null;
    }
  }

  /**
   * Ottiene liste departments (categorie AW)
   * @returns {Promise<Array>}
   */
  async getCategories() {
    if (this.isMockMode) {
      return this._getMockCategories();
    }

    const cacheKey = this._getCacheKey('getCategories', {});
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      logger.info('🔄 AW Dropship: getCategories');

      // Ottiene prodotti filtrati per department per vedere tutte le categorie
      const response = await this._makeRequest('get', '/dropshipping/products', null, {
        params: { type: 'department', per_page: 100, sort: 'department_slug' }
      });

      const categories = response.data.data || response.data || [];
      this._setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      logger.error('Errore AW getCategories:', error.message);
      return [];
    }
  }

  // ===== ORDINI =====

  /**
   * Crea un nuovo ordine
   * @param {Object} orderData - Dati ordine
   * @returns {Promise<Object>}
   */
  async createOrder(orderData) {
    if (this.isMockMode) {
      logger.info('🎭 AW Mock: createOrder', orderData);
      return { id: 'MOCK-AW-' + Date.now(), status: 'pending', ...orderData };
    }

    try {
      logger.info('📦 AW Dropship: createOrder');

      const response = await this._makeRequest('post', '/orders', orderData);

      return response.data;
    } catch (error) {
      logger.error('Errore AW createOrder:', error.message);
      throw error;
    }
  }

  /**
   * Ottiene stato ordine
   * @param {string} orderId - ID ordine
   * @returns {Promise<Object>}
   */
  async getOrder(orderId) {
    if (this.isMockMode) {
      return { id: orderId, status: 'processing', tracking: 'MOCK123' };
    }

    try {
      logger.info(`🔄 AW Dropship: getOrder (${orderId})`);

      const response = await this._makeRequest('get', `/orders/${orderId}`);

      return response.data;
    } catch (error) {
      logger.error(`Errore AW getOrder (${orderId}):`, error.message);
      return null;
    }
  }

  // ===== MOCK DATA (per sviluppo) =====

  _getMockProducts(page, perPage) {
    logger.info('🎭 AW Mock: getProducts');

    const mockProducts = [];
    for (let i = 0; i < perPage; i++) {
      const id = (page - 1) * perPage + i + 1;
      mockProducts.push({
        id: `AW-MOCK-${id}`,
        name: `Prodotto AW Mock ${id}`,
        description: 'Prodotto di esempio da AW Dropship',
        price: 19.99 + (id * 5),
        category: 'Natural Wellness',
        subcategory: 'Aromaterapia',
        stock: 100,
        images: [`https://via.placeholder.com/400?text=AW+Product+${id}`]
      });
    }

    return {
      data: mockProducts,
      pagination: {
        currentPage: page,
        lastPage: 10,
        perPage: perPage,
        total: perPage * 10
      }
    };
  }

  _getMockProduct(productId) {
    logger.info(`🎭 AW Mock: getProduct (${productId})`);
    return {
      id: productId,
      name: `Prodotto AW Mock ${productId}`,
      description: 'Descrizione dettagliata del prodotto mock',
      price: 29.99,
      category: 'Natural Wellness',
      subcategory: 'Candele',
      stock: 50,
      images: ['https://via.placeholder.com/800?text=AW+Product']
    };
  }

  _getMockCategories() {
    logger.info('🎭 AW Mock: getCategories');
    return [
      { id: '1', name: 'Aromaterapia', slug: 'aromaterapia', products_count: 150 },
      { id: '2', name: 'Candele', slug: 'candele', products_count: 80 },
      { id: '3', name: 'Incenso', slug: 'incenso', products_count: 60 },
      { id: '4', name: 'Fragranza', slug: 'fragranza', products_count: 100 },
      { id: '5', name: 'Borse', slug: 'borse', products_count: 50 },
      { id: '6', name: 'Vestiario', slug: 'vestiario', products_count: 120 }
    ];
  }
}

module.exports = AWDropshipClient;
