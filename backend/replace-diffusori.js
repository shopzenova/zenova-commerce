const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const https = require('https');

const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251211.csv';
const productsPath = path.join(__dirname, 'top-100-products.json');
const layoutPath = path.join(__dirname, 'config/product-layout.json');
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products', 'diffusori');

let products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
let layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

console.log('🔄 SOSTITUZIONE DIFFUSORI DA CSV\n');

// Rimuovi SOLO diffusori AATOM vecchi
const before = products.length;
products = products.filter(p => !(p.id || '').startsWith('AATOM-'));
layout.sidebar = layout.sidebar.filter(id => !id.startsWith('AATOM-'));
console.log(`Rimossi ${before - products.length} diffusori AATOM vecchi\n`);

const results = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => results.push(row))
  .on('end', async () => {
    console.log(`Letti ${results.length} prodotti dal CSV\n`);

    const toImport = [];

    for (const row of results) {
      const sku = row['Product code'];
      if (!sku || !sku.startsWith('AATOM-')) continue;

      const availableQty = row['Available Quantity'];
      const realStock = availableQty && availableQty.trim() !== '' ? parseInt(availableQty) : 0;

      const imagesUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];

      const product = {
        id: sku,
        sku: sku,
        name: row['Unit Name'] || '',
        description: row['Webpage description (plain text)'] || '',
        brand: 'AW Dropship',
        price: parseFloat(row['Unit RRP']) || 0,
        pvd: parseFloat(row['Price']) || 0,
        retailPrice: parseFloat(row['Unit RRP']) || 0,
        stock: realStock,
        available: realStock > 0,
        inStock: realStock > 0,
        stockStatus: row['Stock'] || 'OutofStock',
        category: 'Wellness',
        subcategory: 'diffusori-elettronici',
        zenovaCategory: 'wellness',
        zenovaCategories: ['wellness'],
        zenovaSubcategory: 'diffusori-elettronici',
        weight: parseFloat(row['Unit net weight']) || 0,
        dimensions: row['Unit dimensions'] || '',
        images: imagesUrls.map(url => ({ url, thumbnail: url })),
        ean: row['Barcode'] || '',
        supplier: 'AW Dropship',
        visible: true,
        featured: false,
        localImage: `images/aw-products/diffusori/${sku}.jpg`
      };

      products.push(product);
      layout.sidebar.push(sku);

      toImport.push({ sku, urls: imagesUrls, name: product.name });

      console.log(`✅ ${sku} | Stock: ${realStock} | ${product.name.substring(0, 40)}`);
    }

    // Salva database
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2));

    console.log(`\n💾 Database salvato: ${products.length} prodotti totali`);
    console.log(`📥 Inizio download ${toImport.length} immagini...\n`);

    // Download immagini
    let downloaded = 0;
    for (const item of toImport) {
      if (!item.urls || item.urls.length === 0) continue;

      const mainUrl = item.urls[0];
      const filepath = path.join(imagesDir, `${item.sku}.jpg`);

      try {
        await new Promise((resolve, reject) => {
          https.get(mainUrl, (response) => {
            if (response.statusCode === 200) {
              const fileStream = fs.createWriteStream(filepath);
              response.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ ${item.sku}.jpg scaricata`);
                downloaded++;
                resolve();
              });
            } else {
              reject(new Error(`Status ${response.statusCode}`));
            }
          }).on('error', reject);
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ ${item.sku}: ${error.message}`);
      }
    }

    console.log(`\n🎉 COMPLETATO!`);
    console.log(`   Diffusori importati: ${toImport.length}`);
    console.log(`   Immagini scaricate: ${downloaded}`);
    console.log(`   Totale prodotti: ${products.length}`);
  });
