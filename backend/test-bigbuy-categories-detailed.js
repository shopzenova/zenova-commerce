require('dotenv').config();
const axios = require('axios');

async function testCategoriesAPI() {
    console.log('=== TEST ENDPOINTS CATEGORIE BIGBUY ===\n');

    const apiKey = process.env.BIGBUY_API_KEY;
    const baseURL = 'https://api.bigbuy.eu';

    const client = axios.create({
        baseURL,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 30000
    });

    // Test vari endpoint possibili
    const endpoints = [
        { name: 'categories.json', url: '/rest/catalog/categories.json' },
        { name: 'categories.json?isoCode=it', url: '/rest/catalog/categories.json?isoCode=it' },
        { name: 'categories.json?isoCode=en', url: '/rest/catalog/categories.json?isoCode=en' },
        { name: 'productcategories.json', url: '/rest/catalog/productcategories.json' },
        { name: 'productcategories.json?isoCode=it', url: '/rest/catalog/productcategories.json?isoCode=it' },
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Test: ${endpoint.name}`);
            const response = await client.get(endpoint.url);

            console.log(`   ✅ Successo!`);
            console.log(`   Tipo: ${typeof response.data}`);
            console.log(`   Length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);

            if (response.data) {
                const sample = JSON.stringify(response.data, null, 2).substring(0, 500);
                console.log(`   Sample:\n${sample}`);

                // Se troviamo dati, salviamo
                if (Array.isArray(response.data) && response.data.length > 0) {
                    const fs = require('fs');
                    fs.writeFileSync(
                        `bigbuy-${endpoint.name.replace('?', '-').replace('=', '-')}.json`,
                        JSON.stringify(response.data, null, 2)
                    );
                    console.log(`   💾 Salvato!`);
                }
            }

            // Pausa tra richieste
            await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
            console.log(`   ❌ Errore: ${error.response?.status || error.message}`);
            if (error.response?.data) {
                console.log(`   Dettagli:`, error.response.data);
            }
        }
    }
}

testCategoriesAPI();
