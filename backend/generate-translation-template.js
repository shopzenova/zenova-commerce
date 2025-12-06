/**
 * Genera template per traduzioni mancanti
 */
const fs = require('fs');

const awProducts = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));
const existingTranslations = JSON.parse(fs.readFileSync('./aw-translations.json', 'utf8'));

console.log('🔍 Generazione template traduzioni...\n');

// Filtra prodotti che necessitano traduzione
const needsTranslation = awProducts
  .filter(p => !p.code.startsWith('BeardoB-')) // Escludi oli barba
  .filter(p => !existingTranslations[p.code]) // Solo quelli senza traduzione
  .map(p => ({
    code: p.code,
    englishName: p.name,
    template: {
      name: `[DA TRADURRE] ${p.name}`,
      description: `[DA SCRIVERE] Descrizione completa in italiano per: ${p.name}`
    }
  }));

console.log(`📊 Prodotti da tradurre: ${needsTranslation.length}\n`);

// Raggruppa per prefisso
const byPrefix = {};
needsTranslation.forEach(p => {
  const prefix = p.code.split('-')[0];
  if (!byPrefix[prefix]) byPrefix[prefix] = [];
  byPrefix[prefix].push(p);
});

console.log('📋 DISTRIBUZIONE PER TIPOLOGIA:\n');
Object.keys(byPrefix).sort().forEach(prefix => {
  console.log(`${prefix}: ${byPrefix[prefix].length} prodotti`);
});

// Genera template JSON
const template = {};
needsTranslation.slice(0, 20).forEach(p => {
  template[p.code] = p.template;
});

const templatePath = './aw-translations-template.json';
fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));

console.log(`\n💾 Template salvato in: ${templatePath}`);
console.log(`   (Primi 20 prodotti come esempio)`);

// Salva lista completa per riferimento
const listPath = './aw-products-to-translate.txt';
let listContent = 'PRODOTTI AW DA TRADURRE IN ITALIANO\n';
listContent += '=====================================\n\n';

Object.keys(byPrefix).sort().forEach(prefix => {
  listContent += `\n${prefix} (${byPrefix[prefix].length} prodotti):\n`;
  listContent += '-----------------------------------\n';
  byPrefix[prefix].forEach(p => {
    listContent += `[${p.code}] ${p.englishName}\n`;
  });
});

fs.writeFileSync(listPath, listContent);
console.log(`📝 Lista completa salvata in: ${listPath}\n`);

console.log('✅ Template generato!\n');
console.log('💡 Prossimi passi:');
console.log('   1. Apri aw-products-to-translate.txt per vedere tutti i prodotti');
console.log('   2. Traduci i prodotti aggiungendoli a aw-translations.json');
console.log('   3. Esegui import-aw-products.js per aggiornare il catalogo\n');
