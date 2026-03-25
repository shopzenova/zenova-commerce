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

    // Mappa codice prodotto → ID numerico AW (necessaria per addTransaction)
    this._productCodeToIdMap = null;
    this._productCodeToIdMapTimestamp = 0;

    // Rate limiting
    this.lastRequestTime = 0;
    this.MIN_REQUEST_DELAY = 500; // 500ms tra richieste
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

    // Pre-carica mappa prodotti all'avvio (async, non blocca)
    if (!this.isMockMode) {
      setTimeout(() => {
        this._getProductCodeToIdMap()
          .then(map => logger.info(`✅ AW: Mappa prodotti pre-caricata (${map.size} codici)`))
          .catch(err => logger.error(`❌ AW: Pre-caricamento mappa fallito: ${err.message}`));
      }, 10000); // 10 sec dopo avvio per non intasare
    }
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
    // Esegui la richiesta in coda — ma aggiorna la coda con una promise
    // che NON rigetta, così un errore non rompe le chiamate successive
    const requestPromise = this.requestQueue.then(async () => {
      await this._waitForRateLimit();

      try {
        let response;
        if (method === 'get') {
          response = await this.client.get(url, config);
        } else if (method === 'post') {
          response = await this.client.post(url, data, config);
        } else if (method === 'put') {
          response = await this.client.put(url, data, config);
        } else if (method === 'patch') {
          response = await this.client.patch(url, data, config);
        } else if (method === 'delete') {
          response = await this.client.delete(url, config);
        }

        return response;
      } catch (error) {
        logger.error(`❌ AW API Error (${method} ${url}):`, error.response?.data || error.message);
        throw error;
      }
    });

    // La coda non deve rompersi se una singola richiesta fallisce
    this.requestQueue = requestPromise.catch(() => {});

    return requestPromise;
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
        params: { page, per_page: perPage, sort: 'code', ...filters }
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

  /**
   * Carica mappa codice prodotto → ID numerico AW (con cache 24h)
   * Usa il data feed JSON (singola chiamata, tutti i prodotti)
   * poi arricchisce con /dropshipping/products per gli ID numerici
   * @returns {Promise<Map<string, number>>}
   */
  async _getProductCodeToIdMap() {
    // Usa cache se fresca
    if (this._productCodeToIdMap && (Date.now() - this._productCodeToIdMapTimestamp) < this.CACHE_TTL) {
      return this._productCodeToIdMap;
    }

    logger.info('🔄 AW: Caricamento mappa codice→ID dal portfolio (my-products)...');
    const map = new Map();

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Accept': 'application/json'
    };

    let page = 1;
    const perPage = 200;
    let loadedOk = false;

    try {
      while (true) {
        const response = await axios.get(`${this.baseURL}/dropshipping/products/my-products`, {
          headers,
          params: { page, per_page: perPage },
          timeout: 30000
        });

        const products = response.data.data || [];
        for (const p of products) {
          if (p.code && p.id) {
            map.set(p.code.toUpperCase(), p.id);
          }
        }

        const lastPage = response.data.meta?.last_page || response.data.last_page || 1;
        logger.info(`🔄 AW: Portfolio pagina ${page}/${lastPage} (${products.length} prodotti)`);
        if (page >= lastPage) { loadedOk = true; break; }
        page++;
        await new Promise(r => setTimeout(r, 200)); // piccola pausa tra pagine
      }
    } catch (error) {
      logger.error(`❌ AW: Errore caricamento mappa portfolio a pagina ${page}: ${error.message}`);
    }

    if (loadedOk) {
      logger.info(`✅ AW: Mappa portfolio caricata: ${map.size} codici`);
      this._productCodeToIdMap = map;
      this._productCodeToIdMapTimestamp = Date.now();
    } else {
      // Caricamento parziale — non salvare in cache, verrà ritentato alla prossima chiamata
      logger.warn(`⚠️ AW: Mappa portfolio caricata parzialmente (${map.size} codici, fino a pagina ${page}) — cache non aggiornata`);
      if (map.size > 0) return map; // usa il parziale solo per questa chiamata
    }
    return this._productCodeToIdMap || map;
  }

  /**
   * Risolve un codice prodotto nel suo ID numerico AW
   * @param {string} code - Codice prodotto (es. "FOBP-219")
   * @returns {Promise<number|null>}
   */
  async resolveProductId(code) {
    // Se è già un numero, usalo direttamente
    if (!isNaN(code) && Number.isInteger(Number(code))) {
      return Number(code);
    }

    const map = await this._getProductCodeToIdMap();
    return map.get(String(code).toUpperCase()) || null;
  }

  // ===== ORDINI =====
  // Flusso AW: 1) Crea ordine vuoto → 2) Aggiungi prodotti (transazioni) → 3) Invia ordine

  /**
   * Crea un ordine completo su AW (3 step: create → add items → submit)
   * @param {Object} orderData - { customerClientId, items: [{ portfolioId, quantity }] }
   * @returns {Promise<Object>} - Ordine AW con ID e stato
   */
  async createOrder(orderData) {
    if (this.isMockMode) {
      logger.info('🎭 AW Mock: createOrder', JSON.stringify(orderData));
      return {
        id: 'MOCK-AW-' + Date.now(),
        reference: 'MOCK-REF-' + Math.floor(Math.random() * 10000),
        state: 'submitted',
        items: orderData.items || []
      };
    }

    const { customerClientId, items, deliveryAddress } = orderData;

    if (!customerClientId) {
      throw new Error('AW: customerClientId richiesto per creare ordine');
    }
    if (!items || items.length === 0) {
      throw new Error('AW: almeno un prodotto richiesto');
    }

    // Step 1: Crea ordine per il cliente, passando delivery address nel POST body
    logger.info(`📦 AW Step 1/3: Creazione ordine per cliente ${customerClientId}`);
    const createBody = {};
    if (deliveryAddress && deliveryAddress.street) {
      createBody.delivery_address = {
        contact_name: (deliveryAddress.name || '').trim(),
        country_code: (deliveryAddress.country || 'IT').trim(),
        address_line_1: (deliveryAddress.street || '').trim(),
        address_line_2: '',
        postal_code: (deliveryAddress.postalCode || '').trim(),
        locality: (deliveryAddress.city || '').trim()
      };
      logger.info(`📍 AW: Indirizzo nel POST: ${JSON.stringify(createBody.delivery_address)}`);
    }
    const createResponse = await this._makeRequest(
      'post',
      `/dropshipping/order/client/${customerClientId}/store`,
      createBody
    );
    const awOrder = createResponse.data.data || createResponse.data;
    const awOrderId = awOrder.id;
    logger.info(`✅ AW: Ordine creato con ID ${awOrderId}, risposta: ${JSON.stringify(awOrder)}`);

    // Step 2: Aggiungi prodotti (usa ID numerico, non codice stringa)
    for (const item of items) {
      const numericId = await this.resolveProductId(item.portfolioId);
      if (!numericId) {
        throw new Error(`AW: prodotto "${item.portfolioId}" non trovato nel catalogo AW. Impossibile risolvere ID numerico.`);
      }
      logger.info(`📦 AW Step 2/3: Aggiunta prodotto ${item.portfolioId} (ID=${numericId}), qty=${item.quantity}`);
      await this.addTransaction(awOrderId, numericId, item.quantity);
    }
    logger.info(`✅ AW: ${items.length} prodotti aggiunti all'ordine ${awOrderId}`);

    // Step 3: Invia ordine (solo se i prodotti sono stati aggiunti)
    logger.info(`📦 AW Step 3/3: Invio ordine ${awOrderId}`);
    const submitResponse = await this.submitOrder(awOrderId);
    logger.info(`✅ AW: Ordine ${awOrderId} inviato con successo`);

    return submitResponse;
  }

  /**
   * Aggiunge una transazione (prodotto) a un ordine
   * @param {number} orderId - ID ordine AW
   * @param {string} portfolioId - ID portfolio prodotto
   * @param {number} quantity - Quantità
   * @returns {Promise<Object>}
   */
  async addTransaction(orderId, portfolioId, quantity = 1) {
    try {
      const response = await this._makeRequest(
        'post',
        `/dropshipping/order/${orderId}/portfolio/${portfolioId}/store`,
        { quantity_ordered: quantity }
      );
      return response.data;
    } catch (error) {
      logger.error(`❌ AW addTransaction (order=${orderId}, portfolio=${portfolioId}):`, error.message);
      throw error;
    }
  }

  /**
   * Aggiorna l'indirizzo di consegna di un ordine AW
   * @param {number} orderId - ID ordine AW
   * @param {Object} address - { street, city, postalCode, country }
   * @returns {Promise<boolean>}
   */
  async updateDeliveryAddress(orderId, address) {
    const payload = {
      delivery_address: {
        contact_name: (address.name || '').trim(),
        country_code: (address.country || 'IT').trim(),
        address_line_1: (address.street || '').trim(),
        address_line_2: '',
        postal_code: (address.postalCode || '').trim(),
        locality: (address.city || '').trim()
      }
    };
    logger.info(`📍 AW: updateDeliveryAddress ordine ${orderId} → payload: ${JSON.stringify(payload)}`);
    try {
      const response = await this._makeRequest('patch', `/dropshipping/order/${orderId}`, payload);
      logger.info(`✅ AW: updateDeliveryAddress risposta: ${JSON.stringify(response?.data || response)}`);
      return true;
    } catch (error) {
      logger.error(`❌ AW: updateDeliveryAddress FALLITO ordine ${orderId}: status=${error.response?.status} body=${JSON.stringify(error.response?.data)} msg=${error.message}`);
      return false;
    }
  }

  /**
   * Invia (submit) un ordine AW
   * @param {number} orderId - ID ordine AW
   * @returns {Promise<Object>}
   */
  async submitOrder(orderId) {
    try {
      const response = await this._makeRequest(
        'patch',
        `/dropshipping/order/${orderId}/submit`
      );
      return response.data.data || response.data;
    } catch (error) {
      logger.error(`❌ AW submitOrder (${orderId}):`, error.message);
      throw error;
    }
  }

  /**
   * Crea un cliente su AW
   * @param {Object} clientData - { name, email, phone, address }
   * @returns {Promise<Object>} - Cliente creato con ID
   */
  async createClient(clientData) {
    if (this.isMockMode) {
      logger.info('AW Mock: createClient', JSON.stringify(clientData));
      return { id: 'MOCK-CLIENT-' + Date.now(), name: clientData.name };
    }

    try {
      logger.info(`AW: Creazione cliente ${clientData.name} (${clientData.email})`);

      const payload = {
        company_name: clientData.company || clientData.name || '',
        contact_name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: {
          country_code: clientData.address?.country || 'IT',
          address_line_1: clientData.address?.street || clientData.address?.addressLine1 || '',
          address_line_2: clientData.address?.addressLine2 || '',
          sorting_code: '',
          postal_code: clientData.address?.postalCode || '',
          locality: clientData.address?.city || ''
        }
      };

      const response = await this._makeRequest('post', '/dropshipping/clients', payload);
      const client = response.data.data || response.data;
      logger.info(`AW: Cliente creato con ID ${client.id}`);
      return client;

    } catch (error) {
      logger.error(`AW createClient: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista clienti AW
   * @returns {Promise<Array>}
   */
  async getClients() {
    if (this.isMockMode) {
      return [{ id: 'MOCK-CLIENT-1', name: 'Mock Client' }];
    }

    try {
      const response = await this._makeRequest('get', '/dropshipping/clients', null, {
        params: { active: true, per_page: 100 }
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('❌ AW getClients:', error.message);
      return [];
    }
  }

  /**
   * Ottiene stato ordine
   * @param {string} orderId - ID ordine
   * @returns {Promise<Object>}
   */
  async getOrder(orderId) {
    if (this.isMockMode) {
      return { id: orderId, state: 'submitted', reference: 'MOCK-REF' };
    }

    try {
      logger.info(`🔄 AW Dropship: getOrder (${orderId})`);
      const response = await this._makeRequest('get', `/dropshipping/order/${orderId}`);
      return response.data.data || response.data;
    } catch (error) {
      logger.error(`Errore AW getOrder (${orderId}):`, error.message);
      return null;
    }
  }

  /**
   * Lista ordini AW (per tracking batch)
   * @returns {Promise<Array>}
   */
  async listOrders() {
    if (this.isMockMode) {
      return [];
    }

    try {
      logger.info('🔄 AW Dropship: listOrders');
      const response = await this._makeRequest('get', '/dropshipping/order', null, {
        params: { per_page: 100 }
      });
      return response.data.data || [];
    } catch (error) {
      logger.error('❌ AW listOrders:', error.message);
      return [];
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
