const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-diffusori-${Date.now()}.json`;

console.log('🌍 TRADUZIONE DIFFUSORI AROMATICI IN ITALIANO (solo nomi card)\n');
console.log('='.repeat(90));

// Dizionario traduzioni per diffusori aromatici
const traduzioni = {
  // Tipi di diffusori
  'Atomiser': 'Diffusore',
  'Aroma Diffuser': 'Diffusore Aromatico',
  'Humidifer': 'Umidificatore',
  'Nebulizer': 'Nebulizzatore',

  // Dimensioni
  'Large': 'Grande',
  'Medium': 'Medio',
  'Mini': 'Mini',
  'Small': 'Piccolo',
  'Single': 'Singolo',
  'Double': 'Doppio',

  // Effetti
  'Volcano Effect': 'Effetto Vulcano',
  'Flame Effect': 'Effetto Fiamma',
  'Shell Effect': 'Effetto Conchiglia',
  'Classic Pod': 'Capsula Classica',
  'Colour Change': 'Cambio Colore',
  'Color Change': 'Cambio Colore',

  // Caratteristiche
  'USB': 'USB',
  'USB-C': 'USB-C',
  'Timer': 'Timer',
  'Remote control': 'Telecomando',
  'Waterless': 'Senza Acqua',
  'No Water Required': 'Non Richiede Acqua',
  'Oil': 'Olio',
  'Essential Oil': 'Oli Essenziali',
  'Plug': 'con Spina',
  'Chargable': 'Ricaricabile',
  'Rechargeable': 'Ricaricabile',

  // Caratteristiche speciali
  'Himalayan Salt Chamber': 'Camera di Sale Himalayano',
  'Salt included': 'Sale Incluso',
  'Led Clock': 'Orologio LED',
  'Night Light': 'Luce Notturna',
  'Dry Aromatherapy': 'Aromaterapia a Secco',
  'Movement Detector': 'Rilevatore di Movimento',
  'Switchable': 'Commutabile',
  'Birdsound': 'Canto degli Uccelli',
  'Salt Stone': 'Pietra di Sale',

  // Colori
  'Two Colours': 'Due Colori',
  'White': 'Bianco',
  'Black': 'Nero',
  'Green': 'Verde',
  'Bronze': 'Bronzo',
  'Yellow': 'Giallo',
  'Pink': 'Rosa',
  'Clear': 'Trasparente',

  // Nomi città (manteniamo originali)
  'Milan': 'Milano',
  'Santorini': 'Santorini',
  'Aarhus': 'Aarhus',
  'Palma': 'Palma',
  'Palermo': 'Palermo',
  'Marseille': 'Marsiglia',
  'Helsinki': 'Helsinki',
  'Barcelona': 'Barcellona',
  'Copenhagen': 'Copenaghen',
  'Paris': 'Parigi',
  'Himalayas': 'Himalaya',
  'Urban': 'Urbano',
  'Modern': 'Moderno',
  'Mondo Planet': 'Mondo Pianeta',

  // Altri
  'Face Fan & Spray': 'Ventilatore Viso e Spray',
  'Nano Mist': 'Nebbia Nano',
  'down light': 'luce verso il basso'
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Applica tutte le traduzioni
  Object.keys(traduzioni).forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, (match) => {
      // Mantieni il case originale per acronimi come USB
      if (termineInglese === termineInglese.toUpperCase() && termineInglese.length <= 5) {
        return traduzioni[termineInglese];
      }
      return traduzioni[termineInglese];
    });
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
  if (product.zenovaSubcategory === 'diffusori-aromatici') {
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
console.log(`   Diffusori aromatici tradotti: ${translatedCount}`);
console.log(`   (Solo nomi - descrizioni mantenute invariate)`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
