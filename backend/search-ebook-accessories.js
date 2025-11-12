const fs = require('fs');
const path = require('path');

console.log('📚 Ricerca prodotti eBook e accessori...\n');

const csvFiles = [
    'bigbuy-data/product_2609_it.csv'   // Informatica | Elettronica
];

// Categorie con keyword specifiche
const categories = {
    'alimentatori': {
        name: 'Alimentatori',
        keywords: [
            'alimentatore',
            'caricabatterie tablet',
            'caricatore tablet',
            'charger tablet',
            'adattatore corrente',
            'power adapter'
        ],
        products: []
    },
    'custodie-morbide': {
        name: 'Custodie morbide',
        keywords: [
            'custodia morbida',
            'cover morbida',
            'sleeve',
            'borsa tablet',
            'borsa ebook',
            'soft case',
            'custodia tessuto',
            'custodia neoprene'
        ],
        products: []
    },
    'custodie-rigide': {
        name: 'Custodie rigide',
        keywords: [
            'custodia rigida',
            'cover rigida',
            'hard case',
            'flip cover',
            'smart cover',
            'custodia protettiva',
            'case tablet',
            'folio case'
        ],
        products: []
    },
    'ebook-reader': {
        name: 'eBook Reader',
        keywords: [
            'ebook reader',
            'e-reader',
            'lettore ebook',
            'kindle',
            'kobo',
            'pocketbook',
            'boox',
            'tolino'
        ],
        products: []
    },
    'luci-lettura': {
        name: 'Luci di lettura',
        keywords: [
            'luce lettura',
            'lampada lettura',
            'reading light',
            'book light',
            'luce libro',
            'lampada libro',
            'clip light',
            'lampada clip lettura'
        ],
        products: []
    }
};

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
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File non trovato: ${filePath}`);
        return;
    }

    console.log(`📂 Processando: ${path.basename(filePath)}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines.length === 0) return;

    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            const row = parseCSVRow(line, headers);
            const name = (row.NAME || '').toLowerCase();
            const desc = (row.DESCRIPTION || '').toLowerCase();
            const category = (row.CATEGORY || '').toLowerCase();
            const stock = parseInt(row.STOCK) || 0;
            const price = parseFloat(row.PRICE) || 0;

            if (stock === 0 || price === 0) continue;

            const text = name + ' ' + desc + ' ' + category;

            // Cerca in ogni categoria
            for (const [catId, catData] of Object.entries(categories)) {
                const found = catData.keywords.some(keyword =>
                    text.includes(keyword.toLowerCase())
                );

                if (found) {
                    // Evita duplicati
                    if (!catData.products.find(p => p.id === row.ID)) {
                        const images = [
                            row.IMAGE1, row.IMAGE2, row.IMAGE3,
                            row.IMAGE4, row.IMAGE5, row.IMAGE6,
                            row.IMAGE7, row.IMAGE8
                        ].filter(img => img && img !== '');

                        catData.products.push({
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
                            video: row.VIDEO || '0'
                        });
                    }
                }
            }
        } catch (err) {
            // Skip
        }

        if (i % 10000 === 0) {
            process.stdout.write(`\r  Processate ${i} righe...`);
        }
    }

    console.log(`\r  ✓ Completato`);
}

// Process all files
csvFiles.forEach(processCSVFile);

console.log('\n=== RISULTATI RICERCA ===\n');

let totalProducts = 0;

for (const [catId, catData] of Object.entries(categories)) {
    console.log(`📂 ${catData.name}`);
    console.log(`   Prodotti trovati: ${catData.products.length}`);

    if (catData.products.length > 0) {
        console.log('   Top 5:');
        catData.products.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i+1}. ${p.name.substring(0, 60)}`);
        });
    }
    console.log('');

    totalProducts += catData.products.length;
}

console.log(`📊 TOTALE: ${totalProducts} prodotti trovati\n`);

if (totalProducts > 0) {
    // Salva risultati
    const results = {};
    for (const [catId, catData] of Object.entries(categories)) {
        results[catId] = catData.products;
    }

    fs.writeFileSync('ebook-accessories-all.json', JSON.stringify(results, null, 2));
    console.log('💾 Salvato in: ebook-accessories-all.json');
} else {
    console.log('❌ Nessun prodotto trovato per queste categorie');
}
