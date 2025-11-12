const https = require('https');
const fs = require('fs');

// Credenziali BigBuy API
const API_KEY = 'bbCDCSK9mS6i:XgVEDUdao7';
const API_BASE64 = Buffer.from(API_KEY).toString('base64');

console.log('🔍 Ricerca eBook Reader tramite API BigBuy...\n');

// Cerca prodotti per keyword
function searchProducts(keyword) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.bigbuy.eu',
            path: `/rest/catalog/products.json?isoCode=it&pageSize=100&search=${encodeURIComponent(keyword)}`,
            method: 'GET',
            headers: {
                'Authorization': `Basic ${API_BASE64}`,
                'Content-Type': 'application/json'
            }
        };

        console.log(`📡 Chiamata API: ${options.path}`);

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (err) {
                        reject(new Error('Errore parsing JSON: ' + err.message));
                    }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function findEbookReaders() {
    const keywords = [
        'ebook reader',
        'e-reader',
        'kindle',
        'kobo'
    ];

    const allProducts = [];
    const seenIds = new Set();

    for (const keyword of keywords) {
        console.log(`\n🔎 Ricerca: "${keyword}"`);

        try {
            const result = await searchProducts(keyword);

            if (result && result.products) {
                console.log(`   Trovati: ${result.products.length} prodotti`);

                result.products.forEach(product => {
                    if (!seenIds.has(product.id) && product.active && product.inStock) {
                        seenIds.add(product.id);
                        allProducts.push(product);
                    }
                });
            } else {
                console.log(`   Nessun risultato`);
            }

            // Pausa per non sovraccaricare API
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`   ❌ Errore: ${err.message}`);
        }
    }

    console.log(`\n📊 Totale eBook Reader unici: ${allProducts.length}\n`);

    if (allProducts.length > 0) {
        console.log('=== EBOOK READER TROVATI ===\n');
        allProducts.forEach((p, i) => {
            console.log(`${i+1}. ${p.name}`);
            console.log(`   ID: ${p.id} | Stock: ${p.stock || 'N/A'} | €${p.retailPrice || 'N/A'}`);
        });

        // Salva risultati
        fs.writeFileSync(
            'ebook-readers-api.json',
            JSON.stringify(allProducts, null, 2)
        );
        console.log(`\n💾 Salvato in: ebook-readers-api.json`);
    } else {
        console.log('❌ Nessun eBook Reader disponibile su BigBuy');
    }
}

findEbookReaders();
