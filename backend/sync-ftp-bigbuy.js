/**
 * SINCRONIZZAZIONE AUTOMATICA VIA FTP BIGBUY
 * Scarica CSV freschi e aggiorna catalogo con stock/prezzi in tempo reale
 */

require('dotenv').config();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const FTP_HOST = process.env.BIGBUY_FTP_HOST;
const FTP_USER = process.env.BIGBUY_FTP_USER;
const FTP_PASSWORD = process.env.BIGBUY_FTP_PASSWORD;

console.log('🔄 SINCRONIZZAZIONE FTP BIGBUY');
console.log('='.repeat(60));
console.log(`📡 Server: ${FTP_HOST}`);
console.log(`👤 User: ${FTP_USER}`);
console.log('⏰', new Date().toLocaleString('it-IT'));
console.log('');

// Carica mapping categorie
const beautyMapping = JSON.parse(fs.readFileSync('config/bigbuy-zenova-mapping.json', 'utf-8'));
const healthMapping = JSON.parse(fs.readFileSync('config/bigbuy-zenova-health-mapping.json', 'utf-8'));

/**
 * Scarica CSV da FTP BigBuy
 */
async function downloadCSVFromFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('🔌 Connessione a FTP BigBuy...');

    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: false
    });

    console.log('✅ Connesso!\n');

    // Lista file disponibili
    console.log('📂 Listing root directory...');
    const list = await client.list();

    console.log(`\n📋 Trovati ${list.length} file/cartelle:\n`);
    list.forEach(item => {
      console.log(`   ${item.isDirectory ? '📁' : '📄'} ${item.name} (${(item.size / 1024).toFixed(2)} KB)`);
    });

    // Entra nella cartella files/products/csv/standard
    console.log(`\n📁 Entrando in /files/products/csv/standard/...`);
    await client.cd('files/products/csv/standard');

    const filesList = await client.list();
    console.log(`\n📋 Trovati ${filesList.length} file in /files/products/csv/standard/:\n`);
    filesList.slice(0, 30).forEach(item => {
      console.log(`   ${item.isDirectory ? '📁' : '📄'} ${item.name} (${(item.size / 1024).toFixed(2)} KB)`);
    });

    // Scarica Beauty CSV
    const beautyFile = 'product_2507_it.csv';
    const healthFile = 'product_2501_it.csv';

    console.log(`\n⬇️  Scaricamento ${beautyFile}...`);
    const beautyPath = path.join(__dirname, 'bigbuy-data', beautyFile);
    await client.downloadTo(beautyPath, beautyFile);
    console.log(`✅ ${beautyFile} scaricato (${(fs.statSync(beautyPath).size / 1024 / 1024).toFixed(2)} MB)`);

    console.log(`\n⬇️  Scaricamento ${healthFile}...`);
    const healthPath = path.join(__dirname, 'bigbuy-data', healthFile);
    await client.downloadTo(healthPath, healthFile);
    console.log(`✅ ${healthFile} scaricato (${(fs.statSync(healthPath).size / 1024 / 1024).toFixed(2)} MB)`);

    client.close();
    console.log('\n✅ FTP chiuso');

    return { beautyPath, healthPath };

  } catch (error) {
    console.error('❌ Errore FTP:', error.message);
    client.close();
    throw error;
  }
}

/**
 * Processa CSV e aggiorna catalogo
 */
async function processAndUpdateCatalog() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PROCESSAMENTO CSV E AGGIORNAMENTO CATALOGO');
  console.log('='.repeat(60) + '\n');

  // Scarica CSV freschi da FTP
  const { beautyPath, healthPath } = await downloadCSVFromFTP();

  // Carica catalogo attuale
  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  console.log(`\n📦 Catalogo attuale: ${currentCatalog.length} prodotti`);

  // Rimuovi prodotti esistenti Beauty e Health
  const beforeCount = currentCatalog.length;
  currentCatalog = currentCatalog.filter(p =>
    p.zenovaCategory !== 'beauty' && p.zenovaCategory !== 'health-personal-care'
  );
  console.log(`🗑️  Rimossi ${beforeCount - currentCatalog.length} prodotti vecchi\n`);

  // Processa Beauty
  const beautyProducts = await processBeautyCSV(beautyPath);
  console.log(`✅ Beauty processato: ${beautyProducts.length} prodotti`);

  // Processa Health
  const healthProducts = await processHealthCSV(healthPath);
  console.log(`✅ Health processato: ${healthProducts.length} prodotti`);

  // Aggiungi nuovi prodotti
  currentCatalog.push(...beautyProducts, ...healthProducts);

  // Salva
  fs.writeFileSync(catalogPath, JSON.stringify(currentCatalog, null, 2));

  console.log(`\n💾 Catalogo aggiornato: ${currentCatalog.length} prodotti totali`);

  // Statistiche
  const stats = {
    lastSync: new Date().toISOString(),
    totalProducts: currentCatalog.length,
    beautyProducts: beautyProducts.length,
    healthProducts: healthProducts.length,
    source: 'BigBuy FTP CSV',
    ftpHost: FTP_HOST
  };

  fs.writeFileSync('last-ftp-sync.json', JSON.stringify(stats, null, 2));

  console.log('\n✅ SINCRONIZZAZIONE FTP COMPLETATA!');
  console.log('='.repeat(60));

  return stats;
}

/**
 * Processa CSV Beauty
 */
function processBeautyCSV(csvPath) {
  return new Promise((resolve) => {
    const products = [];
    const bigbuyToZenova = {};

    // Inverti mapping
    for (const [zenovaKey, data] of Object.entries(beautyMapping.mapping)) {
      data.bigbuyIds.forEach(bigbuyId => {
        bigbuyToZenova[bigbuyId] = { key: zenovaKey, name: data.name };
      });
    }

    fs.createReadStream(csvPath)
      .pipe(csv({
        separator: ';',
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') // Remove BOM
      }))
      .on('data', (row) => {
        const stock = parseInt(row.STOCK) || 0;
        if (stock < 1) return;

        const category = row.CATEGORY || '';
        const normalized = category.split(',').map(c => c.trim()).sort((a,b) => parseInt(a) - parseInt(b)).join(',');
        const zenovaMap = bigbuyToZenova[normalized];

        if (zenovaMap) {
          products.push({
            id: row.ID,
            name: row.NAME || '',
            description: row.DESCRIPTION || row.NAME || '',
            brand: row.BRAND || '',
            category: category,
            subcategory: normalized,
            zenovaCategory: 'beauty',
            zenovaSubcategory: zenovaMap.key,
            price: parseFloat(row.PVP_BIGBUY) || 0,
            retailPrice: (parseFloat(row.PVP_BIGBUY) || 0) * 1.5,
            wholesalePrice: parseFloat(row.PVD) || 0,
            stock: stock,
            images: [row.IMAGE1, row.IMAGE2, row.IMAGE3, row.IMAGE4, row.IMAGE5].filter(img => img && img.startsWith('http')),
            image: row.IMAGE1 || '',
            ean: row.EAN13 || '',
            weight: parseFloat(row.WEIGHT) || 0,
            dimensions: {
              width: parseFloat(row.WIDTH) || 0,
              height: parseFloat(row.HEIGHT) || 0,
              depth: parseFloat(row.DEPTH) || 0
            },
            active: true,
            lastSync: new Date().toISOString()
          });
        }
      })
      .on('end', () => resolve(products));
  });
}

/**
 * Processa CSV Health
 */
function processHealthCSV(csvPath) {
  return new Promise((resolve) => {
    const products = [];
    const bigbuyToZenova = {};

    // Inverti mapping
    for (const [zenovaKey, data] of Object.entries(healthMapping.mapping)) {
      data.bigbuyIds.forEach(bigbuyId => {
        bigbuyToZenova[bigbuyId] = { key: zenovaKey, name: data.name };
      });
    }

    const categoryCounts = {};
    const MAX_PER_CATEGORY = 100;
    let skippedGlasses = 0;

    fs.createReadStream(csvPath)
      .pipe(csv({
        separator: ';',
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') // Remove BOM
      }))
      .on('data', (row) => {
        const stock = parseInt(row.STOCK) || 0;
        if (stock < 1) return;

        const category = row.CATEGORY || '';
        const normalized = category.split(',').map(c => c.trim()).sort((a,b) => parseInt(a) - parseInt(b)).join(',');
        const zenovaMap = bigbuyToZenova[normalized];

        if (!zenovaMap) return;

        // Escludi occhiali
        if (zenovaMap.key === 'occhiali-da-vista') {
          skippedGlasses++;
          return;
        }

        // Limita per categoria
        if (!categoryCounts[zenovaMap.key]) categoryCounts[zenovaMap.key] = 0;
        if (categoryCounts[zenovaMap.key] >= MAX_PER_CATEGORY) return;

        categoryCounts[zenovaMap.key]++;

        products.push({
          id: row.ID,
          name: row.NAME || '',
          description: row.DESCRIPTION || row.NAME || '',
          brand: row.BRAND || '',
          category: category,
          subcategory: normalized,
          zenovaCategory: 'health-personal-care',
          zenovaSubcategory: zenovaMap.key,
          price: parseFloat(row.PVP_BIGBUY) || 0,
          retailPrice: (parseFloat(row.PVP_BIGBUY) || 0) * 1.5,
          wholesalePrice: parseFloat(row.PVD) || 0,
          stock: stock,
          images: [row.IMAGE1, row.IMAGE2, row.IMAGE3, row.IMAGE4, row.IMAGE5].filter(img => img && img.startsWith('http')),
          image: row.IMAGE1 || '',
          ean: row.EAN13 || '',
          weight: parseFloat(row.WEIGHT) || 0,
          dimensions: {
            width: parseFloat(row.WIDTH) || 0,
            height: parseFloat(row.HEIGHT) || 0,
            depth: parseFloat(row.DEPTH) || 0
          },
          active: true,
          lastSync: new Date().toISOString()
        });
      })
      .on('end', () => {
        console.log(`   ⊗  Occhiali esclusi: ${skippedGlasses}`);
        resolve(products);
      });
  });
}

// Esegui se chiamato direttamente
if (require.main === module) {
  processAndUpdateCatalog()
    .then((stats) => {
      console.log('\n🎉 Sync FTP completato!');
      console.log(`📊 Statistiche salvate in: last-ftp-sync.json`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Sync FTP fallito:', error);
      process.exit(1);
    });
}

module.exports = { processAndUpdateCatalog, downloadCSVFromFTP };
