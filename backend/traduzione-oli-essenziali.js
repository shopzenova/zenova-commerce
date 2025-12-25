const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-oli-${Date.now()}.json`;

console.log('🌍 TRADUZIONE OLI ESSENZIALI IN ITALIANO\n');
console.log('='.repeat(90));

// Dizionario traduzioni nomi oli essenziali
const traduzioniNomi = {
  'Lavender': 'Lavanda',
  'Tea Tree': 'Tea Tree (Albero del Tè)',
  'Eucalyptus': 'Eucalipto',
  'Peppermint': 'Menta Piperita',
  'Rosemary': 'Rosmarino',
  'Ylang Ylang': 'Ylang Ylang',
  'Clary Sage': 'Salvia Sclarea',
  'Geranium': 'Geranio',
  'Sandalwood Amayris': 'Legno di Sandalo Amayris',
  'Patchouli': 'Patchouli',
  'Jasmine': 'Gelsomino',
  'Lemon': 'Limone',
  'Basil': 'Basilico',
  'Bergamot': 'Bergamotto',
  'Blackpepper': 'Pepe Nero',
  'Black Pepper': 'Pepe Nero',
  'Fennel': 'Finocchio',
  'Frankincense': 'Incenso',
  'Chamomile Roman': 'Camomilla Romana',
  'Citronella': 'Citronella',
  'Cinnamon': 'Cannella',
  'Clove Leaf': 'Chiodi di Garofano',
  'Cypress': 'Cipresso',
  'Ginger': 'Zenzero',
  'Grapefruit': 'Pompelmo',
  'Juniperberry': 'Bacche di Ginepro',
  'Juniper Berry': 'Bacche di Ginepro',
  'Lemongrass': 'Citronella (Lemongrass)',
  'Lime': 'Lime',
  'Mandarin': 'Mandarino',
  'Essential Oil': 'Olio Essenziale',
  'Roll On Essential Oil Blend': 'Blend di Oli Essenziali Roll-On',
  'Essential Oil Blend': 'Blend di Oli Essenziali',
  'Dilute': 'Diluito',
  'Pure': 'Puro',
  'Absolute': 'Assoluto',
  'RELAX': 'RELAX',
  'ENERGY': 'ENERGIA',
  'CALM': 'CALMA',
  'SLEEP': 'SONNO',
  'FOCUS': 'CONCENTRAZIONE',
  'HAPPY': 'FELICITÀ',
  'Energising': 'Energizzante',
  'Breath Easy': 'Respira Facile',
  'Happiness': 'Felicità',
  'Sleep Easy': 'Sonno Facile',
  'Soothing': 'Lenitivo',
  'Relaxing': 'Rilassante',
  'Less Stress': 'Meno Stress',
  'Sensual': 'Sensuale',
  'Simmus': 'Simmus',
  'Boxed': 'In Scatola',
  'Refill Pad': 'Tampone di Ricambio',
  'Reusable': 'Riutilizzabile'
};

// Traduzioni descrizioni comuni
const descrizioniTemplate = {
  lavender: 'La lavanda è stata usata e apprezzata per secoli per il suo inconfondibile aroma e i numerosi benefici. Nell\'antichità, gli egizi e i romani usavano la lavanda per il bagno, il relax, la cucina e come profumo. Le sue qualità calmanti e rilassanti continuano ad essere le caratteristiche più notevoli della lavanda. Applicato localmente, viene spesso utilizzato per ridurre l\'aspetto delle imperfezioni della pelle. Aggiungi all\'acqua del bagno per alleviare lo stress o applicalo sulle tempie e sulla nuca. Aggiungi alcune gocce di lavanda sui cuscini, sulla biancheria da letto o sulla pianta dei piedi per rilassarti e prepararti per una notte di sonno riposante.',

  tea_tree: 'L\'olio essenziale di Tea Tree (Albero del Tè) è noto per le sue proprietà purificanti e rinvigoranti. Questo olio versatile è perfetto per la cura della pelle, aiuta a purificare e rinnovare la pelle. Può essere aggiunto a detergenti, creme idratanti e diffusori. Le sue proprietà naturali lo rendono ideale per mantenere una pelle sana e pulita.',

  eucalyptus: 'L\'olio essenziale di eucalipto è estratto dalle foglie dell\'albero di eucalipto. Questo olio rinfrescante e rivitalizzante è perfetto per la diffusione durante i mesi invernali. Le sue proprietà purificanti lo rendono ideale per creare un\'atmosfera rinfrescante. Può essere utilizzato in vaporizzatori, massaggi e bagni aromatici.',

  peppermint: 'L\'olio essenziale di menta piperita ha un aroma rinfrescante e tonificante. Questo olio versatile può essere utilizzato per migliorare la concentrazione, rinvigorire i sensi e rinfrescare l\'ambiente. È perfetto per la diffusione, i massaggi e le applicazioni topiche diluite.',

  bergamot: 'L\'olio essenziale di bergamotto viene estratto per spremitura dalla buccia matura e acerba dell\'arancia bergamotto. Questo olio che profuma di agrumi ma dolce, è ottimo per creare una sensazione di relax e felicità. È utile nel trattamento delle infezioni del tratto urinario, problemi della pelle e stimola le funzioni del fegato, della milza e dello stomaco. In aromaterapia viene utilizzato per trattare depressione, stress, tensione, scarsa autostima, paura e isteria.',

  blend: 'Blend di oli essenziali puri accuratamente selezionati per creare sinergie aromatiche uniche. Ogni blend è formulato per supportare specifici stati d\'animo e benessere. Perfetto per diffusione, aromaterapia e applicazioni topiche diluite. 100% naturale e di alta qualità.',

  default: 'Olio essenziale puro di alta qualità, perfetto per aromaterapia, diffusione e benessere naturale. Estratto con metodi naturali per preservare tutte le proprietà benefiche della pianta. Ideale per vaporizzatori, massaggi e applicazioni aromaterapiche.'
};

function traduciNome(nomeInglese) {
  let nomeItaliano = nomeInglese;

  // Applica tutte le traduzioni
  Object.keys(traduzioniNomi).forEach(termineInglese => {
    const regex = new RegExp(termineInglese, 'gi');
    nomeItaliano = nomeItaliano.replace(regex, traduzioniNomi[termineInglese]);
  });

  // Riordina formato: "10 ml Olio Essenziale di X" → "Olio Essenziale di X 10ml"
  nomeItaliano = nomeItaliano.replace(/^(\d+)\s*ml\s+/i, '').trim();
  if (nomeInglese.match(/^(\d+)\s*ml/i)) {
    const ml = nomeInglese.match(/^(\d+)\s*ml/i)[1];
    nomeItaliano = `${nomeItaliano} ${ml}ml`;
  }

  return nomeItaliano;
}

function getDescrizioneItaliana(nome, descrizioneOriginale) {
  const nomeLower = nome.toLowerCase();

  if (nomeLower.includes('lavanda') || nomeLower.includes('lavender')) {
    return descrizioniTemplate.lavender;
  } else if (nomeLower.includes('tea tree')) {
    return descrizioniTemplate.tea_tree;
  } else if (nomeLower.includes('eucalipto') || nomeLower.includes('eucalyptus')) {
    return descrizioniTemplate.eucalyptus;
  } else if (nomeLower.includes('menta') || nomeLower.includes('peppermint')) {
    return descrizioniTemplate.peppermint;
  } else if (nomeLower.includes('bergamotto') || nomeLower.includes('bergamot')) {
    return descrizioniTemplate.bergamot;
  } else if (nomeLower.includes('blend') || nomeLower.includes('roll')) {
    return descrizioniTemplate.blend;
  } else {
    return descrizioniTemplate.default + ' ' + nome + '.';
  }
}

// Carica prodotti
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Prodotti totali: ${products.length}\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🔄 TRADUZIONE IN CORSO:\n');

let translatedCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'oli-essenziali') {
    const vecchioNome = product.name;
    const nuovoNome = traduciNome(vecchioNome);
    const nuovaDescrizione = getDescrizioneItaliana(nuovoNome, product.description);

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
console.log(`   Prodotti oli essenziali tradotti: ${translatedCount}`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
