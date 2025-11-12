const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Carica il catalogo attuale
const catalogPath = path.join(__dirname, 'top-100-products.json');
let currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log(`📦 Catalogo attuale: ${currentCatalog.length} prodotti`);

// Categorie Cura della Pelle con parole chiave
const categories = {
  'cura-pelle-viso': {
    name: 'Viso',
    keywords: ['viso', 'face', 'facial', 'antirughe', 'anti-age', 'siero', 'serum', 'tonico', 'maschera viso', 'peeling viso'],
    products: []
  },
  'cura-pelle-corpo': {
    name: 'Corpo',
    keywords: ['corpo', 'body', 'cellulite', 'rassodante corpo', 'crema corpo', 'lozione corpo', 'olio corpo', 'burro corpo'],
    products: []
  },
  'cura-pelle-occhi': {
    name: 'Occhi',
    keywords: ['occhi', 'eye', 'contorno occhi', 'occhiaie', 'borse occhi'],
    products: []
  },
  'cura-pelle-labbra': {
    name: 'Labbra',
    keywords: ['labbra', 'lip', 'balsamo labbra', 'burro labbra', 'scrub labbra'],
    products: []
  },
  'cura-pelle-mani-piedi': {
    name: 'Mani e piedi',
    keywords: ['mani', 'piedi', 'hand', 'feet', 'foot', 'crema mani', 'crema piedi', 'unghie'],
    products: []
  },
  'cura-pelle-collo': {
    name: 'Collo e décolleté',
    keywords: ['collo', 'décolleté', 'decollete', 'neck', 'crema collo'],
    products: []
  },
  'cura-pelle-solare': {
    name: 'Protezione solare e abbronzatura',
    keywords: ['solare', 'protezione solare', 'spf', 'sun', 'abbronzante', 'doposole', 'after sun', 'autoabbronzante'],
    products: []
  },
  'cura-pelle-set-regalo': {
    name: 'Set regalo',
    keywords: ['set regalo', 'gift set', 'cofanetto', 'kit'],
    products: []
  },
  'cura-pelle-skincare-sole': {
    name: 'Skincare con il sole e l\'abbronzatura',
    keywords: ['skincare sole', 'trattamento abbronzatura', 'vitamina d'],
    products: []
  }
};

const products = [];

// Leggi il CSV
console.log('📖 Leggendo CSV BigBuy...');

fs.createReadStream(path.join(__dirname, 'bigbuy-data', 'product_2501_it.csv'))
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    const name = row.NAME || '';
    const description = (row.DESCRIPTION || '').toLowerCase();
    const nameLower = name.toLowerCase();

    // Solo prodotti con prezzo e stock
    const price = parseFloat(row.PVP_BIGBUY);
    const wholesalePrice = parseFloat(row.PVD);
    const stock = parseInt(row.STOCK) || 0;

    if (!price || price <= 0 || !wholesalePrice || stock < 1) return;

    // Filtra solo prodotti "cura della pelle" (escludi make-up, profumi, capelli, ecc.)
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
                       nameLower.includes('anti') ||
                       nameLower.includes('burro') ||
                       description.includes('skincare') ||
                       description.includes('cura della pelle');

    // Escludi prodotti non skincare
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

    // Categorizza il prodotto
    let assigned = false;

    for (const [catId, catData] of Object.entries(categories)) {
      for (const keyword of catData.keywords) {
        if (nameLower.includes(keyword) || description.includes(keyword)) {
          // Importa TUTTI i prodotti (no limite)
          catData.products.push({
              id: row.ID,
              name: row.NAME,
              description: row.DESCRIPTION,
              brand: row.BRAND || '',
              category: '2501', // Health & Beauty
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
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }
  })
  .on('end', () => {
    console.log('\n✅ CSV letto completamente\n');

    // Mostra statistiche
    let totalNew = 0;
    for (const [catId, catData] of Object.entries(categories)) {
      console.log(`${catData.name}: ${catData.products.length} prodotti`);
      totalNew += catData.products.length;
    }

    console.log(`\n📊 Totale nuovi prodotti: ${totalNew}`);

    // Aggiungi al catalogo
    for (const catData of Object.values(categories)) {
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
