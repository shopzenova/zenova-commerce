const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Mappa categorie BigBuy -> categorie Zenova
const CATEGORY_CONFIG = {
  'tech-innovation': {
    bigbuyIds: ['2400', '2644', '2797'], // Electronics, Monitors, Laptops
    zenovaCategory: 'tech-innovation'
  },
  'smart-living': {
    bigbuyIds: ['2421', '2452', '2627'], // Home Automation, Security, Smart Home
    zenovaCategory: 'smart-living'
  }
};

async function importByCategory() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';

  console.log('🚀 IMPORT SMART LIVING & TECH INNOVATION (PER CATEGORIA)\n');
  console.log('='.repeat(60) + '\n');

  // Carica la lista prodotti target
  const listPath = path.join(__dirname, 'smart-tech-products-list.json');
  const productList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));

  // Crea un Set di SKU target per filtrare
  const targetSkus = new Set([
    ...productList['tech-innovation'].map(p => p.sku),
    ...productList['smart-living'].map(p => p.sku)
  ]);

  console.log(`📋 SKU target totali: ${targetSkus.size}\n`);

  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let catalog = [];

  try {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    console.log(`📦 Catalogo attuale: ${catalog.length} prodotti\n`);
  } catch (error) {
    console.log('⚠️  Nessun catalogo esistente\n');
  }

  const imported = {
    'tech-innovation': [],
    'smart-living': []
  };
  const errors = [];
  let totalProcessed = 0;

  // Itera per ogni categoria Zenova
  for (const [zenovaCategory, config] of Object.entries(CATEGORY_CONFIG)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 CATEGORIA ZENOVA: ${zenovaCategory.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);

    // Scarica prodotti da tutte le categorie BigBuy associate
    for (const bigbuyId of config.bigbuyIds) {
      console.log(`🔍 Scarico prodotti da categoria BigBuy ${bigbuyId}...\n`);

      try {
        // Scarica prodotti dalla categoria (max 100 per pagina)
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 3) { // Limita a 3 pagine per evitare rate limit
          console.log(`   Pagina ${page}...`);

          const response = await axios.get(`${baseURL}/rest/catalog/products.json`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            params: {
              isoCode: 'it',
              category: bigbuyId,
              page: page,
              pageSize: 100
            },
            timeout: 30000
          });

          if (response.data && response.data.length > 0) {
            console.log(`   ✅ Ricevuti ${response.data.length} prodotti`);

            // Filtra solo i prodotti nella nostra lista target
            const matchingProducts = response.data.filter(p =>
              targetSkus.has(p.sku)
            );

            console.log(`   🎯 Trovati ${matchingProducts.length} prodotti target\n`);

            // Processa i prodotti trovati
            for (const product of matchingProducts) {
              totalProcessed++;
              console.log(`[${totalProcessed}/${targetSkus.size}] ✅ ${product.sku}`);
              console.log(`   Nome: ${product.name || product.sku}`);
              console.log(`   Prezzo: €${product.retailPrice} - Stock: ${product.stock || 0}\n`);

              // Formatta il prodotto
              const formattedProduct = {
                id: product.id || product.sku,
                name: product.name || product.sku,
                description: product.description || '',
                brand: product.brand || '',
                category: zenovaCategory,
                price: parseFloat(product.retailPrice || product.price || 0),
                pvd: parseFloat(product.wholesalePrice || product.price || 0),
                stock: product.stock || 0,
                images: product.images || [],
                imageCount: (product.images || []).length,
                video: product.video || '0',
                ean: product.ean13 || '',
                width: product.width || '',
                height: product.height || '',
                depth: product.depth || '',
                weight: product.weight || '',
                raw: {
                  ...product,
                  ZENOVA_CATEGORY: zenovaCategory
                }
              };

              imported[zenovaCategory].push(formattedProduct);

              // Rimuovi da targetSkus per non cercarlo più
              targetSkus.delete(product.sku);
            }

            // Se abbiamo meno di 100 prodotti, non ci sono altre pagine
            if (response.data.length < 100) {
              hasMore = false;
            } else {
              page++;
            }

          } else {
            hasMore = false;
          }

          // Pausa per evitare rate limiting
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`   ⚠️  RATE LIMIT! Attendi e riprova più tardi\n`);
          break;
        }

        console.log(`   ❌ Errore categoria ${bigbuyId}: ${error.message}\n`);
        errors.push({ category: bigbuyId, reason: error.message });
      }
    }
  }

  // Riepilogo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RIEPILOGO IMPORTAZIONE');
  console.log('='.repeat(60) + '\n');

  const totalImported = imported['smart-living'].length + imported['tech-innovation'].length;

  console.log(`✅ Smart Living: ${imported['smart-living'].length}`);
  console.log(`✅ Tech Innovation: ${imported['tech-innovation'].length}`);
  console.log(`\n📦 Totale importati: ${totalImported}`);
  console.log(`❌ Non trovati: ${targetSkus.size}\n`);

  if (totalImported > 0) {
    // Aggiungi i nuovi prodotti al catalogo
    const allImported = [...imported['smart-living'], ...imported['tech-innovation']];

    // Rimuovi duplicati
    const existingIds = new Set(catalog.map(p => p.id));
    const newProducts = allImported.filter(p => !existingIds.has(p.id));

    // Aggiorna catalogo
    const updatedCatalog = [...catalog, ...newProducts];
    fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));

    console.log(`💾 Catalogo aggiornato:`);
    console.log(`   Prodotti precedenti: ${catalog.length}`);
    console.log(`   Nuovi prodotti: ${newProducts.length}`);
    console.log(`   Totale: ${updatedCatalog.length}\n`);

    // Mostra prodotti importati
    console.log('📋 PRODOTTI IMPORTATI:\n');

    console.log(`🏠 SMART LIVING (${imported['smart-living'].length}):`);
    imported['smart-living'].slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 50)}...`);
      console.log(`      SKU: ${p.id} | €${p.price} | Stock: ${p.stock}`);
    });
    if (imported['smart-living'].length > 10) {
      console.log(`   ... e altri ${imported['smart-living'].length - 10} prodotti`);
    }

    console.log(`\n⚡ TECH INNOVATION (${imported['tech-innovation'].length}):`);
    imported['tech-innovation'].slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 50)}...`);
      console.log(`      SKU: ${p.id} | €${p.price} | Stock: ${p.stock}`);
    });
    if (imported['tech-innovation'].length > 10) {
      console.log(`   ... e altri ${imported['tech-innovation'].length - 10} prodotti`);
    }
  }

  if (targetSkus.size > 0) {
    console.log('\n⚠️  SKU NON TROVATI:');
    Array.from(targetSkus).slice(0, 10).forEach(sku => {
      console.log(`   ${sku}`);
    });
    if (targetSkus.size > 10) {
      console.log(`   ... e altri ${targetSkus.size - 10} SKU`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETATO!');
  console.log('='.repeat(60) + '\n');
}

importByCategory();
