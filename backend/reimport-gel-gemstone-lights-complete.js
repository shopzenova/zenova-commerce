const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFiles = [
  'aw-gel-gemstones-1.csv',
  'aw-gel-gemstones-2.csv',
  'aw-gel-gemstones-3.csv'
];

const productsFilePath = path.join(__dirname, 'top-100-products.json');
const layoutFilePath = path.join(__dirname, 'config/product-layout.json');

let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
let layout = JSON.parse(fs.readFileSync(layoutFilePath, 'utf-8'));

// Rimuovi vecchi prodotti GEL (Gemstone Enchantment Lights)
products = products.filter(p => !p.sku || !p.sku.startsWith('GEL-'));
layout.sidebar = layout.sidebar.filter(id => !id || !id.startsWith('GEL-'));

console.log('📦 Importazione COMPLETA Gemstone Enchantment Lights da AW Dropship\n');

const allProducts = new Map(); // Usa Map per evitare duplicati

let filesProcessed = 0;

csvFiles.forEach((csvFile, index) => {
  const csvFilePath = path.join(__dirname, csvFile);

  if (!fs.existsSync(csvFilePath)) {
    console.log(`⚠️  File ${csvFile} non trovato, skip`);
    filesProcessed++;
    return;
  }

  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => {
      console.log(`✅ File ${index + 1}/3: ${csvFile} - ${results.length} prodotti`);

      results.forEach((row) => {
        const sku = row['Product code'];
        const status = row['Status'];

        if (status !== 'Active') {
          return;
        }

        // Evita duplicati - usa solo il primo che trovi
        if (allProducts.has(sku)) {
          console.log(`   ⚠️  ${sku} già importato, skip duplicato`);
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
          subcategory: 'pietre-preziose',
          zenovaCategory: 'wellness',
          zenovaCategories: ['wellness'],
          zenovaSubcategory: 'pietre-preziose',
          weight: weight,
          dimensions: dimensions,
          images: images.map(url => ({ url, thumbnail: url })),
          ean: row['Barcode'] || '',
          supplier: 'AW Dropship',
          visible: true,
          featured: false
        };

        allProducts.set(sku, product);
      });

      filesProcessed++;

      // Quando tutti i file sono processati, salva
      if (filesProcessed === csvFiles.length) {
        finalizeImport();
      }
    })
    .on('error', (err) => {
      console.error(`❌ Errore lettura ${csvFile}:`, err);
      filesProcessed++;
      if (filesProcessed === csvFiles.length) {
        finalizeImport();
      }
    });
});

function finalizeImport() {
  console.log('\n📊 Riepilogo prodotti unici:\n');

  let imported = 0;
  allProducts.forEach((product, sku) => {
    products.push(product);
    layout.sidebar.push(sku);
    imported++;

    console.log(`✅ ${sku} | Stock: ${product.stock} | ${product.name.substring(0, 50)}`);
  });

  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  fs.writeFileSync(layoutFilePath, JSON.stringify(layout, null, 2));

  console.log(`\n🎉 Importazione completata!`);
  console.log(`   - ${imported} Gemstone Enchantment Lights importati`);
  console.log(`   - Totale prodotti: ${products.length}`);
  console.log(`   - Prodotti in sidebar: ${layout.sidebar.length}`);
}
