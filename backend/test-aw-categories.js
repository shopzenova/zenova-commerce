/**
 * Test ricerca categorie AW con filtri
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

async function testCategories() {
  console.log('🔍 Test categorie AW con filtri...\n');

  const awClient = new AWDropshipClient();

  try {
    // Prova diversi filtri per trovare categorie
    const filters = [
      { department_slug: 'lampade' },
      { department_slug: 'diffusori' },
      { department_slug: 'aromi' },
      { department_slug: 'aromatherapy' },
      { department_slug: 'home-fragrance' },
      { family_slug: 'diffusori' },
      { family_slug: 'lampade' },
      { shop_slug: 'aw-dropship' }
    ];

    for (const filter of filters) {
      const filterName = Object.keys(filter)[0];
      const filterValue = Object.values(filter)[0];

      console.log(`\n📦 Tentativo filtro: ${filterName}=${filterValue}`);

      try {
        const result = await awClient.getProducts(1, 10, filter);

        if (result.data.length > 0) {
          console.log(`✅ TROVATI ${result.data.length} prodotti!`);
          console.log(`   Total: ${result.pagination.total}`);
          result.data.slice(0, 3).forEach(p => {
            console.log(`   - [${p.code}] ${p.name}`);
          });
        } else {
          console.log(`❌ Nessun prodotto trovato`);
        }
      } catch (error) {
        console.log(`❌ Errore: ${error.message}`);
      }

      await new Promise(r => setTimeout(r, 2500));
    }

    console.log('\n✅ Test completato!\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    process.exit(1);
  }
}

testCategories().then(() => {
  process.exit(0);
});
