const products = require('./top-100-products.json');

const awProducts = products.filter(p => p.source === 'aw');
const bigbuyProducts = products.filter(p => p.source === 'bigbuy');

// Cerca prodotti con nomi in inglese (chiavi comuni)
const englishKeywords = ['oil', 'essential', 'massage', 'set', 'body', 'face', 'hair', 'cream', 'lotion', 'diffuser', 'candle', 'wellness', 'relaxation', 'aromatherapy'];

const awUntranslated = awProducts.filter(p => {
  if (!p.name) return true;
  const nameLower = p.name.toLowerCase();
  return englishKeywords.some(keyword => nameLower.includes(keyword) && !nameLower.includes('olio') && !nameLower.includes('massaggio'));
});

const bigbuyUntranslated = bigbuyProducts.filter(p => {
  if (!p.name) return true;
  const nameLower = p.name.toLowerCase();
  return englishKeywords.some(keyword => nameLower.includes(keyword) && !nameLower.includes('olio') && !nameLower.includes('massaggio'));
});

console.log('=== STATO TRADUZIONI ===\n');
console.log('Prodotti AW totali:', awProducts.length);
console.log('Prodotti AW potenzialmente NON tradotti:', awUntranslated.length);
console.log('\nProdotti BigBuy totali:', bigbuyProducts.length);
console.log('Prodotti BigBuy potenzialmente NON tradotti:', bigbuyUntranslated.length);

if (awUntranslated.length > 0) {
  console.log('\n=== ESEMPI AW NON TRADOTTI ===');
  awUntranslated.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. [${p.id}] ${p.name}`);
  });
}

if (bigbuyUntranslated.length > 0) {
  console.log('\n=== ESEMPI BIGBUY NON TRADOTTI ===');
  bigbuyUntranslated.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. [${p.id}] ${p.name}`);
  });
}

console.log('\n=== TOTALE ===');
console.log('Prodotti totali:', products.length);
console.log('Prodotti da tradurre:', awUntranslated.length + bigbuyUntranslated.length);
