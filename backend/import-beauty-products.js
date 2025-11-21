/**
 * Import Beauty Products from BigBuy CSV
 * Categorizza automaticamente prodotti usando keywords
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica catalogo attuale
const catalogPath = path.join(__dirname, 'top-100-products.json');
let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log(`📦 Catalogo attuale: ${currentCatalog.length} prodotti`);

// MAPPING: Keywords → Categoria Zenova
const categoryMapping = {
  // PROFUMI E FRAGRANZE
  'profumi-donne': {
    name: 'Profumi Donna',
    categoryIds: ['2507,2508,2510', '2507,2510', '2510'],
    keywords: ['profumo donna', 'profumo femminile', 'eau de parfum donna', 'eau de toilette donna', 'edt donna', 'edp donna'],
    maxProducts: 20,
    products: []
  },
  'profumi-uomini': {
    name: 'Profumi Uomo',
    categoryIds: ['2507,2508,2509', '2507,2509', '2509'],
    keywords: ['profumo uomo', 'profumo maschile', 'eau de parfum uomo', 'eau de toilette uomo', 'edt uomo', 'edp uomo'],
    maxProducts: 15,
    products: []
  },
  'profumi-unisex': {
    name: 'Profumi Unisex',
    categoryIds: ['2507,2508', '2508'],
    keywords: ['unisex', 'per lei e per lui'],
    maxProducts: 10,
    products: []
  },

  // CURA DEI CAPELLI
  'shampoo': {
    name: 'Shampoo',
    categoryIds: ['2507'],
    keywords: ['shampoo', 'shampo'],
    maxProducts: 15,
    products: []
  },
  'balsamo-capelli': {
    name: 'Balsamo',
    categoryIds: ['2507'],
    keywords: ['balsamo', 'conditioner', 'maschera capelli'],
    maxProducts: 10,
    products: []
  },
  'colorazione-capelli': {
    name: 'Colorazione Capelli',
    categoryIds: ['2507'],
    keywords: ['tintura', 'colorazione', 'tinta capelli', 'colore capelli'],
    maxProducts: 10,
    products: []
  },
  'phon-piastre': {
    name: 'Phon e Piastre',
    categoryIds: ['2507'],
    keywords: ['phon', 'asciugacapelli', 'piastra', 'arricciacapelli', 'styling'],
    maxProducts: 10,
    products: []
  },

  // CURA DELLA PELLE
  'creme-viso': {
    name: 'Creme Viso',
    categoryIds: ['2507'],
    keywords: ['crema viso', 'crema facial', 'crema giorno', 'crema notte', 'siero viso', 'serum'],
    maxProducts: 15,
    products: []
  },
  'crema-corpo': {
    name: 'Creme Corpo',
    categoryIds: ['2507'],
    keywords: ['crema corpo', 'lozione corpo', 'body cream', 'idratante corpo'],
    maxProducts: 10,
    products: []
  },
  'protezione-solare': {
    name: 'Protezione Solare',
    categoryIds: ['2507'],
    keywords: ['protezione solare', 'crema solare', 'spf', 'abbronzante'],
    maxProducts: 10,
    products: []
  },

  // TRUCCO
  'rossetto-labbra': {
    name: 'Rossetto',
    categoryIds: ['2507'],
    keywords: ['rossetto', 'lipstick', 'gloss', 'balsamo labbra'],
    maxProducts: 15,
    products: []
  },
  'mascara-occhi': {
    name: 'Mascara',
    categoryIds: ['2507'],
    keywords: ['mascara', 'eye liner', 'eyeliner', 'matita occhi', 'ombretto'],
    maxProducts: 10,
    products: []
  },
  'fondotinta': {
    name: 'Fondotinta',
    categoryIds: ['2507'],
    keywords: ['fondotinta', 'foundation', 'base trucco', 'bb cream', 'cc cream'],
    maxProducts: 10,
    products: []
  },

  // MANICURE E PEDICURE
  'smalto-unghie': {
    name: 'Smalto Unghie',
    categoryIds: ['2507'],
    keywords: ['smalto', 'nail polish', 'unghie', 'gel unghie'],
    maxProducts: 15,
    products: []
  },

  // BAGNO E IGIENE
  'bagnoschiuma': {
    name: 'Bagnoschiuma',
    categoryIds: ['2507'],
    keywords: ['bagnoschiuma', 'docciaschiuma', 'gel doccia', 'sapone liquido'],
    maxProducts: 10,
    products: []
  },
  'deodorante': {
    name: 'Deodorante',
    categoryIds: ['2507'],
    keywords: ['deodorante', 'deo', 'anti-traspirante'],
    maxProducts: 10,
    products: []
  },

  // RASATURA E DEPILAZIONE
  'rasoio-elettrico': {
    name: 'Rasoio Elettrico',
    categoryIds: ['2507'],
    keywords: ['rasoio elettrico', 'tagliacapelli', 'regolabarba', 'trimmer'],
    maxProducts: 10,
    products: []
  },
  'crema-rasatura': {
    name: 'Crema da Barba',
    categoryIds: ['2507'],
    keywords: ['crema rasatura', 'schiuma barba', 'after shave', 'dopobarba'],
    maxProducts: 8,
    products: []
  }
};

let totalProcessed = 0;
let totalImported = 0;
const MAX_TOTAL_PRODUCTS = 150; // Limite totale prodotti da importare

// Leggi CSV
console.log('\n📖 Leggendo CSV BigBuy Beauty (2507)...\n');

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2507_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    totalProcessed++;

    // Stop se abbiamo raggiunto il limite
    if (totalImported >= MAX_TOTAL_PRODUCTS) return;

    // Filtri base: prezzo, stock
    const price = parseFloat(row.PVP_BIGBUY);
    const wholesalePrice = parseFloat(row.PVD);
    const stock = parseInt(row.STOCK) || 0;

    if (!price || price <= 0 || !wholesalePrice || stock < 1) return;

    const name = row.NAME || '';
    const nameLower = name.toLowerCase();
    const description = (row.DESCRIPTION || '').toLowerCase();
    const category = row.CATEGORY || '';

    // Prova a categorizzare il prodotto
    for (const [zenovaKey, mapping] of Object.entries(categoryMapping)) {
      // Se abbiamo già raggiunto il massimo per questa categoria, skip
      if (mapping.products.length >= mapping.maxProducts) continue;

      // Check keywords nel nome o descrizione
      const hasKeyword = mapping.keywords.some(kw =>
        nameLower.includes(kw.toLowerCase()) ||
        description.includes(kw.toLowerCase())
      );

      if (hasKeyword) {
        // Crea prodotto con categoria Zenova
        const product = {
          id: row.ID,
          name: name,
          description: row.DESCRIPTION || name,
          brand: row.BRAND || '',
          category: category, // Categoria BigBuy originale
          subcategory: category, // Mantieni BigBuy per compatibilità
          zenovaCategory: 'beauty',
          zenovaSubcategory: zenovaKey,
          price: price,
          retailPrice: price * 1.5, // Margine 50%
          wholesalePrice: wholesalePrice,
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

        mapping.products.push(product);
        totalImported++;

        // Log ogni 10 prodotti
        if (totalImported % 10 === 0) {
          console.log(`✓ Importati ${totalImported} prodotti...`);
        }

        break; // Prodotto categorizzato, passa al prossimo
      }
    }
  })
  .on('end', () => {
    console.log(`\n✅ CSV processato: ${totalProcessed} righe`);
    console.log(`✅ Prodotti importati: ${totalImported}\n`);

    // Mostra riepilogo per categoria
    console.log('📊 Riepilogo per categoria:');
    for (const [key, mapping] of Object.entries(categoryMapping)) {
      if (mapping.products.length > 0) {
        console.log(`   ${mapping.name}: ${mapping.products.length} prodotti`);
      }
    }

    // Aggiungi prodotti al catalogo (rimuovendo duplicati)
    const existingIds = new Set(currentCatalog.map(p => p.id));
    let added = 0;

    for (const mapping of Object.values(categoryMapping)) {
      for (const product of mapping.products) {
        if (!existingIds.has(product.id)) {
          currentCatalog.push(product);
          added++;
        }
      }
    }

    console.log(`\n📦 Prodotti aggiunti al catalogo: ${added}`);
    console.log(`📦 Totale prodotti nel catalogo: ${currentCatalog.length}`);

    // Salva catalogo aggiornato
    fs.writeFileSync(catalogPath, JSON.stringify(currentCatalog, null, 2));
    console.log(`\n💾 Catalogo salvato: ${catalogPath}`);
    console.log('\n✅ Import completato!');
  });
