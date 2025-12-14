/**
 * PayPal Service
 * Gestisce creazione ordini e cattura pagamenti PayPal
 */

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * Configurazione ambiente PayPal (Sandbox o Live)
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (mode === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * Client PayPal
 */
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 * Crea un ordine PayPal
 * @param {Array} items - Prodotti nel carrello
 * @param {Object} customer - Dati cliente
 * @returns {Object} - Order ID e approval URL
 */
async function createOrder(items, customer) {
  try {
    // Calcola totale
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Costruisci request
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'ZENOVA',
        landing_page: 'BILLING',
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/success.html`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout.html`
      },
      payer: {
        name: {
          given_name: customer.name.split(' ')[0] || customer.name,
          surname: customer.name.split(' ').slice(1).join(' ') || customer.name
        },
        email_address: customer.email,
        phone: {
          phone_type: 'MOBILE',
          phone_number: {
            national_number: customer.phone
          }
        }
      },
      purchase_units: [{
        reference_id: `ZENOVA-${Date.now()}`,
        description: 'Ordine Zenova E-commerce',
        amount: {
          currency_code: 'EUR',
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: total.toFixed(2)
            }
          }
        },
        items: items.map(item => ({
          name: item.name.substring(0, 127), // PayPal limit
          description: item.description ? item.description.substring(0, 127) : '',
          unit_amount: {
            currency_code: 'EUR',
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString(),
          category: 'PHYSICAL_GOODS'
        })),
        shipping: {
          name: {
            full_name: customer.name
          },
          address: {
            address_line_1: customer.address || 'Via esempio 1',
            admin_area_2: customer.city || 'Roma',
            postal_code: customer.postalCode || '00100',
            country_code: 'IT'
          }
        }
      }]
    });

    // Esegui richiesta
    const response = await client().execute(request);

    // Estrai approval URL
    const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;

    return {
      success: true,
      orderId: response.result.id,
      approvalUrl,
      status: response.result.status
    };

  } catch (error) {
    console.error('❌ Errore creazione ordine PayPal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cattura pagamento dopo approvazione
 * @param {string} orderId - Order ID PayPal
 * @returns {Object} - Dettagli transazione
 */
async function captureOrder(orderId) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client().execute(request);

    return {
      success: true,
      orderId: response.result.id,
      status: response.result.status,
      captureId: response.result.purchase_units[0].payments.captures[0].id,
      amount: response.result.purchase_units[0].payments.captures[0].amount.value,
      payer: {
        email: response.result.payer.email_address,
        name: response.result.payer.name.given_name + ' ' + response.result.payer.name.surname
      }
    };

  } catch (error) {
    console.error('❌ Errore cattura pagamento PayPal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Recupera dettagli ordine
 * @param {string} orderId - Order ID PayPal
 * @returns {Object} - Dettagli ordine
 */
async function getOrderDetails(orderId) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
    const response = await client().execute(request);

    return {
      success: true,
      order: response.result
    };

  } catch (error) {
    console.error('❌ Errore recupero ordine PayPal:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createOrder,
  captureOrder,
  getOrderDetails
};
