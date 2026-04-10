/**
 * EBAY CLIENT — Trading API (Auth 'n' Auth)
 * Gestisce: recupero ordini, aggiornamento tracking
 */

const https = require('https');
const logger = require('../utils/logger');

const EBAY_API_URL = 'api.ebay.com';
const EBAY_API_PATH = '/ws/api.dll';
const COMPATIBILITY_LEVEL = '967';
const SITE_ID = '101'; // Italia

class EbayClient {
  constructor() {
    this.appId   = process.env.EBAY_APP_ID;
    this.devId   = process.env.EBAY_DEV_ID;
    this.certId  = process.env.EBAY_CERT_ID;
    this.token   = process.env.EBAY_USER_TOKEN;
  }

  /**
   * Esegue una chiamata XML all'API Trading di eBay
   */
  async _call(callName, xmlBody) {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${this.token}</eBayAuthToken>
  </RequesterCredentials>
  ${xmlBody}
</${callName}Request>`;

    return new Promise((resolve, reject) => {
      const body = Buffer.from(xml, 'utf8');
      const options = {
        hostname: EBAY_API_URL,
        path: EBAY_API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'Content-Length': body.length,
          'X-EBAY-API-SITEID': SITE_ID,
          'X-EBAY-API-COMPATIBILITY-LEVEL': COMPATIBILITY_LEVEL,
          'X-EBAY-API-CALL-NAME': callName,
          'X-EBAY-API-APP-NAME': this.appId,
          'X-EBAY-API-DEV-NAME': this.devId,
          'X-EBAY-API-CERT-NAME': this.certId,
        }
      };

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Recupera ordini completati nell'intervallo di tempo indicato
   * @param {Date} from
   * @param {Date} to
   */
  async getOrders(from, to) {
    const fromStr = from.toISOString();
    const toStr   = to.toISOString();

    const xml = await this._call('GetOrders', `
      <CreateTimeFrom>${fromStr}</CreateTimeFrom>
      <CreateTimeTo>${toStr}</CreateTimeTo>
      <OrderStatus>Completed</OrderStatus>
      <DetailLevel>ReturnAll</DetailLevel>
      <Pagination>
        <EntriesPerPage>100</EntriesPerPage>
        <PageNumber>1</PageNumber>
      </Pagination>
    `);

    return this._parseOrders(xml);
  }

  /**
   * Aggiorna il tracking di un ordine eBay
   * @param {string} ebayOrderId
   * @param {string} trackingNumber
   * @param {string} carrier
   */
  async updateTracking(ebayOrderId, trackingNumber, carrier) {
    const carrierMapped = this._mapCarrier(carrier);
    const xml = await this._call('CompleteSale', `
      <OrderID>${ebayOrderId}</OrderID>
      <Shipment>
        <ShipmentTrackingDetails>
          <ShippingCarrierUsed>${carrierMapped}</ShippingCarrierUsed>
          <ShipmentTrackingNumber>${trackingNumber}</ShipmentTrackingNumber>
        </ShipmentTrackingDetails>
      </Shipment>
    `);

    if (xml.includes('<Ack>Success</Ack>') || xml.includes('<Ack>Warning</Ack>')) {
      logger.info(`EbayClient: tracking aggiornato per ordine ${ebayOrderId}`);
      return true;
    }

    logger.error(`EbayClient: errore aggiornamento tracking ${ebayOrderId}: ${xml.substring(0, 300)}`);
    return false;
  }

  /**
   * Estrae array ordini dall'XML di risposta
   */
  _parseOrders(xml) {
    const orders = [];
    const orderMatches = xml.match(/<Order>([\s\S]*?)<\/Order>/g) || [];

    for (const orderXml of orderMatches) {
      try {
        const order = {
          ebayOrderId:    this._extract(orderXml, 'OrderID'),
          status:         this._extract(orderXml, 'OrderStatus'),
          total:          parseFloat(this._extract(orderXml, 'Total') || '0'),
          createdAt:      this._extract(orderXml, 'CreatedTime'),
          buyerEmail:     this._extract(orderXml, 'Email'),
          buyerName:      this._extract(orderXml, 'ShippingAddress>Name') ||
                          this._extract(orderXml, 'Name'),
          shippingName:   this._extract(orderXml, 'ShippingAddress>Name'),
          shippingStreet: this._extract(orderXml, 'Street1'),
          shippingStreet2:this._extract(orderXml, 'Street2'),
          shippingCity:   this._extract(orderXml, 'CityName'),
          shippingZip:    this._extract(orderXml, 'PostalCode'),
          shippingCountry:this._extract(orderXml, 'Country'),
          shippingPhone:  this._extract(orderXml, 'Phone'),
          items:          this._parseItems(orderXml),
        };
        if (order.ebayOrderId) orders.push(order);
      } catch (e) {
        logger.error('EbayClient: errore parsing ordine:', e.message);
      }
    }

    return orders;
  }

  _parseItems(orderXml) {
    const items = [];
    const txMatches = orderXml.match(/<Transaction>([\s\S]*?)<\/Transaction>/g) || [];
    for (const tx of txMatches) {
      items.push({
        itemId:       this._extract(tx, 'ItemID'),
        title:        this._extract(tx, 'Title'),
        sku:          this._extract(tx, 'SKU'),
        quantity:     parseInt(this._extract(tx, 'QuantityPurchased') || '1'),
        price:        parseFloat(this._extract(tx, 'TransactionPrice') || '0'),
        variationName:this._extract(tx, 'VariationSpecificValue'),
      });
    }
    return items;
  }

  _extract(xml, tag) {
    // Supporta tag semplici e annidati (es. "ShippingAddress>Name")
    const tags = tag.split('>');
    let current = xml;
    for (const t of tags) {
      const match = current.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i'));
      if (!match) return null;
      current = match[1];
    }
    return current ? current.trim() : null;
  }

  _mapCarrier(carrier) {
    const c = (carrier || '').toLowerCase();
    if (c.includes('gls')) return 'GLS';
    if (c.includes('dhl')) return 'DHL';
    if (c.includes('ups')) return 'UPS';
    if (c.includes('fedex')) return 'FedEx';
    if (c.includes('poste') || c.includes('sda')) return 'IT_SDA';
    if (c.includes('dpd')) return 'DPD';
    if (c.includes('hermes') || c.includes('evri')) return 'Hermes_UK';
    return 'Other';
  }
}

module.exports = new EbayClient();
