const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const ftp = require('basic-ftp');

// Lista degli SKU target
const TARGET_SKUS = new Set();

async function loadTargetSkus() {
  const listPath = path.join(__dirname, 'smart-tech-products-list.json');
  const productList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

  productList['tech-innovation'].forEach(p => TARGET_SKUS.add(p.sku));
  productList['smart-living'].forEach(p => TARGET_SKUS.add(p.sku));

  console.log(`🎯 SKU target caricati: ${TARGET_SKUS.size}\n`);
}

async function searchInExistingCSV() {
  console.log('🔍 STEP 1: Cerco nei CSV già scaricati...\n');

  const csvDir = path.join(__dirname, 'bigbuy-data');
  const csvFiles = fs.readdirSync(csvDir).filter(f => f.startsWith('product_') && f.endsWith('.csv'));

  console.log(`📂 Trovati ${csvFiles.length} file CSV esistenti\n`);

  const foundProducts = [];

  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file);
    console.log(`   Scansiono ${file}...`);

    const products = await parseCSV(filePath);
    const matches = products.filter(p => TARGET_SKUS.has(p.sku));

    if (matches.length > 0) {
      console.log(`   ✅ Trovati ${matches.length} prodotti target!`);
      foundProducts.push(...matches);
      matches.forEach(p => TARGET_SKUS.delete(p.sku));
    } else {
      console.log(`   ⚪ Nessun prodotto target`);
    }
  }

  console.log(`\n📊 Trovati ${foundProducts.length} prodotti nei CSV esistenti`);
  console.log(`⏳ Rimanenti da cercare: ${TARGET_SKUS.size}\n`);

  return foundProducts;
}

async function downloadMissingCSV() {
  if (TARGET_SKUS.size === 0) {
    console.log('✅ Tutti i prodotti trovati nei CSV esistenti!\n');
    return [];
  }

  console.log('📥 STEP 2: Scarico CSV delle categorie Smart Living e Tech Innovation...\n');

  const client = new ftp.Client();
  const csvDir = path.join(__dirname, 'bigbuy-data');

  // Categorie da scaricare
  const categoriesToDownload = [
    { id: '2400', name: 'Electronics (Tech Innovation)' },
    { id: '2421', name: 'Home Automation (Smart Living)' },
    { id: '2644', name: 'Monitors' },
    { id: '2797', name: 'Laptops' }
  ];

  const downloadedFiles = [];

  try {
    console.log('🔄 Connessione FTP BigBuy...');

    await client.access({
      host: 'www.dropshippers.com.es',
      user: 'bbCDCSK9mS6i',
      password: 'XgVEDUdao7',
      secure: false
    });

    console.log('✅ Connesso!\n');

    await client.cd('files/products');

    for (const category of categoriesToDownload) {
      const remoteFile = `product_${category.id}_it.csv`;
      const localFile = path.join(csvDir, remoteFile);

      // Salta se già scaricato
      if (fs.existsSync(localFile)) {
        console.log(`⏭️  ${remoteFile} già presente`);
        downloadedFiles.push(localFile);
        continue;
      }

      try {
        console.log(`📥 Scarico ${category.name} (${remoteFile})...`);
        await client.downloadTo(localFile, remoteFile);

        const stats = fs.statSync(localFile);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`   ✅ Scaricato ${sizeMB} MB\n`);

        downloadedFiles.push(localFile);

        // Pausa tra download
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        console.log(`   ⚠️  File non trovato o errore: ${err.message}\n`);
      }
    }

  } catch (err) {
    console.error('❌ Errore FTP:', err.message);
  } finally {
    client.close();
  }

  return downloadedFiles;
}

async function searchInNewCSV(csvFiles) {
  if (TARGET_SKUS.size === 0 || csvFiles.length === 0) {
    return [];
  }

  console.log('\n🔍 STEP 3: Cerco nei nuovi CSV scaricati...\n');

  const foundProducts = [];

  for (const file of csvFiles) {
    const fileName = path.basename(file);
    console.log(`   Scansiono ${fileName}...`);

    const products = await parseCSV(file);
    const matches = products.filter(p => TARGET_SKUS.has(p.sku));

    if (matches.length > 0) {
      console.log(`   ✅ Trovati ${matches.length} prodotti target!`);
      foundProducts.push(...matches);
      matches.forEach(p => TARGET_SKUS.delete(p.sku));
    } else {
      console.log(`   ⚪ Nessun prodotto target`);
    }
  }

  console.log(`\n📊 Trovati ${foundProducts.length} prodotti nei nuovi CSV`);
  console.log(`⏳ Rimanenti non trovati: ${TARGET_SKUS.size}\n`);

  return foundProducts;
}

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        products.push({
          sku: row.sku || row.SKU || row.Sku,
          id: row.id || row.ID,
          name: row.name || row.Name,
          description: row.description || row.Description || '',
          brand: row.brand || row.Brand || '',
          category: row.category || row.Category,
          retailPrice: parseFloat(row.retail_price || row.RetailPrice || row.price || 0),
          wholesalePrice: parseFloat(row.wholesale_price || row.WholesalePrice || 0),
          stock: parseInt(row.stock || row.Stock || 0),
          ean: row.ean13 || row.EAN13 || row.ean || '',
          weight: row.weight || row.Weight || '',
          width: row.width || row.Width || '',
          height: row.height || row.Height || '',
          depth: row.depth || row.Depth || ''
        });
      })
      .on('end', () => resolve(products))
      .on('error', reject);
  });
}

function categorizeBySku(products) {
  const listPath = path.join(__dirname, 'smart-tech-products-list.json');
  const productList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

  const categorized = {
    'smart-living': [],
    'tech-innovation': []
  };

  const smartSkus = new Set(productList['smart-living'].map(p => p.sku));
  const techSkus = new Set(productList['tech-innovation'].map(p => p.sku));

  products.forEach(product => {
    if (smartSkus.has(product.sku)) {
      categorized['smart-living'].push({ ...product, category: 'smart-living' });
    } else if (techSkus.has(product.sku)) {
      categorized['tech-innovation'].push({ ...product, category: 'tech-innovation' });
    }
  });

  return categorized;
}

async function saveToCatalog(allProducts) {
  if (allProducts.length === 0) {
    console.log('⚠️  Nessun prodotto da salvare\n');
    return;
  }

  console.log('💾 STEP 4: Salvo nel catalogo...\n');

  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let catalog = [];

  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
  } catch (error) {
    console.log('📦 Creo nuovo catalogo');
  }

  // Rimuovi duplicati
  const existingIds = new Set(catalog.map(p => p.id));
  const newProducts = allProducts
    .map(p => ({
      id: p.id || p.sku,
      name: p.name,
      description: p.description,
      brand: p.brand,
      category: p.category,
      price: p.retailPrice,
      pvd: p.wholesalePrice,
      stock: p.stock,
      images: [],
      imageCount: 0,
      video: '0',
      ean: p.ean,
      width: p.width,
      height: p.height,
      depth: p.depth,
      weight: p.weight
    }))
    .filter(p => !existingIds.has(p.id));

  const updatedCatalog = [...catalog, ...newProducts];
  fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));

  console.log(`✅ Nuovi prodotti aggiunti: ${newProducts.length}`);
  console.log(`📦 Totale catalogo: ${updatedCatalog.length}\n`);

  return newProducts;
}

async function main() {
  console.log('🚀 IMPORT PRODOTTI DA CSV\n');
  console.log('='.repeat(60) + '\n');

  await loadTargetSkus();

  // Step 1: Cerca nei CSV esistenti
  const existingProducts = await searchInExistingCSV();

  // Step 2: Scarica nuovi CSV se necessario
  const newCSVFiles = await downloadMissingCSV();

  // Step 3: Cerca nei nuovi CSV
  const newProducts = await searchInNewCSV(newCSVFiles);

  // Combina tutti i prodotti trovati
  const allProducts = [...existingProducts, ...newProducts];

  // Categorizza
  const categorized = categorizeBySku(allProducts);

  // Step 4: Salva nel catalogo
  await saveToCatalog(allProducts);

  // Riepilogo finale
  console.log('='.repeat(60));
  console.log('📊 RIEPILOGO FINALE');
  console.log('='.repeat(60) + '\n');

  console.log(`✅ Smart Living importati: ${categorized['smart-living'].length}`);
  console.log(`✅ Tech Innovation importati: ${categorized['tech-innovation'].length}`);
  console.log(`📦 Totale: ${allProducts.length}/60`);
  console.log(`❌ Non trovati: ${TARGET_SKUS.size}\n`);

  if (TARGET_SKUS.size > 0) {
    console.log('⚠️  SKU NON TROVATI:');
    Array.from(TARGET_SKUS).slice(0, 10).forEach(sku => {
      console.log(`   ${sku}`);
    });
    if (TARGET_SKUS.size > 10) {
      console.log(`   ... e altri ${TARGET_SKUS.size - 10}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETATO!');
  console.log('='.repeat(60) + '\n');
}

main();
