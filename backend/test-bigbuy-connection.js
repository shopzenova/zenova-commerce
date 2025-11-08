require('dotenv').config(); // Carica .env PRIMA di tutto
const bigBuyClient = require('./src/integrations/BigBuyClient');

async function testConnection() {
    console.log('=== TEST CONNESSIONE BIGBUY API ===\n');

    try {
        console.log('📡 Test 1: Scarico categorie...\n');

        const categories = await bigBuyClient.getCategories();

        console.log('✅ Connessione RIUSCITA!');
        console.log('📊 Tipo risposta:', typeof categories);
        console.log('📦 Struttura:', JSON.stringify(categories, null, 2).substring(0, 500));

        // Salva per analisi
        const fs = require('fs');
        fs.writeFileSync(
            'bigbuy-categories-real.json',
            JSON.stringify(categories, null, 2)
        );
        console.log('\n💾 Salvato in bigbuy-categories-real.json');

    } catch (error) {
        console.error('❌ Errore connessione:', error.message);
        console.error(error.response?.data || error.stack);
    }
}

testConnection();
