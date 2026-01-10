const fs = require('fs');

// Traduzioni manuali dei prodotti Kit Benessere
const traduzioni = {
  // Agnes+Cat Gift Boxes
  "Gift Box - Rhubarb (Candle) + White Fig & Fell Berry (Fizz)": "Cofanetto Regalo - Rabarbaro (Candela) + Fico Bianco & Frutti di Bosco (Fizzer)",
  "Gift Box - Coffee & Walnut (Candle) + Peonies & Japanese Bloom (Fizz)": "Cofanetto Regalo - Caffè & Noce (Candela) + Peonie & Fiori Giapponesi (Fizzer)",
  "Gift Box - Fresh Citrus (Candle) + Clementine & Mor.Roll (Fizz)": "Cofanetto Regalo - Agrumi Freschi (Candela) + Clementine & Mor.Roll (Fizzer)",
  "Gift Box - Parma Violet (Candle) + Seasalt and Moss & Dolly Blue (Fizz)": "Cofanetto Regalo - Violetta di Parma (Candela) + Sale Marino & Muschio (Fizzer)",
  "Gift Box - Velvet Moon (Candle) + Windermere & Citrus (Fizz)": "Cofanetto Regalo - Luna di Velluto (Candela) + Windermere & Agrumi (Fizzer)",
  "Gift Box - Moonstone (Candle) + Provence & Tea and Roses (Fizz)": "Cofanetto Regalo - Pietra di Luna (Candela) + Provenza & Tè e Rose (Fizzer)",

  // Agnes+Cat Wellness Sets
  "Agnes + Cat Wellness Gift Set - Bloom & Bliss": "Set Regalo Benessere Agnes + Cat - Fioritura & Beatitudine",
  "Agnes + Cat Wellness Gift Set - Lake Breeze": "Set Regalo Benessere Agnes + Cat - Brezza di Lago",
  "Agnes + Cat Wellness Gift Set - Moroccan Morning": "Set Regalo Benessere Agnes + Cat - Mattino Marocchino",

  // Agnes+Cat Fragrance Sets
  "Agnes + Cat Fragrance Gift Set - Tea & Roses": "Set Regalo Fragranza Agnes + Cat - Tè e Rose",
  "Agnes + Cat Fragrance Gift Set - Windemere": "Set Regalo Fragranza Agnes + Cat - Windermere",
  "Agnes + Cat Fragrance Gift Set - Moroccan": "Set Regalo Fragranza Agnes + Cat - Marocchino",

  // Bottom Up Glasses
  "Gift Set of 6 Glasses (100ml) - Mystical Creatures - Antique Bronze": "Set Regalo 6 Bicchieri (100ml) - Creature Mistiche - Bronzo Antico",
  "Gift Set of 6 Shot Glasses (50ml) - Wild Forest Creatures - Antique Bronze": "Set Regalo 6 Bicchierini (50ml) - Creature della Foresta - Bronzo Antico",
  "Gift Set of 12 Bottom Up Shot Glasses (25ml) - Forest & Mystical Creatures - Antique Bronze": "Set Regalo 12 Bicchierini Bottom Up (25ml) - Creature Foresta & Mistiche - Bronzo Antico",
  "Bottom Up Shot Glasses (25ml) - Forest & Mystical Creatures - Antique Bronze": "Bicchierini Bottom Up (25ml) - Creature Foresta & Mistiche - Bronzo Antico",

  // Sarongs
  "1x Bali Celtic Sarongs - Lucky Coins (4 Assorted Colours)": "1x Parei Bali Celtico - Monete Portafortuna (4 Colori Assortiti)",
  "1x Bali Celtic Sarongs - Yin & Yang (4 Assorted Colours)": "1x Parei Bali Celtico - Yin & Yang (4 Colori Assortiti)",

  // Cocktail Bath Bombs
  "Set of Three Martini Bath Bombs": "Set di Tre Bombe da Bagno Martini",
  "Set of Three Mojito Bath Bombs": "Set di Tre Bombe da Bagno Mojito",
  "Set of Three Piña Colada Bath Bombs": "Set di Tre Bombe da Bagno Piña Colada",

  // Cotton Wall Art
  "Cotton Wall Art - Chakra Buddha": "Arazzo in Cotone - Buddha Chakra",
  "Cotton Wall Art - Herbal Leaf": "Arazzo in Cotone - Foglia Erborea",
  "Cotton Wall Art - Round Mandala": "Arazzo in Cotone - Mandala Rotondo",
  "Cotton Wall Art - Tree of Life - Classic": "Arazzo in Cotone - Albero della Vita - Classico",
  "Cotton Wall Art - Tree of Strength": "Arazzo in Cotone - Albero della Forza",
  "Cotton Wall Art - Tree with Adam & Eve": "Arazzo in Cotone - Albero con Adamo ed Eva",
  "Cotton Wall Art - Elephant Mandala": "Arazzo in Cotone - Mandala Elefante",
  "Cotton Wall Art - Dream Catcher": "Arazzo in Cotone - Acchiappasogni",

  // Essential Oil Sets
  "Aromatherapy Essential Oil Set - Starter Pack": "Set Oli Essenziali Aromaterapia - Pacchetto Base",
  "Aromatherapy Essential Oil Set - The Top 12": "Set Oli Essenziali Aromaterapia - I Migliori 12",
  "Aromatherapy Essential Oil Set - Autumn Set": "Set Oli Essenziali Aromaterapia - Set Autunno",
  "Aromatherapy Essential Oil Set - Spring": "Set Oli Essenziali Aromaterapia - Primavera",
  "Aromatherapy Essential Oil Set - Summer": "Set Oli Essenziali Aromaterapia - Estate",

  // Palo Santo
  "Palo Santo Large Incense Sticks - Cinnamon": "Bastoncini di Incenso Palo Santo Large - Cannella",
  "Palo Santo Large Incense Sticks - Rosemary": "Bastoncini di Incenso Palo Santo Large - Rosmarino",
  "Palo Santo Large Incense Sticks - Eucalyptus": "Bastoncini di Incenso Palo Santo Large - Eucalipto",
  "Palo Santo Large Incense Sticks - Jasmine": "Bastoncini di Incenso Palo Santo Large - Gelsomino",
  "Palo Santo Large Incense Sticks - Gardenia": "Bastoncini di Incenso Palo Santo Large - Gardenia",
  "Palo Santo Large Incense Sticks - Ruda": "Bastoncini di Incenso Palo Santo Large - Ruta",
  "Palo Santo Large Incense Sticks - Chipre": "Bastoncini di Incenso Palo Santo Large - Cipro",
  "Palo Santo Large Incense Sticks - Wiracoa": "Bastoncini di Incenso Palo Santo Large - Wiracoa",
  "Palo Santo Large Incense Sticks - Cloves": "Bastoncini di Incenso Palo Santo Large - Chiodi di Garofano",
  "Palo Santo Large Incense Sticks - Sandalwood": "Bastoncini di Incenso Palo Santo Large - Sandalo",
  "Palo Santo Large Incense Sticks - Lavander": "Bastoncini di Incenso Palo Santo Large - Lavanda",
  "Palo Santo Large Incense Sticks - Peppermint": "Bastoncini di Incenso Palo Santo Large - Menta Piperita",
  "Palo Santo Large Incense Sticks - Classic": "Bastoncini di Incenso Palo Santo Large - Classico",
  "2nd Grade Palo Santo Wood Sticks": "Bastoncini di Legno Palo Santo 2° Grado",
  "1st Grade Palo Santo Wood Sticks": "Bastoncini di Legno Palo Santo 1° Grado"
};

// Traduzioni descrizioni (parti comuni)
const traduzioniDescrizioni = {
  "The Perfect Gift for Any Occasion!": "Il Regalo Perfetto per Ogni Occasione!",
  "These beautifully wrapped gift boxes are ideal for Christmas, birthdays, anniversaries, or any special celebration.": "Questi cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.",
  "What Makes Them Special?": "Cosa li Rende Speciali?",
  "The wrapping paper is exclusively designed for Agnes + Cat": "La carta da regalo è esclusivamente disegnata per Agnes + Cat",
  "you won't find it anywhere else!": "non la troverai da nessun'altra parte!",
  "Inside Each Box": "All'Interno di Ogni Cofanetto",
  "2 x Bath Fizzers:": "2 x Frizzanti da Bagno:",
  "Fragranced with signature house scents.": "Profumati con le fragranze esclusive della casa.",
  "Made with a touch of coconut butter for a luxurious, moisturizing soak.": "Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante.",
  "Each fizzer can be used whole or split for two baths and comes individually wrapped.": "Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato.",
  "1 x Jam Jar Candle:": "1 x Candela in Vasetto:",
  "Crafted with natural soy wax.": "Realizzata con cera di soia naturale.",
  "Infused with a blend of natural essential oils and high-quality fragrance oils for a delightful aroma.": "Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso.",
  "Make your customers experience unforgettable with Agnes+Cat!": "Rendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  // Fragrance Gift Set descriptions
  "A soft and romantic home-fragrance set handmade in the UK": "Un set di fragranze per la casa morbido e romantico fatto a mano nel Regno Unito",
  "blending the gentle sweetness of roses with the comforting warmth of tea": "che unisce la dolce delicatezza delle rose con il calore confortante del tè",
  "A lovely way to make any room feel calm and inviting": "Un modo incantevole per rendere ogni stanza calma e accogliente",
  "This set includes four scented wax melts, a white ceramic oil burner with delicate cut-out florals, and a tea light to get everything started": "Questo set include quattro cere profumate da sciogliere, un bruciatore di oli in ceramica bianca con delicati motivi floreali traforati e una candela tealight per iniziare",
  "The fragrance is cosy yet floral": "La fragranza è accogliente e al tempo stesso floreale",
  "light rose notes softened by a touch of warm tea": "note leggere di rosa addolcite da un tocco di tè caldo",
  "creating a comforting atmosphere without overwhelming the space": "creando un'atmosfera confortante senza sopraffare lo spazio",
  "The melts sit beautifully in the scalloped dish of the burner, slowly releasing scent as they warm": "Le cere si adagiano magnificamente nel piattino smerlato del bruciatore, rilasciando lentamente il profumo mentre si scaldano",
  "Packaged in a pink, house-shaped gift box with charming floral details": "Confezionato in una scatola regalo rosa a forma di casa con incantevoli dettagli floreali",
  "it's an easy all-in-one gift": "è un regalo tutto-in-uno facile"
};

console.log('🌍 TRADUZIONE PRODOTTI KIT BENESSERE IN ITALIANO\n');
console.log('='.repeat(90));

// Leggi products.json
const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-kit-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Totale prodotti: ${products.length}`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🌍 TRADUZIONE IN CORSO:\n');

let tradottiCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'kit-benessere-cofanetti-regalo') {
    const nomeOriginale = product.name;

    // Traduci nome
    if (traduzioni[nomeOriginale]) {
      product.name = traduzioni[nomeOriginale];
      console.log(`✅ ${product.sku}`);
      console.log(`   EN: ${nomeOriginale}`);
      console.log(`   IT: ${product.name}`);

      // Traduci descrizione (sostituzioni comuni)
      if (product.description) {
        let descIT = product.description;

        // Applica tutte le traduzioni delle parti comuni
        Object.keys(traduzioniDescrizioni).forEach(en => {
          const it = traduzioniDescrizioni[en];
          descIT = descIT.replace(new RegExp(en, 'g'), it);
        });

        product.description = descIT;
      }

      tradottiCount++;
      console.log('');
    }
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Prodotti tradotti: ${tradottiCount}/51`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
