/**
 * AGGIORNA PREZZI - AGGIUNGI €4 A TUTTI I PRODOTTI
 * Aggiunge €4 al prezzo retail di ogni prodotto
 *
 * IMPORTANTE: Esegui prima backup-prices.js!
 *
 * Uso: node scripts/update-prices-add-4euro.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { backupPrices } = require('./backup-prices');

const prisma = new PrismaClient();

const PRICE_INCREASE = 4.00; // €4 da aggiungere

async function updatePrices() {
  try {
    console.log('💰 AGGIORNAMENTO PREZZI PRODOTTI');
    console.log('================================\n');
    console.log(`📊 Aumento previsto: +€${PRICE_INCREASE.toFixed(2)} per prodotto\n`);

    // STEP 1: Crea backup automatico prima di modificare
    console.log('📦 Creazione backup automatico...');
    const backupFile = await backupPrices();
    console.log(`✅ Backup creato: ${backupFile}\n`);

    // STEP 2: Conta prodotti
    const totalProducts = await prisma.product.count();
    console.log(`📊 Prodotti da aggiornare: ${totalProducts}\n`);

    // STEP 3: Mostra anteprima (primi 5 prodotti)
    console.log('👀 Anteprima modifiche (primi 5 prodotti):');
    console.log('─'.repeat(70));

    const preview = await prisma.product.findMany({
      take: 5,
      select: { id: true, name: true, retailPrice: true }
    });

    preview.forEach(p => {
      const oldPrice = parseFloat(p.retailPrice) || 0;
      const newPrice = oldPrice + PRICE_INCREASE;
      console.log(`  ${p.name.substring(0, 40).padEnd(40)} €${oldPrice.toFixed(2)} → €${newPrice.toFixed(2)}`);
    });
    console.log('─'.repeat(70) + '\n');

    // STEP 4: Esegui update
    console.log('🔄 Aggiornamento in corso...');

    // Usa raw query per update massivo più efficiente
    const result = await prisma.$executeRaw`
      UPDATE products
      SET retail_price = retail_price + ${PRICE_INCREASE},
          updated_at = NOW()
    `;

    console.log(`\n✅ Aggiornati ${result} prodotti!`);

    // STEP 5: Verifica
    console.log('\n🔍 Verifica post-update (stessi 5 prodotti):');
    console.log('─'.repeat(70));

    const verify = await prisma.product.findMany({
      where: { id: { in: preview.map(p => p.id) } },
      select: { id: true, name: true, retailPrice: true }
    });

    verify.forEach(p => {
      const newPrice = parseFloat(p.retailPrice) || 0;
      console.log(`  ${p.name.substring(0, 40).padEnd(40)} → €${newPrice.toFixed(2)} ✓`);
    });
    console.log('─'.repeat(70));

    // Statistiche finali
    const stats = await prisma.product.aggregate({
      _avg: { retailPrice: true },
      _min: { retailPrice: true },
      _max: { retailPrice: true }
    });

    console.log('\n📈 Nuove statistiche prezzi:');
    console.log(`   Media: €${parseFloat(stats._avg.retailPrice).toFixed(2)}`);
    console.log(`   Minimo: €${parseFloat(stats._min.retailPrice).toFixed(2)}`);
    console.log(`   Massimo: €${parseFloat(stats._max.retailPrice).toFixed(2)}`);

    console.log('\n⚠️  IMPORTANTE: Fai redeploy su Railway per applicare le modifiche!');
    console.log('   Comando: railway up\n');

    return result;

  } catch (error) {
    console.error('❌ Errore durante aggiornamento:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  updatePrices()
    .then(count => {
      console.log('🎉 Aggiornamento completato con successo!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n💥 Aggiornamento fallito:', err.message);
      console.log('\n💡 Usa rollback-prices.js per ripristinare dal backup');
      process.exit(1);
    });
}

module.exports = { updatePrices };
