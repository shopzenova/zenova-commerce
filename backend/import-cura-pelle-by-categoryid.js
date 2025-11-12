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
// Uso i category ID trovati analizzando i prodotti BigBuy
const categoryMapping = {
  'cura-pelle-viso': {
    name: 'Viso',
    categoryIds: ['2554'], // Spesso con 2552
    keywords: ['viso', 'face', 'facial', 'antirughe', 'anti-age', 'siero viso', 'serum', 'tonico', 'maschera viso', 'peeling viso'],
    excludeKeywords: ['occhi', 'eye', 'labbra', 'lip', 'corpo', 'body'],
    products: []
  },
  'cura-pelle-occhi': {
    name: 'Occhi',
    categoryIds: ['2554'], // Stesso di viso, ma con keywords specifiche
    keywords: ['occhi', 'eye', 'contorno occhi', 'occhiaie', 'borse occhi'],
    products: []
  },
  'cura-pelle-labbra': {
    name: 'Labbra',
    categoryIds: ['2554'], // Stesso di viso, ma con keywords specifiche
    keywords: ['labbra', 'lip', 'balsamo labbra', 'burro labbra', 'scrub labbra', 'protettore labbra'],
    products: []
  },
  'cura-pelle-corpo': {
    name: 'Corpo',
    categoryIds: ['2546', '2556'], // Due categorie corpo diverse
    keywords: ['corpo', 'body', 'cellulite', 'rassodante corpo', 'crema corpo', 'lozione corpo', 'olio corpo', 'burro corpo'],
    excludeKeywords: ['mani', 'piedi', 'hand', 'feet', 'foot'],
    products: []
  },
  'cura-pelle-mani-piedi': {
    name: 'Mani e piedi',
    categoryIds: ['2546'], // Stessa categoria del corpo
    keywords: ['mani', 'piedi', 'hand', 'feet', 'foot', 'crema mani', 'crema piedi', 'unghie'],
    products: []
  },
  'cura-pelle-collo': {
    name: 'Collo e décolleté',
    categoryIds: ['2554', '2546'], // Potrebbe essere in viso o corpo
    keywords: ['collo', 'décolleté', 'decollete', 'neck', 'crema collo'],
    products: []
  },
  'cura-pelle-solare': {
    name: 'Protezione solare e abbronzatura',
    categoryIds: ['2556', '2568'], // 2568 = after sun
    keywords: ['solare', 'protezione solare', 'spf', 'sun', 'abbronzante', 'doposole', 'after sun', 'autoabbronzante'],
    products: []
  },
  'cura-pelle-set-regalo': {
    name: 'Set regalo',
    categoryIds: ['2504'], // Categoria gift set
    keywords: ['set regalo', 'gift set', 'cofanetto', 'kit'],
    products: []
  },
  'cura-pelle-skincare-sole': {
    name: 'Skincare con il sole e l\'abbronzatura',
    categoryIds: ['2556', '2568'],
    keywords: ['skincare sole', 'trattamento abbronzatura', 'vitamina d', 'prepara pelle sole'],
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

    // Solo prodotti con prezzo e stock
    const price = parseFloat(row.PVP_BIGBUY);
    const wholesalePrice = parseFloat(row.PVD);
    const stock = parseInt(row.STOCK) || 0;

    if (!price || price <= 0 || !wholesalePrice || stock < 1) return;

    const categories = row.CATEGORY ? row.CATEGORY.split(',') : [];
    const name = row.NAME || '';
    const description = (row.DESCRIPTION || '').toLowerCase();
    const nameLower = name.toLowerCase();

    // Verifica se è un prodotto skincare (esclude make-up, profumi, capelli)
    const isSkincare = nameLower.includes('crema') ||
                       nameLower.includes('siero') ||
                       nameLower.includes('lozione') ||
                       nameLower.includes('gel') ||
                       nameLower.includes('olio') ||
                       nameLower.includes('balsamo') ||
                       nameLower.includes('maschera') ||
                       nameLower.includes('esfoliante') ||
                       nameLower.includes('peeling') ||
                       nameLower.includes('tonico') ||
                       nameLower.includes('latte') ||
                       nameLower.includes('mousse') ||
                       nameLower.includes('protezione') ||
                       nameLower.includes('protettore') ||
                       nameLower.includes('anti') ||
                       nameLower.includes('burro') ||
                       nameLower.includes('spf') ||
                       nameLower.includes('solare') ||
                       description.includes('skincare') ||
                       description.includes('cura della pelle');

    const isExcluded = nameLower.includes('profumo') ||
                       nameLower.includes('shampoo') ||
                       nameLower.includes('balsamo capelli') ||
                       nameLower.includes('capelli') ||
                       nameLower.includes('mascara') ||
                       nameLower.includes('rossetto') ||
                       nameLower.includes('trucco') ||
                       nameLower.includes('make-up') ||
                       nameLower.includes('smalto') ||
                       nameLower.includes('rasoio') ||
                       nameLower.includes('epilatore');

    if (!isSkincare || isExcluded) return;

    // Prova a categorizzare usando category ID + keywords
    let assigned = false;

    for (const [catId, catData] of Object.entries(categoryMapping)) {
      // Verifica se ha uno dei category ID richiesti
      const hasCategoryId = catData.categoryIds.some(id => categories.includes(id));

      if (hasCategoryId) {
        // Verifica keywords
        let hasKeyword = false;
        for (const keyword of catData.keywords) {
          if (nameLower.includes(keyword) || description.includes(keyword)) {
            hasKeyword = true;
            break;
          }
        }

        // Verifica exclude keywords (se esistono)
        let hasExcludeKeyword = false;
        if (catData.excludeKeywords) {
          for (const excludeKeyword of catData.excludeKeywords) {
            if (nameLower.includes(excludeKeyword)) {
              hasExcludeKeyword = true;
              break;
            }
          }
        }

        // Assegna se ha il category ID e la keyword (e non ha exclude keywords)
        if (hasKeyword && !hasExcludeKeyword) {
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
