const bigbuy = require('./src/integrations/BigBuyClient');
const logger = require('./src/utils/logger');
require('dotenv').config();

const searchTerms = [
  'wake up light',
  'candela led',
  'candle led',
  'plafoniera ksiks',
  'stellar',
  'rumore bianco',
  'white noise',
  'neon',
  'striscia led',
  'led strip',
  'equilibrio magnetico',
  'magnetic lamp',
  'lampada esprit',
  'floor lamp'
];

async function searchLightingProducts() {
  const foundProducts = [];

  console.log('🔍 Cerco prodotti illuminazione su BigBuy...\n');

  try {
    // Cerco in più pagine per avere più risultati
    for (let page = 1; page <= 20; page++) {
      console.log(`📄 Pagina ${page}...`);

      const products = await bigbuy.getProducts(page, 50);

      if (products.length === 0) {
        console.log('❌ Nessun prodotto trovato in questa pagina');
        break;
      }

      // Filtro prodotti che matchano i termini di ricerca
      const matches = products.filter(p => {
        const name = (p.name || '').toLowerCase();

        // Gestisci categoria come stringa o array
        let categoryStr = '';
        if (typeof p.category === 'string') {
          categoryStr = p.category.toLowerCase();
        } else if (Array.isArray(p.category)) {
          categoryStr = p.category.map(c => typeof c === 'string' ? c : c.name || '').join(' ').toLowerCase();
        } else if (p.category && p.category.name) {
          categoryStr = p.category.name.toLowerCase();
        }

        // Cerca illuminazione, lampade, LED nella categoria o nome
        const isLighting = categoryStr.includes('light') ||
                          categoryStr.includes('lamp') ||
                          categoryStr.includes('illuminaz') ||
                          name.includes('lamp') ||
                          name.includes('light') ||
                          name.includes('led') ||
                          searchTerms.some(term => name.includes(term.toLowerCase()));

        return isLighting;
      });

      if (matches.length > 0) {
        console.log(`✅ Trovati ${matches.length} prodotti illuminazione`);
        foundProducts.push(...matches);

        matches.forEach(p => {
          console.log(`  - ${p.name}`);
          console.log(`    Categoria: ${p.category}`);
          console.log(`    Prezzo: €${p.price}`);
          console.log();
        });
      }

      // Pausa per evitare rate limiting
      if (page < 20) {
        console.log('⏳ Attendo 3 secondi...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('\n=================================');
    console.log(`🎉 TOTALE: ${foundProducts.length} prodotti trovati`);
    console.log('=================================\n');

    // Salva risultati in un file JSON
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'lighting-products-found.json');
    fs.writeFileSync(outputPath, JSON.stringify(foundProducts, null, 2));
    console.log(`💾 Risultati salvati in: ${outputPath}`);

  } catch (error) {
    console.error('❌ Errore durante la ricerca:', error.message);
  }
}

searchLightingProducts();
