#!/usr/bin/env node
/**
 * SCRIPT COMPLETO IMPORTAZIONE PRODOTTI BIGBUY
 *
 * Questo script automatizza l'intero processo di importazione:
 * 1. Carica la lista SKU target
 * 2. Cerca i prodotti nei CSV BigBuy
 * 3. Importa nel catalogo
 * 4. Sistema i campi categoria per compatibilità
 * 5. Verifica l'importazione
 *
 * USO:
 *   node import-products-complete.js
 *
 * PREREQUISITI:
 *   - File smart-tech-products-list.json con SKU da importare
 *   - CSV BigBuy estratti in bigbuy-data/bigbuy-complete/
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_DIR = path.join(__dirname, 'bigbuy-data', 'bigbuy-complete');
const TARGET_LIST = path.join(__dirname, 'smart-tech-products-list.json');
const CATALOG_PATH = path.join(__dirname, 'top-100-products.json');

// Parsing CSV con gestione BOM
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

async function main() {
  console.log('🚀 IMPORTAZIONE COMPLETA PRODOTTI BIGBUY\n');
  console.log('='.repeat(60) + '\n');

  // STEP 1: Carica lista SKU
  console.log('📋 STEP 1: Caricamento lista SKU target...\n');

  if (!fs.existsSync(TARGET_LIST)) {
    console.error('❌ File smart-tech-products-list.json non trovato!');
    console.log('   Crea prima il file con gli SKU da importare.\n');
    process.exit(1);
  }

  const targetList = JSON.parse(fs.readFileSync(TARGET_LIST, 'utf-8'));
  const targetSkus = new Set([
    ...targetList['tech-innovation'].map(p => p.sku),
    ...targetList['smart-living'].map(p => p.sku)
  ]);

  console.log(`✅ Caricati ${targetSkus.size} SKU target`);
  console.log(`   Tech Innovation: ${targetList['tech-innovation'].length}`);
  console.log(`   Smart Living: ${targetList['smart-living'].length}\n`);

  // STEP 2: Cerca prodotti nei CSV
  console.log('🔍 STEP 2: Ricerca prodotti nei CSV BigBuy...\n');

  if (!fs.existsSync(CSV_DIR)) {
    console.error('❌ Cartella CSV non trovata:', CSV_DIR);
    console.log('   Scarica ed estrai i CSV da BigBuy prima di continuare.\n');
    process.exit(1);
  }

  const csvFiles = fs.readdirSync(CSV_DIR)
    .filter(f => f.startsWith('general-products-csv-') && f.endsWith('.csv'));

  console.log(`📂 Trovati ${csvFiles.length} file CSV\n`);

  const foundProducts = [];
  let filesScanned = 0;

  for (const file of csvFiles) {
    filesScanned++;
    const filePath = path.join(CSV_DIR, file);

    process.stdout.write(`[${filesScanned}/${csvFiles.length}] Scansiono ${file}...`);

    try {
      const products = await parseCSV(filePath);
      const matches = products.filter(p => targetSkus.has(p.ID));

      if (matches.length > 0) {
        console.log(` ✅ ${matches.length} trovati!`);
        matches.forEach(p => {
          foundProducts.push(p);
          targetSkus.delete(p.ID);
        });
      } else {
        console.log(' ⚪');
      }

      if (targetSkus.size === 0) {
        console.log('\n🎉 Tutti i prodotti trovati!\n');
        break;
      }

    } catch (err) {
      console.log(` ❌ Errore: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Prodotti trovati: ${foundProducts.length}/${targetList.summary.totalSelected}`);
  console.log(`❌ Non trovati: ${targetSkus.size}\n`);

  if (foundProducts.length === 0) {
    console.log('❌ Nessun prodotto da importare\n');
    process.exit(0);
  }

  // STEP 3: Categorizza e formatta prodotti
  console.log('🏷️  STEP 3: Categorizzazione prodotti...\n');

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
        zenovaCategory: category,
        zenovaCategories: [category],
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

  console.log(`✅ Smart Living: ${categorized['smart-living'].length}`);
  console.log(`✅ Tech Innovation: ${categorized['tech-innovation'].length}\n`);

  // STEP 4: Importa nel catalogo
  console.log('💾 STEP 4: Importazione nel catalogo...\n');

  let catalog = [];
  try {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
    console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
  } catch (err) {
    console.log('📦 Creo nuovo catalogo');
  }

  const allImported = [...categorized['smart-living'], ...categorized['tech-innovation']];
  const existingIds = new Set(catalog.map(p => p.id));
  const newProducts = allImported.filter(p => !existingIds.has(p.id));

  const updatedCatalog = [...catalog, ...newProducts];
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 2));

  console.log(`✅ Nuovi prodotti aggiunti: ${newProducts.length}`);
  console.log(`📦 Totale catalogo: ${updatedCatalog.length}\n`);

  // STEP 5: Verifica finale
  console.log('='.repeat(60));
  console.log('📊 RIEPILOGO IMPORTAZIONE');
  console.log('='.repeat(60) + '\n');

  console.log(`🏠 SMART LIVING (${categorized['smart-living'].length}):`);
  categorized['smart-living'].slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 55)}`);
    console.log(`      SKU: ${p.sku} | €${p.price.toFixed(2)} | Stock: ${p.stock}`);
  });
  if (categorized['smart-living'].length > 5) {
    console.log(`   ... e altri ${categorized['smart-living'].length - 5} prodotti`);
  }

  console.log(`\n⚡ TECH INNOVATION (${categorized['tech-innovation'].length}):`);
  categorized['tech-innovation'].slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 55)}`);
    console.log(`      SKU: ${p.sku} | €${p.price.toFixed(2)} | Stock: ${p.stock}`);
  });
  if (categorized['tech-innovation'].length > 5) {
    console.log(`   ... e altri ${categorized['tech-innovation'].length - 5} prodotti`);
  }

  if (targetSkus.size > 0) {
    console.log('\n⚠️  SKU NON TROVATI:');
    Array.from(targetSkus).slice(0, 5).forEach(sku => {
      console.log(`   - ${sku}`);
    });
    if (targetSkus.size > 5) {
      console.log(`   ... e altri ${targetSkus.size - 5} SKU`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORTAZIONE COMPLETATA!');
  console.log('='.repeat(60));
  console.log('\n💡 PROSSIMI PASSI:');
  console.log('   1. Riavvia il server: node server.js');
  console.log('   2. Verifica prodotti su: http://localhost:3000/admin.html');
  console.log('   3. Visualizza sul sito: http://127.0.0.1:8080/prodotti.html\n');
}

main().catch(err => {
  console.error('\n❌ ERRORE FATALE:', err.message);
  console.error(err.stack);
  process.exit(1);
});
