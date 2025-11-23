/**
 * Script per eseguire la sincronizzazione automatica
 * Beauty + Health & Personal Care da BigBuy
 */

// Carica variabili d'ambiente
require('dotenv').config();

const { autoSync } = require('./src/services/auto-sync');

console.log('🚀 Avvio sincronizzazione automatica Beauty + Health & Personal Care...\n');

autoSync()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RISULTATI SINCRONIZZAZIONE');
    console.log('='.repeat(60));
    console.log(`✅ Successo: ${result.success}`);
    console.log(`⏱️  Durata: ${result.duration} secondi`);
    console.log(`\n💄 BEAUTY:`);
    console.log(`   - Controllati: ${result.stats.beauty.checked}`);
    console.log(`   - Aggiunti: ${result.stats.beauty.added}`);
    console.log(`   - Aggiornati: ${result.stats.beauty.updated}`);
    console.log(`   - Saltati: ${result.stats.beauty.skipped}`);
    console.log(`\n🏥 HEALTH & PERSONAL CARE:`);
    console.log(`   - Controllati: ${result.stats.health.checked}`);
    console.log(`   - Aggiunti: ${result.stats.health.added}`);
    console.log(`   - Aggiornati: ${result.stats.health.updated}`);
    console.log(`   - Saltati: ${result.stats.health.skipped}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errori: ${result.errors.length}`);
      result.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    }

    console.log('='.repeat(60));
    console.log('✅ Sincronizzazione completata!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ERRORE SINCRONIZZAZIONE:', error);
    process.exit(1);
  });
