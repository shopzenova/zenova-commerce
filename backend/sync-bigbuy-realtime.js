/**
 * SINCRONIZZAZIONE AUTOMATICA CON BIGBUY API IN TEMPO REALE
 * Aggiorna prodotti, stock e prezzi direttamente da BigBuy
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BIGBUY_API_URL = process.env.BIGBUY_API_URL;
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

// Carica mapping categorie
const beautyMapping = JSON.parse(fs.readFileSync('config/bigbuy-zenova-mapping.json', 'utf-8'));
const healthMapping = JSON.parse(fs.readFileSync('config/bigbuy-zenova-health-mapping.json', 'utf-8'));

console.log('🔄 SINCRONIZZAZIONE TEMPO REALE CON BIGBUY');
console.log('='.repeat(60));
console.log(`📡 API URL: ${BIGBUY_API_URL}`);
console.log(`🔑 API Key: ${BIGBUY_API_KEY.substring(0, 20)}...`);
console.log('');

// Configurazione axios per BigBuy
const bigbuyAPI = axios.create({
  baseURL: BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

/**
 * Ottieni prodotti Beauty da BigBuy API
 */
async function fetchBeautyProducts() {
  console.log('📦 Scaricando prodotti Beauty da BigBuy API...');

  try {
    // BigBuy API endpoint per catalogo
    const response = await bigbuyAPI.get('/rest/catalog/products.json', {
      params: {
        category: 2507,  // Beauty category
        isoCode: 'it'    // Lingua italiana
      }
    });

    console.log(`✅ Ricevuti ${response.data.length} prodotti Beauty da API`);
    return response.data;
  } catch (error) {
    console.error('❌ Errore scaricamento Beauty:', error.response?.status, error.message);
    return [];
  }
}

/**
 * Ottieni prodotti Health da BigBuy API
 */
async function fetchHealthProducts() {
  console.log('📦 Scaricando prodotti Health & Personal Care da BigBuy API...');

  try {
    const response = await bigbuyAPI.get('/rest/catalog/products.json', {
      params: {
        category: 2501,  // Health category
        isoCode: 'it'
      }
    });

    console.log(`✅ Ricevuti ${response.data.length} prodotti Health da API`);
    return response.data;
  } catch (error) {
    console.error('❌ Errore scaricamento Health:', error.response?.status, error.message);
    return [];
  }
}

/**
 * Ottieni stock in tempo reale
 */
async function fetchStock(productIds) {
  console.log(`📊 Aggiornando stock per ${productIds.length} prodotti...`);

  try {
    const response = await bigbuyAPI.post('/rest/catalog/productstockavailable.json', {
      products: productIds
    });

    return response.data;
  } catch (error) {
    console.error('❌ Errore stock:', error.message);
    return [];
  }
}

/**
 * Mappa prodotti BigBuy → Zenova (Beauty)
 */
function mapBeautyProducts(bigbuyProducts) {
  const mapped = [];
  const bigbuyToZenova = {};

  // Inverti mapping
  for (const [zenovaKey, data] of Object.entries(beautyMapping.mapping)) {
    data.bigbuyIds.forEach(bigbuyId => {
      bigbuyToZenova[bigbuyId] = {
        key: zenovaKey,
        name: data.name
      };
    });
  }

  for (const product of bigbuyProducts) {
    // Filtra solo con stock
    if (!product.inStock || product.stock < 1) continue;

    // Normalizza categoria
    const categories = product.categories || [];
    const normalizedCat = categories.map(c => c.id).sort((a,b) => a - b).join(',');

    const zenovaMap = bigbuyToZenova[normalizedCat];
    if (!zenovaMap) continue;

    mapped.push({
      id: product.id.toString(),
      name: product.name || '',
      description: product.description || product.name || '',
      brand: product.manufacturer || '',
      category: normalizedCat,
      subcategory: normalizedCat,
      zenovaCategory: 'beauty',
      zenovaSubcategory: zenovaMap.key,
      price: parseFloat(product.retailPrice) || 0,
      retailPrice: parseFloat(product.retailPrice) || 0,
      wholesalePrice: parseFloat(product.wholesalePrice) || 0,
      stock: parseInt(product.stock) || 0,
      inStock: product.inStock,
      images: (product.images || []).map(img => img.url).filter(url => url),
      image: product.images?.[0]?.url || '',
      ean: product.ean13 || '',
      weight: parseFloat(product.weight) || 0,
      dimensions: {
        width: parseFloat(product.width) || 0,
        height: parseFloat(product.height) || 0,
        depth: parseFloat(product.depth) || 0
      },
      active: true,
      lastSync: new Date().toISOString()
    });
  }

  return mapped;
}

/**
 * Mappa prodotti BigBuy → Zenova (Health)
 */
function mapHealthProducts(bigbuyProducts) {
  const mapped = [];
  const bigbuyToZenova = {};

  // Inverti mapping
  for (const [zenovaKey, data] of Object.entries(healthMapping.mapping)) {
    data.bigbuyIds.forEach(bigbuyId => {
      bigbuyToZenova[bigbuyId] = {
        key: zenovaKey,
        name: data.name
      };
    });
  }

  // Escludi occhiali
  const EXCLUDE_GLASSES = true;
  let skippedGlasses = 0;
  const MAX_PER_CATEGORY = 100;
  const categoryCounts = {};

  for (const product of bigbuyProducts) {
    if (!product.inStock || product.stock < 1) continue;

    const categories = product.categories || [];
    const normalizedCat = categories.map(c => c.id).sort((a,b) => a - b).join(',');

    const zenovaMap = bigbuyToZenova[normalizedCat];
    if (!zenovaMap) continue;

    // Escludi occhiali
    if (EXCLUDE_GLASSES && zenovaMap.key === 'occhiali-da-vista') {
      skippedGlasses++;
      continue;
    }

    // Limita per categoria
    if (!categoryCounts[zenovaMap.key]) categoryCounts[zenovaMap.key] = 0;
    if (categoryCounts[zenovaMap.key] >= MAX_PER_CATEGORY) continue;

    categoryCounts[zenovaMap.key]++;

    mapped.push({
      id: product.id.toString(),
      name: product.name || '',
      description: product.description || product.name || '',
      brand: product.manufacturer || '',
      category: normalizedCat,
      subcategory: normalizedCat,
      zenovaCategory: 'health-personal-care',
      zenovaSubcategory: zenovaMap.key,
      price: parseFloat(product.retailPrice) || 0,
      retailPrice: parseFloat(product.retailPrice) || 0,
      wholesalePrice: parseFloat(product.wholesalePrice) || 0,
      stock: parseInt(product.stock) || 0,
      inStock: product.inStock,
      images: (product.images || []).map(img => img.url).filter(url => url),
      image: product.images?.[0]?.url || '',
      ean: product.ean13 || '',
      weight: parseFloat(product.weight) || 0,
      dimensions: {
        width: parseFloat(product.width) || 0,
        height: parseFloat(product.height) || 0,
        depth: parseFloat(product.depth) || 0
      },
      active: true,
      lastSync: new Date().toISOString()
    });
  }

  console.log(`⊗  Occhiali esclusi: ${skippedGlasses}`);
  return mapped;
}

/**
 * Sincronizza tutto
 */
async function syncAll() {
  console.log('\n⏰ Inizio sincronizzazione:', new Date().toLocaleString('it-IT'));
  console.log('='.repeat(60));

  try {
    // Scarica da API BigBuy
    const [beautyProducts, healthProducts] = await Promise.all([
      fetchBeautyProducts(),
      fetchHealthProducts()
    ]);

    console.log('\n📊 Prodotti ricevuti da BigBuy:');
    console.log(`  - Beauty: ${beautyProducts.length}`);
    console.log(`  - Health: ${healthProducts.length}`);

    // Mappa a categorie Zenova
    const beautyMapped = mapBeautyProducts(beautyProducts);
    const healthMapped = mapHealthProducts(healthProducts);

    console.log('\n✅ Prodotti mappati:');
    console.log(`  - Beauty: ${beautyMapped.length}`);
    console.log(`  - Health: ${healthMapped.length}`);

    // Combina e salva
    const allProducts = [...beautyMapped, ...healthMapped];

    const catalogPath = path.join(__dirname, 'top-100-products.json');
    fs.writeFileSync(catalogPath, JSON.stringify(allProducts, null, 2));

    console.log(`\n💾 Catalogo salvato: ${allProducts.length} prodotti`);
    console.log(`📁 File: ${catalogPath}`);

    // Salva statistiche
    const stats = {
      lastSync: new Date().toISOString(),
      totalProducts: allProducts.length,
      beautyProducts: beautyMapped.length,
      healthProducts: healthMapped.length,
      source: 'BigBuy API',
      apiUrl: BIGBUY_API_URL
    };

    fs.writeFileSync('last-sync-stats.json', JSON.stringify(stats, null, 2));

    console.log('\n✅ SINCRONIZZAZIONE COMPLETATA!');
    console.log('='.repeat(60));

    return allProducts;
  } catch (error) {
    console.error('\n❌ ERRORE SINCRONIZZAZIONE:', error.message);
    throw error;
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  syncAll()
    .then(() => {
      console.log('\n🎉 Sync completato con successo!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Sync fallito:', error);
      process.exit(1);
    });
}

module.exports = { syncAll, fetchBeautyProducts, fetchHealthProducts, fetchStock };
