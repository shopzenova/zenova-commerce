const fs = require('fs');
const csv = require('csv-parser');

// CSV con oli essenziali 10ml
const CSV_10ML = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251210 (8).csv';
// CSV con oli essenziali 50ml
const CSV_50ML = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251210 (9).csv';

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-fix-oli-essenziali-${Date.now()}.json`;

// MARGINE DI VENDITA: prezzo vendita = prezzo costo * 2.2 (120% markup)
const MARKUP = 2.2;

// Traduzioni italiane oli essenziali
const translations = {
    'Lavender': 'Lavanda',
    'Tea Tree': 'Tea Tree (Albero del Tè)',
    'Eucalyptus': 'Eucalipto',
    'Peppermint': 'Menta Piperita',
    'Rosemary': 'Rosmarino',
    'Lemon': 'Limone',
    'Clary Sage': 'Salvia Sclarea',
    'Geranium': 'Geranio',
    'Ylang Ylang': 'Ylang Ylang',
    'Patchouli': 'Patchouli',
    'Jasmine': 'Gelsomino',
    'Orange': 'Arancia',
    'Frankincense': 'Incenso',
    'Chamomile': 'Camomilla',
    'Bergamot': 'Bergamotto',
    'Grapefruit': 'Pompelmo',
    'Cinnamon': 'Cannella',
    'Ginger': 'Zenzero',
    'Basil': 'Basilico',
    'Cedarwood': 'Cedro',
    'Sandalwood': 'Sandalo',
    'Rose': 'Rosa',
    'Neroli': 'Neroli',
    'Vetiver': 'Vetiver',
    'Pine': 'Pino',
    'Juniper': 'Ginepro',
    'Cypress': 'Cipresso',
    'Fennel': 'Finocchio',
    'Thyme': 'Timo',
    'Marjoram': 'Maggiorana',
    'Melissa': 'Melissa',
    'Myrrh': 'Mirra',
    'Black Pepper': 'Pepe Nero',
    'Clove': 'Chiodi di Garofano',
    'Nutmeg': 'Noce Moscata',
    'Cardamom': 'Cardamomo',
    'Coriander': 'Coriandolo',
    'Cumin': 'Cumino',
    'Dill': 'Aneto',
    'Anise': 'Anice',
    'Star Anise': 'Anice Stellato',
    'Citronella': 'Citronella',
    'Lemongrass': 'Lemongrass',
    'Palmarosa': 'Palmarosa',
    'Cajeput': 'Cajeput',
    'Niaouli': 'Niaouli',
    'Ho Wood': 'Legno di Ho',
    'May Chang': 'May Chang',
    'Mandarin': 'Mandarino',
    'Lime': 'Lime',
    'Petitgrain': 'Petitgrain',
    'Hyssop': 'Issopo',
    'Bay Leaf': 'Alloro',
    'Carrot Seed': 'Carota (semi)',
    'Parsley': 'Prezzemolo',
    'Benzoin': 'Benzoino',
    'Absolute': 'Assoluto',
    'Dilute': 'Diluito',
    'Pure': 'Puro',
    'Essential Oil': 'Olio Essenziale',
    'Fragrance Oil': 'Olio Profumato',
    'Bulgarian': 'Bulgaro',
    'Roman': 'Romano',
    'Spanish': 'Spagnolo',
    'Virginian': 'Virginiano',
    'Egypt': 'Egitto',
    'China': 'Cina'
};

function translateName(englishName) {
    let italianName = englishName;

    // Traduci ogni parola
    Object.entries(translations).forEach(([en, it]) => {
        const regex = new RegExp(en, 'gi');
        italianName = italianName.replace(regex, it);
    });

    return italianName;
}

function generateDescription(name, size) {
    const baseName = name.replace(/\d+\s*ml\s*/i, '').replace(/Essential Oil/i, '').trim();

    return `${baseName} ${size} - Olio essenziale 100% puro e naturale, ideale per aromaterapia, diffusori, massaggi e cosmetica naturale. Qualità premium da AW Dropship.`;
}

console.log('🔧 FIX OLI ESSENZIALI - Prezzi Vendita + Traduzioni + Stock\n');

// Backup
console.log('💾 Creazione backup...');
const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(existingProducts, null, 2));
console.log(`✅ Backup: ${BACKUP_FILE}\n`);

const updatedProducts = [];
let updateCount = 0;

async function processCSV(csvPath, size) {
    return new Promise((resolve) => {
        const oilProducts = [];

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                const productCode = row['Product code'] || '';

                // Solo oli essenziali (EO-* e PrEO-*)
                if (!productCode.startsWith('EO-') && !productCode.startsWith('PrEO-')) {
                    return;
                }

                const englishName = row['Unit Name'] || '';
                const costPrice = parseFloat(row['Price']) || 0;
                const sellPrice = Math.round(costPrice * MARKUP * 100) / 100; // Prezzo vendita con markup

                const stock = parseInt(row['Available Quantity']) || 0;
                const stockStatus = row['Stock'] || '';

                // Determina disponibilità
                let available = stock > 0 && (stockStatus === 'Active' || stockStatus === 'Normal' || stockStatus === 'Low' || stockStatus === 'VeryLow');

                if (stockStatus === 'Discontinued' || stockStatus === 'OutofStock') {
                    available = false;
                }

                const imagesString = row['Images'] || '';
                const images = imagesString.split(',').map(url => url.trim()).filter(url => url);

                const italianName = translateName(englishName);
                const description = generateDescription(italianName, size);

                const product = {
                    id: `aw-${productCode.toLowerCase()}`,
                    sku: productCode,
                    name: italianName,
                    description: description,
                    price: sellPrice,
                    costPrice: costPrice, // Salvo anche prezzo di costo per riferimento
                    pvd: costPrice, // Price Vendor Dropship
                    originalPrice: parseFloat(row['Unit RRP']) || sellPrice,
                    currency: 'EUR',
                    stock: stock,
                    stockStatus: stockStatus,
                    available: available,
                    inStock: available,
                    images: images,
                    image: images[0] || '',
                    mainImage: images[0] || '',
                    category: 'Natural Wellness',
                    subcategory: 'oli-essenziali',
                    zenovaCategory: 'natural-wellness',
                    zenovaSubcategory: 'oli-essenziali',
                    zenovaCategories: ['natural-wellness'],
                    tags: ['Oli Essenziali', 'Aromaterapia', 'AW Dropship', 'Naturale'],
                    brand: 'AW Dropship',
                    source: 'aw',
                    barcode: row['Barcode'] || '',
                    weight: parseFloat(row['Unit net weight']) || 0,
                    dimensions: row['Unit dimensions'] || '',
                    materials: row['Materials/Ingredients'] || '',
                    countryOfOrigin: row['Country of origin'] || '',
                    unitsPerOuter: parseInt(row['Units per outer']) || 1,
                    dataUpdated: row['Data updated'] || new Date().toISOString(),
                    stockUpdated: row['Stock updated'] || new Date().toISOString(),
                    priceUpdated: row['Price updated'] || new Date().toISOString(),
                    visible: available,
                    zone: 'sidebar'
                };

                oilProducts.push(product);

                const stockIcon = available ? '✅' : '❌';
                console.log(`${stockIcon} ${italianName}`);
                console.log(`   Costo: €${costPrice.toFixed(2)} → Vendita: €${sellPrice.toFixed(2)} | Stock: ${stock} (${stockStatus})`);
            })
            .on('end', () => {
                resolve(oilProducts);
            });
    });
}

async function main() {
    console.log('📦 Elaborazione oli essenziali 10ml...\n');
    const oils10ml = await processCSV(CSV_10ML, '10ml');

    console.log('\n📦 Elaborazione oli essenziali 50ml...\n');
    const oils50ml = await processCSV(CSV_50ML, '50ml');

    const allOils = [...oils10ml, ...oils50ml];

    console.log(`\n📊 Totale oli elaborati: ${allOils.length}`);

    // Rimuovi vecchi oli essenziali e aggiungi i nuovi
    const productsWithoutOils = existingProducts.filter(p => {
        const isOil = p.source === 'aw' &&
                     (p.zenovaSubcategory === 'oli-essenziali' || p.subcategory === 'oli-essenziali' ||
                      (p.sku && (p.sku.startsWith('EO-') || p.sku.startsWith('PrEO-'))));

        if (isOil) {
            updateCount++;
        }

        return !isOil;
    });

    const finalProducts = [...productsWithoutOils, ...allOils];

    console.log(`\n✅ Rimossi: ${updateCount} oli vecchi`);
    console.log(`✅ Aggiunti: ${allOils.length} oli aggiornati`);
    console.log(`✅ Totale prodotti: ${finalProducts.length}`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(finalProducts, null, 2));

    // Copia in root per frontend
    fs.writeFileSync('../products.json', JSON.stringify(finalProducts, null, 2));

    console.log('\n🎉 OLI ESSENZIALI SISTEMATI!');
    console.log('\n📋 COSA È STATO FATTO:');
    console.log('   ✅ Prezzi: Aggiornati con markup 2.2x (120% margine)');
    console.log('   ✅ Traduzioni: Nomi e descrizioni in italiano');
    console.log('   ✅ Stock: Sincronizzato da CSV AW');
    console.log('   ✅ Immagini: Importate da CSV');
    console.log('   ✅ Disponibilità: Calcolata da stock + status');
}

main().catch(console.error);
