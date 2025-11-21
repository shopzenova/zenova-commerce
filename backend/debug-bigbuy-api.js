const axios = require('axios');
require('dotenv').config();

async function debugAPI() {
    try {
        console.log('🔄 Debug chiamata API BigBuy...\n');

        const response = await axios.get('https://api.bigbuy.eu/rest/catalog/categories.json', {
            headers: {
                'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`
            },
            params: {
                isoCode: 'it'
            }
        });

        console.log('✅ Risposta ricevuta!\n');
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        console.log('\n📦 BODY completo:\n');
        console.log(JSON.stringify(response.data, null, 2));

        // Salva risposta completa
        const fs = require('fs');
        fs.writeFileSync(
            'bigbuy-api-response.json',
            JSON.stringify(response.data, null, 2)
        );
        console.log('\n✅ Risposta salvata in: bigbuy-api-response.json');

    } catch (error) {
        console.error('❌ Errore:', error.response?.status);
        console.error('Messaggio:', error.response?.data || error.message);
    }
}

debugAPI();
