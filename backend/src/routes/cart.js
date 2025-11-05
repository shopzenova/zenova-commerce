const express = require('express');
const router = express.Router();
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');

// POST /api/cart/validate - Valida carrello (stock e prezzi)
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Carrello vuoto'
      });
    }

    // Estrai IDs prodotti
    const productIds = items.map(item => item.productId || item.bigbuyId);

    // Verifica stock su BigBuy
    const stockData = await bigbuy.checkMultipleStock(productIds);

    // Controlla disponibilità
    const issues = [];
    const items_validated = [];

    for (const item of items) {
      const productId = item.productId || item.bigbuyId;
      const stock = stockData.stocks?.find(s => s.productId === productId);

      if (!stock || !stock.available || stock.quantity < item.quantity) {
        issues.push({
          productId,
          message: `Prodotto non disponibile o quantità insufficiente (disponibili: ${stock?.quantity || 0})`
        });
      }

      items_validated.push({
        productId,
        requestedQuantity: item.quantity,
        availableQuantity: stock?.quantity || 0,
        available: stock?.available || false
      });
    }

    res.json({
      success: true,
      data: {
        valid: issues.length === 0,
        issues: issues,
        items: items_validated
      }
    });

  } catch (error) {
    logger.error('Errore /api/cart/validate:', error);
    res.status(500).json({
      success: false,
      error: 'Errore validazione carrello'
    });
  }
});

module.exports = router;
