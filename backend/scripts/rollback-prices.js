/**
 * ROLLBACK PREZZI PRODOTTI
 * Ripristina i prezzi da un file di backup
 *
 * Uso: node scripts/rollback-prices.js [backup-file]
 *
 * Se non specifichi il file, usa l'ultimo backup disponibile
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function rollbackPrices(backupFile = null) {
  try {
    console.log('🔄 ROLLBACK PREZZI PRODOTTI');
    console.log('===========================\n');

    // Trova backup file
    const backupDir = path.join(__dirname, '../backups');

    if (!backupFile) {
      // Cerca ultimo backup
      if (!fs.existsSync(backupDir)) {
        throw new Error('Nessuna cartella backups trovata!');
      }

      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('prices-backup-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) {
        throw new Error('Nessun backup trovato nella cartella backups/');
      }

      backupFile = path.join(backupDir, files[0]);
      console.log(`📁 Usando ultimo backup: ${files[0]}`);
    }

    // Carica backup
    if (!fs.existsSync(backupFile)) {
      throw new Error(`File backup non trovato: ${backupFile}`);
    }

    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

    console.log(`📅 Backup del: ${backup.timestamp}`);
    console.log(`📊 Prodotti nel backup: ${backup.totalProducts}\n`);

    // Mostra anteprima (primi 5)
    console.log('👀 Anteprima rollback (primi 5 prodotti):');
    console.log('─'.repeat(70));

    const previewIds = backup.products.slice(0, 5).map(p => p.id);
    const currentProducts = await prisma.product.findMany({
      where: { id: { in: previewIds } },
      select: { id: true, name: true, retailPrice: true }
    });

    currentProducts.forEach(current => {
      const backupProduct = backup.products.find(p => p.id === current.id);
      if (backupProduct) {
        const currentPrice = parseFloat(current.retailPrice) || 0;
        const backupPrice = backupProduct.retailPrice;
        console.log(`  ${current.name.substring(0, 40).padEnd(40)} €${currentPrice.toFixed(2)} → €${backupPrice.toFixed(2)}`);
      }
    });
    console.log('─'.repeat(70) + '\n');

    // Esegui rollback
    console.log('🔄 Rollback in corso...');

    let updated = 0;
    let errors = 0;

    // Aggiorna in batch di 100 per evitare timeout
    const batchSize = 100;
    for (let i = 0; i < backup.products.length; i += batchSize) {
      const batch = backup.products.slice(i, i + batchSize);

      await Promise.all(batch.map(async (product) => {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              retailPrice: product.retailPrice,
              price: product.price,
              originalPrice: product.originalPrice,
              wholesalePrice: product.wholesalePrice,
              updatedAt: new Date()
            }
          });
          updated++;
        } catch (err) {
          errors++;
          // Prodotto potrebbe essere stato eliminato
        }
      }));

      // Progress
      const progress = Math.min(100, Math.round((i + batchSize) / backup.products.length * 100));
      process.stdout.write(`\r  Progresso: ${progress}% (${updated} aggiornati, ${errors} errori)`);
    }

    console.log('\n');
    console.log(`✅ Rollback completato!`);
    console.log(`   - Prodotti aggiornati: ${updated}`);
    console.log(`   - Errori (prodotti non trovati): ${errors}`);

    // Verifica
    console.log('\n🔍 Verifica post-rollback:');
    console.log('─'.repeat(70));

    const verify = await prisma.product.findMany({
      where: { id: { in: previewIds } },
      select: { id: true, name: true, retailPrice: true }
    });

    verify.forEach(p => {
      const price = parseFloat(p.retailPrice) || 0;
      console.log(`  ${p.name.substring(0, 40).padEnd(40)} → €${price.toFixed(2)} ✓`);
    });
    console.log('─'.repeat(70));

    console.log('\n⚠️  IMPORTANTE: Fai redeploy su Railway per applicare le modifiche!');
    console.log('   Comando: railway up\n');

    return updated;

  } catch (error) {
    console.error('❌ Errore durante rollback:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  const backupFile = process.argv[2] || null;

  rollbackPrices(backupFile)
    .then(count => {
      console.log('🎉 Rollback completato con successo!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n💥 Rollback fallito:', err.message);
      process.exit(1);
    });
}

module.exports = { rollbackPrices };
