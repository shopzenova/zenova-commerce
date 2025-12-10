/**
 * Importa SOLO reed diffusers AW nel database Zenova
 */
const fs = require('fs');
const readline = require('readline');

const csvFile = './aw-reed-diffusers-raw.csv';
const productsFile = './top-100-products.json';

// Leggi prodotti esistenti
const existingProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
console.log(`📦 Prodotti esistenti: ${existingProducts.length}\n`);

const newProducts = [];

/**
 * Parse CSV line
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

/**
 * Converti prezzo AW in EUR
 */
function parsePrice(priceString) {
  const price = parseFloat(priceString);
  return isNaN(price) ? 0 : price;
}

/**
 * Crea prodotto Zenova da riga CSV AW (Reed Diffuser)
 */
function createZenovaProduct(row, index) {
  const productCode = row['Product code'];
  const name = row['Unit Name'] || row['Product code'];
  const price = parsePrice(row['Price']);
  const rrp = parsePrice(row['Unit RRP']);
  const stock = row['Stock'] || 'OutofStock';
  const description = row['Webpage description (plain text)'] || 'Diffusore a bastoncini profumato da 140ml';
  const weight = parseFloat(row['Unit net weight']) || 0;
  const dimensions = row['Unit dimensions'] || '';
  const barcode = row['Barcode'] || '';
  const family = row['Family'] || '';

  // Immagini
  const imageUrls = (row['Images'] || '').split(',').map(url => url.trim()).filter(url => url.length > 0);
  const images = imageUrls.map((url, idx) => {
    return {
      url: url,
      thumbnail: url
    };
  });

  return {
    id: `AW-${productCode}`,
    sku: productCode,
    name: name,
    description: description,
    price: price,
    retailPrice: rrp,
    inStock: stock === 'Normal' || stock === 'Low',
    stock: stock === 'Normal' || stock === 'Low' ? 100 : 0,
    category: '2680',
    subcategory: 'diffusori',
    brand: 'AW Dropship',
    zenovaSubcategory: 'diffusori',
    zenovaCategory: 'home',
    zenovaCategories: ['home'],
    images: images,
    imagesCount: images.length,
    tags: ['diffusore', 'reed-diffuser', 'bastoncini', 'aromaterapia', 'home', 'aw-dropship'],
    wholesale: false,
    rating: 4.5,
    reviews: 0,
    dateAdded: new Date().toISOString(),
    supplier: 'aw-dropship',
    supplierInfo: {
      provider: 'AW Dropship',
      productCode: productCode,
      barcode: barcode,
      weight: weight,
      dimensions: dimensions,
      family: family
    },
    image: images[0]?.url || '',
    detailedDescription: description,
    ean: barcode,
    weight: weight,
    active: true
  };
}

/**
 * Processa CSV
 */
async function processCsv() {
  const fileStream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers = [];
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;

    if (lineNumber === 1) {
      headers = parseCSVLine(line);
      continue;
    }

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const productCode = row['Product code'];
    const family = row['Family'];

    // IMPORTA SOLO Reed Diffusers
    if (!productCode || !family.includes('Reed Diffuser')) {
      continue;
    }

    const product = createZenovaProduct(row, newProducts.length);
    newProducts.push(product);

    console.log(`✅ ${productCode}: ${product.name}`);
  }

  console.log(`\n📊 RIEPILOGO:`);
  console.log(`   Prodotti esistenti: ${existingProducts.length}`);
  console.log(`   Nuovi Reed Diffusers: ${newProducts.length}`);
  console.log(`   Totale finale: ${existingProducts.length + newProducts.length}`);

  // Backup
  const backupFile = `${productsFile}.backup-reed-${Date.now()}`;
  fs.writeFileSync(backupFile, JSON.stringify(existingProducts, null, 2));
  console.log(`\n💾 Backup salvato: ${backupFile}`);

  // Aggiungi nuovi prodotti
  const allProducts = [...existingProducts, ...newProducts];
  fs.writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));
  console.log(`✅ Prodotti aggiornati: ${productsFile}`);
}

processCsv().then(() => {
  console.log('\n✅ Importazione Reed Diffusers completata!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Errore:', error);
  process.exit(1);
});
