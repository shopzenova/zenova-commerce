/**
 * Scarica struttura completa categorie Beauty da BigBuy API
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BIGBUY_API_URL = process.env.BIGBUY_API_URL;
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

console.log('🔑 API BigBuy configurata:', BIGBUY_API_URL);

async function fetchAllCategories() {
  try {
    console.log('\n📡 Scaricando TUTTE le categorie da BigBuy API...\n');

    const response = await axios.get(`${BIGBUY_API_URL}/rest/catalog/categories.json`, {
      headers: {
        'Authorization': `Bearer ${BIGBUY_API_KEY}`
      },
      params: {
        isoCode: 'it'
      }
    });

    const categories = response.data;
    console.log(`✅ Scaricate ${categories.length} categorie totali\n`);

    // Salva tutte le categorie
    fs.writeFileSync('bigbuy-categories-complete.json', JSON.stringify(categories, null, 2));
    console.log('💾 Salvate in: bigbuy-categories-complete.json\n');

    // Trova categoria Beauty/Bellezza (2507)
    const beauty = categories.find(c => c.id === 2507);
    if (beauty) {
      console.log(`📂 Categoria Beauty trovata: ${beauty.id} → ${beauty.name}`);
      console.log(`   Parent: ${beauty.parentCategory || 'ROOT'}\n`);
    } else {
      console.log('⚠️  Categoria 2507 (Beauty) non trovata nelle categorie principali\n');
    }

    // Trova tutte le sottocategorie di Health & Beauty (2501)
    const healthBeauty = categories.find(c => c.id === 2501);
    if (healthBeauty) {
      console.log(`📂 Categoria Health & Beauty: ${healthBeauty.id} → ${healthBeauty.name}\n`);
    }

    // Trova tutte le categorie che hanno come parent 2501 o 2507
    const beautyChildren = categories.filter(c =>
      c.parentCategory === 2501 || c.parentCategory === 2507
    );

    console.log(`📊 Sottocategorie di Health & Beauty (2501) e Beauty (2507):\n`);
    beautyChildren
      .sort((a, b) => a.id - b.id)
      .forEach(cat => {
        console.log(`   ${String(cat.id).padEnd(6)} → ${cat.name} (parent: ${cat.parentCategory})`);
      });

    console.log(`\n✅ Totale sottocategorie: ${beautyChildren.length}\n`);

    // Salva solo categorie Beauty
    const beautyStructure = {
      main: healthBeauty,
      beauty2507: beauty,
      subcategories: beautyChildren,
      totalSubcategories: beautyChildren.length
    };

    fs.writeFileSync('beauty-structure-bigbuy.json', JSON.stringify(beautyStructure, null, 2));
    console.log('💾 Struttura Beauty salvata in: beauty-structure-bigbuy.json\n');

    return beautyChildren;

  } catch (error) {
    console.error('❌ Errore durante lo scaricamento:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
}

// Esegui
fetchAllCategories()
  .then(() => {
    console.log('✅ Download completato!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore fatale:', err.message);
    process.exit(1);
  });
