const fs = require('fs');
const path = require('path');

// Parole chiave per massaggio e rilassamento
const keywords = [
    'massaggiatore', 'massaggio', 'idromassaggio', 'massaggiante',
    'relax', 'rilassamento', 'rilassante',
    'cervicale', 'schiena', 'piedi', 'gambe', 'corpo',
    'shiatsu', 'percussione', 'vibrazione', 'vibrante',
    'wellness', 'benessere corpo',
    'pediluvio', 'foot spa', 'foot massager',
    'neck massager', 'back massager',
    'tappetino massaggiante', 'cuscino massaggiante',
    'pistola massaggiante', 'massage gun',
    'rullo massaggio', 'roller massage',
    'elettrostimolatore', 'tens',
    'termoforo', 'heat pad', 'cuscinetto riscaldante'
];

const foundProducts = [];

// File CSV da analizzare
const csvFiles = [
    'bigbuy-data/product_2501_it.csv',  // Health & Beauty
    'bigbuy-data/product_2399_it.csv',
    'bigbuy-data/product_2491_it.csv',
    'bigbuy-data/product_2507_it.csv'
];

let totalProducts = 0;

console.log('🔍 Ricerca TUTTI i prodotti Massaggio e Rilassamento...\n');

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

            // Solo prodotti con stock > 0 e prezzo > 0
            if (stock === 0 || price === 0) continue;

            // Cerca keywords
            const found = keywords.some(keyword =>
                name.includes(keyword.toLowerCase()) ||
                description.includes(keyword.toLowerCase())
            );

            if (found) {
                // Evita duplicati
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
            // Skip malformed rows
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
console.log(`✅ Prodotti Massaggio e Rilassamento trovati: ${foundProducts.length}\n`);

// Ordina per stock (più venduti)
foundProducts.sort((a, b) => b.stock - a.stock);

// Mostra i top 20
console.log('=== TOP 20 PRODOTTI PER STOCK ===\n');
foundProducts.slice(0, 20).forEach((p, i) => {
    console.log(`${i+1}. ${p.name.substring(0, 70)}`);
    console.log(`   Stock: ${p.stock} | €${p.price} | ${p.imageCount} img`);
});

if (foundProducts.length > 20) {
    console.log(`\n... e altri ${foundProducts.length - 20} prodotti`);
}

// Salva i risultati
fs.writeFileSync('massaggio-products.json', JSON.stringify(foundProducts, null, 2));
console.log(`\n💾 Risultati salvati in: massaggio-products.json`);

console.log(`\n📋 PROSSIMO STEP:`);
console.log(`   Trovati ${foundProducts.length} prodotti`);
console.log(`   Vuoi aggiungerli tutti o filtrare ulteriormente?`);
