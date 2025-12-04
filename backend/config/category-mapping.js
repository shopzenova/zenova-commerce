/**
 * Sistema di Categorizzazione Zenova - NUOVA STRUTTURA 2.0
 * "Where Technology Meets Calm"
 *
 * 5 CATEGORIE PRINCIPALI:
 * 1. Beauty (BigBuy auto-sync)
 * 2. Health & Personal Care (BigBuy auto-sync)
 * 3. Smart Living (BigBuy SKU import)
 * 4. Tech Innovation (Mix SKU import)
 * 5. Natural Wellness (AW Dropship)
 */

// ============================================================================
// KEYWORD BLACKLIST - Prodotti da ESCLUDERE automaticamente
// ============================================================================
const BLACKLIST_KEYWORDS = [
  // Alcolici
  'vodka', 'whisky', 'liquore', 'vino', 'birra', 'gin', 'rum', 'grappa', 'champagne',
  'alcol', 'alcolico', 'spirits',

  // Cucina generica (NON Zenova)
  'pentola', 'padella', 'tegame', 'friggitrice', 'forno', 'microonde',
  'batteria da cucina', 'pentole', 'casseruola', 'wok', 'grill',
  'affettatrice', 'grattugia', 'scolapasta', 'mestolo', 'spatola',

  // Cibo generico
  'prosciutto', 'salame', 'formaggio', 'pasta', 'riso', 'farina',
  'conserva', 'marmellata', 'salsa', 'sugo',

  // Elettrodomestici da cucina generici
  'mixer', 'frullatore', 'robot da cucina', 'impastatrice', 'tritacarne',
  'tostapane', 'bollitore elettrico',

  // Pulizia
  'scopa', 'aspirapolvere', 'mocio', 'spugna', 'detergente', 'sapone per piatti',

  // Sport generico
  'pallone', 'calcio', 'basket', 'tennis', 'racchetta',

  // Giocattoli
  'giocattolo', 'peluche', 'bambola', 'gioco da tavolo',

  // Abbigliamento generico
  'maglietta', 'pantaloni', 'giacca', 'scarpe', 'calze', 'mutande'
];

// ============================================================================
// CATEGORIE ZENOVA CON KEYWORD SPECIFICHE
// ============================================================================

const ZENOVA_CATEGORIES = {
  // 1. 💄 BEAUTY (BigBuy auto-sync)
  'beauty': {
    keywords: [
      // Profumi
      'profumo', 'eau de toilette', 'eau de parfum', 'fragranza', 'cologne',

      // Makeup
      'cosmetico', 'makeup', 'trucco', 'rossetto', 'mascara', 'fondotinta',
      'ombretto', 'matita', 'cipria', 'blush', 'correttore',

      // Skincare
      'crema viso', 'siero viso', 'maschera viso', 'gel viso', 'lozione',
      'anti-age', 'anti-rughe', 'contorno occhi', 'struccante',

      // Corpo
      'gel doccia', 'bagnoschiuma', 'crema corpo', 'lozione corpo',
      'scrub corpo', 'olio corpo', 'deodorante',

      // Igiene
      'igiene orale', 'dentifricio', 'collutorio', 'gel intimo',
      'sapone', 'detergente viso'
    ],
    priority: 1
  },

  // 2. 🏥 HEALTH & PERSONAL CARE (BigBuy auto-sync)
  'health-personal-care': {
    keywords: [
      // Cura capelli
      'shampoo', 'balsamo', 'maschera capelli', 'tintura capelli',
      'lacca', 'gel capelli', 'mousse capelli', 'siero capelli',
      'piastra', 'arricciacapelli', 'phon', 'asciugacapelli',

      // Barba
      'barba', 'dopobarba', 'schiuma barba', 'rasoio', 'trimmer barba',

      // Massaggio e benessere
      'massaggiatore', 'massaggio', 'shiatsu', 'pistola massaggiante',

      // Medicale
      'cerotto', 'medicazione', 'misuratore pressione', 'termometro',

      // Protezione solare
      'protezione solare', 'crema solare', 'after sun', 'autoabbronzante',

      // Mani e piedi
      'crema mani', 'crema piedi', 'pedicure', 'manicure'
    ],
    priority: 2
  },

  // 3. 🏠 SMART LIVING (BigBuy SKU import)
  'smart-living': {
    keywords: [
      // Illuminazione smart
      'smart led', 'lampadina smart', 'striscia led', 'led wifi', 'alexa', 'google home',
      'led rgb', 'illuminazione smart', 'smart light', 'led controllato',
      'wake-up light', 'wake up light', 'sveglia luce', 'simulazione alba',

      // Domotica
      'smart home', 'domotica', 'sensore', 'telecamera wifi', 'campanello smart',
      'termostato smart', 'presa smart', 'interruttore smart', 'hub smart',

      // Dispositivi wireless
      'bluetooth speaker', 'casse bluetooth', 'altoparlante wireless',
      'caricatore wireless', 'powerbank wireless',

      // Smart home accessories
      'robot aspirapolvere', 'purificatore aria smart', 'umidificatore smart',
      'smart plug', 'smart socket', 'timer smart'
    ],
    priority: 3
  },

  // 4. ⚡ TECH INNOVATION (Mix SKU import)
  'tech-innovation': {
    keywords: [
      // Smart devices
      'smart watch', 'smartwatch', 'fitness tracker', 'activity tracker',
      'smart band', 'fitness band', 'smart ring',

      // Wearable tech
      'auricolari wireless', 'auricolari', 'earbuds', 'tws', 'cuffie bluetooth',
      'cuffie wireless', 'wireless earbuds', 'bluetooth earbuds',
      'smart glasses', 'vr headset', 'ar glasses',

      // Tech wellness
      'fitness tech', 'health tracker', 'sleep tracker', 'postura smart',
      'massaggiatore elettrico', 'tens machine', 'ems trainer',
      'macchina del rumore', 'white noise', 'rumore bianco', 'sleep machine',
      'macchina rilassante', 'slewel', 'sound machine', 'macchina per dormire',

      // Gadget tech innovativi
      'gadget tech', 'tech gadget', 'innovazione', 'smart gadget',
      'portable tech', 'mini projector', 'pocket printer',

      // Innovazioni
      'drone', 'robot', 'ai device', 'smart pen', 'digital notepad',
      'e-reader', 'tablet', 'portable scanner'
    ],
    priority: 4
  },

  // 5. 🧘 NATURAL WELLNESS (AW Dropship)
  'natural-wellness': {
    keywords: [
      // Oli essenziali
      'oli essenziali', 'olio essenziale', 'essential oil', 'olio aromaterapia',

      // Aromaterapia
      'diffusore oli essenziali', 'diffusore aroma', 'aromaterapia',
      'umidificatore aromi', 'bruciatore essenze', 'nebulizzatore',

      // Yoga e meditazione
      'tappetino yoga', 'yoga mat', 'cuscino meditazione', 'zafu', 'bolster yoga',
      'blocco yoga', 'cinghia yoga', 'ruota yoga', 'yoga wheel',

      // Incensi e candele naturali
      'incenso', 'bastoncini incenso', 'portaincenso', 'candela aromatica',
      'candela meditazione', 'candela naturale', 'cera soia', 'candela biologica',

      // Prodotti zen
      'fontana zen', 'giardino zen', 'buddha', 'statua zen', 'campana tibetana',
      'singing bowl', 'gong', 'carillon zen', 'sale himalayano',
      'lampada sale', 'himalayan salt lamp', 'cristalli', 'pietre chakra'
    ],
    priority: 5
  }
};

// ============================================================================
// FUNZIONE DI CATEGORIZZAZIONE
// ============================================================================

/**
 * Categorizza un prodotto BigBuy nelle categorie Zenova
 * Restituisce array di categorie o ['exclude'] se il prodotto va escluso
 */
function categorizeProduct(product) {
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const text = `${name} ${description}`;

  // STEP 1: Controlla BLACKLIST - se matcha, ESCLUDI il prodotto
  // Usa word boundary per evitare false positive (es. "rum" in "rumore")
  for (const blacklistWord of BLACKLIST_KEYWORDS) {
    const regex = new RegExp(`\\b${blacklistWord.toLowerCase()}\\b`, 'i');
    if (regex.test(text)) {
      return ['exclude']; // Prodotto da escludere
    }
  }

  // STEP 2: Cerca match con categorie Zenova
  const matchedCategories = [];

  for (const [categoryKey, categoryData] of Object.entries(ZENOVA_CATEGORIES)) {
    for (const keyword of categoryData.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!matchedCategories.includes(categoryKey)) {
          matchedCategories.push(categoryKey);
        }
        break; // Un match per categoria è sufficiente
      }
    }
  }

  // STEP 3: Restituisci categorie trovate
  if (matchedCategories.length > 0) {
    return matchedCategories;
  }

  // STEP 4: Se nessun match, escludi (troppo generico)
  return ['exclude'];
}

// ============================================================================
// SOTTOCATEGORIE ZENOVA
// ============================================================================

const SUBCATEGORIES = {
  'smart-living': {
    'smart-led-illuminazione': [
      'smart led', 'lampadina smart', 'striscia led', 'led wifi', 'led rgb',
      'illuminazione smart', 'smart light', 'led controllato', 'lampada smart',
      'wake-up light', 'wake up light', 'sveglia luce', 'simulazione alba',
      'plafoniera led', 'lampada led', 'luce smart', 'faretto led'
    ],
    'domotica-smart-home': [
      'smart home', 'domotica', 'sensore', 'telecamera wifi', 'campanello smart',
      'termostato smart', 'presa smart', 'interruttore smart', 'hub smart',
      'smart plug', 'smart socket', 'timer smart', 'alexa', 'google home',
      'robot aspirapolvere', 'purificatore aria smart', 'umidificatore smart'
    ]
  },
  'beauty': {
    'makeup': [
      'makeup', 'trucco', 'rossetto', 'mascara', 'fondotinta', 'ombretto',
      'matita', 'cipria', 'blush', 'correttore', 'cosmetico'
    ],
    'skincare': [
      'crema viso', 'siero viso', 'maschera viso', 'gel viso', 'lozione',
      'anti-age', 'anti-rughe', 'contorno occhi', 'struccante', 'detergente viso'
    ],
    'profumi': [
      'profumo', 'eau de toilette', 'eau de parfum', 'fragranza', 'cologne'
    ],
    'corpo': [
      'gel doccia', 'bagnoschiuma', 'crema corpo', 'lozione corpo',
      'scrub corpo', 'olio corpo', 'deodorante', 'sapone'
    ]
  },
  'health-personal-care': {
    'hair-care': [
      'shampoo', 'balsamo', 'maschera capelli', 'tintura capelli',
      'lacca', 'gel capelli', 'mousse capelli', 'siero capelli',
      'piastra', 'arricciacapelli', 'phon', 'asciugacapelli'
    ],
    'barba': [
      'barba', 'dopobarba', 'schiuma barba', 'rasoio', 'trimmer barba'
    ],
    'massaggio-benessere': [
      'massaggiatore', 'massaggio', 'shiatsu', 'pistola massaggiante'
    ],
    'protezione-solare': [
      'protezione solare', 'crema solare', 'after sun', 'autoabbronzante'
    ]
  },
  'tech-innovation': {
    'wearable': [
      'smart watch', 'smartwatch', 'fitness tracker', 'activity tracker',
      'smart band', 'fitness band', 'smart ring'
    ],
    'audio': [
      'auricolari wireless', 'auricolari', 'earbuds', 'tws', 'cuffie bluetooth',
      'cuffie wireless', 'wireless earbuds', 'bluetooth earbuds'
    ],
    'gadget': [
      'gadget tech', 'tech gadget', 'innovazione', 'smart gadget',
      'portable tech', 'mini projector', 'pocket printer', 'drone', 'robot'
    ]
  },
  'natural-wellness': {
    'aromaterapia': [
      'oli essenziali', 'olio essenziale', 'essential oil', 'olio aromaterapia',
      'diffusore oli essenziali', 'diffusore aroma', 'aromaterapia'
    ],
    'yoga-meditazione': [
      'tappetino yoga', 'yoga mat', 'cuscino meditazione', 'zafu', 'bolster yoga',
      'blocco yoga', 'cinghia yoga', 'ruota yoga', 'yoga wheel'
    ],
    'decorazione-zen': [
      'incenso', 'bastoncini incenso', 'portaincenso', 'candela aromatica',
      'fontana zen', 'giardino zen', 'buddha', 'statua zen', 'campana tibetana',
      'lampada sale', 'himalayan salt lamp', 'cristalli', 'pietre chakra'
    ]
  }
};

/**
 * Determina la sottocategoria per filtri frontend
 */
function getProductSubcategory(product) {
  const categories = categorizeProduct(product);

  if (categories.includes('exclude') || categories.length === 0) {
    return null;
  }

  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const text = `${name} ${description}`;

  // Per ogni categoria principale del prodotto
  for (const mainCategory of categories) {
    if (!SUBCATEGORIES[mainCategory]) continue;

    // Cerca la sottocategoria più appropriata
    for (const [subcategoryKey, keywords] of Object.entries(SUBCATEGORIES[mainCategory])) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return subcategoryKey; // Restituisci la prima sottocategoria che matcha
        }
      }
    }
  }

  // Se non trova una sottocategoria specifica, restituisce null
  return null;
}

/**
 * Verifica se un prodotto è valido per Zenova (non escluso)
 */
function isValidZenovaProduct(product) {
  const categories = categorizeProduct(product);
  return !categories.includes('exclude') && categories.length > 0;
}

module.exports = {
  categorizeProduct,
  getProductSubcategory,
  isValidZenovaProduct,
  ZENOVA_CATEGORIES
};
