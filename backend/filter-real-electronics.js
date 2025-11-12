const fs = require('fs');

console.log('🔍 Filtraggio prodotti elettronica autentici...\n');

const products = JSON.parse(fs.readFileSync('electronics-products.json', 'utf-8'));

// Parole da ESCLUDERE (non sono vera elettronica)
const excludeKeywords = [
    'piega indumenti',
    'grucce',
    'gru personalizzata',
    'gruccia',
    'dispenser',
    'lavavetri',
    'sbiancare denti',
    'pouf',
    'sollevamento',
    'guinzaglio',
    'divisori',
    'epilatore',
    'sedia',
    'amaca',
    'vassoio',
    'scrivania',
    'tappeto',
    'portaoggetti',
    'rete parasole',
    'letto',
    'fasciatoio',
    'fascia termica',
    'fascia lombare',
    'cuscino',
    'materasso',
    'zaino',
    'borsa',
    'coperta',
    'borsone',
    'valigia',
    'organizzatore',
    'portaspazzolino',
    'spazzola',
    'pettine',
    'asciugamano',
    'contenitore',
    'scatola',
    'cestino',
    'piattaforma',
    'tavolo',
    'sgabello',
    'poltrona',
    'supporto lombare',
    'correttore postura',
    'dispositivo sbiancare',
    'fontana',
    'abbeveratoio',
    'mangiatoia',
    'gioco',
    'peluche',
    'cuccia',
    'collare',
    'guinzaglio',
    'set regalo',
    'coprisedile'
];

// Parole da INCLUDERE (vera elettronica)
const includeKeywords = [
    // Audio
    'cuffie', 'auricolare', 'speaker', 'altoparlante', 'bluetooth', 'earbuds', 'headphone',
    'microfono', 'amplificatore acustico',

    // Illuminazione
    'lampada led', 'lampadina', 'striscia led', 'faretto', 'plafoniera', 'applique',
    'proiettore stelle', 'luce notturna',

    // Power
    'power bank', 'caricabatterie', 'caricatore', 'charger', 'wireless charging',
    'hub usb', 'adattatore usb',

    // Smart Home
    'telecamera', 'videocamera', 'sensore movimento', 'rilevatore', 'allarme',
    'termostato', 'presa smart', 'interruttore smart',

    // Wearables
    'smartwatch', 'fitness tracker', 'activity tracker', 'smart band',
    'cardiofrequenzimetro', 'pedometro', 'orologio smart',

    // Dispositivi
    'tablet', 'ebook reader', 'e-reader', 'kindle',
    'drone', 'action cam', 'gopro', 'gimbal',

    // Accessori
    'mouse', 'tastiera', 'keyboard', 'webcam', 'treppiede',
    'cavo hdmi', 'cavo usb', 'sdoppiatore', 'prolunga',

    // Salute/Wellness Tech
    'massaggiatore elettrico', 'termometro digitale', 'sfigmomanometro',
    'bilancia smart', 'spazzolino elettrico', 'rasoio elettrico',

    // Casa Tech
    'robot', 'aspirapolvere', 'purificatore aria', 'umidificatore',
    'ventilatore', 'termoventilatore', 'deumidificatore',

    // Altro
    'torcia led', 'lampada antizanzare', 'repellente ultrasuoni',
    'tapis roulant', 'cyclette'
];

const realElectronics = products.filter(p => {
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const text = name + ' ' + desc;

    // Escludi prodotti non tech
    for (const exclude of excludeKeywords) {
        if (name.includes(exclude)) {
            return false;
        }
    }

    // Includi solo se contiene keyword tech
    for (const include of includeKeywords) {
        if (text.includes(include)) {
            return true;
        }
    }

    return false;
});

console.log(`📊 Prodotti originali: ${products.length}`);
console.log(`✅ Prodotti elettronica autentici: ${realElectronics.length}`);
console.log(`❌ Rimossi: ${products.length - realElectronics.length}\n`);

// Mostra top 50
console.log('=== TOP 50 PRODOTTI ELETTRONICA AUTENTICI ===\n');
realElectronics.slice(0, 50).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   Stock: ${p.stock} | €${p.price}`);
});

if (realElectronics.length > 50) {
    console.log(`\n... e altri ${realElectronics.length - 50} prodotti`);
}

// Salva
fs.writeFileSync(
    'electronics-real.json',
    JSON.stringify(realElectronics, null, 2)
);

console.log(`\n💾 Salvato in: electronics-real.json`);
