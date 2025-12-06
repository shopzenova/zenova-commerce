/**
 * Analizza i 100 prodotti AW scaricati
 */
const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));

console.log(`📊 ANALISI ${products.length} PRODOTTI AW\n`);

// Raggruppa per pattern nei nomi
const namePatterns = {};
products.forEach(p => {
  // Estrai pattern dal nome (prima parte prima del "-")
  const match = p.name.match(/^(\([^)]+\)\s*)?([^-]+)/);
  const pattern = match ? match[0].trim() : 'Unknown';

  if (!namePatterns[pattern]) {
    namePatterns[pattern] = [];
  }
  namePatterns[pattern].push(p);
});

console.log('📋 TIPI DI PRODOTTI (per pattern nel nome):');
Object.keys(namePatterns).sort((a, b) => namePatterns[b].length - namePatterns[a].length).forEach(pattern => {
  console.log(`\n${pattern}`);
  console.log(`   Quantità: ${namePatterns[pattern].length} prodotti`);
  console.log(`   Codici: ${namePatterns[pattern].slice(0, 5).map(p => p.code).join(', ')}${namePatterns[pattern].length > 5 ? '...' : ''}`);
  console.log(`   Prezzo medio: €${(namePatterns[pattern].reduce((sum, p) => sum + parseFloat(p.price), 0) / namePatterns[pattern].length).toFixed(2)}`);
});

// Raggruppa per codice prefix
console.log('\n\n📋 PREFISSI CODICE PRODOTTO:');
const codePrefixes = {};
products.forEach(p => {
  const prefix = p.code.split('-')[0];
  if (!codePrefixes[prefix]) {
    codePrefixes[prefix] = [];
  }
  codePrefixes[prefix].push(p);
});

Object.keys(codePrefixes).sort().forEach(prefix => {
  console.log(`   ${prefix}-*: ${codePrefixes[prefix].length} prodotti`);
});

// Range prezzi
const prices = products.map(p => parseFloat(p.price)).sort((a, b) => a - b);
console.log('\n\n💰 RANGE PREZZI:');
console.log(`   Min: €${prices[0].toFixed(2)}`);
console.log(`   Max: €${prices[prices.length - 1].toFixed(2)}`);
console.log(`   Media: €${(prices.reduce((a, b) => a + b) / prices.length).toFixed(2)}`);

// Peso medio
const weights = products.map(p => p.gross_weight);
console.log('\n\n📦 PESO:');
console.log(`   Min: ${Math.min(...weights)}g`);
console.log(`   Max: ${Math.max(...weights)}g`);
console.log(`   Medio: ${Math.round(weights.reduce((a, b) => a + b) / weights.length)}g`);

console.log('\n\n🔍 ESEMPI PRODOTTI:');
products.slice(0, 10).forEach((p, i) => {
  console.log(`\n${i + 1}. [${p.code}] ${p.name}`);
  console.log(`   Prezzo: €${p.price} | Peso: ${p.gross_weight}g`);
  console.log(`   Immagine: ${p.image.original}`);
});

console.log('\n✅ Analisi completata!\n');
