/**
 * Zenova API Client
 * Helper per chiamare il backend da script.js
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ZenovaAPI {

  /**
   * GET - Lista prodotti
   */
  static async getProducts(page = 1, pageSize = 200) {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();

      if (data.success) {
        return data.data; // Fix: data.data è già l'array dei prodotti
      }
      throw new Error('Errore caricamento prodotti');
    } catch (error) {
      console.error('Errore getProducts:', error);
      return [];
    }
  }

  /**
   * GET - Dettaglio prodotto
   */
  static async getProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      throw new Error('Prodotto non trovato');
    } catch (error) {
      console.error('Errore getProduct:', error);
      return null;
    }
  }

  /**
   * POST - Valida carrello
   */
  static async validateCart(cartItems) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            bigbuyId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore validateCart:', error);
      return { success: false, error: 'Errore validazione carrello' };
    }
  }

  /**
   * POST - Crea checkout Stripe
   */
  static async createCheckout(cartItems, customer) {
    try {
      console.log('🔄 API createCheckout chiamata');
      console.log('📡 URL:', `${API_BASE_URL}/checkout`);
      console.log('📦 Items:', cartItems);
      console.log('👤 Customer:', customer);

      const requestBody = {
        items: cartItems.map(item => ({
          productId: item.id,
          bigbuyId: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          images: item.images
        })),
        customer: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone
        }
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Checkout creato! Redirect a:', data.data.url);
        // Redirect a Stripe checkout
        window.location.href = data.data.url;
      } else {
        console.error('❌ Errore dal backend:', data.error);
        alert(data.error || 'Errore durante il checkout');
      }

      return data;
    } catch (error) {
      console.error('❌ Errore createCheckout:', error);
      alert('Errore durante il checkout. Riprova.');
      return { success: false };
    }
  }

  /**
   * GET - Verifica stock prodotto
   */
  static async checkStock(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Errore checkStock:', error);
      return null;
    }
  }
}

// Export per uso in script.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZenovaAPI;
}
