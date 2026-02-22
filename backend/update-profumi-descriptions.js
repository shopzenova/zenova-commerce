/**
 * AGGIORNA DESCRIZIONI PROFUMI DA BIGBUY API
 *
 * Scarica le descrizioni dettagliate da BigBuy per tutti i profumi
 * e aggiorna il database PostgreSQL.
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const BIGBUY_API_URL = process.env.BIGBUY_API_URL || 'https://api.bigbuy.eu';
const BIGBUY_API_KEY = process.env.BIGBUY_API_KEY;

const client = axios.create({
  baseURL: BIGBUY_API_URL,
  headers: {
    'Authorization': `Bearer ${BIGBUY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 90000
});

// Rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchProductInfo(sku) {
  try {
    const response = await client.get(`/rest/catalog/productinformation/${sku}.json`, {
      params: { isoCode: 'it' }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Prova anche endpoint batch per efficienza
async function fetchBatchProductInfo(page, pageSize) {
  try {
    const response = await client.get('/rest/catalog/productsinformation.json', {
      params: { isoCode: 'it', page, pageSize }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Errore batch page ${page}:`, error.response?.status, error.message);
    return [];
  }
}

async function main() {
  console.log('🔄 Aggiornamento descrizioni profumi da BigBuy API...\n');

  // Carica tutti i profumi dal DB
  const profumi = await prisma.product.findMany({
    where: {
      zenovaSubcategory: { in: ['profumi-uomini', 'profumi-donne'] },
      source: 'bigbuy'
    },
    select: { id: true, name: true, description: true }
  });

  console.log(`📦 Profumi da aggiornare: ${profumi.length}`);

  // Crea un set di ID profumi per lookup veloce
  const profumiIds = new Set(profumi.map(p => p.id));

  // Scarica descrizioni in batch da BigBuy (paginato)
  console.log('\n📡 Scaricamento descrizioni da BigBuy API (batch)...');
  const allDescriptions = new Map();
  let page = 0;
  let hasMore = true;
  const pageSize = 1000;

  while (hasMore) {
    console.log(`   Pagina ${page}...`);
    const batch = await fetchBatchProductInfo(page, pageSize);

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const item of batch) {
      const sku = item.sku || item.id;
      if (profumiIds.has(String(sku))) {
        // Cerca descrizione in italiano
        let description = '';
        if (Array.isArray(item.descriptions)) {
          const itDesc = item.descriptions.find(d => d.isoCode === 'it' || d.language === 'it');
          description = itDesc ? (itDesc.description || itDesc.text || '') : '';
          if (!description && item.descriptions.length > 0) {
            // Fallback: usa prima descrizione disponibile
            description = item.descriptions[0].description || item.descriptions[0].text || '';
          }
        } else if (typeof item.description === 'string') {
          description = item.description;
        } else if (item.name) {
          // Qualche volta la descrizione è in un campo diverso
          description = item.htmlDescription || item.longDescription || '';
        }

        if (description && description.length > 50) {
          allDescriptions.set(String(sku), description);
        }
      }
    }

    console.log(`   ✅ Pagina ${page}: ${batch.length} prodotti, ${allDescriptions.size} descrizioni trovate finora`);
    page++;
    await delay(3000); // Rate limiting
  }

  console.log(`\n📋 Descrizioni trovate: ${allDescriptions.size} su ${profumi.length} profumi`);

  if (allDescriptions.size === 0) {
    console.log('\n⚠️ Nessuna descrizione trovata via batch. Provo singolarmente...');

    // Fallback: prova singolarmente per i primi 10 come test
    let found = 0;
    const testSample = profumi.slice(0, 10);

    for (const p of testSample) {
      console.log(`   Provo ${p.id}...`);
      try {
        const info = await fetchProductInfo(p.id);
        if (info) {
          console.log(`   ✅ Trovato! Keys: ${Object.keys(info).join(', ')}`);
          console.log(`   Descrizione: ${JSON.stringify(info).substring(0, 200)}`);
          found++;
        } else {
          console.log(`   ❌ 404`);
        }
      } catch (e) {
        console.log(`   ❌ Errore: ${e.response?.status || e.message}`);
      }
      await delay(3000);
    }

    console.log(`\n   Test completato: ${found}/10 trovati`);

    if (found === 0) {
      console.log('❌ BigBuy API non restituisce descrizioni. Potrebbe servire un endpoint diverso.');
      await prisma.$disconnect();
      return;
    }
  }

  // Aggiorna il database
  if (allDescriptions.size > 0) {
    console.log('\n💾 Aggiornamento database...');
    let updated = 0;

    for (const [id, description] of allDescriptions) {
      try {
        await prisma.product.update({
          where: { id },
          data: { description }
        });
        updated++;
        if (updated % 100 === 0) {
          console.log(`   ${updated}/${allDescriptions.size} aggiornati...`);
        }
      } catch (e) {
        console.log(`   ⚠️ Errore update ${id}: ${e.message}`);
      }
    }

    console.log(`\n✅ Aggiornate ${updated} descrizioni!`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Errore:', e);
  prisma.$disconnect();
  process.exit(1);
});
