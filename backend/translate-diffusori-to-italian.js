const fs = require('fs');
const path = require('path');

// Dizionario traduzioni comuni per diffusori
const translations = {
    // Termini tecnici diffusori
    'Aroma Diffuser': 'Diffusore di Aromi',
    'Aroma Diffusers': 'Diffusori di Aromi',
    'Atomiser': 'Atomizzatore',
    'Nebulizer': 'Nebulizzatore',
    'Humidifier': 'Umidificatore',

    // Descrizioni comuni
    'are timeless and elegant': 'sono senza tempo ed eleganti',
    'they provide a flameless and smoke-free way': 'offrono un modo senza fiamma e senza fumo',
    'to fragrance your room or office': 'per profumare la tua stanza o ufficio',
    'Just add some water and a favourite essential or fragrance oil': 'Basta aggiungere un po\' d\'acqua e il tuo olio essenziale o fragranza preferita',
    'for an instant aroma experience': 'per un\'esperienza aromatica istantanea',

    'use an ultrasonic motor': 'utilizzano un motore a ultrasuoni',
    'to pump out the water': 'per nebulizzare l\'acqua',
    'so it\'s very quiet during use': 'quindi è molto silenzioso durante l\'uso',
    'As featuring a colour changing mood light': 'Con luce d\'atmosfera a cambio colore',
    'and can be used as a simple humidifier': 'e può essere usato come semplice umidificatore',

    'are very easy to operate and maintain': 'sono molto facili da usare e mantenere',
    'only occasionally having to be filled': 'necessitano solo occasionalmente di essere riempiti',
    'with a small amount of water': 'con una piccola quantità d\'acqua',
    'and a few drops of scented oil': 'e qualche goccia di olio profumato',

    'Fast selling - stock up today to totally atomise your sales': 'Vendita rapida - fai scorta oggi per massimizzare le tue vendite',

    // Specifiche tecniche
    'Tank Capacity': 'Capacità serbatoio',
    'LED light': 'Luce LED',
    'Powered by USB': 'Alimentato tramite USB',
    'Auto power off when water runs out': 'Spegnimento automatico quando l\'acqua finisce',
    'timer': 'timer',
    'Height': 'Altezza',
    'Diameter': 'Diametro',
    'weight': 'peso',
    'length of the cord': 'lunghezza del cavo',

    // Caratteristiche
    'Colour Change': 'Cambio Colore',
    'Color Change': 'Cambio Colore',
    'Shell Effect': 'Effetto Conchiglia',
    'Classic Pod': 'Pod Classico',
    'Timer': 'Timer',
    'Flame Effect': 'Effetto Fiamma',
    'Himalayan Salt': 'Sale Himalayano',
    'Salt Chamber': 'Camera di Sale',
    'Led Clock': 'Orologio LED',
    'Night Light': 'Luce Notturna',
    'Dry Aromatherapy': 'Aromaterapia a Secco',
    'No Water Required': 'Senza Acqua',
    'Waterless': 'Senza Acqua',
    'Oil Nebulizer': 'Nebulizzatore di Oli',
    'Volcano Effect': 'Effetto Vulcano',
    'Birdsound': 'Suoni di Uccelli',
    'Remote control': 'Telecomando',
    'movement detector': 'rilevatore di movimento',

    // Nomi prodotti
    'Milan': 'Milano',
    'Santorini': 'Santorini',
    'Palma': 'Palma',
    'Aarhus': 'Aarhus',
    'Palermo': 'Palermo',
    'Blaze': 'Fiamma',
    'Modern': 'Moderno',
    'Urban': 'Urbano',
    'White & Bronze': 'Bianco e Bronzo',
    'Green & Bronze': 'Verde e Bronzo',

    // Features
    'Salt included': 'Sale incluso',
    'Two Colours': 'Due Colori'
};

// Funzione per tradurre testo
function translateText(text) {
    if (!text) return text;

    let translated = text;

    // Applica tutte le traduzioni dal dizionario
    for (const [english, italian] of Object.entries(translations)) {
        const regex = new RegExp(english, 'gi');
        translated = translated.replace(regex, italian);
    }

    return translated;
}

// Leggi prodotti
const productsFile = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

console.log(`📦 Traduzione prodotti AATOM in italiano...\n`);

let translated = 0;
products.forEach(p => {
    if (p.sku && p.sku.startsWith('AATOM-')) {
        console.log(`🔄 Traduco: ${p.sku} - ${p.name}`);

        // Traduci nome
        const originalName = p.name;
        p.name = translateText(p.name);
        console.log(`   Nome: ${originalName} → ${p.name}`);

        // Traduci descrizione
        if (p.description) {
            const originalDesc = p.description.substring(0, 80) + '...';
            p.description = translateText(p.description);
            console.log(`   Descrizione tradotta`);
        }

        // Traduci short description
        if (p.shortDescription) {
            p.shortDescription = translateText(p.shortDescription);
        }

        // Traduci features
        if (p.features && Array.isArray(p.features)) {
            p.features = p.features.map(f => translateText(f));
        }

        // Traduci specifications
        if (p.specifications) {
            const newSpecs = {};
            for (const [key, value] of Object.entries(p.specifications)) {
                const translatedKey = translateText(key);
                const translatedValue = translateText(String(value));
                newSpecs[translatedKey] = translatedValue;
            }
            p.specifications = newSpecs;
        }

        translated++;
        console.log('');
    }
});

// Salva file aggiornato
fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');

console.log(`✅ Tradotti ${translated} prodotti AATOM in italiano`);
console.log(`💾 File salvato: ${productsFile}`);
