const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Verifica se siamo in modalità mock
    this.isMockMode = process.env.EMAIL_USER === 'your_email@gmail.com';

    if (this.isMockMode) {
      logger.warn('⚠️  Email in MOCK MODE - email non inviate realmente');
      this.transporter = null;
    } else {
      // Crea transporter nodemailer
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: { rejectUnauthorized: false }
      });

      logger.info('✅ Email service inizializzato');
    }

    this.from = process.env.EMAIL_FROM || 'noreply@zenova.it';
  }

  /**
   * Invia email conferma ordine
   * @param {Object} order - Dati ordine
   * @returns {Promise<boolean>}
   */
  async sendOrderConfirmation(order) {
    const subject = `Ordine Confermato - ${order.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; background: #F5F1E8; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #8B6F47; }
          .tagline { color: #A8B5A0; font-size: 14px; }
          .content { margin: 30px 0; }
          .order-number { font-size: 24px; font-weight: bold; color: #8B6F47; }
          .items { margin: 20px 0; }
          .item { border-bottom: 1px solid #E8DCC4; padding: 15px 0; }
          .total { font-size: 20px; font-weight: bold; color: #8B6F47; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZENOVA</div>
            <div class="tagline">where technology meets calm</div>
          </div>

          <div class="content">
            <h2>Grazie per il tuo ordine!</h2>
            <p>Ciao ${order.customerName},</p>
            <p>Il tuo ordine è stato confermato e sarà presto in viaggio verso di te.</p>

            <p class="order-number">Ordine: ${order.orderNumber}</p>

            <div class="items">
              <h3>Prodotti ordinati:</h3>
              ${order.items.map(item => `
                <div class="item">
                  <strong>${item.productName}</strong><br>
                  Quantità: ${item.quantity} × €${item.unitPrice.toFixed(2)}<br>
                  Subtotale: €${item.totalPrice.toFixed(2)}
                </div>
              `).join('')}
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 15px;">
              di cui IVA (22%): €${order.vatAmount ? order.vatAmount.toFixed(2) : (order.total - (order.total / 1.22)).toFixed(2)}
            </p>
            <p class="total">Totale (IVA inclusa): €${order.total.toFixed(2)}</p>

            <p>Riceverai un'email con il tracking non appena il tuo pacco sarà spedito.</p>
          </div>

          <div class="footer">
            <p>Zenova - La tua oasi di tranquillità</p>
            <p>Hai domande? Contattaci: info@zenova.it</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this._sendEmail(order.customerEmail, subject, html);
  }

  /**
   * Invia email con tracking spedizione
   * @param {Object} order - Dati ordine
   * @param {string} trackingNumber - Numero tracking
   * @param {string} carrier - Corriere
   * @returns {Promise<boolean>}
   */
  async sendTrackingEmail(order, trackingNumber, carrier = 'GLS') {
    const subject = `Il tuo ordine è in viaggio! - ${order.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; background: #F5F1E8; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #8B6F47; }
          .tracking { background: #E8DCC4; padding: 20px; border-radius: 10px; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #8B6F47; margin: 15px 0; }
          .button { display: inline-block; background: #8B6F47; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZENOVA</div>
          </div>

          <h2>📦 Il tuo ordine è in viaggio!</h2>
          <p>Ciao ${order.customerName},</p>
          <p>Ottime notizie! Il tuo ordine <strong>${order.orderNumber}</strong> è stato spedito.</p>

          <div class="tracking">
            <p><strong>Corriere:</strong> ${carrier}</p>
            <p class="tracking-number">${trackingNumber}</p>
            <a href="https://gls-group.eu/IT/it/ricerca-spedizioni" class="button" target="_blank">
              Traccia il tuo pacco
            </a>
          </div>

          <p style="margin-top: 30px;">Riceverai il pacco entro 2-3 giorni lavorativi.</p>

          <div class="footer">
            <p>Zenova - La tua oasi di tranquillità</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this._sendEmail(order.customerEmail, subject, html);
  }

  /**
   * Invia email conferma consegna
   * @param {Object} order - Dati ordine
   * @returns {Promise<boolean>}
   */
  async sendDeliveryEmail(order) {
    const subject = `Ordine consegnato! - ${order.orderNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; background: #F5F1E8; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #8B6F47; }
          .success { background: #E8F5E9; border-radius: 10px; padding: 25px; text-align: center; margin: 20px 0; }
          .success h2 { color: #2E7D32; margin: 0 0 10px 0; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZENOVA</div>
          </div>

          <div class="success">
            <h2>Il tuo ordine e' stato consegnato!</h2>
            <p>Ordine <strong>${order.orderNumber}</strong></p>
          </div>

          <p>Ciao ${order.customerName},</p>
          <p>Il tuo ordine e' stato consegnato con successo. Speriamo che i prodotti siano di tuo gradimento!</p>

          <p>Se hai bisogno di assistenza o hai domande sui prodotti ricevuti, non esitare a contattarci.</p>

          <div class="footer">
            <p>Zenova - La tua oasi di tranquillita'</p>
            <p>Hai domande? Contattaci: info@zenova.it</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this._sendEmail(order.customerEmail, subject, html);
  }

  /**
   * Invia email notifica errore ordine fornitore
   * @param {Object} order - Dati ordine
   * @param {string} supplier - Nome fornitore (bigbuy/aw)
   * @param {string} errorMessage - Messaggio errore
   * @param {number} retries - Numero tentativi effettuati
   * @returns {Promise<boolean>}
   */
  async sendSupplierOrderError(order, supplier, errorMessage, retries) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const subject = `[ZENOVA URGENTE] Ordine fornitore FALLITO - ${order.orderNumber || order.id}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .alert { background: #FFE0E0; border-left: 4px solid #FF4444; padding: 20px; margin: 20px 0; }
          .details { background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .label { font-weight: bold; color: #666; }
          .error-msg { background: #FFF3E0; padding: 15px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Ordine fornitore NON inviato</h2>

          <div class="alert">
            <strong>L'ordine non e' stato inoltrato al fornitore dopo ${retries} tentativi.</strong>
            <br>Richiede intervento manuale.
          </div>

          <div class="details">
            <p><span class="label">Ordine:</span> ${order.orderNumber || order.id}</p>
            <p><span class="label">Fornitore:</span> ${supplier.toUpperCase()}</p>
            <p><span class="label">Cliente:</span> ${order.customerName || order.customer?.name || 'N/A'}</p>
            <p><span class="label">Email cliente:</span> ${order.customerEmail || order.customer?.email || 'N/A'}</p>
            <p><span class="label">Totale:</span> EUR ${order.total || order.totals?.total || 'N/A'}</p>
            <p><span class="label">Tentativi:</span> ${retries}/3</p>
          </div>

          <div class="error-msg">
            <strong>Errore:</strong><br>
            ${errorMessage}
          </div>

          <p>Azioni necessarie:</p>
          <ol>
            <li>Verificare il pannello ${supplier.toUpperCase()}</li>
            <li>Creare l'ordine manualmente se necessario</li>
            <li>Aggiornare lo stato dell'ordine nel database</li>
          </ol>
        </div>
      </body>
      </html>
    `;

    return this._sendEmail(adminEmail, subject, html);
  }

  /**
   * Invia email alert stock admin con riepilogo sync
   * @param {Object} stats - Statistiche sync
   * @returns {Promise<boolean>}
   */
  async sendStockAlertEmail(stats) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const hasOutOfStock = stats.newlyOutOfStock && stats.newlyOutOfStock.length > 0;
    const subject = hasOutOfStock
      ? `[ZENOVA] Stock Alert: ${stats.newlyOutOfStock.length} prodotti esauriti`
      : `[ZENOVA] Stock Sync: ${stats.totalErrors} errori durante sincronizzazione`;

    const outOfStockRows = (stats.newlyOutOfStock || []).map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E8DCC4;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E8DCC4;">${p.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E8DCC4;">${p.source.toUpperCase()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E8DCC4;">${p.previousStock} &rarr; 0</td>
      </tr>
    `).join('');

    const durationSec = ((stats.durationMs || 0) / 1000).toFixed(1);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #8B6F47; }
          .alert { background: #FFE0E0; border-left: 4px solid #FF4444; padding: 15px; margin: 15px 0; }
          .info { background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; }
          .stats { background: #F5F5F5; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .label { font-weight: bold; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #8B6F47; color: white; padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZENOVA - Stock Sync Report</div>
          </div>

          ${hasOutOfStock ? `
          <div class="alert">
            <strong>${stats.newlyOutOfStock.length} prodotti appena esauriti!</strong><br>
            Questi prodotti avevano stock disponibile e ora sono a 0.
          </div>

          <table>
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>ID</th>
                <th>Fonte</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              ${outOfStockRows}
            </tbody>
          </table>
          ` : ''}

          ${stats.totalErrors > 0 ? `
          <div class="alert">
            <strong>${stats.totalErrors} errori durante la sincronizzazione.</strong>
          </div>
          ` : `
          <div class="info">
            <strong>Sincronizzazione completata con successo.</strong>
          </div>
          `}

          <div class="stats">
            <h3>Riepilogo</h3>
            <p><span class="label">BigBuy:</span> ${stats.bigbuy.updated}/${stats.bigbuy.total} aggiornati (${stats.bigbuy.inStock} disponibili, ${stats.bigbuy.outOfStock} esauriti, ${stats.bigbuy.errors} errori)</p>
            <p><span class="label">AW:</span> ${stats.aw.updated}/${stats.aw.total} aggiornati (${stats.aw.inStock} disponibili, ${stats.aw.outOfStock} esauriti, ${stats.aw.errors} errori)</p>
            <p><span class="label">Totale aggiornati:</span> ${stats.totalUpdated}</p>
            <p><span class="label">Durata:</span> ${durationSec}s</p>
            <p><span class="label">Data:</span> ${new Date().toLocaleString('it-IT')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this._sendEmail(adminEmail, subject, html);
  }

  /**
   * Invia email generica
   * @private
   */
  async _sendEmail(to, subject, html) {
    if (this.isMockMode) {
      logger.info(`MOCK Email inviata a ${to}: "${subject}"`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html
      });

      logger.info(`Email inviata: ${info.messageId}`);
      return true;

    } catch (error) {
      logger.error('Errore invio email:', error.message);
      return false;
    }
  }

  /**
   * Test connessione email
   */
  async testConnection() {
    if (this.isMockMode) {
      logger.info('MOCK: Connessione email OK');
      return true;
    }

    try {
      await this.transporter.verify();
      logger.info('✅ Connessione email verificata');
      return true;
    } catch (error) {
      logger.error('❌ Errore connessione email:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
