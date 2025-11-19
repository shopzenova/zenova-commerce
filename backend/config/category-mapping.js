/**
 * Sistema di Categorizzazione Automatica BigBuy → Zenova
 *
 * Struttura a 3 livelli:
 * - Level 1: Mappatura categorie principali BigBuy (13 categorie FTP)
 * - Level 2: Mappatura sottocategorie BigBuy più comuni (~100 sottocategorie)
 * - Level 3: Keyword matching per categorie non mappate
 */

// ============================================================================
// LEVEL 1: Mappatura Categorie Principali BigBuy → Zenova
// ============================================================================
// Queste sono le 13 categorie disponibili via FTP BigBuy

const mainCategoryMapping = {
  // Casa e Giardino (89.000 prodotti)
  '2399': {
    zenova: ['smart-living', 'design-atmosfera'],
    priority: 'smart-living',
    description: 'Casa | Giardino'
  },

  // Cucina e Gourmet (25.000 prodotti)
  '2403': {
    zenova: ['design-atmosfera'],
    priority: 'design-atmosfera',
    description: 'Cucina | Gourmet'
  },

  // Sport e Fitness (40.000 prodotti)
  '2491': {
    zenova: ['zen-lifestyle', 'benessere'],
    priority: 'zen-lifestyle',
    description: 'Sport | Fitness'
  },

  // Salute e Bellezza (50.000 prodotti)
  '2501': {
    zenova: ['cura-corpo-skin', 'benessere'],
    priority: 'cura-corpo-skin',
    description: 'Salute | Bellezza'
  },

  // Profumeria e Cosmesi (30.000 prodotti)
  '2507': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    description: 'Profumeria | Cosmesi'
  },

  // Moda e Accessori (60.000 prodotti)
  '2570': {
    zenova: ['generale', 'moda'],
    priority: 'generale',
    description: 'Moda | Accessori'
  },

  // Giocattoli (45.000 prodotti)
  '2571': {
    zenova: ['generale', 'giocattoli'],
    priority: 'generale',
    description: 'Giocattoli'
  },

  // Informatica ed Elettronica (70.000 prodotti)
  '2609': {
    zenova: ['smart-living', 'tecnologia'],
    priority: 'smart-living',
    description: 'Informatica | Elettronica'
  },

  // Regali Originali (15.000 prodotti)
  '2662': {
    zenova: ['design-atmosfera', 'generale'],
    priority: 'design-atmosfera',
    description: 'Regali Originali'
  },

  // Televendita (10.000 prodotti)
  '2672': {
    zenova: ['generale'],
    priority: 'generale',
    description: 'Televendita'
  },

  // Outlet e Offerte (20.000 prodotti)
  '2678': {
    zenova: ['generale', 'offerte'],
    priority: 'generale',
    description: 'Outlet | Offerte'
  },

  // Sex Shop (8.000 prodotti)
  '3046': {
    zenova: ['generale', 'adulti'],
    priority: 'generale',
    description: 'Sex Shop'
  },

  // Catalogo Completo (500.000 prodotti)
  '2202': {
    zenova: ['generale'],
    priority: 'generale',
    description: 'Catalogo Completo'
  }
};

// ============================================================================
// LEVEL 2: Mappatura Sottocategorie BigBuy Comuni
// ============================================================================
// Basata su category-ids-mapping.json e analisi prodotti esistenti

const subCategoryMapping = {
  // ========== SALUTE E BELLEZZA ==========

  // Massaggi e Relax
  '2502': {
    zenova: ['cura-corpo-skin', 'meditazione-zen'],
    priority: 'cura-corpo-skin',
    subcategory: 'massaggio-rilassamento',
    keywords: ['massaggiatore', 'massaggio', 'relax', 'benessere']
  },
  '2504': {
    zenova: ['cura-corpo-skin', 'meditazione-zen'],
    priority: 'cura-corpo-skin',
    subcategory: 'massaggio-rilassamento',
    keywords: ['massaggio', 'relax']
  },
  '2506': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'massaggio-rilassamento',
    keywords: ['idromassaggio', 'massaggio piedi']
  },

  // Cura Capelli
  '2520': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['phon', 'asciugacapelli', 'piastra', 'arricciacapelli', 'capelli']
  },
  '2525': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['balsamo', 'shampoo', 'trattamento capelli']
  },
  '2526': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['spray capelli', 'lacca', 'styling']
  },
  '2530': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['phon', 'asciugacapelli']
  },
  '2532': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['spazzola', 'pettine', 'piastra']
  },
  '2535': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-capelli',
    keywords: ['arricciacapelli', 'piastra', 'styler']
  },

  // Depilazione e Cura Pelle
  '2540': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-pelle',
    keywords: ['epilatore', 'rasoio', 'depilazione']
  },
  '2544': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-pelle',
    keywords: ['rasoio elettrico', 'depilatore']
  },
  '2548': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-pelle',
    keywords: ['essenza', 'olio essenziale', 'aromaterapia']
  },
  '2652': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'cura-pelle',
    keywords: ['rasoio', 'barba', 'grooming']
  },

  // Protezione Solare
  '2552': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'protezione-solare',
    keywords: ['protezione solare', 'crema solare', 'spf']
  },
  '2554': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'protezione-solare',
    keywords: ['solare', 'spf', 'protezione viso']
  },
  '2556': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'protezione-corpo',
    keywords: ['protezione corpo', 'crema corpo']
  },
  '2568': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'doposole',
    keywords: ['doposole', 'after sun']
  },

  // Integratori
  '3462': {
    zenova: ['cura-corpo-skin', 'benessere'],
    priority: 'cura-corpo-skin',
    subcategory: 'integratori',
    keywords: ['integratore', 'vitamine', 'supplemento']
  },

  // ========== PROFUMERIA ==========

  // Profumi
  '2508': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'fragranze',
    keywords: ['profumo', 'eau de parfum', 'eau de toilette', 'edp', 'edt']
  },
  '2509': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'fragranze',
    keywords: ['profumo uomo', 'fragranza maschile']
  },
  '2510': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'fragranze',
    keywords: ['profumo donna', 'fragranza femminile']
  },
  '2511': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'fragranze',
    keywords: ['profumo unisex', 'fragranza']
  },

  // Cosmesi
  '2547': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'igiene',
    keywords: ['gel doccia', 'bagnoschiuma', 'sapone']
  },
  '2549': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'igiene',
    keywords: ['gel doccia', 'deodorante']
  },
  '2555': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'labbra',
    keywords: ['balsamo labbra', 'lip balm', 'burro cacao']
  },
  '2569': {
    zenova: ['cura-corpo-skin'],
    priority: 'cura-corpo-skin',
    subcategory: 'labbra',
    keywords: ['balsamo labbra', 'rossetto', 'gloss']
  },

  // ========== CASA E GIARDINO ==========

  // Illuminazione
  '2400': {
    zenova: ['smart-living', 'design-atmosfera'],
    priority: 'smart-living',
    subcategory: 'lampade-luci-led',
    keywords: ['lampada', 'led', 'luce', 'illuminazione']
  },
  '2421': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'lampade-luci-led',
    keywords: ['lampada led', 'smart light', 'luce intelligente']
  },

  // Piscina e Giardino
  '2435': {
    zenova: ['design-atmosfera'],
    priority: 'design-atmosfera',
    subcategory: 'giardino',
    keywords: ['piscina', 'gonfiabile', 'giardino']
  },
  '2440': {
    zenova: ['design-atmosfera'],
    priority: 'design-atmosfera',
    subcategory: 'arredamento-esterno',
    keywords: ['gonfiabile', 'poltrona', 'outdoor']
  },
  '2708': {
    zenova: ['design-atmosfera'],
    priority: 'design-atmosfera',
    subcategory: 'arredamento-esterno',
    keywords: ['sedia', 'sdraio', 'pieghevole', 'spiaggia']
  },
  '2717': {
    zenova: ['design-atmosfera'],
    priority: 'design-atmosfera',
    subcategory: 'arredamento-esterno',
    keywords: ['sedia spiaggia', 'outdoor']
  },
  '2736': {
    zenova: ['smart-living', 'design-atmosfera'],
    priority: 'design-atmosfera',
    subcategory: 'luci-piscina',
    keywords: ['luce piscina', 'led galleggiante', 'solare']
  },

  // Animali Domestici
  '2443': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali',
    keywords: ['cane', 'gatto', 'animali', 'pet']
  },
  '2444': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali-acquari',
    keywords: ['acquario', 'pesci', 'rettili', 'terrario']
  },
  '2445': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali-accessori',
    keywords: ['guinzaglio', 'collare', 'pettorina']
  },
  '2446': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali-cucce',
    keywords: ['cuccia', 'lettino', 'cuscino cane', 'tiragraffi']
  },
  '2447': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali-cibo',
    keywords: ['cibo cane', 'cibo gatto', 'mangiatoia']
  },
  '2448': {
    zenova: ['generale', 'animali'],
    priority: 'generale',
    subcategory: 'animali-giochi',
    keywords: ['giocattolo cane', 'giocattolo gatto', 'puntatore laser']
  },

  // Sicurezza e Domotica
  '2471': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'sicurezza',
    keywords: ['videocamera', 'sorveglianza', 'sicurezza', 'nvr']
  },
  '3209': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'sicurezza',
    keywords: ['videocamera', 'telecamera', 'ip camera']
  },
  '3210': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'sicurezza',
    keywords: ['allarme', 'sensore', 'sicurezza']
  },

  // ========== ELETTRONICA ==========

  // eBook e Accessori
  '2617': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'ebook-tech',
    keywords: ['ebook', 'ereader', 'kobo', 'kindle']
  },
  '2909': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'ebook-tech',
    keywords: ['ebook reader', 'accessori ebook']
  },
  '2937': {
    zenova: ['smart-living'],
    priority: 'smart-living',
    subcategory: 'accessori-tech',
    keywords: ['cover', 'custodia', 'accessorio']
  }
};

// ============================================================================
// LEVEL 3: Keyword Matching per Categorie Non Mappate
// ============================================================================

const keywordMatching = {
  'smart-living': [
    'smart', 'tech', 'tecnologia', 'elettronica', 'informatica', 'led', 'wifi',
    'bluetooth', 'usb', 'caricatore', 'cavo', 'batteria', 'power bank',
    'videocamera', 'telecamera', 'sorveglianza', 'sicurezza', 'domotica',
    'lampada', 'luce', 'illuminazione', 'smart home', 'alexa', 'google home',
    'ebook', 'ereader', 'tablet', 'computer', 'mouse', 'tastiera'
  ],

  'cura-corpo-skin': [
    'crema', 'profumo', 'fragranza', 'eau de', 'edp', 'edt', 'parfum',
    'massaggio', 'massaggiatore', 'relax', 'benessere', 'spa',
    'phon', 'asciugacapelli', 'piastra', 'arricciacapelli', 'capelli',
    'epilatore', 'rasoio', 'depilazione', 'barba', 'grooming',
    'balsamo', 'shampoo', 'bagnoschiuma', 'gel doccia', 'sapone',
    'protezione solare', 'spf', 'solare', 'doposole', 'abbronzante',
    'cosmetico', 'makeup', 'trucco', 'rossetto', 'mascara',
    'integratore', 'vitamina', 'supplemento', 'beauty', 'bellezza'
  ],

  'meditazione-zen': [
    'meditazione', 'zen', 'yoga', 'mindfulness', 'rilassamento',
    'aromaterapia', 'incenso', 'candela', 'diffusore', 'oli essenziali',
    'cuscino meditazione', 'tappetino yoga', 'singing bowl'
  ],

  'design-atmosfera': [
    'arredamento', 'decorazione', 'design', 'vaso', 'quadro', 'cornice',
    'cucina', 'pentola', 'padella', 'utensile', 'posate', 'piatti',
    'bicchiere', 'tazza', 'mug', 'teiera', 'caffettiera',
    'giardino', 'piscina', 'outdoor', 'sedia', 'sdraio', 'ombrellone',
    'gonfiabile', 'galleggiante', 'barbecue', 'grill',
    'regalo', 'idea regalo', 'originale'
  ],

  'zen-lifestyle': [
    'fitness', 'sport', 'allenamento', 'training', 'workout',
    'pesi', 'manubri', 'tapis roulant', 'cyclette', 'attrezzo',
    'yoga', 'pilates', 'stretching', 'elastico fitness',
    'borraccia', 'shaker', 'proteina', 'wellness', 'salute'
  ]
};

// ============================================================================
// FUNZIONE PRINCIPALE DI CATEGORIZZAZIONE
// ============================================================================

/**
 * Determina le categorie Zenova per un prodotto BigBuy
 * @param {Object} product - Prodotto BigBuy con categoryId, name, description
 * @returns {Array<string>} - Array di categorie Zenova (es. ['smart-living', 'design-atmosfera'])
 */
function categorizeProduct(product) {
  const categoryId = product.categoryId?.toString();
  const productName = (product.name || '').toLowerCase();
  const productDescription = (product.description || '').toLowerCase();
  const combinedText = `${productName} ${productDescription}`;

  let categories = [];

  // LEVEL 1: Categoria Principale BigBuy
  if (categoryId && mainCategoryMapping[categoryId]) {
    const mapping = mainCategoryMapping[categoryId];
    categories.push(mapping.priority);
    // Aggiungi anche le categorie secondarie se presenti
    mapping.zenova.forEach(cat => {
      if (cat !== mapping.priority && !categories.includes(cat)) {
        categories.push(cat);
      }
    });
  }

  // LEVEL 2: Sottocategoria BigBuy (più specifica)
  // Se presente una sottocategoria mappata, sovrascrive la categoria principale
  if (categoryId && subCategoryMapping[categoryId]) {
    const subMapping = subCategoryMapping[categoryId];

    // Verifica anche le keyword della sottocategoria per maggiore precisione
    const hasKeywordMatch = subMapping.keywords?.some(keyword =>
      combinedText.includes(keyword.toLowerCase())
    );

    if (hasKeywordMatch || true) { // true = fidati della mappatura anche senza keyword match
      categories = [subMapping.priority];
      // Aggiungi categorie secondarie
      subMapping.zenova.forEach(cat => {
        if (cat !== subMapping.priority && !categories.includes(cat)) {
          categories.push(cat);
        }
      });
    }
  }

  // LEVEL 3: Keyword Matching (solo se non abbiamo ancora categorie o per arricchire)
  if (categories.length === 0 || categories.includes('generale')) {
    for (const [zenovaCategory, keywords] of Object.entries(keywordMatching)) {
      const matchCount = keywords.filter(keyword =>
        combinedText.includes(keyword.toLowerCase())
      ).length;

      // Se trova almeno 2 keyword match, aggiungi la categoria
      if (matchCount >= 2 && !categories.includes(zenovaCategory)) {
        categories.push(zenovaCategory);
      }
    }
  }

  // Fallback: se ancora nessuna categoria, usa 'generale'
  if (categories.length === 0) {
    categories = ['generale'];
  }

  // Ritorna max 3 categorie (la principale + 2 secondarie)
  return categories.slice(0, 3);
}

/**
 * Ottiene la subcategoria specifica per il frontend (per filtri sidebar)
 * @param {Object} product - Prodotto BigBuy
 * @returns {string} - Subcategory string per filtri (es. "2501,2502,2504")
 */
function getProductSubcategory(product) {
  const categoryId = product.categoryId?.toString();

  // Se ha una sottocategoria mappata, usa quella
  if (categoryId && subCategoryMapping[categoryId]) {
    return categoryId;
  }

  // Altrimenti usa la categoria principale
  if (categoryId && mainCategoryMapping[categoryId]) {
    return categoryId;
  }

  // Fallback
  return 'generale';
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  mainCategoryMapping,
  subCategoryMapping,
  keywordMatching,
  categorizeProduct,
  getProductSubcategory
};
