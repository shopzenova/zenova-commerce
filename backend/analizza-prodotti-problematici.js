const fs = require('fs');

console.log('=== ANALISI PRODOTTI PROBLEMATICI ===\n');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

// Filtra prodotti AW
const aw = products.filter(p => p.source === 'aw');

console.log(`Prodotti AW totali: ${aw.length}\n`);

// Trova candele
const candele = aw.filter(p =>
  p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
);

console.log(`🕯️  CANDELE (${candele.length}):`);
candele.forEach(p => {
  console.log(`  ${p.id} | ${p.name.substring(0, 50)}`);
  console.log(`    Cat: ${p.zenovaCategory} | SubCat: ${p.zenovaSubcategory}`);
  console.log(`    Visible: ${p.visible} | Zone: ${p.zone}`);
});

// Trova incensi a coni
const incensi = aw.filter(p =>
  p.name && (p.name.toLowerCase().includes('coni') || p.name.toLowerCase().includes('cone'))
);

console.log(`\n🔥 INCENSI A CONI (${incensi.length}):`);
incensi.forEach(p => {
  console.log(`  ${p.id} | ${p.name.substring(0, 50)}`);
  console.log(`    Cat: ${p.zenovaCategory} | SubCat: ${p.zenovaSubcategory}`);
  console.log(`    Visible: ${p.visible} | Zone: ${p.zone}`);
});

// Trova prodotti con visible/zone undefined
const missingFields = aw.filter(p => p.visible === undefined || p.zone === undefined);

console.log(`\n⚠️  PRODOTTI CON CAMPI MANCANTI (${missingFields.length}):`);
console.log(`   (Campione di 10):`);
missingFields.slice(0, 10).forEach(p => {
  console.log(`  ${p.id} | ${p.name.substring(0, 40)}`);
  console.log(`    Visible: ${p.visible} | Zone: ${p.zone}`);
});

// Analizza sottocategorie esistenti
const subcats = {};
aw.forEach(p => {
  const sub = p.zenovaSubcategory || 'undefined';
  subcats[sub] = (subcats[sub] || 0) + 1;
});

console.log(`\n📊 SOTTOCATEGORIE AW ESISTENTI:`);
Object.entries(subcats).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Salva lista IDs da correggere
const toFix = [...candele, ...incensi];
fs.writeFileSync(
  'prodotti-da-correggere.json',
  JSON.stringify(toFix.map(p => ({ id: p.id, name: p.name, currentSubcat: p.zenovaSubcategory })), null, 2)
);

console.log(`\n✅ Lista prodotti da correggere salvata in: prodotti-da-correggere.json`);
console.log(`\nTotale da correggere: ${toFix.length} prodotti`);
