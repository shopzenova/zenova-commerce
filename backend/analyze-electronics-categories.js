const fs = require('fs');

console.log('📊 Analisi categorie Elettronica...\n');

// Carica i prodotti elettronici già trovati
if (!fs.existsSync('electronics-products.json')) {
    console.log('❌ File electronics-products.json non trovato');
    console.log('   Devi prima eseguire search-electronics-keywords.js');
    process.exit(1);
}

const products = JSON.parse(fs.readFileSync('electronics-products.json', 'utf-8'));

console.log(`📦 Totale prodotti elettronici: ${products.length}\n`);

// Definiamo le sottocategorie basate sui prodotti che abbiamo
const categories = {
    'audio-bluetooth': {
        name: 'Audio e Bluetooth',
        keywords: ['cuffie', 'auricolare', 'speaker', 'altoparlante', 'bluetooth', 'wireless', 'earbuds', 'headphone'],
        products: []
    },
    'smart-home': {
        name: 'Smart Home',
        keywords: ['smart', 'domotica', 'alexa', 'google home', 'sensore', 'telecamera', 'videocitofono'],
        products: []
    },
    'illuminazione': {
        name: 'Illuminazione LED',
        keywords: ['lampada led', 'luce led', 'striscia led', 'smart light', 'illuminazione', 'lampadina'],
        products: []
    },
    'power-charging': {
        name: 'Alimentazione e Ricarica',
        keywords: ['power bank', 'caricabatterie', 'caricatore', 'charger', 'usb', 'wireless charging'],
        products: []
    },
    'wearables': {
        name: 'Smartwatch e Fitness',
        keywords: ['smartwatch', 'fitness tracker', 'activity tracker', 'smart band', 'cardiofrequenzimetro', 'pedometro', 'orologio smart'],
        products: []
    },
    'tablet-ebook': {
        name: 'Tablet e eReader',
        keywords: ['tablet', 'ebook', 'e-book', 'kindle', 'kobo', 'e-reader', 'lettore ebook'],
        products: []
    },
    'fotografia': {
        name: 'Foto e Video',
        keywords: ['action cam', 'gopro', 'drone', 'videocamera', 'fotocamera', 'treppiede', 'gimbal'],
        products: []
    },
    'accessori-tech': {
        name: 'Accessori Tech',
        keywords: ['mouse', 'tastiera', 'keyboard', 'hub', 'adattatore', 'cavo', 'supporto', 'cover', 'custodia'],
        products: []
    }
};

// Categorizza i prodotti
products.forEach(product => {
    const name = product.name.toLowerCase();
    const desc = (product.description || '').toLowerCase();

    let categorized = false;

    for (const [catId, catData] of Object.entries(categories)) {
        if (categorized) break;

        for (const keyword of catData.keywords) {
            if (name.includes(keyword) || desc.includes(keyword)) {
                catData.products.push(product);
                categorized = true;
                break;
            }
        }
    }
});

// Stampa risultati
console.log('=== SOTTOCATEGORIE ELETTRONICA ===\n');

const subcategories = [];

for (const [catId, catData] of Object.entries(categories)) {
    if (catData.products.length > 0) {
        console.log(`📂 ${catData.name} (${catId})`);
        console.log(`   Prodotti: ${catData.products.length}`);

        // Mostra top 5
        console.log('   Top 5:');
        catData.products.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.name.substring(0, 60)}`);
        });
        console.log('');

        subcategories.push({
            id: catId,
            name: catData.name,
            count: catData.products.length,
            products: catData.products
        });
    }
}

// Salva per sottocategoria
const electronicsByCategory = {};
subcategories.forEach(sub => {
    electronicsByCategory[sub.id] = sub.products;
});

fs.writeFileSync(
    'electronics-by-category.json',
    JSON.stringify(electronicsByCategory, null, 2)
);

console.log(`\n✅ ${subcategories.length} sottocategorie create`);
console.log(`💾 Salvato in: electronics-by-category.json`);
