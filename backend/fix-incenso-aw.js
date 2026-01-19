/**
 * Script per tradurre e aggiornare prodotti incenso AW
 * - Traduce nomi e descrizioni in italiano
 * - Aggiunge peso 1.6 kg
 */

const fs = require('fs');

// Carica prodotti
const products = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));

// Dizionario traduzioni inglese -> italiano
const translations = {
  // Nomi prodotti
  'Bulk Incense Cones': 'Coni di Incenso Sfusi',
  'Bulk  Incense Cones': 'Coni di Incenso Sfusi',
  'Bulk Incense': 'Incenso Sfuso',
  'Bulk  Incense': 'Incenso Sfuso',
  'Incense Sticks': 'Bastoncini di Incenso',
  'Back Flow Incenso Bruciatore': 'Bruciatore Incenso a Riflusso',
  'Bruciatore Incenso a Cascata': 'Bruciatore Incenso a Cascata',
  'Backflow Incense Burner': 'Bruciatore Incenso a Riflusso',
  'Incense Burner': 'Bruciatore di Incenso',
  'Incense Holder': 'Porta Incenso',
  'Incense Box': 'Scatola Porta Incenso',

  // Fragranze
  'Honeysuckle': 'Caprifoglio',
  'Lavender': 'Lavanda',
  'Sandalwood': 'Sandalo',
  'Rose': 'Rosa',
  'Jasmine': 'Gelsomino',
  'Patchouli': 'Patchouli',
  'Frankincense': 'Olibano',
  'Myrrh': 'Mirra',
  'Cinnamon': 'Cannella',
  'Vanilla': 'Vaniglia',
  'Cedar': 'Cedro',
  'Cedarwood': 'Legno di Cedro',
  'Pine': 'Pino',
  'Eucalyptus': 'Eucalipto',
  'Peppermint': 'Menta Piperita',
  'Mint': 'Menta',
  'Lemon': 'Limone',
  'Orange': 'Arancia',
  'Bergamot': 'Bergamotto',
  'Ylang Ylang': 'Ylang Ylang',
  'Geranium': 'Geranio',
  'Tea Tree': 'Tea Tree',
  'Rosemary': 'Rosmarino',
  'Sage': 'Salvia',
  'White Sage': 'Salvia Bianca',
  'Dragon Blood': 'Sangue di Drago',
  'Dragons Blood': 'Sangue di Drago',
  'Nag Champa': 'Nag Champa',
  'Opium': 'Oppio',
  'Musk': 'Muschio',
  'Tibetan Musk': 'Muschio Tibetano',
  'Amber': 'Ambra',
  'Copal': 'Copale',
  'Benzoin': 'Benzoino',
  'Lotus': 'Loto',
  'Lotus Flower': 'Fiore di Loto',
  'Coconut': 'Cocco',
  'Coffee': 'Caffè',
  'Chocolate': 'Cioccolato',
  'Apple': 'Mela',
  'Cherry': 'Ciliegia',
  'Strawberry': 'Fragola',
  'Peach': 'Pesca',
  'Mango': 'Mango',
  'Papaya': 'Papaya',
  'Passion Fruit': 'Frutto della Passione',
  'Ocean': 'Oceano',
  'Sea Breeze': 'Brezza Marina',
  'Fresh Air': 'Aria Fresca',
  'Rain': 'Pioggia',
  'Forest': 'Foresta',
  'Green Tea': 'Tè Verde',
  'Chamomile': 'Camomilla',
  'Vetiver': 'Vetiver',
  'Clove': 'Chiodi di Garofano',
  'Ginger': 'Zenzero',
  'Cardamom': 'Cardamomo',
  'Basil': 'Basilico',
  'Thyme': 'Timo',
  'Lemongrass': 'Citronella',
  'Camphor': 'Canfora',
  'Juniper': 'Ginepro',
  'Fir': 'Abete',
  'Spruce': 'Abete Rosso',
  'Cypress': 'Cipresso',
  'Night Queen': 'Regina della Notte',
  'Mogra': 'Mogra',
  'Kewda': 'Kewda',
  'Chandan': 'Chandan',
  'Oudh': 'Oudh',
  'Oud': 'Oudh',
  'Agarwood': 'Legno di Agar',

  // Descrizioni comuni
  'Hand & Lotus Flower': 'Mano e Fiore di Loto',
  'Piccolo Pebbles': 'Piccoli Ciottoli',
  'Grande Pebbles into Pool': 'Grandi Ciottoli nella Vasca',
  'Split Bamboo Fountain': 'Fontana di Bambù',
  'Bamboo & Pool': 'Bambù e Vasca',
  'Round to Square': 'Dal Rotondo al Quadrato',
  'Grande Pools to Pools': 'Grandi Vasche',
  'Tea Pot': 'Teiera',
  'Wiki Waterfall': 'Cascata Wiki',
  'Grande Dragon Pool': 'Grande Vasca del Drago',
  'Small': 'Piccolo',
  'Large': 'Grande',
  'Medium': 'Medio',
  'Mini': 'Mini',
  'Set': 'Set',
  'Pack': 'Confezione',
  'Box': 'Scatola',
  'Sticks': 'Bastoncini',
  'Cones': 'Coni',
  'Coils': 'Spirali',
  'Natural': 'Naturale',
  'Pure': 'Puro',
  'Premium': 'Premium',
  'Traditional': 'Tradizionale',
  'Handmade': 'Fatto a Mano',
  'Hand Made': 'Fatto a Mano',
  'Hand Rolled': 'Arrotolato a Mano',
  'Indian': 'Indiano',
  'Tibetan': 'Tibetano',
  'Japanese': 'Giapponese',
  'Chinese': 'Cinese',

  // Frasi descrizioni
  'Burn the': 'Brucia',
  'for finding inner truth': 'per trovare la verità interiore',
  'love and strength': 'amore e forza',
  'has a warm, earthy scent': 'ha un profumo caldo e terroso',
  'sensual and oriental': 'sensuale e orientale',
  'This spicy fragrance': 'Questa fragranza speziata',
  'will help you set the perfect mood': 'ti aiuterà a creare l\'atmosfera perfetta',
  'for romance': 'per il romanticismo',
  'Each pack': 'Ogni confezione',
  'contains': 'contiene',
  'approximately': 'circa',
  'sticks': 'bastoncini',
  'long': 'di lunghezza'
};

// Funzione per tradurre testo
function translateText(text) {
  if (!text) return text;

  let translated = text;

  // Ordina le chiavi per lunghezza decrescente (per tradurre prima le frasi più lunghe)
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);

  for (const eng of sortedKeys) {
    const ita = translations[eng];
    // Case-insensitive replace
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, ita);
  }

  return translated;
}

// Filtra prodotti incenso AW
const incensoAW = products.filter(p => p.source === 'aw' && p.zenovaSubcategory === 'incenso');

console.log(`\n🔄 Traduzione ${incensoAW.length} prodotti incenso AW...\n`);

let updated = 0;

// Aggiorna ogni prodotto
incensoAW.forEach(product => {
  const originalName = product.name;
  const originalDesc = product.description;

  // Traduci nome
  product.name = translateText(product.name);

  // Traduci descrizione
  if (product.description) {
    product.description = translateText(product.description);
  }

  // Aggiungi peso 1.6 kg
  product.weight = 1.6;
  product.weightUnit = 'kg';

  // Log modifiche
  if (originalName !== product.name) {
    console.log(`✅ ${product.id}`);
    console.log(`   Nome: "${originalName}"`);
    console.log(`   →     "${product.name}"`);
    updated++;
  }
});

// Salva file aggiornato
fs.writeFileSync('./top-100-products.json', JSON.stringify(products, null, 2));

console.log(`\n✅ Completato!`);
console.log(`   Prodotti aggiornati: ${updated}`);
console.log(`   Peso aggiunto: 1.6 kg a tutti`);
console.log(`   File salvato: top-100-products.json`);
