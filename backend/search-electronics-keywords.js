const fs = require('fs');
const path = require('path');

// Keywords per prodotti elettronica/tech adatti a Zenova
const keywords = [
    // Smart Home
    'smart', 'domotica', 'alexa', 'google home', 'sensore', 'telecamera',

    // Audio
    'cuffie', 'auricolare', 'speaker', 'altoparlante', 'bluetooth', 'wireless',

    // Illuminazione
    'lampada led', 'luce led', 'striscia led', 'smart light', 'illuminazione',

    // Power & Charging
    'power bank', 'caricabatterie', 'caricatore wireless', 'charger',

    // Wearables & Fitness Tech
    'smartwatch', 'fitness tracker', 'activity tracker', 'smart band',
    'cardiofrequenzimetro', 'pedometro',

    // Gadget
    'gadget', 'tech', 'elettronico', 'electronic',

    // Altro tech
    'tablet', 'ebook', 'kindle', 'drone', 'action cam'
];

const foundProducts = [];

const csvFiles = [
    'bigbuy-data/product_2399_it.csv',  // Home & Garden
    'bigbuy-data/product_2491_it.csv',  // Sports | Fitness
    'bigbuy-data/product_2501_it.csv',  // Health & Beauty
    'bigbuy-data/product_2507_it.csv'   // Perfumes | Cosmetics
];

let totalProducts = 0;

console.log('🔍 Ricerca prodotti Elettronica/Tech...\n');

function parseCSVRow(line, headers) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, index) => {
        row[header] = values[index] || '';
    });
    return row;
}

function processCSVFile(filePath) {
    console.log(`📂 Processando: ${path.basename(filePath)}...`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines.length === 0) return;

    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        count++;
        totalProducts++;

        try {
            const row = parseCSVRow(line, headers);

            const name = (row.NAME || '').toLowerCase();
            const description = (row.DESCRIPTION || '').toLowerCase();
            const stock = parseInt(row.STOCK) || 0;
            const price = parseFloat(row.PRICE) || 0;

            if (stock === 0 || price === 0) continue;

            // Cerca keywords
            const found = keywords.some(keyword =>
                name.includes(keyword.toLowerCase()) ||
                description.includes(keyword.toLowerCase())
            );

            if (found) {
                if (!foundProducts.find(p => p.id === row.ID)) {
                    const images = [
                        row.IMAGE1, row.IMAGE2, row.IMAGE3,
                        row.IMAGE4, row.IMAGE5, row.IMAGE6,
                        row.IMAGE7, row.IMAGE8
                    ].filter(img => img && img !== '');

                    foundProducts.push({
                        id: row.ID,
                        name: row.NAME,
                        description: row.DESCRIPTION,
                        brand: row.BRAND,
                        category: row.CATEGORY,
                        price: price,
                        pvd: parseFloat(row.PVD) || 0,
                        stock: stock,
                        ean: row.EAN13,
                        images: images,
                        imageCount: images.length,
                        weight: row.WEIGHT,
                        width: row.WIDTH,
                        height: row.HEIGHT,
                        depth: row.DEPTH,
                        video: row.VIDEO || '0',
                        raw: row
                    });
                }
            }
        } catch (err) {
            // Skip
        }

        if (count % 10000 === 0) {
            process.stdout.write(`\r  Processate ${count} righe...`);
        }
    }

    console.log(`\r  ✓ Completato: ${count} righe processate`);
}

// Process all files
console.log('Inizio ricerca...\n');

for (const file of csvFiles) {
    if (fs.existsSync(file)) {
        processCSVFile(file);
    }
}

console.log(`\n📊 Totale prodotti analizzati: ${totalProducts}`);
console.log(`✅ Prodotti Elettronica/Tech trovati: ${foundProducts.length}\n`);

// Ordina per stock
foundProducts.sort((a, b) => b.stock - a.stock);

// Mostra top 30
console.log('=== TOP 30 PRODOTTI ELETTRONICA/TECH ===\n');
foundProducts.slice(0, 30).forEach((p, i) => {
    console.log(`${i+1}. ${p.name.substring(0, 70)}`);
    console.log(`   Stock: ${p.stock} | €${p.price}`);
});

if (foundProducts.length > 30) {
    console.log(`\n... e altri ${foundProducts.length - 30} prodotti`);
}

// Salva
fs.writeFileSync('electronics-products.json', JSON.stringify(foundProducts, null, 2));
console.log(`\n💾 Risultati salvati in: electronics-products.json`);
