/**
 * SINCRONIZZAZIONE DEFINITIVA PRODOTTI HEALTH & PERSONAL CARE
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica mapping definitivo
const mappingPath = path.join(__dirname, 'config', 'bigbuy-zenova-health-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Carica catalogo attuale
const catalogPath = path.join(__dirname, 'top-100-products.json');
let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log('\n🔄 SINCRONIZZAZIONE HEALTH & PERSONAL CARE');
console.log('='.repeat(50));
console.log(`📦 Catalogo attuale: ${currentCatalog.length} prodotti`);
console.log(`📊 Mapping: ${Object.keys(mapping.mapping).length} categorie Zenova\n`);

// Inverti il mapping
const bigbuyToZenova = {};
for (const [zenovaKey, data] of Object.entries(mapping.mapping)) {
  data.bigbuyIds.forEach(bigbuyId => {
    bigbuyToZenova[bigbuyId] = {
      key: zenovaKey,
      name: data.name,
      priority: data.priority || 1
    };
  });
}

console.log(`🔑 Mapping invertito: ${Object.keys(bigbuyToZenova).length} combinazioni\n`);

// Statistiche
const stats = {
  total: 0,
  matched: 0,
  unmatched: 0,
  added: 0,
  skippedGlasses: 0,
  byCategory: {}
};

// Inizializza contatori
for (const key of Object.keys(mapping.mapping)) {
  stats.byCategory[key] = 0;
}

let processedRows = 0;
const newProducts = [];

// LIMITI: escludi occhiali (troppi)
const EXCLUDE_GLASSES = true;
const MAX_PRODUCTS_PER_CATEGORY = 100; // Limite per categoria

console.log('📖 Leggendo CSV Health & Personal Care...\n');

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2501_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    processedRows++;

    const stock = parseInt(row.STOCK) || 0;
    if (stock < 1) return;

    stats.total++;

    const category = row.CATEGORY || '';

    const normalizeCategory = (cat) => {
      return cat.split(',').map(c => c.trim()).sort((a, b) => parseInt(a) - parseInt(b)).join(',');
    };

    const normalizedCategory = normalizeCategory(category);
    const zenovaMapping = bigbuyToZenova[normalizedCategory];

    if (zenovaMapping) {
      // Escludi occhiali se richiesto
      if (EXCLUDE_GLASSES && zenovaMapping.key === 'occhiali-da-vista') {
        stats.skippedGlasses++;
        return;
      }

      // Limita prodotti per categoria
      if (stats.byCategory[zenovaMapping.key] >= MAX_PRODUCTS_PER_CATEGORY) {
        return;
      }

      stats.matched++;
      stats.byCategory[zenovaMapping.key]++;

      const product = {
        id: row.ID,
        name: row.NAME || '',
        description: row.DESCRIPTION || row.NAME || '',
        brand: row.BRAND || '',
        category: category,
        subcategory: normalizedCategory,
        zenovaCategory: 'health-personal-care',
        zenovaSubcategory: zenovaMapping.key,
        price: parseFloat(row.PVP_BIGBUY) || 0,
        retailPrice: (parseFloat(row.PVP_BIGBUY) || 0) * 1.5,
        wholesalePrice: parseFloat(row.PVD) || 0,
        stock: stock,
        images: [
          row.IMAGE1,
          row.IMAGE2,
          row.IMAGE3,
          row.IMAGE4,
          row.IMAGE5
        ].filter(img => img && img.startsWith('http')),
        image: row.IMAGE1 || '',
        ean: row.EAN13 || '',
        weight: parseFloat(row.WEIGHT) || 0,
        dimensions: {
          width: parseFloat(row.WIDTH) || 0,
          height: parseFloat(row.HEIGHT) || 0,
          depth: parseFloat(row.DEPTH) || 0
        },
        active: true
      };

      newProducts.push(product);
    } else {
      stats.unmatched++;
    }

    if (processedRows % 2000 === 0) {
      console.log(`   Processate ${processedRows} righe...`);
    }
  })
  .on('end', () => {
    console.log('\n' + '='.repeat(50));
    console.log('📊 STATISTICHE SINCRONIZZAZIONE\n');
    console.log(`✅ Righe CSV processate: ${processedRows}`);
    console.log(`📦 Prodotti con stock: ${stats.total}`);
    console.log(`✓  Matchati: ${stats.matched}`);
    console.log(`⊗  Occhiali esclusi: ${stats.skippedGlasses}`);
    console.log(`⚠  Non matchati: ${stats.unmatched}\n`);

    console.log('📂 Prodotti per categoria:\n');

    Object.entries(stats.byCategory)
      .filter(([key, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, count]) => {
        const name = mapping.mapping[key].name;
        console.log(`   ${name.padEnd(40)} ${String(count).padStart(4)} prodotti`);
      });

    console.log('\n' + '='.repeat(50));

    // Rimuovi SOLO prodotti Health & Personal Care esistenti (non toccare Beauty!)
    const beforeCount = currentCatalog.length;
    currentCatalog = currentCatalog.filter(p => p.zenovaCategory !== 'health-personal-care');
    const removedCount = beforeCount - currentCatalog.length;

    console.log(`\n🗑️  Rimossi ${removedCount} prodotti Health esistenti`);

    // Aggiungi nuovi prodotti
    currentCatalog.push(...newProducts);
    stats.added = newProducts.length;

    console.log(`➕ Aggiunti ${stats.added} nuovi prodotti Health`);
    console.log(`📦 Totale catalogo: ${currentCatalog.length}\n`);

    // Salva
    fs.writeFileSync(catalogPath, JSON.stringify(currentCatalog, null, 2));
    console.log(`💾 Catalogo salvato: ${catalogPath}`);

    const statsFile = {
      timestamp: new Date().toISOString(),
      stats,
      topCategories: Object.entries(stats.byCategory)
        .filter(([k, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([key, count]) => ({
          key,
          name: mapping.mapping[key].name,
          count
        }))
    };

    fs.writeFileSync('health-sync-stats.json', JSON.stringify(statsFile, null, 2));
    console.log('📊 Statistiche salvate: health-sync-stats.json\n');

    console.log('✅ SINCRONIZZAZIONE COMPLETATA!');
    console.log('='.repeat(50) + '\n');
  });
