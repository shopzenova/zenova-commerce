const fs = require('fs');
const csv = require('csv-parser');

const CSV_PATH = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251218.csv';
const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-import-aatom-${Date.now()}.json`;

console.log('📦 Importazione Diffusori Atom da AW...\n');

// Backup del file esistente
console.log('💾 Creazione backup...');
const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(existingProducts, null, 2));
console.log(`✅ Backup salvato: ${BACKUP_FILE}\n`);

const newProducts = [];

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
        // Mappatura CSV AW -> Zenova format
        const productCode = row['Product code'] || '';

        // Estrai immagini
        const imagesString = row['Images'] || '';
        const images = imagesString.split(',').map(url => url.trim()).filter(url => url);

        // Parse prezzo
        const price = parseFloat(row['Price']) || 0;

        // Parse stock
        const availableQty = parseInt(row['Available Quantity']) || 0;
        const stockStatus = row['Stock'] || 'OutofStock';

        // Determina lo stock
        let stock = availableQty;
        if (stockStatus === 'Discontinued') {
            stock = 0;
        }

        // Descrizione HTML
        const descriptionHtml = row['Webpage description (html)'] || '';
        const descriptionPlain = row['Webpage description (plain text)'] || '';

        const product = {
            id: `aw-${productCode.toLowerCase()}`,
            sku: productCode,
            name: row['Unit Name'] || productCode,
            description: descriptionPlain || descriptionHtml.replace(/<[^>]*>/g, ''),
            descriptionHtml: descriptionHtml,
            price: price,
            originalPrice: parseFloat(row['Unit RRP']) || price,
            currency: 'EUR',
            stock: stock,
            stockStatus: stockStatus,
            available: stock > 0 && stockStatus === 'Active',
            images: images,
            mainImage: images[0] || '',
            category: 'Natural Wellness',
            subcategory: 'diffusori-aromatici',
            zenovaCategory: 'natural-wellness',
            zenovaSubcategory: 'diffusori-aromatici',
            tags: ['AW Dropship', 'Aroma Diffusers', 'Atom'],
            brand: 'AW Dropship',
            supplier: 'AW',
            barcode: row['Barcode'] || '',
            weight: parseFloat(row['Unit net weight']) || 0,
            dimensions: row['Unit dimensions'] || '',
            materials: row['Materials/Ingredients'] || '',
            countryOfOrigin: row['Country of origin'] || '',
            unitsPerOuter: parseInt(row['Units per outer']) || 1,
            dataUpdated: row['Data updated'] || new Date().toISOString(),
            stockUpdated: row['Stock updated'] || new Date().toISOString(),
            priceUpdated: row['Price updated'] || new Date().toISOString(),
            imagesUpdated: row['Images updated'] || new Date().toISOString()
        };

        newProducts.push(product);
        console.log(`✅ ${product.name} - €${product.price} - Stock: ${product.stock} (${product.stockStatus})`);
    })
    .on('end', () => {
        console.log(`\n📊 Totale prodotti importati: ${newProducts.length}`);

        // Aggiungi i nuovi prodotti a quelli esistenti
        const updatedProducts = [...existingProducts, ...newProducts];

        // Salva il file aggiornato
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));

        console.log(`✅ Prodotti salvati in ${PRODUCTS_FILE}`);
        console.log(`📦 Totale prodotti nel database: ${updatedProducts.length}`);
        console.log('\n🎉 Importazione completata!');

        // Statistiche
        const active = newProducts.filter(p => p.stockStatus === 'Active').length;
        const outOfStock = newProducts.filter(p => p.stockStatus === 'OutofStock').length;
        const discontinued = newProducts.filter(p => p.stockStatus === 'Discontinued').length;

        console.log('\n📈 Statistiche:');
        console.log(`  - Active: ${active}`);
        console.log(`  - Out of Stock: ${outOfStock}`);
        console.log(`  - Discontinued: ${discontinued}`);
    })
    .on('error', (error) => {
        console.error('❌ Errore durante l\'importazione:', error);
    });
