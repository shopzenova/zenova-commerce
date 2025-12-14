const fs = require('fs');

// Carica catalogo AW e traduzioni esistenti
const awCatalog = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));
const existingTranslations = JSON.parse(fs.readFileSync('./aw-translations.json', 'utf8'));

console.log('📦 Prodotti AW totali:', awCatalog.length);
console.log('✅ Traduzioni esistenti:', Object.keys(existingTranslations).length);

// Dizionario traduzioni comuni
const translations = {
  // Abbigliamento
  'Dress': 'Vestito',
  'Lounge Pants': 'Pantaloni Lounge',
  'Collection': 'Collezione',
  'Design': 'Design',
  'Handpainted': 'Dipinto a Mano',
  'Hand Painted': 'Dipinto a Mano',
  'Evil Eye': 'Occhio Greco Protettivo',
  'Sea Blue': 'Blu Mare',
  'Turquoise': 'Turchese',
  'Gold': 'Oro',
  'White': 'Bianco',
  'Blue': 'Blu',
  'Rich Blue': 'Blu Intenso',
  'Greek Motiff': 'Motivo Greco',
  'Fish Design': 'Design con Pesci',
  'Coral Design': 'Design Corallo',

  // Oli essenziali
  'Essential Oil': 'Olio Essenziale',
  'Fragrance Oil': 'Olio per Fragranza',
  'UNLABELLED': 'SENZA ETICHETTA',

  // Descrizioni comuni
  'Pure': 'Puro',
  'Natural': 'Naturale',
  'Organic': 'Biologico',
  'Box': 'Box',
  'ml': 'ml',
  'Kg': 'Kg',

  // Nomi oli
  'Lavender': 'Lavanda',
  'Bergamot': 'Bergamotto',
  'Lemon': 'Limone',
  'Orange': 'Arancia',
  'Peppermint': 'Menta Piperita',
  'Eucalyptus': 'Eucalipto',
  'Tea Tree': 'Tea Tree',
  'Rose': 'Rosa',
  'Jasmine': 'Gelsomino',
  'Ylang Ylang': 'Ylang Ylang',
  'Sandalwood': 'Sandalo',
  'Patchouli': 'Patchouli',
  'Frankincense': 'Incenso',
  'Myrrh': 'Mirra',
  'Cedarwood': 'Cedro',
  'Pine': 'Pino',
  'Rosemary': 'Rosmarino',
  'Thyme': 'Timo',
  'Clary Sage': 'Salvia Sclarea',
  'Geranium': 'Geranio',
  'Chamomile': 'Camomilla',
  'Neroli': 'Neroli',
  'Petitgrain': 'Petit Grain',
  'Grapefruit': 'Pompelmo',
  'Lemongrass': 'Citronella',
  'Vetiver': 'Vetiver',
  'Black Pepper': 'Pepe Nero',
  'Cinnamon': 'Cannella',
  'Clove': 'Chiodi di Garofano',
  'Ginger': 'Zenzero',
  'Nutmeg': 'Noce Moscata',
  'Cardamom': 'Cardamomo',
  'Juniper': 'Ginepro',
  'Cypress': 'Cipresso',
  'Fir': 'Abete',
  'Spruce': 'Abete Rosso',
  'Bay': 'Alloro',
  'Star Anise': 'Anice Stellato',
  'Fennel': 'Finocchio',
  'Basil': 'Basilico',
  'Marjoram': 'Maggiorana',
  'Oregano': 'Origano',
  'Spearmint': 'Menta Verde',
  'Wintergreen': 'Gaultheria',
  'Camphor': 'Canfora',
  'Cajeput': 'Cajeput',
  'Niaouli': 'Niaouli',
  'Ravensara': 'Ravensara',
  'Ho Wood': 'Legno di Ho',
  'Rosewood': 'Palissandro',
  'Coconut': 'Cocco',
  'Vanilla': 'Vaniglia',
  'Chocolate': 'Cioccolato',
  'Coffee': 'Caffè',
  'Passion Fruit': 'Frutto della Passione',
  'Mango': 'Mango',
  'Peach': 'Pesca',
  'Strawberry': 'Fragola',
  'Cherry': 'Ciliegia',
  'Apple': 'Mela',
  'Pear': 'Pera',
  'Plum': 'Prugna',
  'Apricot': 'Albicocca',
  'Watermelon': 'Anguria',
  'Melon': 'Melone',
  'Cucumber': 'Cetriolo',
  'Mint': 'Menta',
  'Honey': 'Miele',
  'Almond': 'Mandorla',
  'Hazelnut': 'Nocciola',
  'Pistachio': 'Pistacchio',
  'Walnut': 'Noce',
  'Cashew': 'Anacardo',
  'Macadamia': 'Macadamia',
  'Pecan': 'Pecan',
  'Brazil Nut': 'Noce del Brasile',
  'Lotus': 'Loto',
  'Lily': 'Giglio',
  'Magnolia': 'Magnolia',
  'Gardenia': 'Gardenia',
  'Tuberose': 'Tuberosa',
  'Narcissus': 'Narciso',
  'Hyacinth': 'Giacinto',
  'Freesia': 'Fresia',
  'Violet': 'Violetta',
  'Iris': 'Iris',
  'Peony': 'Peonia',
  'Carnation': 'Garofano',
  'Mimosa': 'Mimosa',
  'Wisteria': 'Glicine',
  'Honeysuckle': 'Caprifoglio',
  'Lilac': 'Lillà',
  'Sweet Pea': 'Pisello Odoroso',
  'Heliotrope': 'Eliotropio',
  'Summer of Love': 'Estate d\'Amore',
  'Ocean': 'Oceano',
  'Rain': 'Pioggia',
  'Forest': 'Foresta',
  'Garden': 'Giardino',
  'Meadow': 'Prato',
  'Mountain': 'Montagna',
  'Desert': 'Deserto',
  'Tropical': 'Tropicale',
  'Oriental': 'Orientale',
  'Zen': 'Zen',
  'Meditation': 'Meditazione',
  'Relaxation': 'Relax',
  'Energy': 'Energia',
  'Balance': 'Equilibrio',
  'Harmony': 'Armonia',
  'Peace': 'Pace',
  'Calm': 'Calma',
  'Serenity': 'Serenità',
  'Tranquility': 'Tranquillità',
  'Joy': 'Gioia',
  'Love': 'Amore',
  'Happiness': 'Felicità',
  'Dreams': 'Sogni',
  'Sleep': 'Sonno',
  'Night': 'Notte',
  'Morning': 'Mattino',
  'Sunset': 'Tramonto',
  'Sunrise': 'Alba',
  'Spring': 'Primavera',
  'Summer': 'Estate',
  'Autumn': 'Autunno',
  'Winter': 'Inverno'
};

// Funzione per tradurre testo
function translateText(text) {
  if (!text) return text;

  let translated = text;

  // Applica traduzioni dal dizionario (case-insensitive per matching, ma mantiene il case originale)
  for (const [en, it] of Object.entries(translations)) {
    const regex = new RegExp('\\b' + en + '\\b', 'gi');
    translated = translated.replace(regex, (match) => {
      // Mantieni maiuscole/minuscole del match originale
      if (match === match.toUpperCase()) return it.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return it.charAt(0).toUpperCase() + it.slice(1);
      }
      return it;
    });
  }

  return translated;
}

// Funzione per creare descrizioni dettagliate
function createDescription(product) {
  const name = product.name || '';

  // Identifica tipo di prodotto
  if (name.includes('Essential Oil') || name.includes('EO-')) {
    return createEssentialOilDescription(product);
  } else if (name.includes('Fragrance Oil') || name.includes('ULFO-')) {
    return createFragranceOilDescription(product);
  } else if (name.includes('Chill Pills') || name.includes('AWChill-')) {
    return createChillPillsDescription(product);
  } else if (name.includes('Nomad Sari') || name.includes('NSMed-')) {
    return createNomadSariDescription(product);
  } else if (name.includes('Gemstone') || name.includes('Crystal')) {
    return createGemstoneDescription(product);
  }

  // Descrizione generica
  return `${translateText(product.name)}. Prodotto di qualità per il benessere e il relax. ${product.description ? translateText(product.description) : ''}`.trim();
}

function createEssentialOilDescription(product) {
  const name = translateText(product.name);
  return `Olio essenziale puro 100% naturale. ${name}. Ideale per aromaterapia, diffusione ambientale e benessere quotidiano. Estratto con metodi naturali per preservare tutte le proprietà benefiche della pianta. Perfetto per creare un'atmosfera rilassante e armoniosa.`;
}

function createFragranceOilDescription(product) {
  const name = translateText(product.name);
  return `Olio per fragranza di alta qualità. ${name}. Ideale per creare candele, saponi, diffusori e prodotti per la cura personale. Fragranza concentrata e duratura. Perfetto per uso professionale e hobbistico.`;
}

function createChillPillsDescription(product) {
  const name = translateText(product.name);
  return `${name}. Compresse profumate ideali per diffondere fragranze naturali negli ambienti. Perfette per creare un'atmosfera rilassante e accogliente. Formato professionale da 1.3 kg, ideale sia per uso domestico che commerciale.`;
}

function createNomadSariDescription(product) {
  const name = translateText(product.name);
  return `${name}. Capo d'abbigliamento della collezione Nomad Sari ispirata al Mediterraneo. Realizzato con tessuti naturali, morbidi e traspiranti. Design unico che unisce stile bohémien e comfort. Taglia LXL. Vestiario wellness perfetto per momenti di relax, yoga, meditazione o vacanze.`;
}

function createGemstoneDescription(product) {
  const name = translateText(product.name);
  return `${name}. Pietra naturale per il benessere e l'armonizzazione energetica. Ogni pietra è unica e possiede proprietà benefiche secondo la tradizione della cristalloterapia. Ideale per meditazione, decorazione o come portafortuna personale.`;
}

// Traduci prodotti
const newTranslations = {};
let translatedCount = 0;

for (const product of awCatalog) {
  const productId = product.code || product.id || product.sku;

  // Salta se già tradotto
  if (existingTranslations[productId]) {
    newTranslations[productId] = existingTranslations[productId];
    continue;
  }

  // Traduci nome e descrizione
  const translatedName = translateText(product.name);
  const translatedDescription = createDescription(product);

  newTranslations[productId] = {
    name: translatedName,
    description: translatedDescription
  };

  translatedCount++;

  if (translatedCount <= 5) {
    console.log(`\n✅ Tradotto: ${productId}`);
    console.log(`   EN: ${product.name}`);
    console.log(`   IT: ${translatedName}`);
  }
}

// Salva traduzioni
fs.writeFileSync('./aw-translations.json', JSON.stringify(newTranslations, null, 2));

console.log(`\n✅ Traduzione completata!`);
console.log(`📝 Nuovi prodotti tradotti: ${translatedCount}`);
console.log(`📦 Totale traduzioni: ${Object.keys(newTranslations).length}`);
console.log(`💾 Salvato in: aw-translations.json`);
