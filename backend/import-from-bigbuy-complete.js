const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_DIR = path.join(__dirname, 'bigbuy-data', 'bigbuy-complete');
const TARGET_LIST = path.join(__dirname, 'smart-tech-products-list.json');
const CATALOG_PATH = path.join(__dirname, 'top-100-products.json');

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        // Rimuovi BOM dalle chiavi se presente
        const cleanedRow = {};
        for (const [key, value] of Object.entries(row)) {
          const cleanKey = key.replace(/^\uFEFF/, ''); // Rimuovi BOM
          cleanedRow[cleanKey] = value;
        }
        products.push(cleanedRow);
      })
      .on('end', () => resolve(products))
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 IMPORT SMART LIVING & TECH INNOVATION DA CSV BIGBUY\n');
  console.log('='.repeat(60) + '\n');

  // Carica lista SKU target
  const targetList = JSON.parse(fs.readFileSync(TARGET_LIST, 'utf-8'));
  const targetSkus = new Set([
    ...targetList['tech-innovation'].map(p => p.sku),
    ...targetList['smart-living'].map(p => p.sku)
  ]);

  console.log(`🎯 SKU da cercare: ${targetSkus.size}`);
  console.log(`   Tech Innovation: ${targetList['tech-innovation'].length}`);
  console.log(`   Smart Living: ${targetList['smart-living'].length}\n`);

  // Lista file CSV da scansionare
  const csvFiles = fs.readdirSync(CSV_DIR)
    .filter(f => f.startsWith('general-products-csv-') && f.endsWith('.csv'));

  console.log(`📂 File CSV trovati: ${csvFiles.length}\n`);

  const foundProducts = [];
  let filesScanned = 0;

  for (const file of csvFiles) {
    filesScanned++;
    const filePath = path.join(CSV_DIR, file);

    console.log(`[${filesScanned}/${csvFiles.length}] 🔍 Scansiono ${file}...`);

    try {
      const products = await parseCSV(filePath);

      // Cerca i nostri SKU (il campo si chiama "ID" nel CSV BigBuy)
      const matches = products.filter(p => targetSkus.has(p.ID));

      if (matches.length > 0) {
        console.log(`   ✅ Trovati ${matches.length} prodotti target!`);

        matches.forEach(p => {
          console.log(`      - ${p.ID}: ${(p.NAME || '').substring(0, 50)}...`);
          foundProducts.push(p);
          targetSkus.delete(p.ID);
        });
      } else {
        console.log(`   ⚪ Nessun prodotto target`);
      }

      // Se abbiamo trovato tutti i prodotti, fermiamoci
      if (targetSkus.size === 0) {
        console.log(`\n🎉 Tutti i prodotti trovati! Fermo la ricerca.\n`);
        break;
      }

    } catch (err) {
      console.log(`   ❌ Errore: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RISULTATI RICERCA');
  console.log('='.repeat(60) + '\n');

  console.log(`✅ Prodotti trovati: ${foundProducts.length}/${targetList.summary.totalSelected}`);
  console.log(`❌ Non trovati: ${targetSkus.size}\n`);

  if (targetSkus.size > 0) {
    console.log('⚠️  SKU NON TROVATI:');
    Array.from(targetSkus).forEach(sku => console.log(`   - ${sku}`));
    console.log('');
  }

  if (foundProducts.length === 0) {
    console.log('❌ Nessun prodotto da importare\n');
    return;
  }

  // Categorizza i prodotti
  const smartSkus = new Set(targetList['smart-living'].map(p => p.sku));
  const techSkus = new Set(targetList['tech-innovation'].map(p => p.sku));

  const categorized = {
    'smart-living': [],
    'tech-innovation': []
  };

  foundProducts.forEach(p => {
    const category = smartSkus.has(p.ID) ? 'smart-living' :
                     techSkus.has(p.ID) ? 'tech-innovation' : null;

    if (category) {
      // Raccogli tutte le immagini disponibili
      const images = [];
      for (let i = 1; i <= 8; i++) {
        const imgField = `IMAGE${i}`;
        if (p[imgField]) images.push({ url: p[imgField] });
      }

      categorized[category].push({
        id: p.ID,
        sku: p.ID,
        name: p.NAME || p.ID,
        description: p.DESCRIPTION || '',
        brand: p.BRAND || '',
        category: category,
        price: parseFloat(p.PVP_BIGBUY || p.PRICE || 0),
        pvd: parseFloat(p.PVD || 0),
        stock: parseInt(p.STOCK || 0),
        images: images,
        imageCount: images.length,
        video: p.VIDEO || '0',
        ean: p.EAN13 || '',
        width: p.WIDTH || '',
        height: p.HEIGHT || '',
        depth: p.DEPTH || '',
        weight: p.WEIGHT || ''
      });
    }
  });

  console.log('💾 SALVATAGGIO NEL CATALOGO...\n');

  // Carica catalogo esistente
  let catalog = [];
  try {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
    console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
  } catch (err) {
    console.log('📦 Creo nuovo catalogo');
  }

  // Rimuovi duplicati
  const allImported = [...categorized['smart-living'], ...categorized['tech-innovation']];
  const existingIds = new Set(catalog.map(p => p.id));
  const newProducts = allImported.filter(p => !existingIds.has(p.id));

  // Aggiorna catalogo
  const updatedCatalog = [...catalog, ...newProducts];
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 2));

  console.log(`✅ Nuovi prodotti aggiunti: ${newProducts.length}`);
  console.log(`📦 Totale catalogo: ${updatedCatalog.length}\n`);

  console.log('='.repeat(60));
  console.log('📋 RIEPILOGO PRODOTTI IMPORTATI');
  console.log('='.repeat(60) + '\n');

  console.log(`🏠 SMART LIVING (${categorized['smart-living'].length}):`);
  categorized['smart-living'].forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 60)}`);
    console.log(`      SKU: ${p.sku} | €${p.price.toFixed(2)} | Stock: ${p.stock}`);
  });

  console.log(`\n⚡ TECH INNOVATION (${categorized['tech-innovation'].length}):`);
  categorized['tech-innovation'].forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 60)}`);
    console.log(`      SKU: ${p.sku} | €${p.price.toFixed(2)} | Stock: ${p.stock}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETATO!');
  console.log('='.repeat(60) + '\n');
}

main();
