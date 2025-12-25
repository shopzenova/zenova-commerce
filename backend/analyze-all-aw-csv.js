const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const CSV_DIR = 'C:\\Users\\giorg\\Downloads';
const csvFiles = [
    'portfolio_data_feed_cdeu-000774-dssk_20251220.csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251218.csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251211.csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210.csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (1).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (2).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (3).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (4).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (5).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (6).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (7).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (8).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (9).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (10).csv',
    'portfolio_data_feed_cdeu-000774-dssk_20251210 (11).csv'
];

console.log('=== ANALISI CSV AW DROPSHIP ===\n');

async function analyzeCSV(filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(CSV_DIR, filename);

        if (!fs.existsSync(filePath)) {
            resolve({ filename, error: 'File non trovato', products: [] });
            return;
        }

        const products = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                products.push({
                    code: row['Product code'] || '',
                    name: row['Unit Name'] || '',
                    price: parseFloat(row['Price']) || 0,
                    stock: parseInt(row['Available Quantity']) || 0,
                    stockStatus: row['Stock'] || '',
                    images: (row['Images'] || '').split(',').length,
                    brand: row['Brand'] || '',
                    category: row['Category'] || ''
                });
            })
            .on('end', () => {
                resolve({ filename, products, count: products.length });
            })
            .on('error', (error) => {
                resolve({ filename, error: error.message, products: [] });
            });
    });
}

async function analyzeAll() {
    const results = [];

    for (const filename of csvFiles) {
        const result = await analyzeCSV(filename);
        results.push(result);
    }

    // Stampa riepilogo
    console.log('📊 RIEPILOGO CSV\n');
    console.log('File'.padEnd(60) + 'Prodotti'.padEnd(12) + 'Tipo Prodotti');
    console.log('='.repeat(100));

    for (const result of results) {
        if (result.error) {
            console.log(`${result.filename.padEnd(60)}ERROR: ${result.error}`);
            continue;
        }

        if (result.count === 0) {
            console.log(`${result.filename.padEnd(60)}${result.count.toString().padEnd(12)}VUOTO`);
            continue;
        }

        // Identifica tipo prodotti
        const sample = result.products[0];
        const type = sample.name.substring(0, 50);

        console.log(`${result.filename.padEnd(60)}${result.count.toString().padEnd(12)}${type}`);
    }

    // Analisi dettagliata per CSV con prodotti
    console.log('\n\n📋 DETTAGLI CSV CON PRODOTTI\n');

    for (const result of results.filter(r => r.count > 0)) {
        console.log(`\n${'='.repeat(100)}`);
        console.log(`📁 ${result.filename}`);
        console.log(`   Prodotti: ${result.count}`);

        // Range prezzi
        const prices = result.products.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
            console.log(`   Prezzi: €${Math.min(...prices).toFixed(2)} - €${Math.max(...prices).toFixed(2)}`);
        }

        // Stock
        const inStock = result.products.filter(p => p.stock > 0 && p.stockStatus === 'Active').length;
        console.log(`   In Stock: ${inStock}/${result.count} (${Math.round(inStock/result.count*100)}%)`);

        // Brand
        const brands = [...new Set(result.products.map(p => p.brand).filter(b => b))];
        if (brands.length > 0) {
            console.log(`   Brand: ${brands.slice(0, 3).join(', ')}${brands.length > 3 ? '...' : ''}`);
        }

        // Esempi prodotti
        console.log(`\n   🔹 Primi 5 prodotti:`);
        result.products.slice(0, 5).forEach((p, i) => {
            console.log(`      ${i+1}. [${p.code}] ${p.name.substring(0, 60)}`);
            console.log(`         €${p.price.toFixed(2)} | Stock: ${p.stock} (${p.stockStatus}) | Immagini: ${p.images}`);
        });
    }

    // Riepilogo finale
    console.log('\n\n' + '='.repeat(100));
    console.log('📊 RIEPILOGO TOTALE\n');
    const totalProducts = results.reduce((sum, r) => sum + r.count, 0);
    const csvWithProducts = results.filter(r => r.count > 0).length;
    console.log(`CSV totali: ${results.length}`);
    console.log(`CSV con prodotti: ${csvWithProducts}`);
    console.log(`CSV vuoti/errore: ${results.length - csvWithProducts}`);
    console.log(`Prodotti totali (somma): ${totalProducts}`);
}

analyzeAll().catch(console.error);
