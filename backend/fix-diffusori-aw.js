const fs = require('fs');
const csv = require('csv-parser');

const CSV_PATH = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251210 (11).csv';
const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-fix-diffusori-${Date.now()}.json`;

console.log('🔧 FIX DIFFUSORI AW - Source + Traduzioni + Descrizioni\n');

// Traduzioni
const translations = {
    'Soywax Melts Jar': 'Cera di Soia Profumata in Vasetto',
    'Lavender Fields': 'Campi di Lavanda',
    'Midnight Jasmine': 'Gelsomino di Mezzanotte',
    'Apple Spice': 'Mela Speziata',
    'Coffee Trader': 'Caffè Artigianale',
    'Peachy Cool': 'Pesca Fresca',
    'Floral Paradise': 'Paradiso Floreale',
    'Dark Patchouli': 'Patchouli Intenso',
    'Winter Spice': 'Spezie Invernali',
    'Vanilla Cream': 'Crema di Vaniglia',
    'Citrus Splash': 'Esplosione di Agrumi',
    'Fresh Linen': 'Lino Fresco',
    'Ocean Breeze': 'Brezza Marina',
    'Rose Garden': 'Giardino di Rose',
    'Cinnamon Stick': 'Bastoncini di Cannella',
    'Coconut Lime': 'Cocco e Lime',
    'Strawberry Fields': 'Campi di Fragole',
    'Warm Welcome': 'Caloroso Benvenuto',
    'Floral Greetings': 'Saluti Floreali',
    'Let Angels Pass': 'Lascia Passare gli Angeli',
    'Peaceful Home': 'Casa Serena',
    'Heart & Hearth': 'Cuore e Focolare',
    'Hallway': 'Ingresso',
    'Living Room': 'Soggiorno',
    'Kitchen': 'Cucina',
    'Bathroom': 'Bagno',
    'Bedroom': 'Camera da Letto'
};

function translateName(englishName) {
    let italianName = englishName;
    Object.entries(translations).forEach(([en, it]) => {
        const regex = new RegExp(en, 'gi');
        italianName = italianName.replace(regex, it);
    });
    return italianName;
}

function cleanDescription(htmlDesc) {
    if (!htmlDesc) return '';

    // Rimuovi tag HTML ma mantieni il contenuto
    let clean = htmlDesc.replace(/<[^>]*>/g, ' ');

    // Traduci alcune frasi comuni
    clean = clean.replace(/These/g, 'Queste');
    clean = clean.replace(/are made from/g, 'sono realizzate con');
    clean = clean.replace(/natural blend/g, 'miscela naturale');
    clean = clean.replace(/finest/g, 'migliori');
    clean = clean.replace(/Available in/g, 'Disponibile in');
    clean = clean.replace(/mouthwatering fragrances/g, 'fragranze deliziose');
    clean = clean.replace(/fragrance oils/g, 'oli profumati');
    clean = clean.replace(/Just add/g, 'Basta aggiungere');
    clean = clean.replace(/to make your home smell wonderful/g, 'per profumare meravigliosamente la tua casa');
    clean = clean.replace(/perfect gift/g, 'regalo perfetto');

    // Pulisci spazi multipli
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
}

// Backup
console.log('💾 Backup...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup: ${BACKUP_FILE}\n`);

// Mappa dati dal CSV
const csvData = new Map();

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
        const sku = row['Product code'] || '';
        const descHtml = row['Webpage description (html)'] || '';
        const descPlain = row['Webpage description (plain text)'] || '';

        csvData.set(sku, {
            descriptionHtml: descHtml,
            descriptionPlain: descPlain,
            images: (row['Images'] || '').split(',').map(u => u.trim()).filter(u => u)
        });
    })
    .on('end', () => {
        console.log(`📦 Caricati ${csvData.size} prodotti dal CSV\n`);

        let updateCount = 0;

        // Aggiorna solo prodotti AW con source sbagliato nella categoria diffusori
        products.forEach(product => {
            const isAWDiffusore =
                product.brand === 'AW Dropship' &&
                product.source === 'bigbuy' &&
                (product.zenovaSubcategory === 'diffusori' || product.subcategory === 'diffusori');

            if (isAWDiffusore) {
                const csvProduct = csvData.get(product.sku);

                // Fix source
                product.source = 'aw';

                // Traduci nome
                const oldName = product.name;
                product.name = translateName(oldName);

                // Fix descrizione
                if (csvProduct) {
                    const cleanDesc = cleanDescription(csvProduct.descriptionHtml || csvProduct.descriptionPlain);
                    product.description = cleanDesc || product.description;
                    product.descriptionHtml = csvProduct.descriptionHtml;

                    // Aggiorna immagini se disponibili
                    if (csvProduct.images && csvProduct.images.length > 0) {
                        product.images = csvProduct.images;
                        product.image = csvProduct.images[0];
                        product.mainImage = csvProduct.images[0];
                    }
                }

                updateCount++;
                console.log(`✅ ${product.sku}: ${oldName} → ${product.name}`);
                console.log(`   Source: bigbuy → aw | Stock: ${product.stock}`);
            }
        });

        console.log(`\n📊 AGGIORNATI: ${updateCount} prodotti`);

        // Salva
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        fs.writeFileSync('../products.json', JSON.stringify(products, null, 2));

        console.log('\n✅ File aggiornati!');
        console.log('   - backend/top-100-products.json');
        console.log('   - products.json');

        console.log('\n🎉 DIFFUSORI AW SISTEMATI!');
        console.log('   ✅ Source corretto (bigbuy → aw)');
        console.log('   ✅ Nomi tradotti in italiano');
        console.log('   ✅ Descrizioni dal CSV');
        console.log('   ✅ Immagini aggiornate');
    });
