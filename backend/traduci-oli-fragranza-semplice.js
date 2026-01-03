const fs = require('fs');

console.log('🌍 TRADUZIONE OLI PER FRAGRANZA IN ITALIANO\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-oli-fragranza-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Traduzioni fragranze
const fragranze = {
  "Alloy": "Lega Metallica",
  "Amber": "Ambra",
  "Apple & Elderflower": "Mela e Sambuco",
  "Apple Pie & Custard": "Torta di Mele e Crema",
  "Banana": "Banana",
  "Black Pepper": "Pepe Nero",
  "Blackberry": "Mora",
  "Blueberry": "Mirtillo",
  "Bouquet": "Bouquet Floreale",
  "Christmas Pudding": "Pudding di Natale",
  "Cranberry": "Mirtillo Rosso",
  "Dark Chocolate": "Cioccolato Fondente",
  "Eiffel": "Eiffel",
  "Geranium": "Geranio",
  "Ginger & Lime": "Zenzero e Lime",
  "Ginger Stem & Walnut": "Zenzero e Noce",
  "Gooseberry & White Tea": "Ribes e Tè Bianco",
  "Grapefruit & Mandarin": "Pompelmo e Mandarino",
  "Guava": "Guava",
  "Heavenly Musk": "Muschio Celestiale",
  "Kiwi": "Kiwi",
  "Lavender": "Lavanda",
  "Lemon & Eucalyptus": "Limone ed Eucalipto",
  "Lemongrass": "Citronella",
  "Lime": "Lime",
  "Mango": "Mango",
  "Melon": "Melone",
  "Neroli": "Neroli",
  "On Jasmine Wings": "Sulle Ali del Gelsomino",
  "Orange & Cinnamon": "Arancia e Cannella",
  "Papaya": "Papaya",
  "Passionfruit": "Frutto della Passione",
  "Patchouli": "Patchouli",
  "Peach": "Pesca",
  "Peppermint & Frankincense": "Menta Piperita e Incenso",
  "Petitgrain & Rosewood": "Petitgrain e Palissandro",
  "Pineapple": "Ananas",
  "Pomegranate": "Melograno",
  "Pomegranate & Nutmeg": "Melograno e Noce Moscata",
  "Raspberry": "Lampone",
  "Rose": "Rosa",
  "Sage & Rosemary": "Salvia e Rosmarino",
  "Sandalwood": "Sandalo",
  "Strawberry": "Fragola",
  "Tangerine": "Mandarino",
  "Vanilla": "Vaniglia",
  "Vanilla Plantation": "Piantagione di Vaniglia",
  "Violet": "Violetta",
  "Watermelon": "Anguria",
  "White Strawberry & Blackberry": "Fragola Bianca e Mora",
  "Ylang Ylang & Mandarin": "Ylang Ylang e Mandarino"
};

// Traduci prodotti
let translatedCount = 0;
const oliFrag = products.filter(p => p.subcategory === 'oli-per-fragranza');

console.log(`🎯 Oli per fragranza da tradurre: ${oliFrag.length}\n`);
console.log('='.repeat(90));
console.log('🔄 TRADUZIONE IN CORSO:\n');

oliFrag.forEach(product => {
  const originalName = product.name;

  // Traduci il nome
  let translatedName = product.name;
  Object.keys(fragranze).forEach(eng => {
    const ita = fragranze[eng];
    translatedName = translatedName.replace(new RegExp(eng, 'gi'), ita);
  });

  translatedName = translatedName
    .replace(/Fragrance/gi, 'Fragranza')
    .replace(/250g/gi, '250g');

  product.name = translatedName;

  // Traduci la descrizione
  product.description = product.description
    .replace(/Pure Fragrance Oils/gi, 'Oli per Fragranza Puri')
    .replace(/Fragrance Oils/gi, 'Oli per Fragranza')
    .replace(/oil burners/gi, 'bruciatori per oli')
    .replace(/potpourri/gi, 'potpourri')
    .replace(/scented stones/gi, 'pietre profumate')
    .replace(/aluminium bottle/gi, 'bottiglia in alluminio')
    .replace(/secure lid/gi, 'tappo sicuro')
    .replace(/Top notes/gi, 'Note di testa')
    .replace(/Heart Notes/gi, 'Note di cuore')
    .replace(/Base Notes/gi, 'Note di fondo')
    .replace(/Woods/gi, 'Legnose')
    .replace(/Musk/gi, 'Muschio')
    .replace(/Powder/gi, 'Polverose')
    .replace(/250g of pure fragrance oils/gi, '250g di oli per fragranza puri')
    .replace(/ideal for/gi, 'ideale per')
    .replace(/high quality/gi, 'alta qualità')
    .replace(/essential and profitable product/gi, 'prodotto essenziale e redditizio');

  translatedCount++;
  console.log(`✅ ${originalName}`);
  console.log(`   → ${translatedName}\n`);
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Prodotti tradotti: ${translatedCount}`);
console.log(`   Totale prodotti: ${products.length}`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
