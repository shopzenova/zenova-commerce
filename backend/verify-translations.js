const translations = require('./aw-translations.json');

console.log('✅ Traduzioni totali:', Object.keys(translations).length);
console.log('\n=== ESEMPI TRADUZIONI ===\n');

Object.entries(translations).slice(0, 10).forEach(([id, t]) => {
  console.log(`${id}:`);
  console.log(`  Nome: ${t.name}`);
  console.log(`  Desc: ${t.description.substring(0, 100)}...`);
  console.log('');
});
