/**
 * SINCRONIZZAZIONE DEFINITIVA PRODOTTI BEAUTY
 * Usa il mapping BigBuy → Zenova per importare prodotti nelle categorie corrette
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica mapping definitivo
const mappingPath = path.join(__dirname, 'config', 'bigbuy-zenova-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Carica catalogo attuale
const catalogPath = path.join(__dirname, 'top-100-products.json');
let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log('\n🔄 SINCRONIZZAZIONE DEFINITIVA PRODOTTI BEAUTY');
console.log('='.repeat(50));
console.log(`📦 Catalogo attuale: ${currentCatalog.length} prodotti`);
console.log(`📊 Mapping: ${Object.keys(mapping.mapping).length} categorie Zenova\n`);

// Inverti il mapping per lookup veloce
// bigbuyId → zenovaCategory
const bigbuyToZenova = {};
for (const [zenovaKey, data] of Object.entries(mapping.mapping)) {
  data.bigbuyIds.forEach(bigbuyId => {
    bigbuyToZenova[bigbuyId] = {
      key: zenovaKey,
      name: data.name
    };
  });
}

console.log(`🔑 Mapping invertito: ${Object.keys(bigbuyToZenova).length} combinazioni BigBuy → Zenova\n`);

// Statistiche
const stats = {
  total: 0,
  matched: 0,
  unmatched: 0,
  added: 0,
  byCategory: {}
};

// Inizializza contatori per categoria
for (const key of Object.keys(mapping.mapping)) {
  stats.byCategory[key] = 0;
}

let processedRows = 0;
const newProducts = [];

console.log('📖 Leggendo CSV BigBuy Beauty...\n');

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2507_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    processedRows++;

    // Solo prodotti con stock
    const stock = parseInt(row.STOCK) || 0;
    if (stock < 1) return;

    stats.total++;

    // Prendi la categoria BigBuy del prodotto
    const category = row.CATEGORY || '';

    // Normalizza (ordina gli ID)
    const normalizeCategory = (cat) => {
      return cat.split(',').map(c => c.trim()).sort((a, b) => parseInt(a) - parseInt(b)).join(',');
    };

    const normalizedCategory = normalizeCategory(category);

    // Cerca nel mapping
    const zenovaMapping = bigbuyToZenova[normalizedCategory];

    if (zenovaMapping) {
      stats.matched++;
      stats.byCategory[zenovaMapping.key]++;

      // Crea prodotto con categoria Zenova
      const product = {
        id: row.ID,
        name: row.NAME || '',
        description: row.DESCRIPTION || row.NAME || '',
        brand: row.BRAND || '',
        category: category, // BigBuy originale
        subcategory: normalizedCategory, // BigBuy normalizzato per matching
        zenovaCategory: 'beauty',
        zenovaSubcategory: zenovaMapping.key,
        price: parseFloat(row.PVP_BIGBUY) || 0,
        retailPrice: (parseFloat(row.PVP_BIGBUY) || 0) * 1.5, // +50%
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

      // Log prime 5 categorie non matchate per debug
      if (stats.unmatched <= 5) {
        console.log(`⚠️  Non matchato: ${normalizedCategory} - ${row.NAME.substring(0, 50)}...`);
      }
    }

    // Progress ogni 500 prodotti
    if (processedRows % 500 === 0) {
      console.log(`   Processate ${processedRows} righe...`);
    }
  })
  .on('end', () => {
    console.log('\n' + '='.repeat(50));
    console.log('📊 STATISTICHE SINCRONIZZAZIONE\n');
    console.log(`✅ Righe CSV processate: ${processedRows}`);
    console.log(`📦 Prodotti con stock: ${stats.total}`);
    console.log(`✓  Matchati con Zenova: ${stats.matched} (${((stats.matched/stats.total)*100).toFixed(1)}%)`);
    console.log(`⚠  Non matchati: ${stats.unmatched} (${((stats.unmatched/stats.total)*100).toFixed(1)}%)\n`);

    console.log('📂 Prodotti per categoria Zenova:\n');

    // Mostra solo categorie con prodotti
    Object.entries(stats.byCategory)
      .filter(([key, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // Ordina per numero prodotti
      .forEach(([key, count]) => {
        const name = mapping.mapping[key].name;
        console.log(`   ${name.padEnd(40)} ${String(count).padStart(4)} prodotti`);
      });

    console.log('\n' + '='.repeat(50));

    // Rimuovi prodotti Beauty esistenti dal catalogo
    const existingIds = new Set(newProducts.map(p => p.id));
    currentCatalog = currentCatalog.filter(p => !existingIds.has(p.id));

    console.log(`\n🗑️  Rimossi ${existingIds.size} prodotti esistenti dal catalogo`);

    // Aggiungi nuovi prodotti
    currentCatalog.push(...newProducts);
    stats.added = newProducts.length;

    console.log(`➕ Aggiunti ${stats.added} nuovi prodotti Beauty`);
    console.log(`📦 Totale prodotti nel catalogo: ${currentCatalog.length}\n`);

    // Salva catalogo aggiornato
    fs.writeFileSync(catalogPath, JSON.stringify(currentCatalog, null, 2));
    console.log(`💾 Catalogo salvato: ${catalogPath}`);

    // Salva statistiche
    const statsFile = {
      timestamp: new Date().toISOString(),
      stats,
      topCategories: Object.entries(stats.byCategory)
        .filter(([k, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => ({
          key,
          name: mapping.mapping[key].name,
          count
        }))
    };

    fs.writeFileSync('beauty-sync-stats.json', JSON.stringify(statsFile, null, 2));
    console.log('📊 Statistiche salvate: beauty-sync-stats.json\n');

    console.log('✅ SINCRONIZZAZIONE COMPLETATA!');
    console.log('='.repeat(50) + '\n');
  });
