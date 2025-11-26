const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Mappa categorie Zenova -> categorie BigBuy
const CATEGORY_MAP = {
  'smart-living': '2421', // Home Automation & Security
  'tech-innovation': '2400' // Electronics
};

async function importSmartTechProducts() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';

  console.log('🚀 IMPORT PRODOTTI SMART LIVING & TECH INNOVATION\n');
  console.log('='.repeat(60) + '\n');

  // Carica la lista prodotti selezionati
  const listPath = path.join(__dirname, 'smart-tech-products-list.json');
  const productList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

  console.log(`📋 Prodotti da importare:`);
  console.log(`   Smart Living: ${productList['smart-living'].length}`);
  console.log(`   Tech Innovation: ${productList['tech-innovation'].length}`);
  console.log(`   Totale: ${productList.summary.totalSelected}\n`);

  // Carica il catalogo esistente
  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let existingProducts = [];

  try {
    const catalogData = fs.readFileSync(catalogPath, 'utf-8');
    existingProducts = JSON.parse(catalogData);
    console.log(`📦 Catalogo attuale: ${existingProducts.length} prodotti\n`);
  } catch (error) {
    console.log('⚠️  Nessun catalogo esistente trovato\n');
  }

  const imported = {
    'smart-living': [],
    'tech-innovation': []
  };
  const errors = [];
  let totalProcessed = 0;

  // Importa per ogni categoria
  for (const [category, products] of Object.entries(productList)) {
    if (category === 'summary') continue;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 CATEGORIA: ${category.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);

    for (const productInfo of products) {
      totalProcessed++;
      const sku = productInfo.sku;

      console.log(`[${totalProcessed}/${productList.summary.totalSelected}] 🔎 SKU: ${sku}`);
      console.log(`   Nome: ${productInfo.name}`);

      try {
        // Scarica i dettagli completi del prodotto da BigBuy
        const response = await axios.get(`${baseURL}/rest/catalog/products.json`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            isoCode: 'it',
            sku: sku
          },
          timeout: 30000
        });

        if (response.data && response.data.length > 0) {
          const product = response.data[0];

          // Formatta il prodotto nel formato del nostro catalogo
          const formattedProduct = {
            id: product.id || sku,
            name: product.name,
            description: product.description || '',
            brand: product.brand || '',
            category: category, // Usa la categoria Zenova
            price: parseFloat(product.retailPrice || product.price || 0),
            pvd: parseFloat(product.wholesalePrice || product.price || 0),
            stock: product.stock || 0,
            images: product.images || [],
            imageCount: (product.images || []).length,
            video: product.video || '0',
            ean: product.ean || '',
            width: product.width || '',
            height: product.height || '',
            depth: product.depth || '',
            weight: product.weight || '',
            raw: {
              ...product,
              ZENOVA_CATEGORY: category // Tag per riconoscere la categoria Zenova
            }
          };

          imported[category].push(formattedProduct);
          console.log(`   ✅ Importato - Prezzo: €${formattedProduct.price} - Stock: ${formattedProduct.stock}`);

        } else {
          console.log(`   ❌ Non trovato nell'API BigBuy`);
          errors.push({ sku, category, reason: 'not_found' });
        }

      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`   ⚠️  RATE LIMIT! Attendo 60 secondi...`);
          await new Promise(resolve => setTimeout(resolve, 60000));
          // Riprova
          totalProcessed--;
          continue;
        }

        console.log(`   ❌ Errore: ${error.message}`);
        errors.push({ sku, category, reason: error.message });
      }

      // Pausa per evitare rate limiting (5 secondi tra richieste)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Riepilogo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RIEPILOGO IMPORTAZIONE');
  console.log('='.repeat(60) + '\n');

  const totalImported = imported['smart-living'].length + imported['tech-innovation'].length;

  console.log(`✅ Smart Living: ${imported['smart-living'].length}/${productList['smart-living'].length}`);
  console.log(`✅ Tech Innovation: ${imported['tech-innovation'].length}/${productList['tech-innovation'].length}`);
  console.log(`\n📦 Totale importati: ${totalImported}/${productList.summary.totalSelected}`);
  console.log(`❌ Errori: ${errors.length}\n`);

  if (totalImported > 0) {
    // Combina tutti i prodotti importati
    const allImported = [...imported['smart-living'], ...imported['tech-innovation']];

    // Rimuovi duplicati dal catalogo esistente (se ci sono)
    const existingSkus = new Set(existingProducts.map(p => p.id));
    const newProducts = allImported.filter(p => !existingSkus.has(p.id));

    // Aggiungi i nuovi prodotti al catalogo
    const updatedCatalog = [...existingProducts, ...newProducts];

    // Salva il catalogo aggiornato
    fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));

    console.log(`💾 Catalogo aggiornato:`);
    console.log(`   Prodotti precedenti: ${existingProducts.length}`);
    console.log(`   Nuovi prodotti: ${newProducts.length}`);
    console.log(`   Totale: ${updatedCatalog.length}\n`);

    // Mostra riepilogo per categoria
    console.log('📋 PRODOTTI AGGIUNTI:\n');

    console.log(`🏠 SMART LIVING (${imported['smart-living'].length}):`);
    imported['smart-living'].forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 60)}...`);
      console.log(`      SKU: ${p.id} | €${p.price} | Stock: ${p.stock}`);
    });

    console.log(`\n⚡ TECH INNOVATION (${imported['tech-innovation'].length}):`);
    imported['tech-innovation'].forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 60)}...`);
      console.log(`      SKU: ${p.id} | €${p.price} | Stock: ${p.stock}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORI:');
    errors.forEach(err => {
      console.log(`   SKU: ${err.sku} (${err.category}) - ${err.reason}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETATO!');
  console.log('='.repeat(60) + '\n');
}

importSmartTechProducts();
