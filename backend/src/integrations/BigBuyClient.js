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
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 secondi timeout
    });
  }

  // ===== PRODOTTI =====

  async getProducts(page = 1, pageSize = 100) {
    if (this.isMockMode) {
      return this._getMockProducts(page, pageSize);
    }

    try {
      const response = await this.client.get('/rest/catalog/products.json', {
        params: { isoCode: 'it', page, pageSize }
      });
      logger.info(`BigBuy: Ricevuti ${response.data.products?.length || 0} prodotti`);
      return response.data;
    } catch (error) {
      logger.error('Errore BigBuy getProducts:', error.message);
      throw error;
    }
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
      {
        id: 123456,
        sku: 'MOCK-DIFF-001',
        name: 'Diffusore Aromi Ultrasonico 400ml',
        description: 'Diffusore di aromi con tecnologia ultrasonica, LED RGB e timer programmabile',
        inShopsPrice: 35.00,
        wholesalePrice: 15.00,
        retailPrice: 35.00,
        taxRate: 22,
        categories: [{ id: 456, name: 'Aromatherapy' }],
        images: [
          { url: 'https://via.placeholder.com/400/E8DCC4/8B6F47?text=Diffusore+Aromi' },
          { url: 'https://via.placeholder.com/400/F5F1E8/8B6F47?text=Diffusore+2' }
        ],
        weight: 0.5,
        width: 15,
        height: 20,
        depth: 15
      },
      {
        id: 123457,
        sku: 'MOCK-LAMP-001',
        name: 'Lampada Sale Himalayano',
        description: 'Lampada di sale naturale dell\'Himalaya con base in legno',
        inShopsPrice: 28.00,
        wholesalePrice: 12.00,
        retailPrice: 28.00,
        taxRate: 22,
        categories: [{ id: 456, name: 'Home Fragrance' }],
        images: [
          { url: 'https://via.placeholder.com/400/D9C7A8/8B6F47?text=Lampada+Sale' }
        ],
        weight: 2.0,
        width: 12,
        height: 18,
        depth: 12
      },
      {
        id: 123458,
        sku: 'MOCK-YOGA-001',
        name: 'Tappetino Yoga Premium',
        description: 'Tappetino yoga ecologico antiscivolo 6mm',
        inShopsPrice: 42.00,
        wholesalePrice: 18.00,
        retailPrice: 42.00,
        taxRate: 22,
        categories: [{ id: 458, name: 'Mindfulness' }],
        images: [
          { url: 'https://via.placeholder.com/400/A8B5A0/8B6F47?text=Tappetino+Yoga' }
        ],
        weight: 1.2,
        width: 60,
        height: 180,
        depth: 0.6
      }
    ];

    return {
      products: mockProducts,
      page,
      pageSize,
      totalPages: 1,
      totalProducts: mockProducts.length
    };
  }

  _getMockProduct(productId) {
    const products = this._getMockProducts().products;
    return products.find(p => p.id === parseInt(productId)) || products[0];
  }
}

module.exports = new BigBuyClient();
