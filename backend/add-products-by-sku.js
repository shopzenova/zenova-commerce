const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const skuList = [
  'V0103570', // Wake-up light
  'V0103781',
  'S1906898'
  // 'V0103815',
  // 'S1906442',
  // 'V0103345',
  // 'S3055024',
  // 'S3057894'
];

async function addProductsBySku() {
  const apiKey = process.env.BIGBUY_API_KEY;
  const baseURL = 'https://api.bigbuy.eu';

  console.log('🔍 Scarico dettagli prodotti da BigBuy...\n');

  const foundProducts = [];
  const errors = [];

  // Carica il catalogo esistente
  const catalogPath = path.join(__dirname, 'top-100-products.json');
  let existingProducts = [];

  try {
    const catalogData = fs.readFileSync(catalogPath, 'utf-8');
    existingProducts = JSON.parse(catalogData);
    console.log(`📦 Catalogo attuale: ${existingProducts.length} prodotti\n`);
  } catch (error) {
    console.log('⚠️  Nessun catalogo esistente trovato\n');
  }

  // Per ogni SKU, cerca il prodotto
  for (const sku of skuList) {
    console.log(`🔎 Cercando prodotto con SKU: ${sku}...`);

    try {
      // Cerca il prodotto per SKU usando la ricerca
      const response = await axios.get(`${baseURL}/rest/catalog/products.json`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          isoCode: 'it',
          sku: sku
        },
        timeout: 30000
      });

      if (response.data && response.data.length > 0) {
        const product = response.data[0];
        console.log(`✅ Trovato: ${product.name}`);
        console.log(`   Prezzo: €${product.retailPrice || product.price}`);
        console.log(`   Categoria: ${product.category}`);

        // Formatta il prodotto nel nostro formato con categoria LED
        const formattedProduct = {
          id: product.id || sku,
          name: product.name,
          description: product.description || '',
          brand: product.brand || '',
          category: '2399,2400,2421', // Categoria Lampade e Luci LED
          price: parseFloat(product.retailPrice || product.price || 0),
          pvd: parseFloat(product.wholesalePrice || product.price || 0),
          stock: product.stock || 0,
          images: product.images || [],
          imageCount: (product.images || []).length,
          video: product.video || '0',
          ean: product.ean || '',
          width: product.width || '',
          height: product.height || '',
          depth: product.depth || '',
          weight: product.weight || '',
          raw: {
            ...product,
            CATEGORY: '2399,2400,2421' // Assicura che anche raw abbia la categoria corretta
          }
        };

        foundProducts.push(formattedProduct);
        console.log('');
      } else {
        console.log(`❌ Non trovato\n`);
        errors.push(sku);
      }

      // Pausa per evitare rate limiting - aumentata a 10 secondi
      await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
      console.log(`❌ Errore: ${error.message}\n`);
      errors.push(sku);
    }
  }

  console.log('\n=================================');
  console.log(`✅ Trovati: ${foundProducts.length} prodotti`);
  console.log(`❌ Non trovati: ${errors.length} prodotti`);
  console.log('=================================\n');

  if (foundProducts.length > 0) {
    // Aggiungi i nuovi prodotti al catalogo esistente
    const updatedCatalog = [...existingProducts, ...foundProducts];

    // Salva il catalogo aggiornato
    fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));
    console.log(`💾 Catalogo aggiornato: ${updatedCatalog.length} prodotti totali`);
    console.log(`📁 Salvato in: ${catalogPath}\n`);

    // Mostra riepilogo
    console.log('📋 PRODOTTI AGGIUNTI:');
    foundProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   SKU: ${p.id}`);
      console.log(`   Prezzo: €${p.price}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n⚠️  SKU non trovati:');
    errors.forEach(sku => console.log(`  - ${sku}`));
  }
}

addProductsBySku();
