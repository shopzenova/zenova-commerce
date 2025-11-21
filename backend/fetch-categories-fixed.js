const axios = require('axios');
require('dotenv').config();

async function fetchCategories() {
    try {
        console.log('🔄 Chiamata API BigBuy con parametri corretti...\n');

        const response = await axios.get('https://api.bigbuy.eu/rest/catalog/categories.json', {
            headers: {
                'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`
            },
            params: {
                isoCode: 'it',
                page: 1,           // Specificato!
                pageSize: 100      // Specificato!
            }
        });

        console.log('✅ Risposta ricevuta!\n');
        console.log(`Status: ${response.status}`);

        const categories = response.data;

        if (Array.isArray(categories)) {
            console.log(`📊 Totale categorie: ${categories.length}\n`);
        } else {
            console.log('📦 Struttura risposta:\n', JSON.stringify(categories, null, 2));
        }

        // Salva risposta completa
        const fs = require('fs');
        fs.writeFileSync(
            'bigbuy-categories-full.json',
            JSON.stringify(categories, null, 2)
        );
        console.log('✅ Risposta salvata in: bigbuy-categories-full.json\n');

        // Se è un array, cerca categorie che ci interessano
        if (Array.isArray(categories) && categories.length > 0) {
            console.log('🔍 Cerco "Salute | Bellezza"...\n');

            const healthBeauty = categories.find(cat =>
                (cat.name && (
                    cat.name.toLowerCase().includes('salute') ||
                    cat.name.toLowerCase().includes('health') ||
                    cat.name.toLowerCase().includes('bellezza') ||
                    cat.name.toLowerCase().includes('beauty')
                )) ||
                cat.id === 2501 || cat.id === '2501'
            );

            if (healthBeauty) {
                console.log('✅ TROVATA!\n');
                console.log(JSON.stringify(healthBeauty, null, 2));

                fs.writeFileSync(
                    'bigbuy-health-beauty.json',
                    JSON.stringify(healthBeauty, null, 2)
                );
            } else {
                console.log('❌ Non trovata. Ecco le prime 10 categorie:\n');
                categories.slice(0, 10).forEach(cat => {
                    console.log(`[${cat.id}] ${cat.name || 'N/A'}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Errore:', error.response?.status);
        console.error('Messaggio:', error.response?.data || error.message);
    }
}

fetchCategories();
