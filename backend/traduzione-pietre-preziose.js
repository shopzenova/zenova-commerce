const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-gemstones-${Date.now()}.json`;

console.log('🌍 TRADUZIONE PIETRE PREZIOSE IN ITALIANO (nomi + descrizioni)\n');
console.log('='.repeat(90));

// Dizionario traduzioni per pietre preziose
const traduzioniNomi = {
  // Tipi di prodotti
  'Gemstone Enchantment Lights': 'Luci Decorative con Pietre Preziose',
  'Orgonite Power Chakra Pendulum': 'Pendolo Chakra in Orgonite',
  'Aromatherapy Jewellery': 'Gioiello per Aromaterapia',

  // Tipi di gioielli
  'Chain Bracelet': 'Braccialetto a Catena',
  'Crystal Bracelet': 'Braccialetto di Cristallo',
  'Necklace': 'Collana',
  'Pendant': 'Ciondolo',
  'Refill Pad': 'Tampone di Ricambio',
  'Reusable': 'Riutilizzabile',

  // Pietre e materiali
  'Rock Quartz': 'Quarzo Trasparente',
  'Citrine': 'Citrino',
  'Mixed Rocks': 'Pietre Miste',
  'Rose Quartz': 'Quarzo Rosa',
  'Tiger Eye': 'Occhio di Tigre',
  'Angel Wing': 'Ala d\'Angelo',

  // Simboli e design
  'Tree of Life': 'Albero della Vita',
  'Cat & Flowers': 'Gatto e Fiori',
  'Dragonfly': 'Libellula',
  'Infinite Love': 'Amore Infinito',
  'Angel Wings': 'Ali d\'Angelo',
  'Flower of Life': 'Fiore della Vita',
  'Hamsa Chakra': 'Hamsa Chakra',
  'Hand of Fatima': 'Mano di Fatima',
  'Infinity Love': 'Amore Infinito',
  'Leaf': 'Foglia',
  'OM Chakra': 'OM Chakra',
  'Turtle': 'Tartaruga',
  'Yoga Chakra': 'Yoga Chakra',
  'Cat and Flowers': 'Gatto e Fiori',

  // Colori
  'Two Colours': 'Due Colori',

  // Altri
  'Boxed': 'In Scatola',
  'Roll On': 'Roll-On'
};

// Template descrizioni in italiano
const descrizioniTemplate = {
  gemstone_lights: 'Presentazione delle Luci Decorative con Pietre Preziose - una fusione abbagliante della bellezza della natura e della tecnologia moderna. Perfette per la rivendita, queste luci incanteranno i tuoi clienti e i loro ambienti. Le luci sono dotate di connettore USB per un\'alimentazione semplice. I clienti possono collegarle facilmente ai loro computer, power bank o caricatori USB da parete. Si prega di notare che l\'adattatore non è incluso nel prodotto. La lunghezza delle luci è di 227cm.',

  orgonite_pendulum: 'Pendolo Chakra in Orgonite di alta qualità, perfetto per la radiestesia, la meditazione e il bilanciamento energetico. L\'orgonite è una combinazione di cristalli, resina e metalli che si ritiene trasformi l\'energia negativa in energia positiva. Ogni pendolo è realizzato artigianalmente con pietre naturali autentiche. Ideale per pratiche spirituali, guarigione energetica e ricerca interiore.',

  aromatherapy_jewellery: 'Gioiello per aromaterapia in acciaio inossidabile di alta qualità. Design elegante che combina stile e benessere. Include tamponi assorbenti riutilizzabili su cui versare alcune gocce del tuo olio essenziale preferito. Il profumo viene delicatamente rilasciato durante tutta la giornata. Perfetto per godere dei benefici dell\'aromaterapia ovunque tu vada. Chiusura regolabile per un comfort ottimale.',

  refill_pad: 'Tampone di ricambio riutilizzabile per gioielli aromaterapici. Realizzato in feltro assorbente di alta qualità. Compatibile con tutti i nostri ciondoli per aromaterapia. Semplicemente aggiungi 2-3 gocce del tuo olio essenziale preferito sul tampone, inseriscilo nel ciondolo e goditi il profumo delicato per tutto il giorno. Può essere lavato e riutilizzato più volte. Confezione multipla per avere sempre ricambi a disposizione.'
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Applica tutte le traduzioni
  Object.keys(traduzioniNomi).forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioniNomi[termineInglese]);
  });

  return nomeItaliano;
}

function getDescrizioneItaliana(sku, nome, descrizioneOriginale) {
  const nomeLower = nome.toLowerCase();

  if (nomeLower.includes('gemstone') || nomeLower.includes('luci decorative')) {
    return descrizioniTemplate.gemstone_lights;
  } else if (nomeLower.includes('orgonite') || nomeLower.includes('pendulum') || nomeLower.includes('pendolo')) {
    return descrizioniTemplate.orgonite_pendulum;
  } else if (nomeLower.includes('refill pad') || nomeLower.includes('tampone')) {
    return descrizioniTemplate.refill_pad;
  } else if (nomeLower.includes('aromatherapy jewellery') || nomeLower.includes('gioiello')) {
    return descrizioniTemplate.aromatherapy_jewellery;
  } else {
    // Mantieni descrizione originale se non c'è un template specifico
    return descrizioneOriginale;
  }
}

// Carica prodotti
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Prodotti totali: ${products.length}\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🔄 TRADUZIONE IN CORSO (nomi + descrizioni):\n');

let translatedCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'pietre-preziose') {
    const vecchioNome = product.name;
    const nuovoNome = traduciNome(vecchioNome);
    const nuovaDescrizione = getDescrizioneItaliana(product.sku, nuovoNome, product.description);

    product.name = nuovoNome;
    product.description = nuovaDescrizione;

    translatedCount++;

    console.log(`✅ ${product.sku}`);
    console.log(`   Vecchio: ${vecchioNome}`);
    console.log(`   Nuovo:   ${nuovoNome}`);
    console.log('');
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Pietre preziose tradotte: ${translatedCount}`);
console.log(`   (Nomi + Descrizioni)`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
