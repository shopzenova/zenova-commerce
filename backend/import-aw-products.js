/**
 * Importa prodotti AW in Natural Wellness
 */
const fs = require('fs');

// Carica cataloghi
const awProducts = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));
const zenovaProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));

// Carica traduzioni italiane
let awTranslations = {};
try {
  awTranslations = JSON.parse(fs.readFileSync('./aw-translations.json', 'utf8'));
  console.log(`📚 Caricate ${Object.keys(awTranslations).length} traduzioni italiane\n`);
} catch (error) {
  console.log('⚠️  Nessun file di traduzioni trovato, uso nomi inglesi\n');
}

console.log('📦 Importazione prodotti AW in Zenova...\n');

// Mappa codici a categorie
function getCategoryMapping(code) {
  if (code.startsWith('EO-')) {
    return {
      category: 'natural-wellness',
      subcategory: 'oli-essenziali',
      categoryName: 'Natural Wellness',
      subcategoryName: 'Oli Essenziali'
    };
  }
  if (code.startsWith('ULFO-')) {
    return {
      category: 'natural-wellness',
      subcategory: 'oli-fragranza',
      categoryName: 'Natural Wellness',
      subcategoryName: 'Oli per Fragranza'
    };
  }
  if (code.startsWith('AWChill-')) {
    return {
      category: 'natural-wellness',
      subcategory: 'relax-benessere',
      categoryName: 'Natural Wellness',
      subcategoryName: 'Relax & Benessere'
    };
  }
  if (code.startsWith('NSMed-')) {
    return {
      category: 'natural-wellness',
      subcategory: 'vestiario-wellness',
      categoryName: 'Natural Wellness',
      subcategoryName: 'Vestiario Wellness'
    };
  }
  return null;
}

// Funzione per ottenere URL immagine ad alta risoluzione
function getHighResImage(imageObj) {
  // Usa WebP per migliore qualità/peso, o original come fallback
  let url = imageObj.webp || imageObj.original;
  // Cambia resize a 400x400 per buon compromesso qualità/dimensione
  url = url.replace(/rs::\d+:\d+::/g, 'rs::400:400::');
  return url;
}

// Filtra e converti prodotti
const toImport = awProducts
  .filter(p => !p.code.startsWith('BeardoB-')) // Escludi oli barba
  .map(awProduct => {
    const mapping = getCategoryMapping(awProduct.code);
    if (!mapping) {
      console.log(`⚠️  Skipping ${awProduct.code} - no mapping found`);
      return null;
    }

    // Usa traduzione italiana se disponibile, altrimenti nome inglese
    const translation = awTranslations[awProduct.code];
    const productName = translation?.name || awProduct.name;
    const productDescription = translation?.description || `${awProduct.name} - Prodotto naturale premium da AW Dropship.`;

    return {
      id: `AW-${awProduct.id}`,
      name: productName,
      description: productDescription,
      price: parseFloat(awProduct.price),
      pvd: parseFloat(awProduct.price) * 0.7, // Prezzo di acquisto (70% del prezzo di vendita)
      currency: awProduct.currency_code || 'EUR',
      images: [
        {
          url: getHighResImage(awProduct.image),
          thumbnail: awProduct.image.webp_2x || awProduct.image.webp // 128x128 per griglia
        }
      ],
      category: mapping.category,
      subcategory: mapping.subcategory,
      zenovaCategories: [mapping.category],
      zenovaCategory: mapping.category,
      zenovaSubcategory: mapping.subcategory,
      inStock: true,
      stock: 999, // AW dropship sempre disponibile
      visible: true,
      featured: false,
      tags: ['natural', 'wellness', 'aw-dropship'],
      weight: awProduct.gross_weight,
      dimensions: {
        length: 5,
        width: 5,
        height: 10
      },
      shippingInfo: {
        freeShippingOver: 50,
        processingTime: '2-3 giorni lavorativi',
        provider: 'AW Dropship'
      },
      supplier: 'aw-dropship',
      supplierProductId: awProduct.id.toString(),
      supplierCode: awProduct.code
    };
  })
  .filter(p => p !== null);

console.log(`✅ Prodotti da importare: ${toImport.length}`);

// Conta traduzioni
const translatedCount = toImport.filter(p => awTranslations[p.supplierCode]).length;
const notTranslatedCount = toImport.length - translatedCount;
console.log(`   ✅ ${translatedCount} prodotti con traduzione italiana`);
console.log(`   ⚠️  ${notTranslatedCount} prodotti senza traduzione (usando nome inglese)`);

// Raggruppa per categoria
const byCategory = {};
toImport.forEach(p => {
  const key = p.subcategory;
  if (!byCategory[key]) byCategory[key] = [];
  byCategory[key].push(p);
});

console.log('\n📊 DISTRIBUZIONE PER CATEGORIA:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`   ${cat}: ${byCategory[cat].length} prodotti`);
});

// Rimuovi i vecchi prodotti AW e aggiungi quelli nuovi
console.log('\n🔄 Rimozione vecchi prodotti AW...');
const withoutAW = zenovaProducts.filter(p => p.supplier !== 'aw-dropship');
console.log(`   Rimossi: ${zenovaProducts.length - withoutAW.length} prodotti AW`);
console.log(`   Rimasti: ${withoutAW.length} prodotti BigBuy`);

// Unisci cataloghi
const mergedCatalog = [...withoutAW, ...toImport];

console.log(`\n📈 CATALOGO AGGIORNATO:`);
console.log(`   Prodotti BigBuy: ${withoutAW.length}`);
console.log(`   Prodotti AW: ${toImport.length}`);
console.log(`   TOTALE: ${mergedCatalog.length}`);

// Salva backup
const backupPath = `./top-100-products.backup-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(zenovaProducts, null, 2));
console.log(`\n💾 Backup salvato: ${backupPath}`);

// Salva catalogo aggiornato
fs.writeFileSync('./top-100-products.json', JSON.stringify(mergedCatalog, null, 2));
console.log(`💾 Catalogo aggiornato salvato: ./top-100-products.json`);

// Mostra esempi
console.log('\n🔍 ESEMPI PRODOTTI IMPORTATI:\n');
Object.keys(byCategory).forEach(cat => {
  console.log(`${cat.toUpperCase()}:`);
  byCategory[cat].slice(0, 3).forEach(p => {
    const hasTranslation = awTranslations[p.supplierCode] ? '🇮🇹' : '🇬🇧';
    console.log(`   [${p.supplierCode}] ${hasTranslation} ${p.name.substring(0, 60)}...`);
    console.log(`      Prezzo: €${p.price} | Peso: ${p.weight}g | ID: ${p.id}`);
  });
  console.log('');
});

console.log('✅ IMPORTAZIONE COMPLETATA!\n');
