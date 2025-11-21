/**
 * Fix: Aggiorna data-subcategory nella sidebar con ID corretti
 */

const fs = require('fs');

// Carica mapping Health
const healthMapping = JSON.parse(fs.readFileSync('config/bigbuy-zenova-health-mapping.json', 'utf-8'));

// Crea mappa nome → bigbuyIds
const categoryIds = {};
for (const [key, data] of Object.entries(healthMapping.mapping)) {
  // Usa il primo ID per categoria
  categoryIds[key] = data.bigbuyIds[0];
}

console.log('🔧 Aggiornamento sidebar Health & Personal Care\n');
console.log('Mapping trovato:');
Object.entries(categoryIds).forEach(([key, id]) => {
  console.log(`  ${key}: ${id}`);
});

// Le categorie che dobbiamo sistemare:
// - accessori-saune: attualmente "2501" → non ha prodotti, rimuovere
// - lampade-abbronzanti: attualmente "2501" → non ha prodotti, rimuovere
// - massaggio-rilassamento: attualmente "2501,2502,2504" → usare "2501,2502,2504" (set-massaggio)
// - benessere: attualmente "2501,2502" → troppo generico, rimuovere o cambiare

console.log('\n⚠️  RACCOMANDAZIONI:\n');
console.log('1. RIMUOVI "Accessori per saune" - solo 1 prodotto');
console.log('2. RIMUOVI "Lampade abbronzanti" - 0 prodotti');
console.log('3. RINOMINA "Benessere" in "Set Massaggio" → data-subcategory="2501,2502,2504"');
console.log('4. RINOMINA "Massaggio e rilassamento" in "Cerotti e Medicazioni" → data-subcategory="2501,2502,2896"');

console.log('\n💡 Oppure SOSTITUISCI con le categorie che hanno prodotti:\n');

// Top categorie con più prodotti
const topCategories = [
  { key: 'phon-asciugacapelli', name: 'Phon e Asciugacapelli', id: '2501,2520,2530', count: 100 },
  { key: 'rasoi-elettrici', name: 'Rasoi Elettrici', id: '2501,2520,2652', count: 100 },
  { key: 'shampoo-capelli', name: 'Shampoo', id: '2501,2520,2523', count: 100 },
  { key: 'balsamo-capelli', name: 'Balsamo', id: '2501,2520,2525', count: 100 },
  { key: 'set-massaggio', name: 'Set Massaggio', id: '2501,2502,2504', count: 50 },
  { key: 'cerotti-medicazioni', name: 'Cerotti', id: '2501,2502,2896', count: 100 }
];

console.log('Top 6 categorie con più prodotti:');
topCategories.forEach(cat => {
  console.log(`  - ${cat.name} (${cat.count} prodotti) → data-subcategory="${cat.id}"`);
});

console.log('\n✅ Procedi manualmente o vuoi che aggiorni automaticamente?\n');
