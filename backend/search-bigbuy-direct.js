const axios = require('axios');
require('dotenv').config();

async function searchBigBuyDirect() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';

  console.log('🔍 Ricerca prodotti illuminazione su BigBuy API...\n');

  const searchKeywords = [
    'wake up light',
    'candela led',
    'candle led',
    'plafoniera ksiks',
    'stellar',
    'rumore bianco',
    'white noise',
    'neon ksiks',
    'striscia',
    'equilibrio',
    'magnetico',
    'esprit',
    'lampada terra'
  ];

  try {
    // Prova a cercare prodotti con query
    console.log('📡 Tento richiesta a BigBuy /rest/catalog/products.json\n');

    const allFound = [];

    // Cerca in più pagine (fino a 5 pagine, 100 prodotti ciascuna)
    for (let page = 1; page <= 5; page++) {
      console.log(`📄 Caricamento pagina ${page}...`);

      const response = await axios.get(`${baseURL}/rest/catalog/products.json`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          isoCode: 'it',
          page: page,
          pageSize: 100
        },
        timeout: 60000
      });

      if (!response.data || response.data.length === 0) {
        console.log('Nessun prodotto in questa pagina');
        break;
      }

      console.log(`✅ Ricevuti ${response.data.length} prodotti`);

      // Filtra prodotti che matchano i termini
      const matches = response.data.filter(p => {
        const name = (p.name || '').toLowerCase();
        return searchKeywords.some(keyword => name.includes(keyword.toLowerCase()));
      });

      if (matches.length > 0) {
        console.log(`🔦 Trovati ${matches.length} prodotti rilevanti\n`);
        allFound.push(...matches);
      }

      // Pausa tra richieste
      if (page < 5) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n🎉 TOTALE PRODOTTI TROVATI: ${allFound.length}\n`);

    allFound.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   SKU: ${p.sku || p.id}`);
      console.log(`   Prezzo: €${p.retailPrice || p.price || 'N/A'}`);
      console.log(`   Categoria: ${p.category || 'N/A'}`);
      console.log('');
    });

    // Salva risultati
    if (allFound.length > 0) {
      const fs = require('fs');
      fs.writeFileSync('./lighting-products-found.json', JSON.stringify(allFound, null, 2));
      console.log('💾 Salvati in: lighting-products-found.json');
    }

  } catch (error) {
    console.error('❌ Errore durante la richiesta:');
    console.error('Messaggio:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    }
  }
}

searchBigBuyDirect();
