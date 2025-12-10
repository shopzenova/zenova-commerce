const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const results = [];
const csvFilePath = path.join(__dirname, 'aw-incense-2.csv');
const productsFilePath = path.join(__dirname, 'top-100-products.json');
const layoutFilePath = path.join(__dirname, 'config/product-layout.json');

let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
let layout = JSON.parse(fs.readFileSync(layoutFilePath, 'utf-8'));

// Rimuovi vecchi prodotti EID (Nag Champa Incense)
products = products.filter(p => !p.sku || !p.sku.startsWith('EID-'));
layout.sidebar = layout.sidebar.filter(id => !id || !id.startsWith('EID-'));

console.log('📦 Importazione COMPLETA Nag Champa Incense da AW Dropship\n');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => results.push(row))
  .on('end', () => {
    console.log(`✅ Letti ${results.length} prodotti dal CSV\n`);

    let imported = 0;

    results.forEach((row) => {
      const sku = row['Product code'];
      const status = row['Status'];

      if (status !== 'Active') {
        return;
      }

      // STOCK REALE dal CSV
      const availableQty = row['Available Quantity'];
      const stockStatus = row['Stock'];
      const realStock = availableQty && availableQty.trim() !== ''
        ? parseInt(availableQty)
        : 0;
      const available = realStock > 0;

      const price = parseFloat(row['Price']) || 0;
      const rrp = parseFloat(row['Unit RRP']) || 0;
      const name = row['Unit Name'] || '';
      const description = row['Webpage description (plain text)'] || '';
      const weight = parseFloat(row['Unit net weight']) || 0;
      const dimensions = row['Unit dimensions'] || '';
      const images = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];

      const product = {
        id: sku,
        sku: sku,
        name: name,
        description: description,
        brand: 'AW Dropship',
        price: rrp,
        pvd: price,
        retailPrice: rrp,
        stock: realStock,
        available: available,
        inStock: available,
        stockStatus: stockStatus,
        category: 'Wellness',
        subcategory: 'incenso',
        zenovaCategory: 'wellness',
        zenovaCategories: ['wellness'],
        zenovaSubcategory: 'incenso',
        weight: weight,
        dimensions: dimensions,
        images: images.map(url => ({ url, thumbnail: url })),
        ean: row['Barcode'] || '',
        supplier: 'AW Dropship',
        visible: true,
        featured: false
      };

      products.push(product);
      layout.sidebar.push(sku);
      imported++;

      console.log(`✅ ${sku} | Stock: ${realStock} | ${name.substring(0, 50)}`);
    });

    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
    fs.writeFileSync(layoutFilePath, JSON.stringify(layout, null, 2));

    console.log(`\n🎉 Importazione completata!`);
    console.log(`   - ${imported} Nag Champa Incense importati`);
    console.log(`   - Totale prodotti: ${products.length}`);
    console.log(`   - Prodotti in sidebar: ${layout.sidebar.length}`);
  });
