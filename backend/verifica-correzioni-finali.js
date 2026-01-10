const fs = require('fs');

console.log('=== VERIFICA CORREZIONI FINALI ===\n');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

// Conta prodotti per source
const sources = {};
products.forEach(p => {
  const src = p.source || 'undefined';
  sources[src] = (sources[src] || 0) + 1;
});

console.log('📊 PRODOTTI PER SOURCE:');
Object.entries(sources).sort((a,b) => b[1] - a[1]).forEach(([src, count]) => {
  console.log(`  ${src}: ${count}`);
});

// Verifica candele e incensi corretti
const candeleAW = products.filter(p =>
  p.source === 'aw' &&
  p.id && p.id.startsWith('aw-') &&
  p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
);

const incensiAW = products.filter(p =>
  p.source === 'aw' &&
  p.id && p.id.startsWith('aw-') &&
  p.name && (
    p.name.toLowerCase().includes('incens') ||
    p.name.toLowerCase().includes('coni') ||
    p.name.toLowerCase().includes('cone') ||
    p.name.toLowerCase().includes('backflow')
  )
);

console.log(`\n🕯️  CANDELE CORRETTE (aw-*):`);
console.log(`   Totale: ${candeleAW.length}`);
console.log(`   Con visible=true: ${candeleAW.filter(p => p.visible === true).length}`);
console.log(`   Con zone='sidebar': ${candeleAW.filter(p => p.zone === 'sidebar').length}`);
console.log(`   Con zenovaSubcategory: ${candeleAW.filter(p => p.zenovaSubcategory).length}`);

console.log(`\n🔥 INCENSI CORRETTI (aw-*):`);
console.log(`   Totale: ${incensiAW.length}`);
console.log(`   Con visible=true: ${incensiAW.filter(p => p.visible === true).length}`);
console.log(`   Con zone='sidebar': ${incensiAW.filter(p => p.zone === 'sidebar').length}`);
console.log(`   Con zenovaSubcategory: ${incensiAW.filter(p => p.zenovaSubcategory).length}`);

// Mostra esempi
console.log(`\n📦 ESEMPIO CANDELA:`);
if (candeleAW.length > 0) {
  const esempio = candeleAW[0];
  console.log(JSON.stringify({
    id: esempio.id,
    name: esempio.name.substring(0, 50),
    source: esempio.source,
    zenovaCategory: esempio.zenovaCategory,
    zenovaSubcategory: esempio.zenovaSubcategory,
    visible: esempio.visible,
    zone: esempio.zone
  }, null, 2));
}

console.log(`\n📦 ESEMPIO INCENSO:`);
if (incensiAW.length > 0) {
  const esempio = incensiAW[0];
  console.log(JSON.stringify({
    id: esempio.id,
    name: esempio.name.substring(0, 50),
    source: esempio.source,
    zenovaCategory: esempio.zenovaCategory,
    zenovaSubcategory: esempio.zenovaSubcategory,
    visible: esempio.visible,
    zone: esempio.zone
  }, null, 2));
}

// Conta totale prodotti
console.log(`\n📊 TOTALE GENERALE:`);
console.log(`   Prodotti nel database: ${products.length}`);
console.log(`   Prodotti AW: ${products.filter(p => p.source === 'aw').length}`);

console.log(`\n✅ VERIFICA COMPLETATA!\n`);
