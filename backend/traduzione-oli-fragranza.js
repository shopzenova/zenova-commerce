const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-fragrance-${Date.now()}.json`;

console.log('🌍 TRADUZIONE OLI PER FRAGRANZA IN ITALIANO (solo descrizioni)\n');
console.log('='.repeat(90));

// Dizionario traduzioni fragranze
const traduzioniFragranze = {
  'Fragrance Oil': 'Olio per Fragranza',
  'Fragrance': 'Fragranza',

  // Fragranze comuni
  'Mandarin': 'Mandarino',
  'Lavender': 'Lavanda',
  'Lemon': 'Limone',
  'Orange': 'Arancia',
  'Vanilla': 'Vaniglia',
  'Rose': 'Rosa',
  'Jasmine': 'Gelsomino',
  'Sandalwood': 'Legno di Sandalo',
  'Patchouli': 'Patchouli',
  'Ylang Ylang': 'Ylang Ylang',
  'Bergamot': 'Bergamotto',
  'Eucalyptus': 'Eucalipto',
  'Peppermint': 'Menta Piperita',
  'Tea Tree': 'Tea Tree',
  'Cinnamon': 'Cannella',
  'Clove': 'Chiodi di Garofano',
  'Ginger': 'Zenzero',
  'Lemongrass': 'Citronella',
  'Lime': 'Lime',
  'Neroli': 'Neroli',
  'Pine': 'Pino',
  'Rosemary': 'Rosmarino',
  'Cedarwood': 'Legno di Cedro',
  'Frankincense': 'Incenso',
  'Myrrh': 'Mirra',
  'Chamomile': 'Camomilla',
  'Geranium': 'Geranio',
  'Grapefruit': 'Pompelmo',
  'Juniper': 'Ginepro',
  'Patchouly': 'Patchouli',
  'Petitgrain': 'Petitgrain',
  'Sage': 'Salvia',
  'Thyme': 'Timo',
  'Vetiver': 'Vetiver',
  'Cypress': 'Cipresso',
  'Fennel': 'Finocchio',
  'Basil': 'Basilico',
  'Marjoram': 'Maggiorana',
  'Melissa': 'Melissa',
  'Peppermint': 'Menta Piperita',
  'Spearmint': 'Menta Verde',
  'Wintergreen': 'Gaultheria',

  // Fragranze floreali
  'Lily': 'Giglio',
  'Lotus': 'Loto',
  'Magnolia': 'Magnolia',
  'Orchid': 'Orchidea',
  'Peony': 'Peonia',
  'Tulip': 'Tulipano',
  'Violet': 'Violetta',

  // Fragranze fruttate
  'Apple': 'Mela',
  'Apricot': 'Albicocca',
  'Banana': 'Banana',
  'Blackberry': 'Mora',
  'Blueberry': 'Mirtillo',
  'Cherry': 'Ciliegia',
  'Coconut': 'Cocco',
  'Cranberry': 'Mirtillo Rosso',
  'Fig': 'Fico',
  'Grape': 'Uva',
  'Kiwi': 'Kiwi',
  'Mango': 'Mango',
  'Melon': 'Melone',
  'Papaya': 'Papaya',
  'Peach': 'Pesca',
  'Pear': 'Pera',
  'Pineapple': 'Ananas',
  'Plum': 'Prugna',
  'Pomegranate': 'Melograno',
  'Raspberry': 'Lampone',
  'Strawberry': 'Fragola',
  'Watermelon': 'Anguria',

  // Fragranze dolci
  'Caramel': 'Caramello',
  'Chocolate': 'Cioccolato',
  'Coffee': 'Caffè',
  'Honey': 'Miele',
  'Maple': 'Acero',
  'Sugar': 'Zucchero',

  // Fragranze speziate
  'Anise': 'Anice',
  'Cardamom': 'Cardamomo',
  'Cumin': 'Cumino',
  'Nutmeg': 'Noce Moscata',
  'Pepper': 'Pepe',

  // Fragranze fresche
  'Ocean': 'Oceano',
  'Rain': 'Pioggia',
  'Sea': 'Mare',
  'Spring': 'Primavera',
  'Summer': 'Estate',
  'Winter': 'Inverno',
  'Autumn': 'Autunno',
  'Fall': 'Autunno',

  // Altre
  'Amber': 'Ambra',
  'Musk': 'Muschio',
  'Tobacco': 'Tabacco',
  'Leather': 'Cuoio',
  'Moss': 'Muschio',
  'Wood': 'Legno',
  'Spice': 'Spezie',
  'Herb': 'Erba',
  'Fresh': 'Fresco',
  'Clean': 'Pulito',
  'Sweet': 'Dolce',
  'Citrus': 'Agrumi',
  'Floral': 'Floreale',
  'Fruity': 'Fruttato',
  'Green': 'Verde',
  'Oriental': 'Orientale',
  'Woody': 'Legnoso'
};

// Descrizione template in italiano
const descrizioneTemplate = `I nostri Oli per Fragranza sono molto persistenti e duraturi perché sono diluiti con un altro olio a base di dipropilenglicole (DPG). Il DPG è un olio vettore comunemente utilizzato per diluire gli oli profumati e renderli più efficaci. Inoltre, il suo splendido profumo distintivo attirerà sicuramente l'attenzione dei clienti.

Gli oli per fragranza sono perfetti per:
- Diffusori per ambienti
- Creazione di candele profumate
- Produzione di saponi artigianali
- Potpourri e sacchetti profumati
- Prodotti cosmetici fai-da-te

Ogni olio per fragranza è formulato con ingredienti di alta qualità per garantire un profumo intenso e duraturo. Ideale per uso professionale e hobbistico.`;

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Applica tutte le traduzioni delle fragranze
  Object.keys(traduzioniFragranze).forEach(termineInglese => {
    const regex = new RegExp('\\b' + termineInglese + '\\b', 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioniFragranze[termineInglese]);
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
console.log('🔄 TRADUZIONE IN CORSO (solo descrizioni):\n');

let translatedCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'oli-fragranza' ||
      product.subcategory === 'oli-fragranza') {
    // Aggiorna SOLO la descrizione, lascia il nome invariato
    product.description = descrizioneTemplate;

    translatedCount++;

    console.log(`✅ ${product.sku || product.id}`);
    console.log(`   Nome: ${product.name}`);
    console.log(`   Descrizione: AGGIORNATA`);
    console.log('');
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Oli per fragranza tradotti: ${translatedCount}`);
console.log(`   (Solo Descrizioni - Nomi mantenuti invariati)`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
