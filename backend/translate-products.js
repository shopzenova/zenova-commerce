const fs = require('fs');
const https = require('https');

// Carica prodotti
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf8'));

console.log('🌍 TRADUZIONE AUTOMATICA PRODOTTI');
console.log('==================================\n');
console.log('📦 Totale prodotti:', products.length);

// Funzione per rilevare se il testo è in inglese
function isEnglish(text) {
    if (!text) return false;
    const textLower = text.toLowerCase();
    const englishKeywords = [
        'these', 'made', 'from', 'with', 'available', 'contains',
        'perfect', 'features', 'designed', 'quality', 'natural',
        'blend', 'fragrance', 'scented', 'aromatherapy'
    ];
    return englishKeywords.some(kw => textLower.includes(kw));
}

// Funzione per tradurre con MyMemory Translate (100% GRATIS, NO API KEY!)
async function translateText(text, retries = 3) {
    // Rimuovi HTML tags per tradurre solo il testo
    const textOnly = text.replace(/<[^>]*>/g, ' ').trim();

    if (textOnly.length === 0) return text;
    if (textOnly.length > 500) {
        // MyMemory ha limite 500 caratteri, dividi in pezzi
        const half = Math.floor(textOnly.length / 2);
        const part1 = await translateText(textOnly.substring(0, half), retries);
        await sleep(500); // Pausa tra le parti
        const part2 = await translateText(textOnly.substring(half), retries);
        return part1 + ' ' + part2;
    }

    return new Promise((resolve, reject) => {
        const encodedText = encodeURIComponent(textOnly);
        const path = `/get?q=${encodedText}&langpair=en|it`;

        const options = {
            hostname: 'api.mymemory.translated.net',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.responseData && response.responseData.translatedText) {
                        resolve(response.responseData.translatedText);
                    } else if (retries > 0) {
                        console.log(`⚠️  Riprovo (${retries} tentativi rimasti)...`);
                        setTimeout(() => {
                            translateText(text, retries - 1).then(resolve).catch(reject);
                        }, 3000);
                    } else {
                        reject(new Error('Translation failed'));
                    }
                } catch (error) {
                    if (retries > 0) {
                        setTimeout(() => {
                            translateText(text, retries - 1).then(resolve).catch(reject);
                        }, 3000);
                    } else {
                        reject(error);
                    }
                }
            });
        });

        req.on('error', (error) => {
            if (retries > 0) {
                console.log(`⚠️  Errore connessione, riprovo (${retries} tentativi rimasti)...`);
                setTimeout(() => {
                    translateText(text, retries - 1).then(resolve).catch(reject);
                }, 3000);
            } else {
                reject(error);
            }
        });

        req.end();
    });
}

// Funzione per attendere un po' tra una traduzione e l'altra
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Trova prodotti in inglese
const englishProducts = products.filter(p =>
    isEnglish(p.name) || isEnglish(p.description)
);

console.log('🇬🇧 Prodotti da tradurre:', englishProducts.length);
console.log('🇮🇹 Prodotti già in italiano:', products.length - englishProducts.length);
console.log('\n🚀 INIZIO TRADUZIONE...\n');

// Traduci tutti i prodotti in inglese
async function translateAllProducts() {
    let translated = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const needsTranslation = isEnglish(product.name) || isEnglish(product.description);

        if (!needsTranslation) continue;

        try {
            console.log(`\n[${i + 1}/${products.length}] 📝 Traduco: ${product.name.substring(0, 60)}...`);

            // Traduci nome se in inglese
            if (isEnglish(product.name)) {
                const originalName = product.name;
                product.name = await translateText(product.name);
                console.log(`   ✅ Nome: ${product.name.substring(0, 60)}...`);
                await sleep(1000); // Pausa 1 secondo tra traduzioni
            }

            // Traduci descrizione se in inglese
            if (isEnglish(product.description)) {
                const originalDesc = product.description;
                product.description = await translateText(product.description);
                console.log(`   ✅ Descrizione tradotta`);
                await sleep(1000); // Pausa 1 secondo
            }

            translated++;
            console.log(`   ✅ Completato (${translated}/${englishProducts.length})`);

        } catch (error) {
            console.error(`   ❌ ERRORE: ${error.message}`);
            errors++;

            // Se troppi errori, fermati
            if (errors > 10) {
                console.log('\n❌ Troppi errori consecutivi, mi fermo.');
                break;
            }

            // Aspetta di più prima di riprovare
            await sleep(3000);
        }
    }

    console.log('\n==================================');
    console.log('✅ TRADUZIONE COMPLETATA!');
    console.log('==================================');
    console.log(`✅ Tradotti: ${translated} prodotti`);
    console.log(`❌ Errori: ${errors}`);
    console.log(`📊 Totale: ${products.length} prodotti`);

    // Salva file tradotto
    const outputFile = 'top-100-products.json';
    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf8');
    console.log(`\n💾 File salvato: ${outputFile}`);
    console.log('\n🎉 FATTO! Tutti i prodotti sono ora in italiano!');
}

// Avvia traduzione
translateAllProducts().catch(error => {
    console.error('\n❌ ERRORE FATALE:', error);
    process.exit(1);
});
