const fs = require('fs');
const path = require('path');

console.log('🔄 Integrazione prodotti AW con traduzioni italiane...\n');

// Carica file
const awCatalog = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));
const awTranslations = JSON.parse(fs.readFileSync('./aw-translations.json', 'utf8'));
const topProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));

console.log('📦 Prodotti AW nel catalogo:', awCatalog.length);
console.log('✅ Traduzioni disponibili:', Object.keys(awTranslations).length);
console.log('📋 Prodotti attuali in top-100:', topProducts.length);

// Backup del file originale
const backupPath = `./top-100-products.backup-aw-integration-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(topProducts, null, 2));
console.log('💾 Backup creato:', backupPath);

// Mappa categorie AW -> Zenova
const categoryMap = {
  'essential-oil': { category: 'natural-wellness', subcategory: 'oli-essenziali' },
  'fragrance-oil': { category: 'natural-wellness', subcategory: 'oli-fragranza' },
  'chill-pills': { category: 'natural-wellness', subcategory: 'relax-benessere' },
  'gemstone': { category: 'natural-wellness', subcategory: 'pietre-preziose' },
  'clothing': { category: 'natural-wellness', subcategory: 'vestiario-wellness' },
  'default': { category: 'natural-wellness', subcategory: 'relax-benessere' }
};

// Funzione per determinare categoria prodotto AW
function getAWCategory(product) {
  const code = product.code || '';
  const name = product.name || '';

  if (code.startsWith('EO-') || name.includes('Essential Oil')) {
    return categoryMap['essential-oil'];
  }
  if (code.startsWith('ULFO-') || code.startsWith('FO-') || name.includes('Fragrance Oil')) {
    return categoryMap['fragrance-oil'];
  }
  if (code.startsWith('AWChill-') || name.includes('Chill Pills')) {
    return categoryMap['chill-pills'];
  }
  if (code.startsWith('GS-') || name.includes('Gemstone') || name.includes('Crystal')) {
    return categoryMap['gemstone'];
  }
  if (code.startsWith('NSMed-') || name.includes('Nomad Sari') || name.includes('Dress') || name.includes('Lounge Pants')) {
    return categoryMap['clothing'];
  }
  return categoryMap['default'];
}

// Converti prodotti AW in formato Zenova
const awProductsConverted = [];
let convertedCount = 0;

for (const awProduct of awCatalog) {
  const productCode = awProduct.code || awProduct.id;
  const translation = awTranslations[productCode];

  if (!translation) {
    console.warn(`⚠️  Prodotto ${productCode} senza traduzione, skip`);
    continue;
  }

  const categoryInfo = getAWCategory(awProduct);
  const price = parseFloat(awProduct.price);

  // Calcola prezzi (margine 50%)
  const retailPrice = price * 1.5;
  const wholesalePrice = price;

  // Estrai immagini con dimensioni maggiori (usa 2x per alta qualità)
  const imageUrl = awProduct.image?.webp_2x || awProduct.image?.original_2x || awProduct.image?.webp || awProduct.image?.original || '';

  const convertedProduct = {
    id: productCode,
    name: translation.name,
    description: translation.description,
    brand: 'AW Dropship',
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    zenovaCategory: categoryInfo.category,
    zenovaSubcategory: categoryInfo.subcategory,
    price: price,
    retailPrice: retailPrice,
    wholesalePrice: wholesalePrice,
    stock: 10, // Stock generico AW
    images: imageUrl ? [imageUrl] : [],
    image: imageUrl,
    weight: awProduct.gross_weight ? awProduct.gross_weight / 1000 : 0.1, // Converti grammi in kg
    active: true,
    lastSync: new Date().toISOString(),
    zenovaCategories: [categoryInfo.category],
    visible: true,
    zone: 'products',
    source: 'aw',
    awId: awProduct.id,
    awCode: productCode
  };

  awProductsConverted.push(convertedProduct);
  convertedCount++;
}

console.log(`\n✅ Convertiti ${convertedCount} prodotti AW`);

// Rimuovi eventuali prodotti AW esistenti dal catalogo
const productsWithoutAW = topProducts.filter(p => p.source !== 'aw');
console.log(`🗑️  Rimossi ${topProducts.length - productsWithoutAW.length} prodotti AW esistenti`);

// Aggiungi nuovi prodotti AW
const updatedProducts = [...productsWithoutAW, ...awProductsConverted];

console.log(`\n📊 RIEPILOGO:`);
console.log(`   Prodotti BigBuy: ${productsWithoutAW.length}`);
console.log(`   Prodotti AW: ${awProductsConverted.length}`);
console.log(`   Totale finale: ${updatedProducts.length}`);

// Salva file aggiornato
fs.writeFileSync('./top-100-products.json', JSON.stringify(updatedProducts, null, 2));
console.log(`\n💾 File top-100-products.json aggiornato!`);

// Mostra statistiche per categoria AW
const awByCategory = {};
awProductsConverted.forEach(p => {
  const cat = p.zenovaSubcategory;
  awByCategory[cat] = (awByCategory[cat] || 0) + 1;
});

console.log(`\n📈 PRODOTTI AW PER CATEGORIA:`);
Object.entries(awByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}`);
});

console.log(`\n✅ Integrazione completata! Riavvia il backend per vedere i prodotti AW sul sito.`);
