const fs = require('fs');
const path = require('path');

console.log('📚 Ricerca SOLO eBook Reader...\n');

const csvFiles = [
    'bigbuy-data/product_2399_it.csv',  // Home & Garden
    'bigbuy-data/product_2491_it.csv',  // Sports | Fitness
    'bigbuy-data/product_2501_it.csv',  // Health & Beauty
    'bigbuy-data/product_2507_it.csv'   // Perfumes | Cosmetics
];

// Keywords SPECIFICHE per ebook reader
const ebookKeywords = [
    'ebook reader',
    'e-reader',
    'lettore ebook',
    'lettore e-book',
    'kindle',
    'kobo',
    'pocketbook',
    'boox',
    'tolino',
    'nolim',
    'tagus',
    'bq cervantes'
];

const foundProducts = [];

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
    let count = 0;

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

            // Cerca SOLO ebook reader
            const found = ebookKeywords.some(keyword =>
                name.includes(keyword) ||
                desc.includes(keyword) ||
                category.includes(keyword)
            );

            if (found && stock > 0) {
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
                    video: row.VIDEO || '0'
                });
                count++;
            }
        } catch (err) {
            // Skip
        }

        if (i % 10000 === 0) {
            process.stdout.write(`\r  Processate ${i} righe...`);
        }
    }

    console.log(`\r  ✓ Completato. Trovati ${count} ebook reader`);
}

// Process all files
csvFiles.forEach(processCSVFile);

console.log(`\n📊 Totale eBook Reader trovati: ${foundProducts.length}\n`);

if (foundProducts.length > 0) {
    console.log('=== EBOOK READER DISPONIBILI ===\n');
    foundProducts.forEach((p, i) => {
        console.log(`${i+1}. ${p.name}`);
        console.log(`   Brand: ${p.brand} | Stock: ${p.stock} | €${p.price}`);
        console.log(`   Categoria: ${p.category}`);
        console.log('');
    });

    fs.writeFileSync('ebook-readers-found.json', JSON.stringify(foundProducts, null, 2));
    console.log(`💾 Salvato in: ebook-readers-found.json`);
} else {
    console.log('❌ NESSUN EBOOK READER TROVATO nei CSV di BigBuy');
    console.log('\n💡 BigBuy non sembra avere eBook Reader nel loro catalogo');
    console.log('   I CSV scaricati non contengono prodotti di questa categoria.');
}
