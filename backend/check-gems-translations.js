const products = require('./top-100-products.json');

const gems = products.filter(p => p.categoryId === 3);
console.log('📊 Totale prodotti Pietre Preziose:', gems.length);

const missing = gems.filter(p => {
  const hasTitle = p.title && p.title.it && p.title.en && p.title.es && p.title.fr && p.title.de;
  const hasDesc = p.description && p.description.it && p.description.en && p.description.es && p.description.fr && p.description.de;
  return !hasTitle || !hasDesc;
});

console.log('⚠️ Prodotti con traduzioni mancanti:', missing.length);
console.log('\nPrimi 5 prodotti da tradurre:\n');

missing.slice(0, 5).forEach((p, idx) => {
  console.log(`\n${idx + 1}. ID: ${p.id} - Ref: ${p.referenceCode}`);
  console.log('   Title IT:', p.title?.it || '❌ MANCANTE');
  console.log('   Title EN:', p.title?.en || '❌ MANCANTE');
  console.log('   Desc IT:', (p.description?.it || '❌ MANCANTE').substring(0, 100));
  console.log('   Desc EN:', (p.description?.en || '❌ MANCANTE').substring(0, 100));
});

// Salva lista completa
const fs = require('fs');
fs.writeFileSync(
  'gems-missing-translations.json',
  JSON.stringify(missing.map(p => ({
    id: p.id,
    referenceCode: p.referenceCode,
    source: p.source,
    title: p.title,
    description: p.description
  })), null, 2)
);

console.log('\n✅ Lista completa salvata in: gems-missing-translations.json');
