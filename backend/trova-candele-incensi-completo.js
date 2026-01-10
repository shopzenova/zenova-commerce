const fs = require('fs');

console.log('=== RICERCA COMPLETA 42 CANDELE + 32 INCENSI ===\n');

const products = JSON.parse(fs.readFileSync('data/products.backup-fix-aw-categorie-1767718971866.json', 'utf8'));

// 1. Cerca TUTTE le candele AW
const candelaKeywords = ['candel', 'candle'];
const candele = products.filter(p => {
  const name = (p.name || '').toLowerCase();
  return candelaKeywords.some(kw => name.includes(kw));
});

console.log(`🕯️  CANDELE TOTALI: ${candele.length}`);
console.log('\nDettaglio per source:');
const candelePerSource = {};
candele.forEach(p => {
  const src = p.source || 'undefined';
  candelePerSource[src] = (candelePerSource[src] || 0) + 1;
});
Object.entries(candelePerSource).forEach(([src, count]) => {
  console.log(`  ${src}: ${count}`);
});

// 2. Cerca TUTTI gli incensi AW
const incensoKeywords = ['incens', 'coni', 'cone'];
const incensi = products.filter(p => {
  const name = (p.name || '').toLowerCase();
  return incensoKeywords.some(kw => name.includes(kw));
});

console.log(`\n🔥 INCENSI TOTALI: ${incensi.length}`);
console.log('\nDettaglio per source:');
const incensiPerSource = {};
incensi.forEach(p => {
  const src = p.source || 'undefined';
  incensiPerSource[src] = (incensiPerSource[src] || 0) + 1;
});
Object.entries(incensiPerSource).forEach(([src, count]) => {
  console.log(`  ${src}: ${count}`);
});

// 3. Filtra solo source AW o undefined (potrebbero essere i nuovi)
const candeleAW = candele.filter(p => p.source === 'aw' || p.source === undefined);
const incensiAW = incensi.filter(p => p.source === 'aw' || p.source === undefined);

console.log(`\n📊 PRODOTTI AW (o source undefined):`);
console.log(`  Candele: ${candeleAW.length}`);
console.log(`  Incensi: ${incensiAW.length}`);

// 4. Mostra gli IDs
console.log(`\n📝 IDs CANDELE (${candeleAW.length}):`);
candeleAW.forEach(p => {
  console.log(`  ${p.id} | ${p.source || 'undefined'} | ${p.name.substring(0, 50)}`);
});

console.log(`\n📝 IDs INCENSI (${incensiAW.length}):`);
incensiAW.forEach(p => {
  console.log(`  ${p.id} | ${p.source || 'undefined'} | ${p.name.substring(0, 50)}`);
});

// 5. Cerca nel backup precedente per capire quali sono nuovi
const yesterday = JSON.parse(fs.readFileSync('data/products.backup-before-candele-import-1767626785175.json', 'utf8'));
const yesterdayIds = new Set(yesterday.map(p => p.id));

const nuoveCandele = candeleAW.filter(p => !yesterdayIds.has(p.id));
const nuoviIncensi = incensiAW.filter(p => !yesterdayIds.has(p.id));

console.log(`\n\n🆕 PRODOTTI AGGIUNTI DOPO IL 5 GEN:`);
console.log(`  Candele nuove: ${nuoveCandele.length}`);
console.log(`  Incensi nuovi: ${nuoviIncensi.length}`);
console.log(`  TOTALE: ${nuoveCandele.length + nuoviIncensi.length}`);

// Salva per lo script di correzione
const daCorreggere = {
  candele: nuoveCandele.map(p => p.id),
  incensi: nuoviIncensi.map(p => p.id)
};

fs.writeFileSync('candele-incensi-da-correggere.json', JSON.stringify(daCorreggere, null, 2));
console.log(`\n✅ IDs salvati in: candele-incensi-da-correggere.json`);
