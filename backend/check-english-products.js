const products = require('./top-100-products.json');

// Cerca prodotti con testo in inglese
const needsTranslation = [];
const alreadyTranslated = [];

products.forEach(p => {
  const hasEnglish =
    (p.name && (
      p.name.includes(' Essential Oil') ||
      p.name.includes(' Diffuser') ||
      p.name.includes(' Bag') ||
      p.name.includes(' Light') ||
      p.name.includes(' Burner') ||
      p.name.includes(' Incense') ||
      p.name.includes('Gemstone') ||
      p.name.includes('Jewellery') ||
      p.name.includes('Reed Diffuser')
    )) ||
    (p.description && (
      p.description.includes('Perfect for') ||
      p.description.includes('Ideal for') ||
      p.description.includes('Great for')
    ));

  if (hasEnglish) {
    needsTranslation.push({
      id: p.id,
      name: p.name.substring(0, 100),
      source: p.source || 'unknown'
    });
  } else {
    alreadyTranslated.push(p.id);
  }
});

console.log(`✅ Prodotti già tradotti: ${alreadyTranslated.length}`);
console.log(`⚠️  Prodotti che necessitano traduzione: ${needsTranslation.length}\n`);

if (needsTranslation.length > 0) {
  console.log('=== PRODOTTI DA TRADURRE ===\n');
  needsTranslation.forEach((p, i) => {
    console.log(`${i + 1}. [${p.source}] ${p.id}: ${p.name}`);
  });
}
