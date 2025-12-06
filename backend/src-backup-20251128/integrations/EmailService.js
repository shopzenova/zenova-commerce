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
        }
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

            <p class="total">Totale: €${order.total.toFixed(2)}</p>

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
