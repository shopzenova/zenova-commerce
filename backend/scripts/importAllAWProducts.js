const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Categorie AW da importare
const AW_CATEGORIES = {
  'JNS': { name: 'Borse Nepal', type: 'bags' },
  'AATOM': { name: 'Diffusori Elettronici', type: 'diffusers' },
  'ACD': { name: 'Reed Diffusers', type: 'reed-diffusers' }
};

async function fetchAWProducts(categoryCode) {
  try {
    const response = await axios.get(`https://www.awgifts.eu/api-b2b/articles/${categoryCode}`, {
      headers: {
        'Authorization': 'Bearer hG2rZ8kL5nP9qW3vX7yT4jM6fR1sD0aE',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    return response.data.data || [];
  } catch (error) {
    console.error(`❌ Errore fetch categoria ${categoryCode}:`, error.message);
    return [];
  }
}

function convertAWProduct(awProduct, categoryInfo) {
  const stockTotal = awProduct.stocks ?
    awProduct.stocks.reduce((sum, s) => sum + (s.stock || 0), 0) : 0;

  // Calcoliamo prezzo con markup 2.5x
  const costPrice = parseFloat(awProduct.price_b2b) || 0;
  const sellingPrice = Math.round(costPrice * 2.5 * 100) / 100;

  return {
    sku: awProduct.code,
    name: {
      'it-IT': awProduct.name || awProduct.code,
      'en-US': awProduct.name || awProduct.code
    },
    description: {
      'it-IT': awProduct.description || '',
      'en-US': awProduct.description || ''
    },
    price: sellingPrice,
    costPrice: costPrice,
    stock: stockTotal,
    category: categoryInfo.type,
    brand: 'AW Gifts',
    supplier: 'AW Dropship',
    images: awProduct.images || [],
    active: true, // Importiamo anche quelli esauriti come attivi
    tags: categoryInfo.name.split(' '),
    dimensions: awProduct.dimensions || null,
    weight: awProduct.weight || null,
    ean: awProduct.ean || null
  };
}

async function importAllProducts() {
  console.log('🚀 Inizio importazione TUTTI i prodotti AW (inclusi esauriti)...\n');

  const productsPath = path.join(__dirname, '../data/products.json');
  let allProducts = [];

  // Leggi prodotti esistenti
  if (fs.existsSync(productsPath)) {
    const data = fs.readFileSync(productsPath, 'utf8');
    allProducts = JSON.parse(data);
    console.log(`📦 Trovati ${allProducts.length} prodotti esistenti\n`);
  }

  let totalImported = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  // Importa da ogni categoria AW
  for (const [categoryCode, categoryInfo] of Object.entries(AW_CATEGORIES)) {
    console.log(`\n📂 Categoria: ${categoryInfo.name} (${categoryCode})`);
    console.log('─'.repeat(50));

    const awProducts = await fetchAWProducts(categoryCode);
    console.log(`   Trovati ${awProducts.length} prodotti`);

    for (const awProduct of awProducts) {
      const convertedProduct = convertAWProduct(awProduct, categoryInfo);
      const existingIndex = allProducts.findIndex(p => p.sku === convertedProduct.sku);

      if (existingIndex >= 0) {
        // Aggiorna prodotto esistente
        allProducts[existingIndex] = { ...allProducts[existingIndex], ...convertedProduct };
        totalUpdated++;
        const stockLabel = convertedProduct.stock === 0 ? '❌ ESAURITO' : `✅ ${convertedProduct.stock}`;
        console.log(`   ↻ ${convertedProduct.sku} - Stock: ${stockLabel}`);
      } else {
        // Aggiungi nuovo prodotto
        allProducts.push(convertedProduct);
        totalImported++;
        const stockLabel = convertedProduct.stock === 0 ? '❌ ESAURITO' : `✅ ${convertedProduct.stock}`;
        console.log(`   + ${convertedProduct.sku} - Stock: ${stockLabel}`);
      }
    }
  }

  // Salva tutti i prodotti
  fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, 2), 'utf8');

  console.log('\n' + '═'.repeat(50));
  console.log('✅ IMPORTAZIONE COMPLETATA');
  console.log('═'.repeat(50));
  console.log(`📊 Nuovi prodotti: ${totalImported}`);
  console.log(`↻  Prodotti aggiornati: ${totalUpdated}`);
  console.log(`📦 Totale prodotti: ${allProducts.length}`);
  console.log(`🔄 Inclusi prodotti esauriti (stock 0)`);
  console.log('═'.repeat(50));
}

// Esegui import
importAllProducts().catch(error => {
  console.error('❌ Errore durante importazione:', error);
  process.exit(1);
});
