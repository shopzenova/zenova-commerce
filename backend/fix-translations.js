const fs = require('fs');
const path = require('path');
const https = require('https');

// Load products
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Find products with translation errors
const brokenProducts = products.filter(p =>
    (p.name && p.name.includes('MYMEMORY WARNING')) ||
    (p.description && p.description.includes('MYMEMORY WARNING'))
);

console.log(`\n🔍 Trovati ${brokenProducts.length} prodotti con errori di traduzione\n`);

// Load backup to get original texts
const backupPath = path.join(__dirname, 'top-100-products.backup-pretraduzione-20251212-174835.json');
let backupProducts = [];
try {
    backupProducts = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`✅ Backup caricato: ${backupProducts.length} prodotti\n`);
} catch (err) {
    console.error('❌ Backup non trovato!');
    process.exit(1);
}

// Translation function with delay
function translateText(text, langPair = 'en|it') {
    return new Promise((resolve, reject) => {
        const encodedText = encodeURIComponent(text.substring(0, 500)); // Limit to 500 chars
        const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.responseStatus === 200 || result.responseData) {
                        resolve(result.responseData.translatedText);
                    } else {
                        reject(new Error(result.responseDetails || 'Translation failed'));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

// Process products with delay
async function fixTranslations() {
    let fixed = 0;
    let failed = 0;

    for (let i = 0; i < brokenProducts.length; i++) {
        const product = brokenProducts[i];
        const backup = backupProducts.find(p => p.id === product.id);

        if (!backup) {
            console.log(`⚠️  [${i+1}/${brokenProducts.length}] ${product.id} - Backup non trovato`);
            failed++;
            continue;
        }

        try {
            console.log(`\n🔄 [${i+1}/${brokenProducts.length}] Traduzione ${product.id}...`);

            // Translate name if broken
            if (product.name.includes('MYMEMORY WARNING')) {
                const translatedName = await translateText(backup.name);
                product.name = translatedName;
                console.log(`   ✅ Nome: ${translatedName.substring(0, 60)}...`);
            }

            // Wait 1 second between requests (API limit)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Translate description if broken
            if (product.description && product.description.includes('MYMEMORY WARNING')) {
                const translatedDesc = await translateText(backup.description);
                product.description = translatedDesc;
                console.log(`   ✅ Descrizione tradotta`);
            }

            fixed++;

            // Wait 1 second between products
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.log(`   ❌ Errore: ${err.message}`);

            // If quota exceeded, stop
            if (err.message.includes('QUOTA') || err.message.includes('LIMIT')) {
                console.log('\n⚠️  Quota API esaurita. Salvando progressi...\n');
                break;
            }

            failed++;
        }
    }

    console.log(`\n📊 RIEPILOGO:`);
    console.log(`   ✅ Tradotti: ${fixed}`);
    console.log(`   ❌ Falliti: ${failed}`);
    console.log(`   📦 Totale: ${brokenProducts.length}\n`);

    if (fixed > 0) {
        // Backup
        const backupName = `top-100-products.backup-fix-translations-${Date.now()}.json`;
        fs.writeFileSync(path.join(__dirname, backupName), fs.readFileSync(productsPath, 'utf8'));
        console.log(`💾 Backup creato: ${backupName}`);

        // Save
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        console.log(`💾 File salvato: top-100-products.json`);
        console.log(`\n✅ Traduzioni completate!\n`);
    } else {
        console.log(`\n⚠️  Nessuna traduzione completata.\n`);
    }
}

// Run
fixTranslations().catch(console.error);
