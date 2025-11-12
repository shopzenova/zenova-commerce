const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica il catalogo attuale
const catalogPath = path.join(__dirname, 'top-100-products.json');
let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// Rimuovi prodotti cura-pelle esistenti
currentCatalog = currentCatalog.filter(p => !p.zenovaSubcategory || !p.zenovaSubcategory.startsWith('cura-pelle'));

console.log(`📦 Catalogo pulito: ${currentCatalog.length} prodotti (senza cura-pelle)`);

// Mapping Category ID BigBuy -> Zenova Subcategory
// Importa TUTTI i prodotti per category ID, usa keywords solo per distinguere sottocategorie
const categoryMapping = {
  'cura-pelle-occhi': {
    name: 'Occhi',
    categoryIds: ['2554'],
    keywords: ['occhi', 'eye', 'contorno occhi', 'occhiaie', 'borse'],
    priority: 1, // Alta priorità - assegna per primo
    products: []
  },
  'cura-pelle-labbra': {
    name: 'Labbra',
    categoryIds: ['2554'],
    keywords: ['labbra', 'lip', 'balsamo', 'protettore labbra', 'burro labbra', 'scrub labbra'],
    priority: 2,
    products: []
  },
  'cura-pelle-collo': {
    name: 'Collo e décolleté',
    categoryIds: ['2554', '2546'],
    keywords: ['collo', 'décolleté', 'decollete', 'neck'],
    priority: 3,
    products: []
  },
  'cura-pelle-viso': {
    name: 'Viso',
    categoryIds: ['2554'],
    keywords: [], // Tutto il resto di 2554 va in viso
    priority: 99, // Bassa priorità - assegna per ultimo (catch-all)
    products: []
  },
  'cura-pelle-mani-piedi': {
    name: 'Mani e piedi',
    categoryIds: ['2546'],
    keywords: ['mani', 'piedi', 'hand', 'feet', 'foot', 'unghie', 'nail'],
    priority: 1,
    products: []
  },
  'cura-pelle-corpo': {
    name: 'Corpo',
    categoryIds: ['2546'],
    keywords: [], // Tutto il resto di 2546 va in corpo (catch-all)
    priority: 99,
    products: []
  },
  'cura-pelle-solare': {
    name: 'Protezione solare e abbronzatura',
    categoryIds: ['2556', '2568'],
    keywords: [], // Tutti i prodotti 2556/2568 sono protezione solare
    priority: 1,
    products: []
  },
  'cura-pelle-set-regalo': {
    name: 'Set regalo',
    categoryIds: ['2504'],
    keywords: [], // Tutti i prodotti 2504 sono set regalo
    priority: 1,
    products: []
  }
};

let totalProcessed = 0;
let totalMatched = 0;

// Leggi il CSV
console.log('📖 Leggendo CSV BigBuy...\n');

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2501_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    totalProcessed++;

    // Solo prodotti con prezzo e stock (filtri base)
    const price = parseFloat(row.PVP_BIGBUY);
    const wholesalePrice = parseFloat(row.PVD);
    const stock = parseInt(row.STOCK) || 0;

    if (!price || price <= 0 || !wholesalePrice || stock < 1) return;

    const categories = row.CATEGORY ? row.CATEGORY.split(',') : [];
    const name = row.NAME || '';
    const nameLower = name.toLowerCase();
    const description = (row.DESCRIPTION || '').toLowerCase();

    // Ordina le categorie per priorità
    const sortedCategories = Object.entries(categoryMapping).sort((a, b) => a[1].priority - b[1].priority);

    // Prova ad assegnare il prodotto alla prima categoria che corrisponde
    let assigned = false;

    for (const [catId, catData] of sortedCategories) {
      // Verifica se ha uno dei category ID richiesti
      const hasCategoryId = catData.categoryIds.some(id => categories.includes(id));

      if (hasCategoryId) {
        // Se non ci sono keywords (catch-all), assegna automaticamente
        if (catData.keywords.length === 0) {
          catData.products.push({
            id: row.ID,
            name: row.NAME,
            description: row.DESCRIPTION,
            brand: row.BRAND || '',
            category: row.CATEGORY,
            price: price,
            pvd: wholesalePrice,
            stock: stock,
            ean: row.EAN13 || '',
            images: row.IMAGE1 ? [row.IMAGE1, row.IMAGE2, row.IMAGE3].filter(Boolean) : [],
            imageCount: row.IMAGE1 ? (row.IMAGE2 ? (row.IMAGE3 ? 3 : 2) : 1) : 0,
            weight: row.WEIGHT || '0',
            width: row.WIDTH || '0',
            height: row.HEIGHT || '0',
            depth: row.DEPTH || '0',
            video: '0',
            zenovaCategories: ['bellezza'],
            zenovaSubcategory: catId
          });
          totalMatched++;
          assigned = true;
          break;
        } else {
          // Verifica se ha almeno una keyword
          let hasKeyword = false;
          for (const keyword of catData.keywords) {
            if (nameLower.includes(keyword) || description.includes(keyword)) {
              hasKeyword = true;
              break;
            }
          }

          if (hasKeyword) {
            catData.products.push({
              id: row.ID,
              name: row.NAME,
              description: row.DESCRIPTION,
              brand: row.BRAND || '',
              category: row.CATEGORY,
              price: price,
              pvd: wholesalePrice,
              stock: stock,
              ean: row.EAN13 || '',
              images: row.IMAGE1 ? [row.IMAGE1, row.IMAGE2, row.IMAGE3].filter(Boolean) : [],
              imageCount: row.IMAGE1 ? (row.IMAGE2 ? (row.IMAGE3 ? 3 : 2) : 1) : 0,
              weight: row.WEIGHT || '0',
              width: row.WIDTH || '0',
              height: row.HEIGHT || '0',
              depth: row.DEPTH || '0',
              video: '0',
              zenovaCategories: ['bellezza'],
              zenovaSubcategory: catId
            });
            totalMatched++;
            assigned = true;
            break;
          }
        }
      }
    }
  })
  .on('end', () => {
    console.log(`✅ CSV processato: ${totalProcessed} prodotti analizzati\n`);
    console.log(`📊 Prodotti corrispondenti ai criteri: ${totalMatched}\n`);

    // Mostra statistiche per categoria
    let totalNew = 0;
    console.log('Per categoria:');
    for (const [catId, catData] of Object.entries(categoryMapping)) {
      console.log(`  ${catData.name}: ${catData.products.length} prodotti`);
      totalNew += catData.products.length;
    }

    console.log(`\n📊 Totale nuovi prodotti cura-pelle: ${totalNew}`);

    // Aggiungi al catalogo
    for (const catData of Object.values(categoryMapping)) {
      currentCatalog = currentCatalog.concat(catData.products);
    }

    console.log(`📦 Catalogo finale: ${currentCatalog.length} prodotti`);

    // Salva
    fs.writeFileSync(catalogPath, JSON.stringify(currentCatalog, null, 2), 'utf-8');
    console.log('💾 Catalogo salvato!\n');
  })
  .on('error', (error) => {
    console.error('❌ Errore:', error);
  });
