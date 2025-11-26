#!/usr/bin/env node
/**
 * SCRIPT FACILE PER AGGIUNGERE UN PRODOTTO
 *
 * Ti chiede lo SKU e fa tutto automaticamente:
 * - Cerca il prodotto nei CSV BigBuy
 * - Mostra i dettagli (nome, prezzo, stock)
 * - Ti chiede in quale categoria metterlo
 * - Lo importa nel catalogo
 *
 * USO:
 *   node add-product.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const csv = require('csv-parser');

const CSV_DIR = path.join(__dirname, 'bigbuy-data', 'bigbuy-complete');
const TARGET_LIST = path.join(__dirname, 'smart-tech-products-list.json');
const CATALOG_PATH = path.join(__dirname, 'top-100-products.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        const cleanedRow = {};
        for (const [key, value] of Object.entries(row)) {
          const cleanKey = key.replace(/^\uFEFF/, '');
          cleanedRow[cleanKey] = value;
        }
        products.push(cleanedRow);
      })
      .on('end', () => resolve(products))
      .on('error', reject);
  });
}

async function findProduct(sku) {
  console.log('\n🔍 Cerco il prodotto nei CSV BigBuy...\n');

  const csvFiles = fs.readdirSync(CSV_DIR)
    .filter(f => f.startsWith('general-products-csv-') && f.endsWith('.csv'));

  for (const file of csvFiles) {
    const filePath = path.join(CSV_DIR, file);
    const products = await parseCSV(filePath);
    const product = products.find(p => p.ID === sku);

    if (product) {
      console.log('✅ PRODOTTO TROVATO!\n');
      return product;
    }
  }

  return null;
}

function displayProduct(product) {
  console.log('📦 ' + '='.repeat(60));
  console.log('   ' + product.NAME);
  console.log('='.repeat(60) + '\n');
  console.log('📋 SKU:', product.ID);
  console.log('🏷️  Brand:', product.BRAND);
  console.log('💰 Prezzo vendita:', '€' + product.PVP_BIGBUY);
  console.log('💵 Tuo costo:', '€' + product.PVD);
  console.log('📈 Margine:', '€' + (parseFloat(product.PVP_BIGBUY) - parseFloat(product.PVD)).toFixed(2));
  console.log('📦 Stock:', product.STOCK);

  // Conta immagini
  let imageCount = 0;
  for (let i = 1; i <= 8; i++) {
    if (product[`IMAGE${i}`]) imageCount++;
  }
  console.log('📸 Immagini:', imageCount);
  console.log('');
}

async function main() {
  console.log('\n🚀 AGGIUNGI UN PRODOTTO AL CATALOGO ZENOVA\n');
  console.log('='.repeat(60) + '\n');

  // STEP 1: Chiedi lo SKU
  const sku = await question('📝 Inserisci lo SKU del prodotto: ');

  if (!sku || sku.trim() === '') {
    console.log('\n❌ SKU non valido!\n');
    rl.close();
    return;
  }

  // STEP 2: Cerca il prodotto
  const product = await findProduct(sku.trim());

  if (!product) {
    console.log('\n❌ Prodotto non trovato nei CSV BigBuy!');
    console.log('   Verifica che:');
    console.log('   - Lo SKU sia corretto');
    console.log('   - I CSV BigBuy siano stati scaricati in bigbuy-data/bigbuy-complete/\n');
    rl.close();
    return;
  }

  // STEP 3: Mostra dettagli
  displayProduct(product);

  // STEP 4: Chiedi categoria
  console.log('📂 In quale categoria vuoi metterlo?\n');
  console.log('   1. 🏠 Smart Living (casa, domotica, illuminazione)');
  console.log('   2. ⚡ Tech Innovation (elettronica, monitor, gaming)\n');

  const category = await question('Scegli (1 o 2): ');

  let zenovaCategory;
  if (category === '1') {
    zenovaCategory = 'smart-living';
    console.log('\n✅ Categoria: Smart Living 🏠\n');
  } else if (category === '2') {
    zenovaCategory = 'tech-innovation';
    console.log('\n✅ Categoria: Tech Innovation ⚡\n');
  } else {
    console.log('\n❌ Scelta non valida! Uso Smart Living come default.\n');
    zenovaCategory = 'smart-living';
  }

  // STEP 5: Aggiungi alla lista
  console.log('📝 Aggiungo alla lista prodotti...\n');

  const list = JSON.parse(fs.readFileSync(TARGET_LIST, 'utf-8'));

  // Verifica se già presente
  const exists = list[zenovaCategory].some(p => p.sku === product.ID);
  if (exists) {
    console.log('⚠️  Prodotto già presente nella lista!\n');
  } else {
    list[zenovaCategory].push({
      sku: product.ID,
      name: product.NAME,
      brand: product.BRAND,
      price: parseFloat(product.PVP_BIGBUY),
      stock: parseInt(product.STOCK),
      images: 1,
      category: zenovaCategory
    });

    list.summary.smartCount = list['smart-living'].length;
    list.summary.techCount = list['tech-innovation'].length;
    list.summary.totalSelected = list['smart-living'].length + list['tech-innovation'].length;

    fs.writeFileSync(TARGET_LIST, JSON.stringify(list, null, 2));
    console.log('✅ Aggiunto alla lista!\n');
  }

  // STEP 6: Importa nel catalogo
  console.log('💾 Importo nel catalogo...\n');

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));

  // Verifica se già nel catalogo
  const existsInCatalog = catalog.some(p => p.id === product.ID);

  if (existsInCatalog) {
    console.log('⚠️  Prodotto già presente nel catalogo!\n');
  } else {
    // Raccogli immagini
    const images = [];
    for (let i = 1; i <= 8; i++) {
      const imgField = `IMAGE${i}`;
      if (product[imgField]) images.push({ url: product[imgField] });
    }

    const newProduct = {
      id: product.ID,
      sku: product.ID,
      name: product.NAME || product.ID,
      description: product.DESCRIPTION || '',
      brand: product.BRAND || '',
      category: zenovaCategory,
      zenovaCategory: zenovaCategory,
      zenovaCategories: [zenovaCategory],
      price: parseFloat(product.PVP_BIGBUY || 0),
      pvd: parseFloat(product.PVD || 0),
      stock: parseInt(product.STOCK || 0),
      images: images,
      imageCount: images.length,
      video: product.VIDEO || '0',
      ean: product.EAN13 || '',
      width: product.WIDTH || '',
      height: product.HEIGHT || '',
      depth: product.DEPTH || '',
      weight: product.WEIGHT || ''
    };

    catalog.push(newProduct);
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));

    console.log('✅ Prodotto aggiunto al catalogo!\n');
    console.log('📊 Totale prodotti nel catalogo:', catalog.length, '\n');
  }

  // STEP 7: Istruzioni finali
  console.log('='.repeat(60));
  console.log('🎉 PRODOTTO IMPORTATO CON SUCCESSO!');
  console.log('='.repeat(60) + '\n');

  console.log('💡 PROSSIMO PASSO:\n');
  console.log('   Riavvia il server per vedere il prodotto:');
  console.log('   node server.js\n');
  console.log('   Poi vai su:');
  console.log('   - Admin: http://localhost:3000/admin.html');
  console.log('   - Sito: http://127.0.0.1:8080/prodotti.html?category=' + zenovaCategory + '\n');

  rl.close();
}

main().catch(err => {
  console.error('\n❌ ERRORE:', err.message);
  console.error(err.stack);
  rl.close();
  process.exit(1);
});
