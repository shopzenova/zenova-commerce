const fs = require('fs');
const path = require('path');
const { categorizeProduct } = require('./config/category-mapping');

// Leggi CSV BigBuy
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(';');

  const products = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(';');
    if (values.length < headers.length) continue;

    const product = {};
    headers.forEach((header, index) => {
      product[header.trim()] = values[index] ? values[index].trim().replace(/^"(.*)"$/, '$1') : '';
    });

    products.push(product);
  }

  return products;
}

// Filtra prodotti per categoria Zenova
function findProductsByCategory(products, zenovaCategory) {
  const matched = [];

  for (const product of products) {
    // Converti in formato per categorizeProduct
    const p = {
      id: product.ID || product['﻿ID'],
      name: product.NAME,
      description: product.DESCRIPTION,
      price: parseFloat(product.PVD || 0),
      stock: parseInt(product.STOCK || 0),
      brand: product.BRAND,
      ean: product.EAN13,
      images: [product.IMAGE1, product.IMAGE2].filter(img => img && img.startsWith('http'))
    };

    // Filtra per prezzo adatto a Zenova (€15-150)
    if (p.stock < 1 || p.price < 15 || p.price > 150) continue;

    // Escludi prodotti non adatti
    const nameLower = p.name.toLowerCase();
    const excludeKeywords = [
      'smartphone', 'tablet', 'laptop', 'pc ', 'computer', 'notebook',
      'monitor', 'tv ', 'televisore', 'schermo',
      '24"', '27"', '32"', '34"', '43"', '50"', '55"', '65"', '75"',
      'enterprise', 'server', 'router', 'switch', 'networking',
      'frigorifero', 'lavatrice', 'lavastoviglie', 'forno',
      'distruggi', 'stampante', 'scanner', 'fotocopiatrice',
      'videocamera', 'webcam professionale', 'gaming headset'
    ];

    if (excludeKeywords.some(kw => nameLower.includes(kw))) continue;

    // Categorizza
    const categories = categorizeProduct(p);

    if (categories.includes(zenovaCategory)) {
      matched.push({
        sku: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        images: p.images.length,
        category: zenovaCategory
      });
    }
  }

  return matched;
}

console.log('🔍 RICERCA PRODOTTI SMART LIVING E TECH INNOVATION\n');
console.log('='.repeat(70));

// Analizza categoria Electronics (2609)
console.log('\n📦 Analizzando categoria COMPUTERS | ELECTRONICS...');
const electronicsPath = path.join(__dirname, 'bigbuy-data', 'product_2609_it.csv');
const electronics = parseCSV(electronicsPath);
console.log(`   Totale prodotti: ${electronics.length}`);

// Cerca Tech Innovation
console.log('\n⚡ Cercando prodotti TECH INNOVATION...');
const techProducts = findProductsByCategory(electronics, 'tech-innovation');
console.log(`   Trovati: ${techProducts.length} prodotti`);

// Analizza categoria Home | Garden (2399)
console.log('\n📦 Analizzando categoria HOME | GARDEN...');
const homePath = path.join(__dirname, 'bigbuy-data', 'product_2399_it.csv');
const home = parseCSV(homePath);
console.log(`   Totale prodotti: ${home.length}`);

// Cerca Smart Living
console.log('\n🏠 Cercando prodotti SMART LIVING...');
const smartProducts = findProductsByCategory(home, 'smart-living');
console.log(`   Trovati: ${smartProducts.length} prodotti`);

// Combina e cerca anche in electronics per smart living
const smartProductsFromElectronics = findProductsByCategory(electronics, 'smart-living');
console.log(`   Trovati in Electronics: ${smartProductsFromElectronics.length} prodotti`);

const allSmartProducts = [...smartProducts, ...smartProductsFromElectronics];

// Ordina per prezzo (i migliori primi)
techProducts.sort((a, b) => b.price - a.price);
allSmartProducts.sort((a, b) => b.price - a.price);

// Seleziona TOP prodotti (massimo 30 per categoria)
const topTech = techProducts.slice(0, 30);
const topSmart = allSmartProducts.slice(0, 30);

console.log('\n' + '='.repeat(70));
console.log('\n📊 RISULTATI FINALI:');
console.log(`\n⚡ TECH INNOVATION: ${topTech.length} prodotti selezionati`);
console.log(`🏠 SMART LIVING: ${topSmart.length} prodotti selezionati`);

// Salva liste
const output = {
  'tech-innovation': topTech,
  'smart-living': topSmart,
  summary: {
    techCount: topTech.length,
    smartCount: topSmart.length,
    totalSelected: topTech.length + topSmart.length
  }
};

const outputPath = path.join(__dirname, 'smart-tech-products-list.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\n💾 Lista salvata in: ${outputPath}`);

// Mostra alcuni esempi
console.log('\n' + '='.repeat(70));
console.log('\n🎯 ESEMPI PRODOTTI TECH INNOVATION (top 5):');
topTech.slice(0, 5).forEach((p, i) => {
  console.log(`\n${i + 1}. ${p.name.substring(0, 60)}...`);
  console.log(`   SKU: ${p.sku} | Prezzo: €${p.price} | Stock: ${p.stock}`);
  console.log(`   Brand: ${p.brand}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n🎯 ESEMPI PRODOTTI SMART LIVING (top 5):');
topSmart.slice(0, 5).forEach((p, i) => {
  console.log(`\n${i + 1}. ${p.name.substring(0, 60)}...`);
  console.log(`   SKU: ${p.sku} | Prezzo: €${p.price} | Stock: ${p.stock}`);
  console.log(`   Brand: ${p.brand}`);
});

console.log('\n' + '='.repeat(70));
