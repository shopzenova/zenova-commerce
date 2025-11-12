const fs = require('fs');
const path = require('path');

console.log('🔍 Esplorazione prodotti Elettronica BigBuy...\n');

const csvFiles = [
    'bigbuy-data/product_2609_it.csv', // Computers | Electronics
    'bigbuy-data/product_2399_it.csv', // Home & Garden (può avere smart home)
];

const products = [];

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

    for (let i = 1; i < lines.length && count < 100; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            const row = parseCSVRow(line, headers);
            const stock = parseInt(row.STOCK) || 0;
            const price = parseFloat(row.PRICE) || 0;

            if (stock > 0 && price > 0) {
                products.push({
                    name: row.NAME,
                    price: price,
                    stock: stock
                });
                count++;
            }
        } catch (err) {
            // Skip
        }
    }
    console.log(`  ✓ Campionati ${count} prodotti`);
}

// Process files
csvFiles.forEach(processCSVFile);

console.log(`\n📊 Totale prodotti campionati: ${products.length}\n`);
console.log('=== PRIMI 50 PRODOTTI ELETTRONICA ===\n');

products.slice(0, 50).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
});

console.log('\n💡 Analizza questi prodotti per decidere le sottocategorie...');
