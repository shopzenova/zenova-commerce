const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bigbuy = require('../integrations/BigBuyClient');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

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

    // Fetch minQuantity dal DB
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, minQuantity: true }
    });
    const minQtyMap = {};
    dbProducts.forEach(p => { minQtyMap[p.id] = p.minQuantity || 1; });

    // Verifica stock su BigBuy
    const stockData = await bigbuy.checkMultipleStock(productIds);

    // Controlla disponibilità e minQuantity
    const issues = [];
    const items_validated = [];

    for (const item of items) {
      const productId = item.productId || item.bigbuyId;
      const stock = stockData.stocks?.find(s => s.productId === productId);
      const minQty = minQtyMap[productId] || 1;

      if (!stock || !stock.available || stock.quantity < item.quantity) {
        issues.push({
          productId,
          message: `Prodotto non disponibile o quantità insufficiente (disponibili: ${stock?.quantity || 0})`
        });
      }

      if (item.quantity < minQty) {
        issues.push({
          productId,
          type: 'min_quantity',
          message: `Quantità minima per questo prodotto: ${minQty} pezzi`
        });
      }

      items_validated.push({
        productId,
        requestedQuantity: item.quantity,
        availableQuantity: stock?.quantity || 0,
        available: stock?.available || false,
        minQuantity: minQty
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
