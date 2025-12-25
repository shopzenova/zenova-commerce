const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-vestiario-${Date.now()}.json`;

console.log('🌍 TRADUZIONE VESTIARIO WELLNESS IN ITALIANO (nomi + descrizioni)\n');
console.log('='.repeat(90));

// Dizionario traduzioni per vestiario wellness
const traduzioni = {
  // Tipi di prodotto
  'Nomad Sari On the Med Collection': 'Collezione Nomad Sari Mediterraneo',
  'Indian Boho Scarves': 'Sciarpe Boho Indiane',
  'Large Indian Boho Scarves': 'Sciarpe Boho Indiane Large',
  'Mandela Sarong': 'Pareo Mandala',
  'Jacquard Bag': 'Borsa Jacquard',

  // Tipologie
  'Pario': 'Pareo',
  'Dress': 'Vestito',
  'Sarong': 'Pareo',
  'Backpack': 'Zaino',
  'Sling Bag': 'Borsa a Tracolla',
  'Student Bag': 'Borsa Studente',
  'Student Back': 'Borsa Studente',

  // Colori
  'White': 'Bianco',
  'Blue': 'Blu',
  'Turquoise': 'Turchese',
  'Sea Blue': 'Blu Mare',
  'Gold': 'Oro',
  'Pink': 'Rosa',
  'Purple': 'Viola',
  'Purples': 'Viola',
  'Blues': 'Blu',
  'Greens': 'Verde',
  'Green': 'Verde',
  'Teal': 'Verde Acqua',
  'Ruby Lime': 'Rubino Lime',
  'Lime': 'Lime',
  'Orange': 'Arancione',
  'Chocolate': 'Cioccolato',
  'Peacock': 'Pavone',

  // Design
  'Turtle Design': 'Design Tartaruga',
  'Evil Eye Design': 'Design Occhio Turco',
  'Fish Design': 'Design Pesce',
  'Coral Design': 'Design Corallo',
  'Classic': 'Classico',

  // Altro
  'Random': 'Assortiti',
  'Rose': 'Rosa'
};

// Template descrizioni in italiano
const descrizioniTemplate = {
  pareo_nomad: `Pareo elegante della Collezione Nomad Sari Mediterraneo, realizzato in tessuto leggero e fluido con splendidi design ispirati al mare. Perfetto per la spiaggia, la piscina o come copricostume elegante.

Caratteristiche:
- Tessuto leggero e traspirante
- Design mediterraneo con dettagli oro
- Versatile: pareo, copricostume, scialle
- Dimensioni generose per vari utilizzi
- Colori vivaci resistenti al lavaggio

Ideale per l'estate, questo pareo può essere indossato in molteplici modi: come copricostume, gonna, vestito o scialle. Un accessorio essenziale per la tua vacanza al mare!`,

  vestito_nomad: `Vestito elegante della Collezione Nomad Sari Mediterraneo, realizzato in tessuto fluido con design ispirati al mare. Perfetto per l'estate, la spiaggia o serate casual.

Caratteristiche:
- Tessuto leggero e confortevole
- Design mediterraneo con dettagli oro
- Taglie disponibili: M/L e L/XL
- Vestibilità comoda e rilassata
- Colori brillanti e resistenti

Questo vestito unisce stile bohémien e comfort, ideale per le giornate estive. Può essere indossato in spiaggia, in città o per serate informali. Il design versatile lo rende perfetto per ogni occasione estiva.`,

  sciarpa_boho: `Sciarpa Boho Indiana realizzata a mano con tessuti tradizionali e design etnici. Accessorio versatile che aggiunge un tocco bohémien a qualsiasi outfit.

Caratteristiche:
- Realizzata a mano con tecniche tradizionali
- Design etnico indiano autentico
- Tessuto morbido e confortevole
- Colori vivaci assortiti
- Dimensioni: 50x180cm o 75x180cm

Perfetta come sciarpa, scialle, foulard o accessorio decorativo. I colori assortiti garantiscono pezzi unici con motivi tradizionali indiani. Ideale per uno stile bohémien, etnico o hippie-chic.`,

  pareo_mandala: `Pareo con design Mandala, simbolo spirituale che rappresenta l'universo e l'armonia. Perfetto per yoga, meditazione, spiaggia o come arredo decorativo.

Caratteristiche:
- Design Mandala dettagliato e colorato
- Tessuto leggero e versatile
- Colori vivaci e resistenti
- Dimensioni generose (circa 115x180cm)
- Uso multiplo: pareo, telo mare, arazzo

Il Mandala è un simbolo sacro che rappresenta l'equilibrio e l'armonia. Questo pareo unisce spiritualità e funzionalità, perfetto per la spiaggia, sessioni di yoga o come decorazione da parete per creare un'atmosfera zen.`,

  borsa_jacquard: `Borsa etnica realizzata con tessuto Jacquard tradizionale nepalese. Design artigianale con motivi geometrici colorati, perfetta per uno stile bohémien e naturale.

Caratteristiche:
- Tessuto Jacquard artigianale nepalese
- Design geometrico tradizionale
- Resistente e duratura
- Chiusure e tasche funzionali
- Tracolla regolabile

Le borse Jacquard sono realizzate con tecniche di tessitura tradizionali, creando motivi geometrici unici e colorati. Perfette per uso quotidiano, viaggi, università o come borsa casual. Combinano stile etnico, funzionalità e artigianalità.`
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Rimuovi errori MyMemory dal nome
  if (nomeItaliano.includes('MYMEMORY WARNING')) {
    nomeItaliano = 'Prodotto Vestiario Wellness';
  }

  // Applica tutte le traduzioni in ordine (più lunghe prima)
  const chiavi = Object.keys(traduzioni).sort((a, b) => b.length - a.length);

  chiavi.forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioni[termineInglese]);
  });

  return nomeItaliano;
}

function getDescrizioneItaliana(nome, descrizioneOriginale) {
  const nomeLower = nome.toLowerCase();

  // Se la descrizione contiene l'errore MyMemory o è in inglese, sostituiscila
  if (descrizioneOriginale?.includes('MYMEMORY WARNING') ||
      descrizioneOriginale?.includes('scarf') ||
      descrizioneOriginale?.includes('dress') ||
      descrizioneOriginale?.includes('bag')) {

    if (nomeLower.includes('vestito') || nomeLower.includes('dress')) {
      return descrizioniTemplate.vestito_nomad;
    } else if (nomeLower.includes('pareo') && nomeLower.includes('nomad')) {
      return descrizioniTemplate.pareo_nomad;
    } else if (nomeLower.includes('sciarpe') || nomeLower.includes('scarf')) {
      return descrizioniTemplate.sciarpa_boho;
    } else if (nomeLower.includes('pareo mandala') || nomeLower.includes('sarong')) {
      return descrizioniTemplate.pareo_mandala;
    } else if (nomeLower.includes('borsa') || nomeLower.includes('bag') || nomeLower.includes('zaino')) {
      return descrizioniTemplate.borsa_jacquard;
    } else {
      // Default generico
      return descrizioniTemplate.sciarpa_boho;
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
  if (product.zenovaSubcategory === 'vestiario-wellness') {
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
console.log(`   Prodotti vestiario wellness processati: ${translatedCount}`);
console.log(`   Nomi tradotti/corretti: ${fixedNames}`);
console.log(`   Descrizioni aggiornate: ${fixedDescriptions}`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
