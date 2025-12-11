const fs = require('fs');
const path = require('path');

// Percorsi file
const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251211.csv';
const catalogPath = path.join(__dirname, 'top-100-products.json');

console.log('🔧 FIX: Aggiornamento prodotti AATOM esistenti');
console.log('📅 Usando CSV del 11 Dicembre 2025\n');

// Leggi CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

// Trova indici colonne
const getColumnIndex = (name) => {
  return headers.findIndex(h => h.trim().replace(/"/g, '') === name);
};

const statusIdx = getColumnIndex('Status');
const codeIdx = getColumnIndex('Product code');
const nameIdx = getColumnIndex('Unit Name');
const priceIdx = getColumnIndex('Price');
const rrpIdx = getColumnIndex('Unit RRP');
const stockIdx = getColumnIndex('Stock');
const imagesIdx = getColumnIndex('Images');
const descPlainIdx = getColumnIndex('Webpage description (plain text)');
const descHtmlIdx = getColumnIndex('Webpage description (html)');

// Funzione per parsare riga CSV
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

// Crea mappa dei prodotti dal CSV
const csvProducts = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = parseCSVLine(line);
  const status = fields[statusIdx];
  const code = fields[codeIdx];

  if (!code) continue;

  const name = fields[nameIdx]?.replace(/"/g, '') || `Diffusore ${code}`;
  const price = parseFloat(fields[priceIdx]) || 0;
  const rrp = parseFloat(fields[rrpIdx]) || price * 1.5;
  const stockStatus = fields[stockIdx];
  const imagesStr = fields[imagesIdx]?.replace(/"/g, '') || '';
  const images = imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(url => url) : [];
  const descPlain = fields[descPlainIdx]?.replace(/"/g, '') || '';
  const descHtml = fields[descHtmlIdx]?.replace(/"/g, '') || '';

  let description = descPlain || name;
  if (description.length > 500) {
    description = description.substring(0, 497) + '...';
  }

  csvProducts.set(code, {
    code,
    name,
    price: Math.round(price * 100) / 100,
    rrp: Math.round(rrp * 100) / 100,
    stock: status === 'Active' ? 50 : 0,
    status,
    images,
    description,
    descriptionHtml: descHtml
  });
}

console.log(`📊 Prodotti nel CSV: ${csvProducts.size}`);
console.log(`   - Attivi: ${Array.from(csvProducts.values()).filter(p => p.status === 'Active').length}`);
console.log(`   - Discontinued: ${Array.from(csvProducts.values()).filter(p => p.status === 'Discontinued').length}\n`);

// Carica catalogo
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
const beforeCount = catalog.length;

console.log(`📦 Catalogo iniziale: ${catalog.length} prodotti\n`);

// Fase 1: Rimuovi duplicati con prefisso "aw-AATOM-"
const duplicates = catalog.filter(p => p.id && p.id.match(/^aw-AATOM-/));
console.log(`🗑️  Rimozione duplicati "aw-AATOM-*": ${duplicates.length} prodotti`);
catalog = catalog.filter(p => !p.id || !p.id.match(/^aw-AATOM-/));

// Fase 2: Aggiorna prodotti AATOM esistenti con dati CSV
const aatomProducts = catalog.filter(p => p.id && p.id.match(/^AATOM-/));
console.log(`\n🔄 Aggiornamento ${aatomProducts.length} prodotti AATOM esistenti:\n`);

let updated = 0;
let activated = 0;
let deactivated = 0;

catalog = catalog.map(product => {
  if (!product.id || !product.id.match(/^AATOM-/)) {
    return product; // Non AATOM, lascia invariato
  }

  const csvData = csvProducts.get(product.id);

  if (!csvData) {
    // Prodotto non nel CSV, imposta stock = 0
    if (product.stock > 0) {
      console.log(`   ⏸️  ${product.id} - NON nel CSV - Stock: ${product.stock} → 0`);
      deactivated++;
    }
    return {
      ...product,
      stock: 0
    };
  }

  // Prodotto nel CSV, aggiorna con nuovi dati
  const wasActive = product.stock > 0;
  const isActive = csvData.stock > 0;

  let statusIcon = '  ';
  if (!wasActive && isActive) {
    statusIcon = '✅';
    activated++;
  } else if (wasActive && !isActive) {
    statusIcon = '⏸️ ';
    deactivated++;
  } else if (isActive) {
    statusIcon = '🔄';
  }

  console.log(`   ${statusIcon} ${product.id} - ${csvData.name.substring(0, 50)} - €${csvData.price} - Stock: ${product.stock} → ${csvData.stock}`);

  updated++;

  return {
    ...product,
    name: csvData.name,
    price: csvData.price,
    rrp: csvData.rrp,
    stock: csvData.stock,
    description: csvData.description,
    descriptionHtml: csvData.descriptionHtml,
    image: csvData.images[0] || product.image,
    images: csvData.images.length > 0 ? csvData.images : product.images
  };
});

console.log(`\n📊 Risultati:`);
console.log(`   🗑️  Duplicati rimossi: ${duplicates.length}`);
console.log(`   🔄 Prodotti aggiornati: ${updated}`);
console.log(`   ✅ Attivati (stock 0 → 50): ${activated}`);
console.log(`   ⏸️  Disattivati (stock > 0 → 0): ${deactivated}`);
console.log(`   📦 Totale catalogo: ${beforeCount} → ${catalog.length} prodotti`);

// Salva catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`\n✅ Catalogo salvato: ${catalogPath}`);

console.log('\n🎉 FIX COMPLETATO!\n');
console.log('Prossimo passo: Riavvia il backend');
