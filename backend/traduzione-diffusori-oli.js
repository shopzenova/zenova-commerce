const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-reed-${Date.now()}.json`;

console.log('🌍 TRADUZIONE DIFFUSORI OLI IN ITALIANO (solo nomi card)\n');
console.log('='.repeat(90));

// Dizionario traduzioni per Reed Diffusers
const traduzioni = {
  // Tipi principali
  'Reed Diffuser': 'Diffusore a Bastoncini',
  'Diffuser': 'Diffusore',
  'Refill': 'Ricarica',
  'Reusable Refill Pad': 'Tampone di Ricambio Riutilizzabile',

  // Box/confezione
  'Box of': 'Confezione da',
  'Boxed': 'In Scatola',

  // Profumi/fragranze
  'Fell Berry': 'Frutti di Bosco',
  'Seasalt and Moss': 'Sale Marino e Muschio',
  'Japanese Bloom': 'Fioritura Giapponese',
  'Rhubarb Rhubarb': 'Rabarbaro',
  'Tea & Roses': 'Tè e Rose',
  'Pressed Peonie': 'Peonia Pressata',
  'White Fig': 'Fico Bianco',
  'Provence': 'Provenza',
  'Clementine': 'Clementina',
  'Citrus': 'Agrumi',
  'Windermere': 'Windermere',
  'Moroccan Roll': 'Rotolo Marocchino'
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Applica tutte le traduzioni
  Object.keys(traduzioni).forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioni[termineInglese]);
  });

  return nomeItaliano;
}

// Carica prodotti
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Prodotti totali: ${products.length}\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🔄 TRADUZIONE IN CORSO (solo nomi):\n');

let translatedCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'diffusori-oli') {
    const vecchioNome = product.name;
    const nuovoNome = traduciNome(vecchioNome);

    // Aggiorna SOLO il nome, lascia la descrizione invariata
    product.name = nuovoNome;

    translatedCount++;

    console.log(`✅ ${product.sku}`);
    console.log(`   Vecchio: ${vecchioNome}`);
    console.log(`   Nuovo:   ${nuovoNome}`);
    console.log('');
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Diffusori oli tradotti: ${translatedCount}`);
console.log(`   (Solo nomi - descrizioni mantenute invariate)`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
