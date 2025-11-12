const fs = require('fs');
const path = require('path');

// Prodotti da cercare per categoria
const searchTerms = {
    'lampade-abbronzanti': {
        keywords: ['lampada uv', 'abbronzante', 'solarium', 'tanning', 'lamp uv'],
        category: 'benessere',
        subcategory: 'lampade-abbronzanti',
        icon: '☀️'
    },
    'accessori-saune': {
        keywords: ['sauna', 'bagno turco', 'spa accessori', 'pietra sauna', 'termometro sauna'],
        category: 'benessere',
        subcategory: 'accessori-saune',
        icon: '🧖'
    },
    'trucco': {
        keywords: ['rossetto', 'mascara', 'fondotinta', 'ombretto', 'eyeliner', 'matita labbra',
                   'gloss', 'cipria', 'blush', 'primer viso', 'correttore viso', 'palette'],
        category: 'bellezza',
        subcategory: 'trucco',
        icon: '💄'
    }
};

const foundProducts = {
    'lampade-abbronzanti': [],
    'accessori-saune': [],
    'trucco': []
};

// File CSV da analizzare
const csvFiles = [
    'bigbuy-data/product_2501_it.csv',  // Health & Beauty prima
    'bigbuy-data/product_2399_it.csv',
    'bigbuy-data/product_2491_it.csv',
    'bigbuy-data/product_2507_it.csv'
];

let totalProducts = 0;

console.log('🔍 Ricerca prodotti specifici nei CSV BigBuy...\n');

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

    // Prima riga = headers
    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    let count = 0;

    // Process ogni riga (saltiamo header)
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

            // Cerca in ogni categoria
            for (const [catKey, catData] of Object.entries(searchTerms)) {
                const found = catData.keywords.some(keyword =>
                    name.includes(keyword.toLowerCase()) ||
                    description.includes(keyword.toLowerCase())
                );

                if (found) {
                    // Evita duplicati
                    if (!foundProducts[catKey].find(p => p.id === row.ID)) {
                        const images = [
                            row.IMAGE1, row.IMAGE2, row.IMAGE3,
                            row.IMAGE4, row.IMAGE5, row.IMAGE6,
                            row.IMAGE7, row.IMAGE8
                        ].filter(img => img && img !== '');

                        foundProducts[catKey].push({
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
                            zenovaCategory: catData.category,
                            zenovaSubcategory: catData.subcategory,
                            icon: catData.icon,
                            raw: row
                        });
                    }
                }
            }
        } catch (err) {
            // Skip malformed rows
        }

        // Progress ogni 10000 righe
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

console.log(`\n📊 Totale prodotti analizzati: ${totalProducts}\n`);
console.log('=== RISULTATI RICERCA ===\n');

for (const [catKey, products] of Object.entries(foundProducts)) {
    console.log(`${catKey.toUpperCase()}: ${products.length} prodotti trovati`);

    if (products.length > 0) {
        // Ordina per stock (più stock = più venduto)
        products.sort((a, b) => b.stock - a.stock);

        // Mostra i top 10
        products.slice(0, 10).forEach((p, i) => {
            const shortName = p.name.substring(0, 70);
            console.log(`  ${i+1}. ${shortName}`);
            console.log(`     Stock: ${p.stock} | €${p.price} | ${p.imageCount} img`);
        });

        if (products.length > 10) {
            console.log(`     ... e altri ${products.length - 10} prodotti`);
        }
    }
    console.log('');
}

// Salva i risultati
const outputFile = 'found-specific-products.json';
fs.writeFileSync(outputFile, JSON.stringify(foundProducts, null, 2));
console.log(`\n💾 Risultati salvati in: ${outputFile}`);
