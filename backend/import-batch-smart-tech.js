const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BATCH_SIZE = 10; // 10 prodotti per batch (rate limit)
const PROGRESS_FILE = path.join(__dirname, 'import-progress.json');

async function importBatch() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';

  console.log('🚀 IMPORT BATCH SMART LIVING & TECH INNOVATION');
  console.log('='.repeat(60) + '\n');

  // Carica lista prodotti da importare
  const listPath = path.join(__dirname, 'smart-tech-products-list.json');
  const productList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

  // Combina tutti i prodotti in un'unica lista
  const allProducts = [
    ...productList['tech-innovation'].map(p => ({ ...p, category: 'tech-innovation' })),
    ...productList['smart-living'].map(p => ({ ...p, category: 'smart-living' }))
  ];

  console.log(`📋 Totale prodotti da importare: ${allProducts.length}\n`);

  // Carica o crea file progresso
  let progress = { imported: [], failed: [], lastBatch: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    console.log(`📊 Progresso precedente:`);
    console.log(`   ✅ Importati: ${progress.imported.length}`);
    console.log(`   ❌ Falliti: ${progress.failed.length}`);
    console.log(`   📦 Ultimo batch: ${progress.lastBatch}\n`);
  }

  // Filtra prodotti già processati
  const processedSkus = new Set([
    ...progress.imported.map(p => p.sku),
    ...progress.failed.map(p => p.sku)
  ]);

  const remainingProducts = allProducts.filter(p => !processedSkus.has(p.sku));

  if (remainingProducts.length === 0) {
    console.log('✅ IMPORT COMPLETATO! Tutti i prodotti sono stati processati.\n');
    return;
  }

  console.log(`⏳ Prodotti rimanenti: ${remainingProducts.length}`);
  console.log(`📦 Questo batch: ${Math.min(BATCH_SIZE, remainingProducts.length)}\n`);

  // Prendi i prossimi 10 prodotti
  const batch = remainingProducts.slice(0, BATCH_SIZE);

  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let catalog = [];

  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    console.log(`📦 Catalogo attuale: ${catalog.length} prodotti\n`);
  } catch (error) {
    console.log('⚠️  Nessun catalogo trovato, ne creo uno nuovo\n');
  }

  const batchResults = {
    imported: [],
    failed: []
  };

  console.log('='.repeat(60));
  console.log(`BATCH #${progress.lastBatch + 1}`);
  console.log('='.repeat(60) + '\n');

  // Importa batch
  for (let i = 0; i < batch.length; i++) {
    const productInfo = batch[i];
    const sku = productInfo.sku;
    const category = productInfo.category;

    console.log(`[${i + 1}/${batch.length}] 🔎 SKU: ${sku}`);
    console.log(`   Categoria: ${category}`);
    console.log(`   Nome: ${productInfo.name.substring(0, 60)}...`);

    try {
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

        // Formatta prodotto
        const formattedProduct = {
          id: product.id || sku,
          name: product.name,
          description: product.description || '',
          brand: product.brand || '',
          category: category,
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
            ZENOVA_CATEGORY: category
          }
        };

        // Aggiungi al catalogo (evita duplicati)
        const existingIndex = catalog.findIndex(p => p.id === formattedProduct.id);
        if (existingIndex >= 0) {
          catalog[existingIndex] = formattedProduct;
          console.log(`   🔄 Aggiornato - €${formattedProduct.price} - Stock: ${formattedProduct.stock}`);
        } else {
          catalog.push(formattedProduct);
          console.log(`   ✅ Importato - €${formattedProduct.price} - Stock: ${formattedProduct.stock}`);
        }

        batchResults.imported.push({ sku, category, name: product.name });

      } else {
        console.log(`   ❌ Non trovato`);
        batchResults.failed.push({ sku, category, reason: 'not_found' });
      }

    } catch (error) {
      console.log(`   ❌ Errore: ${error.message}`);
      batchResults.failed.push({ sku, category, reason: error.message });

      // Se rate limit, ferma il batch
      if (error.response?.status === 429) {
        console.log('\n⚠️  RATE LIMIT RAGGIUNTO!\n');
        break;
      }
    }

    // Pausa tra richieste (6 secondi = max 10 richieste/minuto)
    if (i < batch.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
  }

  // Salva catalogo aggiornato
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  // Aggiorna progresso
  progress.imported.push(...batchResults.imported);
  progress.failed.push(...batchResults.failed);
  progress.lastBatch++;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  // Riepilogo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RIEPILOGO BATCH');
  console.log('='.repeat(60) + '\n');

  console.log(`✅ Importati in questo batch: ${batchResults.imported.length}`);
  console.log(`❌ Falliti in questo batch: ${batchResults.failed.length}\n`);

  console.log(`📈 PROGRESSO TOTALE:`);
  console.log(`   ✅ Importati: ${progress.imported.length}/${allProducts.length}`);
  console.log(`   ❌ Falliti: ${progress.failed.length}/${allProducts.length}`);
  console.log(`   ⏳ Rimanenti: ${allProducts.length - progress.imported.length - progress.failed.length}\n`);

  console.log(`💾 Catalogo: ${catalog.length} prodotti totali\n`);

  if (batchResults.imported.length > 0) {
    console.log('📋 PRODOTTI IMPORTATI:');
    batchResults.imported.forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.category}] ${p.name.substring(0, 50)}...`);
    });
    console.log('');
  }

  if (progress.imported.length + progress.failed.length < allProducts.length) {
    const remaining = allProducts.length - progress.imported.length - progress.failed.length;
    const batchesRemaining = Math.ceil(remaining / BATCH_SIZE);
    console.log(`\n⏭️  PROSSIMO STEP:`);
    console.log(`   Aspetta 1 ora e riesegui: node import-batch-smart-tech.js`);
    console.log(`   Batch rimanenti: ${batchesRemaining}`);
    console.log(`   Tempo stimato: ~${batchesRemaining} ore\n`);
  } else {
    console.log('\n🎉 IMPORT COMPLETATO! Tutti i prodotti sono stati processati.\n');
  }

  console.log('='.repeat(60) + '\n');
}

importBatch();
