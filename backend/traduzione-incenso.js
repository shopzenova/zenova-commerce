const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-incenso-${Date.now()}.json`;

console.log('🌍 TRADUZIONE INCENSO IN ITALIANO (nomi + descrizioni)\n');
console.log('='.repeat(90));

// Dizionario traduzioni per incenso
const traduzioni = {
  // Tipi di prodotto
  'Incense': 'Incenso',
  'Incense Sticks': 'Bastoncini di Incenso',
  'Dhoop Cones': 'Coni di Incenso',
  'Ashcatcher': 'Portacenere',
  'Ashatchers': 'Portacenere',
  'Incense Burner': 'Bruciatore per Incenso',
  'Burner': 'Bruciatore',
  'Incense Plates': 'Piatti per Incenso',
  'Stick & Cone Burner': 'Bruciatore per Bastoncini e Coni',
  'Back Flow Incense Burner': 'Bruciatore Incenso a Cascata',
  'Cone & Stick Burner': 'Bruciatore per Coni e Bastoncini',

  // Caratteristiche
  'Brass': 'Ottone',
  'Brass Inlaid': 'Ottone Intarsiato',
  'Chakra': 'Chakra',
  '7 Chakra': '7 Chakra',
  'Colour': 'Colorato',
  'Assorted Colours': 'Colori Assortiti',
  'Assorted Design': 'Design Assortiti',
  'Assorted Designs': 'Design Assortiti',

  // Fragranze comuni
  'Dragon Blood': 'Sangue di Drago',
  'Frankincense': 'Incenso',
  'Jasmine': 'Gelsomino',
  'Lavender': 'Lavanda',
  'Lemongrass': 'Citronella',
  'Meditation': 'Meditazione',
  'Sandalwood': 'Legno di Sandalo',
  'White Sage': 'Salvia Bianca',
  'Patchouli': 'Patchouli',
  'Rose': 'Rosa',
  'Fresh Rose': 'Rosa Fresca',
  'Palo Santo': 'Palo Santo',
  'Citronella': 'Citronella',
  'Nag Champa': 'Nag Champa',
  'Super Hit': 'Super Hit',
  'Black Crystal': 'Cristallo Nero',

  // Altre parole
  'Emotion': 'Emozione',
  'Gold': 'Oro',
  'Karma': 'Karma',
  'Musk': 'Muschio',
  'Natural': 'Naturale',
  'Positive': 'Positivo',
  'Vibes': 'Vibrazioni',
  'Spiritual': 'Spirituale',
  'Healing': 'Guarigione'
};

// Template descrizioni in italiano
const descrizioniTemplate = {
  bastoncini: `Bastoncini di incenso aromatico di alta qualità, perfetti per creare un'atmosfera rilassante e profumata in casa, durante la meditazione o lo yoga. Ogni bastoncino brucia lentamente rilasciando un profumo intenso e duraturo.

Caratteristiche:
- Profumo intenso e duraturo
- Ideale per meditazione, yoga e relax
- Ingredienti naturali di qualità
- Tempo di combustione prolungato
- Perfetto per purificare gli ambienti

L'incenso è stato utilizzato per secoli in pratiche spirituali e rituali per purificare l'ambiente, favorire la concentrazione e creare un'atmosfera di pace e benessere.`,

  coni: `Coni di incenso aromatico di alta qualità, formulati con ingredienti naturali selezionati. I coni di incenso offrono un profumo più intenso e concentrato rispetto ai bastoncini tradizionali.

Caratteristiche:
- Fragranza intensa e concentrata
- Combustione uniforme e prolungata
- Ingredienti naturali di qualità premium
- Ideale per purificazione ambienti
- Perfetto per meditazione e pratiche spirituali

I coni di incenso sono particolarmente apprezzati per la loro capacità di diffondere rapidamente il profumo in spazi ampi, creando un'atmosfera avvolgente e rilassante.`,

  portacenere: `Portacenere decorativo progettato specificamente per bastoncini di incenso. Design elegante e funzionale che raccoglie la cenere in modo sicuro proteggendo le superfici.

Caratteristiche:
- Design decorativo ed elegante
- Raccoglie la cenere in modo sicuro
- Compatibile con bastoncini di incenso standard
- Materiali di qualità resistenti al calore
- Facile da pulire

Essenziale per bruciare incenso in modo sicuro ed elegante, aggiunge un tocco decorativo al tuo spazio di meditazione o relax.`,

  bruciatore: `Bruciatore per incenso artigianale di alta qualità. Design elegante e funzionale, perfetto per bruciare bastoncini e coni di incenso in totale sicurezza.

Caratteristiche:
- Design artigianale elegante
- Compatibile con bastoncini e coni
- Raccolta sicura della cenere
- Materiali resistenti al calore
- Facile da usare e pulire

Ideale per creare un'atmosfera rilassante e profumata in casa, durante la meditazione o semplicemente per godersi i benefici dell'aromaterapia con incenso naturale.`,

  bruciatore_cascata: `Bruciatore per incenso a cascata con effetto fumogeno spettacolare. Quando si utilizzano coni speciali per backflow, il fumo scende a cascata creando un effetto visivo affascinante e rilassante.

Caratteristiche:
- Effetto cascata fumogeno ipnotico
- Design decorativo unico
- Crea un'atmosfera zen e rilassante
- Funziona con coni backflow speciali
- Ideale per meditazione e decorazione

Questo bruciatore non solo profuma l'ambiente ma crea anche uno spettacolo visivo rilassante, perfetto per la meditazione e per aggiungere un elemento decorativo unico al tuo spazio.`
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Rimuovi errori MyMemory dal nome
  if (nomeItaliano.includes('MYMEMORY WARNING')) {
    // Se l'intero nome è l'errore, usa un placeholder
    nomeItaliano = 'Prodotto Incenso';
  }

  // Applica tutte le traduzioni
  Object.keys(traduzioni).forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioni[termineInglese]);
  });

  return nomeItaliano;
}

function getDescrizioneItaliana(nome, descrizioneOriginale) {
  const nomeLower = nome.toLowerCase();

  // Se la descrizione contiene l'errore MyMemory o è in inglese, sostituiscila
  if (descrizioneOriginale?.includes('MYMEMORY WARNING') ||
      descrizioneOriginale?.includes('incense sticks') ||
      descrizioneOriginale?.includes('burner')) {

    if (nomeLower.includes('cascata') || nomeLower.includes('back flow')) {
      return descrizioniTemplate.bruciatore_cascata;
    } else if (nomeLower.includes('bruciatore') || nomeLower.includes('burner')) {
      return descrizioniTemplate.bruciatore;
    } else if (nomeLower.includes('portacenere') || nomeLower.includes('ashcatcher') || nomeLower.includes('plate')) {
      return descrizioniTemplate.portacenere;
    } else if (nomeLower.includes('coni') || nomeLower.includes('cone') || nomeLower.includes('dhoop')) {
      return descrizioniTemplate.coni;
    } else {
      // Bastoncini di incenso (default)
      return descrizioniTemplate.bastoncini;
    }
  }

  // Se la descrizione è già in italiano, mantienila
  return descrizioneOriginale;
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
let fixedNames = 0;
let fixedDescriptions = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'incenso') {
    const vecchioNome = product.name;
    const nuovoNome = traduciNome(vecchioNome);
    const nuovaDescrizione = getDescrizioneItaliana(nuovoNome, product.description);

    const nomeChanged = vecchioNome !== nuovoNome;
    const descChanged = product.description !== nuovaDescrizione;

    if (nomeChanged) fixedNames++;
    if (descChanged) fixedDescriptions++;

    product.name = nuovoNome;
    product.description = nuovaDescrizione;

    translatedCount++;

    console.log(`✅ ${product.sku}`);
    if (nomeChanged) {
      console.log(`   Vecchio nome: ${vecchioNome}`);
      console.log(`   Nuovo nome:   ${nuovoNome}`);
    } else {
      console.log(`   Nome: ${nuovoNome}`);
    }
    console.log(`   Descrizione: ${descChanged ? 'AGGIORNATA' : 'OK'}`);
    console.log('');
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Prodotti incenso processati: ${translatedCount}`);
console.log(`   Nomi tradotti/corretti: ${fixedNames}`);
console.log(`   Descrizioni aggiornate: ${fixedDescriptions}`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
