/**
 * Sistema di Categorizzazione Zenova - KEYWORD MATCHING SELETTIVO
 *
 * ESCLUDE automaticamente prodotti non Zenova (pentole, alcolici, cucina generica)
 * INCLUDE solo prodotti delle 5 categorie Zenova
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
  'affettatrice', 'tostapane', 'bollitore elettrico',

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
  // 1. 🏠 SMART LIVING
  'smart-living': {
    keywords: [
      // Illuminazione smart
      'smart led', 'lampadina smart', 'striscia led', 'led wifi', 'alexa', 'google home',
      'led rgb', 'illuminazione smart', 'smart light', 'led controllato',

      // Tech casa
      'smart home', 'domotica', 'sensore', 'telecamera wifi', 'campanello smart',
      'termostato smart', 'presa smart', 'interruttore smart',

      // Gadget tech
      'wireless', 'bluetooth speaker', 'caricatore wireless', 'powerbank',
      'auricolari wireless', 'smart watch', 'fitness tracker'
    ],
    priority: 1
  },

  // 2. 💆 CURA CORPO & SKIN
  'cura-corpo-skin': {
    keywords: [
      // Massaggio
      'massaggiatore', 'massaggio', 'massaggia', 'shiatsu', 'percussion massager',
      'pistola massaggiante', 'roller massaggio', 'foam roller',

      // Cura pelle
      'crema viso', 'crema corpo', 'siero', 'maschera viso', 'peeling',
      'scrub corpo', 'olio corpo', 'lozione corpo', 'balsamo labbra',
      'crema mani', 'crema piedi', 'anti-age', 'anti-rughe',

      // Beauty tools
      'spazzola pulizia viso', 'dermaroller', 'jade roller', 'gua sha',
      'epilatore', 'rasoio elettrico', 'trimmer', 'asciugacapelli',

      // Cosmesi
      'profumo', 'eau de toilette', 'eau de parfum', 'fragranza',
      'cosmetico', 'makeup', 'trucco', 'rossetto', 'mascara',

      // Bagno & relax
      'sali da bagno', 'bomba da bagno', 'sapone naturale', 'spugna konjac'
    ],
    priority: 2
  },

  // 3. 🧘 MEDITAZIONE & ZEN
  'meditazione-zen': {
    keywords: [
      // Yoga & meditazione
      'tappetino yoga', 'yoga mat', 'cuscino meditazione', 'zafu', 'bolster yoga',
      'blocco yoga', 'cinghia yoga', 'ruota yoga',

      // Aromaterapia
      'diffusore oli essenziali', 'diffusore aroma', 'oli essenziali', 'olio essenziale',
      'aromaterapia', 'umidificatore aromi', 'bruciatore essenze',

      // Incensi & candele zen
      'incenso', 'bastoncini incenso', 'portaincenso', 'candela aromatica',
      'candela meditazione', 'candela naturale', 'cera soia',

      // Zen decor
      'fontana zen', 'giardino zen', 'buddha', 'statua zen', 'campana tibetana',
      'singing bowl', 'gong', 'carillon',

      // Relax & wellness
      'maschera occhi', 'eye mask', 'cuscino rilassante', 'termoforo',
      'lampada sale', 'himalayan salt lamp'
    ],
    priority: 3
  },

  // 4. 🎨 DESIGN & ATMOSFERA
  'design-atmosfera': {
    keywords: [
      // Illuminazione design
      'lampada design', 'lampada decorativa', 'luce notturna', 'nightlight',
      'lampada luna', 'moon lamp', 'lampada led decorativa', 'light box',
      'neon sign', 'insegna luminosa', 'lampada proiettore',

      // Profumatori ambiente
      'diffusore ambiente', 'profumatore ambiente', 'bastoncini profumati',
      'reed diffuser', 'spray ambiente', 'fragranza casa', 'pot pourri',

      // Candele design
      'candelabro', 'portacandele design', 'candela design', 'candeliere',

      // Decor atmosfera
      'vaso design', 'scultura decorativa', 'oggetto design', 'decorazione parete',
      'specchio design', 'orologio design', 'cornice foto design',

      // Tessili premium
      'cuscino design', 'plaid design', 'coperta design'
    ],
    priority: 4
  },

  // 5. ☕ GOURMET & TEA
  'gourmet-tea-coffee': {
    keywords: [
      // Tè pregiato
      'tè verde', 'tè nero', 'tè bianco', 'tè oolong', 'tè pu-erh',
      'tè matcha', 'matcha', 'tè giapponese', 'tè cinese', 'tè pregiato',
      'infuso', 'tisana premium', 'tisana bio', 'tisana detox',

      // Accessori tè
      'teiera', 'teapot', 'kyusu', 'gaiwan', 'tazza tè', 'tea cup',
      'infusore tè', 'tea infuser', 'filtro tè', 'tea strainer',
      'bollitore tè', 'tea kettle', 'chasen', 'frusta matcha',
      'set tè', 'tea set', 'cerimonia tè',

      // Caffè gourmet
      'caffè specialty', 'caffè pregiato', 'caffè monorigine', 'caffè arabica',
      'caffè biologico', 'caffè artigianale',

      // Accessori caffè di qualità
      'macchina caffè espresso', 'espresso machine', 'moka design',
      'french press', 'chemex', 'v60', 'aeropress', 'cold brew',
      'macinacaffè', 'coffee grinder', 'tamper', 'milk frother',

      // Chocolateria
      'cioccolato artigianale', 'cioccolato pregiato', 'cioccolato monorigine',
      'praline', 'tartufo cioccolato', 'cacao premium'
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
  for (const blacklistWord of BLACKLIST_KEYWORDS) {
    if (text.includes(blacklistWord.toLowerCase())) {
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

/**
 * Determina la sottocategoria per filtri frontend (opzionale)
 */
function getProductSubcategory(product) {
  const categories = categorizeProduct(product);

  if (categories.includes('exclude')) {
    return null;
  }

  // Restituisci la prima categoria come subcategory
  return categories[0] || null;
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
