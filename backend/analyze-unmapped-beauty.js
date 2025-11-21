/**
 * Analisi prodotti Beauty non ancora mappati
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica mapping attuale
const mappingPath = path.join(__dirname, 'config', 'bigbuy-zenova-mapping.json');
const currentMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Estrai tutti gli ID già mappati
const mappedIds = new Set();
for (const [key, data] of Object.entries(currentMapping.mapping)) {
  data.bigbuyIds.forEach(id => mappedIds.add(id));
}

console.log('🔍 ANALISI PRODOTTI BEAUTY NON MAPPATI');
console.log('='.repeat(60));
console.log(`✅ Categorie già mappate: ${mappedIds.size}`);
console.log('');

const unmappedCategories = {};
let processedRows = 0;

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2507_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    processedRows++;

    const stock = parseInt(row.STOCK) || 0;
    if (stock < 1) return;

    const category = row.CATEGORY || '';

    // Normalizza categoria
    const normalizeCategory = (cat) => {
      return cat.split(',').map(c => c.trim()).sort((a, b) => parseInt(a) - parseInt(b)).join(',');
    };

    const normalized = normalizeCategory(category);

    // Se NON è già mappato
    if (!mappedIds.has(normalized)) {
      if (!unmappedCategories[normalized]) {
        unmappedCategories[normalized] = {
          count: 0,
          samples: []
        };
      }

      unmappedCategories[normalized].count++;

      // Salva primi 5 esempi
      if (unmappedCategories[normalized].samples.length < 5) {
        unmappedCategories[normalized].samples.push({
          name: row.NAME,
          brand: row.BRAND
        });
      }
    }
  })
  .on('end', () => {
    console.log(`📖 Righe processate: ${processedRows}\n`);

    // Ordina per numero di prodotti
    const sorted = Object.entries(unmappedCategories)
      .sort((a, b) => b[1].count - a[1].count);

    console.log(`⚠️  CATEGORIE NON MAPPATE: ${sorted.length}\n`);
    console.log('TOP 20 CATEGORIE NON MAPPATE:');
    console.log('='.repeat(60));

    sorted.slice(0, 20).forEach(([categoryId, data]) => {
      console.log(`\n📦 Categoria: ${categoryId} (${data.count} prodotti)`);
      console.log('Esempi:');
      data.samples.forEach(sample => {
        console.log(`  - ${sample.brand ? sample.brand + ' - ' : ''}${sample.name}`);
      });
    });

    console.log('\n' + '='.repeat(60));

    // Salva risultati completi
    const results = {
      timestamp: new Date().toISOString(),
      totalUnmapped: sorted.length,
      totalProductsUnmapped: sorted.reduce((sum, [_, data]) => sum + data.count, 0),
      categories: sorted.map(([id, data]) => ({
        bigbuyId: id,
        count: data.count,
        samples: data.samples
      }))
    };

    fs.writeFileSync('unmapped-beauty-analysis.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Risultati salvati in: unmapped-beauty-analysis.json\n');
  });
