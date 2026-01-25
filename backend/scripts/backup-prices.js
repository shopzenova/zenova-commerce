/**
 * BACKUP PREZZI PRODOTTI
 * Esporta tutti i prezzi attuali in un file JSON per possibile rollback
 *
 * Uso: node scripts/backup-prices.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupPrices() {
  try {
    console.log('📦 Avvio backup prezzi prodotti...\n');

    // Recupera tutti i prodotti con i loro prezzi
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        retailPrice: true,
        originalPrice: true,
        wholesalePrice: true,
        source: true
      }
    });

    console.log(`📊 Trovati ${products.length} prodotti\n`);

    // Crea oggetto backup con timestamp
    const backup = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price) || 0,
        retailPrice: parseFloat(p.retailPrice) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        wholesalePrice: p.wholesalePrice ? parseFloat(p.wholesalePrice) : null,
        source: p.source
      }))
    };

    // Salva backup
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = path.join(backupDir, `prices-backup-${timestamp}.json`);

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup salvato: ${backupFile}`);
    console.log(`\n📈 Statistiche:`);

    // Calcola statistiche
    const avgRetailPrice = products.reduce((sum, p) => sum + (parseFloat(p.retailPrice) || 0), 0) / products.length;
    const minPrice = Math.min(...products.map(p => parseFloat(p.retailPrice) || 0));
    const maxPrice = Math.max(...products.map(p => parseFloat(p.retailPrice) || 0));

    console.log(`   Prezzo medio retail: €${avgRetailPrice.toFixed(2)}`);
    console.log(`   Prezzo minimo: €${minPrice.toFixed(2)}`);
    console.log(`   Prezzo massimo: €${maxPrice.toFixed(2)}`);

    return backupFile;

  } catch (error) {
    console.error('❌ Errore durante backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  backupPrices()
    .then(file => {
      console.log('\n🎉 Backup completato con successo!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n💥 Backup fallito:', err.message);
      process.exit(1);
    });
}

module.exports = { backupPrices };
