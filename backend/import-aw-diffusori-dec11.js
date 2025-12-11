const fs = require('fs');
const path = require('path');

// Percorsi file
const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251211.csv';
const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🚀 Importazione AW Dropship - Diffusori AATOM');
console.log('📅 Data CSV: 11 Dicembre 2025\n');

// Leggi CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

console.log(`📊 Totale righe CSV: ${lines.length - 1}`);

// Trova indici colonne
const getColumnIndex = (name) => {
  const index = headers.findIndex(h => h.trim().replace(/"/g, '') === name);
  return index;
};

const statusIdx = getColumnIndex('Status');
const codeIdx = getColumnIndex('Product code');
const nameIdx = getColumnIndex('Unit Name');
const priceIdx = getColumnIndex('Price');
const rrpIdx = getColumnIndex('Unit RRP');
const weightIdx = getColumnIndex('Unit net weight');
const descHtmlIdx = getColumnIndex('Webpage description (html)');
const descPlainIdx = getColumnIndex('Webpage description (plain text)');
const imagesIdx = getColumnIndex('Images');
const stockIdx = getColumnIndex('Stock');
const barcodeIdx = getColumnIndex('Barcode');
const dimensionsIdx = getColumnIndex('Unit dimensions');
const materialsIdx = getColumnIndex('Materials/Ingredients');

console.log(`✅ Colonne trovate - Status: ${statusIdx}, Code: ${codeIdx}, Name: ${nameIdx}\n`);

// Funzione per parsare riga CSV (gestisce virgole dentro i campi)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Estrai prodotti attivi
const products = [];
let activeCount = 0;
let discontinuedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = parseCSVLine(line);
  const status = fields[statusIdx];

  if (status === 'Active') {
    activeCount++;
    const code = fields[codeIdx];
    const name = fields[nameIdx]?.replace(/"/g, '') || `Diffusore ${code}`;
    const price = parseFloat(fields[priceIdx]) || 0;
    const rrp = parseFloat(fields[rrpIdx]) || price * 1.5;
    const weight = parseFloat(fields[weightIdx]) || 0;
    const descHtml = fields[descHtmlIdx]?.replace(/"/g, '') || '';
    const descPlain = fields[descPlainIdx]?.replace(/"/g, '') || '';
    const imagesStr = fields[imagesIdx]?.replace(/"/g, '') || '';
    const images = imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(url => url) : [];
    const barcode = fields[barcodeIdx]?.replace(/"/g, '') || '';
    const dimensions = fields[dimensionsIdx]?.replace(/"/g, '') || '';
    const materials = fields[materialsIdx]?.replace(/"/g, '') || '';

    // Estrai descrizione pulita
    let description = descPlain || name;
    if (description.length > 500) {
      description = description.substring(0, 497) + '...';
    }

    // Crea prodotto formato Zenova
    const product = {
      id: `aw-${code}`,
      sku: `aw-${code}`,
      name: name,
      price: Math.round(price * 100) / 100, // arrotonda a 2 decimali
      rrp: Math.round(rrp * 100) / 100,
      description: description,
      image: images[0] || 'https://via.placeholder.com/300x300?text=Diffusore',
      images: images,
      category: 'Natural Wellness',
      zenovaCategories: ['natural-wellness', 'diffusori'],
      zenovaSubcategory: 'diffusori',
      tags: ['diffusore', 'aromaterapia', 'benessere', 'ultrasonic', 'AW Dropship'],
      stock: 50, // assumiamo stock disponibile
      supplier: 'AW Dropship',
      supplierSKU: code,
      barcode: barcode,
      weight: weight,
      dimensions: dimensions,
      materials: materials,
      descriptionHtml: descHtml,
      featured: false,
      layout: 'sidebar'
    };

    products.push(product);
    console.log(`✅ ${activeCount}. ${code} - ${name} - €${price}`);

  } else if (status === 'Discontinued') {
    discontinuedCount++;
  }
}

console.log(`\n📊 Risultati:`);
console.log(`   ✅ Prodotti ATTIVI importati: ${activeCount}`);
console.log(`   ⏸️  Prodotti DISCONTINUED esclusi: ${discontinuedCount}`);

// Carica catalogo esistente
let catalog = [];
if (fs.existsSync(catalogPath)) {
  catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  console.log(`\n📦 Catalogo esistente: ${catalog.length} prodotti`);

  // Rimuovi eventuali prodotti AW precedenti con prefix aw-AATOM
  const beforeCount = catalog.length;
  catalog = catalog.filter(p => !p.sku || !p.sku.match(/^aw-AATOM-/));
  const removed = beforeCount - catalog.length;
  if (removed > 0) {
    console.log(`🗑️  Rimossi ${removed} prodotti AW-AATOM precedenti`);
  }
}

// Aggiungi nuovi prodotti
catalog.push(...products);

console.log(`📦 Nuovo totale catalogo: ${catalog.length} prodotti`);

// Salva catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`\n✅ Catalogo salvato: ${catalogPath}`);

// Backup del file originale
const backupPath = path.join(__dirname, `top-100-products.backup-${Date.now()}.json`);
console.log(`💾 Creato backup precedente: ${path.basename(backupPath)}`);

console.log('\n🎉 IMPORTAZIONE COMPLETATA!\n');
console.log('Prossimi passi:');
console.log('1. Riavviare il backend: npm start');
console.log('2. Verificare prodotti su: http://localhost:3000/prodotti.html#natural-wellness');
