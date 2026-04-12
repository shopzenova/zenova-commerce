/**
 * AMAZON SP-API CLIENT
 * Gestisce: recupero ordini, conferma spedizione con tracking
 * Marketplace: IT (APJ6JRA9NG5V4)
 */

const https = require('https');
const logger = require('../utils/logger');

const MARKETPLACE_IT = 'APJ6JRA9NG5V4';
const SP_API_HOST    = 'sellingpartnerapi-eu.amazon.com';
const LWA_HOST       = 'api.amazon.com';

class AmazonClient {
  constructor() {
    this.clientId      = process.env.AMAZON_CLIENT_ID;
    this.clientSecret  = process.env.AMAZON_CLIENT_SECRET;
    this.refreshToken  = process.env.AMAZON_REFRESH_TOKEN;
    this.sellerId      = process.env.AMAZON_SELLER_ID;
    this.marketplaceId = process.env.AMAZON_MARKETPLACE_ID || MARKETPLACE_IT;

    this._accessToken    = null;
    this._tokenExpiresAt = 0;
  }

  /**
   * Ottieni access token LWA (con cache 55 minuti)
   */
  async _getAccessToken() {
    if (this._accessToken && Date.now() < this._tokenExpiresAt) {
      return this._accessToken;
    }

    const body = JSON.stringify({
      grant_type:    'refresh_token',
      refresh_token: this.refreshToken,
      client_id:     this.clientId,
      client_secret: this.clientSecret,
    });

    const data = await this._httpRequest({
      hostname: LWA_HOST,
      path:     '/auth/o2/token',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, body);

    this._accessToken    = data.access_token;
    this._tokenExpiresAt = Date.now() + 55 * 60 * 1000; // 55 min
    return this._accessToken;
  }

  /**
   * Chiamata autenticata a SP-API
   */
  async _apiCall(method, path, queryParams = {}, bodyObj = null) {
    const token = await this._getAccessToken();

    const qs = new URLSearchParams({
      ...queryParams,
      MarketplaceIds: this.marketplaceId,
    }).toString();

    const fullPath = `${path}?${qs}`;
    const body     = bodyObj ? JSON.stringify(bodyObj) : null;

    const headers = {
      'x-amz-access-token': token,
      'Content-Type':       'application/json',
      'Accept':             'application/json',
    };
    if (body) headers['Content-Length'] = Buffer.byteLength(body);

    return this._httpRequest({ hostname: SP_API_HOST, path: fullPath, method, headers }, body);
  }

  /**
   * Recupera ordini non spediti (ultimi N ore)
   */
  async getOrders(fromHours = 48) {
    const from = new Date(Date.now() - fromHours * 60 * 60 * 1000);
    const createdAfter = from.toISOString();

    const data = await this._apiCall('GET', '/orders/v0/orders', {
      OrderStatuses:  'Unshipped,PartiallyShipped',
      CreatedAfter:   createdAfter,
      FulfillmentChannels: 'MFN',
    });

    const orders = data?.Orders?.Orders || [];
    logger.info(`AmazonClient: ${orders.length} ordini trovati`);

    const result = [];
    for (const o of orders) {
      try {
        const items = await this.getOrderItems(o.AmazonOrderId);
        result.push({
          amazonOrderId:   o.AmazonOrderId,
          status:          o.OrderStatus,
          buyerEmail:      o.BuyerInfo?.BuyerEmail || null,
          buyerName:       o.BuyerInfo?.BuyerName  || null,
          total:           parseFloat(o.OrderTotal?.Amount || 0),
          currency:        o.OrderTotal?.CurrencyCode || 'EUR',
          createdAt:       o.PurchaseDate,
          shippingName:    o.ShippingAddress?.Name      || null,
          shippingStreet:  o.ShippingAddress?.AddressLine1 || null,
          shippingStreet2: o.ShippingAddress?.AddressLine2 || null,
          shippingCity:    o.ShippingAddress?.City        || null,
          shippingZip:     o.ShippingAddress?.PostalCode  || null,
          shippingCountry: o.ShippingAddress?.CountryCode || 'IT',
          shippingPhone:   o.ShippingAddress?.Phone       || null,
          items,
        });
      } catch (err) {
        logger.error(`AmazonClient: errore items ordine ${o.AmazonOrderId}: ${err.message}`);
      }
      await this._delay(500);
    }

    return result;
  }

  /**
   * Recupera items di un ordine
   */
  async getOrderItems(amazonOrderId) {
    const data = await this._apiCall('GET', `/orders/v0/orders/${amazonOrderId}/orderItems`, {});
    const items = data?.OrderItems?.OrderItems || [];
    return items.map(i => ({
      asin:           i.ASIN,
      sku:            i.SellerSKU,
      title:          i.Title,
      quantity:       i.QuantityOrdered,
      price:          parseFloat(i.ItemPrice?.Amount || 0),
      orderItemId:    i.OrderItemId,
    }));
  }

  /**
   * Conferma spedizione con tracking
   */
  async confirmShipment(amazonOrderId, items, trackingNumber, carrierCode = 'Other') {
    const body = {
      marketplaceId: this.marketplaceId,
      packageDetail: {
        packageReferenceId: amazonOrderId,
        carrierCode,
        trackingNumber,
        shipDate: new Date().toISOString(),
        orderItems: items.map(i => ({
          orderItemId: i.orderItemId,
          quantity:    i.quantity,
        })),
      }
    };

    await this._apiCall('POST', `/orders/v0/orders/${amazonOrderId}/shipment`, {}, body);
    logger.info(`AmazonClient: spedizione confermata per ${amazonOrderId} — tracking ${trackingNumber}`);
    return true;
  }

  // ─── HTTP helper ───────────────────────────────────────────────────────────

  _httpRequest(options, body = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`Amazon API ${res.statusCode}: ${JSON.stringify(parsed)}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`Amazon API risposta non JSON: ${data.slice(0, 200)}`));
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AmazonClient();
