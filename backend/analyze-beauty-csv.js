/**
 * Analizza il CSV Beauty per trovare tutte le categorie reali
 * e contare quanti prodotti ci sono per ciascuna
 */

const fs = require('fs');
const csv = require('csv-parser');

// Conta prodotti per categoria
const categoryCount = {};
const categoryProducts = {}; // Salva 3 esempi per categoria

let totalProducts = 0;

console.log('📊 Analizzando CSV Beauty per trovare categorie reali...\n');

fs.createReadStream('bigbuy-data/product_2507_it.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    // Solo prodotti con stock
    const stock = parseInt(row.STOCK) || 0;
    if (stock < 1) return;

    totalProducts++;

    const categories = row.CATEGORY ? row.CATEGORY.split(',').map(c => c.trim()) : [];

    categories.forEach(catId => {
      if (!categoryCount[catId]) {
        categoryCount[catId] = 0;
        categoryProducts[catId] = [];
      }

      categoryCount[catId]++;

      // Salva max 3 esempi
      if (categoryProducts[catId].length < 3) {
        categoryProducts[catId].push({
          name: row.NAME ? row.NAME.substring(0, 60) + '...' : '',
          categories: row.CATEGORY
        });
      }
    });
  })
  .on('end', () => {
    console.log(`✅ Analisi completata: ${totalProducts} prodotti con stock\n`);
    console.log('📊 Categorie BigBuy trovate nei prodotti:\n');

    // Ordina per numero prodotti
    const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([catId, count]) => {
      console.log(`\n🔹 ${catId}: ${count} prodotti`);
      console.log('   Esempi:');
      categoryProducts[catId].slice(0, 2).forEach(p => {
        console.log(`   - ${p.name}`);
        console.log(`     Cat: ${p.categories}`);
      });
    });

    console.log(`\n\n✅ Totale categorie uniche: ${sorted.length}`);

    // Salva risultato
    const result = {
      totalProducts,
      totalCategories: sorted.length,
      categories: sorted.map(([id, count]) => ({
        id,
        count,
        examples: categoryProducts[id]
      }))
    };

    fs.writeFileSync('beauty-categories-analysis.json', JSON.stringify(result, null, 2));
    console.log('\n💾 Analisi salvata in: beauty-categories-analysis.json');
  });
