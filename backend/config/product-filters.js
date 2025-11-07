// Configurazione filtri prodotti BigBuy per Zenova
// Ultimo aggiornamento: 6 Novembre 2025

module.exports = {
  // ===== CATEGORIE BIGBUY SELEZIONATE =====
  // Questi sono gli ID delle categorie BigBuy da importare

  allowedCategories: {
    // Salute e cura della persona
    health: [
      2525, // Aromatherapy & Essential Oils
      3195, // Personal Care
      2523, // Health & Wellness Products
    ],

    // Benessere
    wellness: [
      2616, // Wellness & Relaxation
      2645, // Meditation & Mindfulness
      2847, // Fitness & Yoga
    ],

    // Illuminazione e bellezza
    beauty: [
      2526, // Home Fragrance & Candles
      2511, // Beauty & Cosmetics
      2659, // Decorative Lighting
      2621, // Ambient Lighting
    ],

    // CATEGORIE MOCK (solo per sviluppo/testing)
    mock: [
      456, // Aromatherapy (mock)
      457, // Home Fragrance (mock)
      458, // Mindfulness (mock)
      459, // Smart Lighting (mock)
      460, // Sound Therapy (mock)
      461, // Wellness Tech (mock)
    ]
  },

  // Lista piatta di tutti gli ID (per query rapide)
  get categoryIds() {
    return [
      ...this.allowedCategories.health,
      ...this.allowedCategories.wellness,
      ...this.allowedCategories.beauty,
      ...this.allowedCategories.mock  // Include mock categories per sviluppo
    ];
  },

  // ===== FILTRI PREZZO =====
  priceRange: {
    min: 5,    // Prezzo minimo €5
    max: 300   // Prezzo massimo €300
  },

  // ===== PAROLE CHIAVE (opzionale) =====
  keywords: {
    // Parole da includere (prodotto deve avere almeno una)
    include: [
      'diffusore', 'aromaterapia', 'essenziale',
      'yoga', 'meditazione', 'zen', 'relax',
      'naturale', 'bio', 'organico',
      'lampada', 'candela', 'incenso',
      'benessere', 'wellness', 'beauty'
    ],

    // Parole da escludere (prodotto con queste viene scartato)
    exclude: [
      'elettrodomestico', 'frigorifero', 'lavatrice',
      'computer', 'smartphone', 'tablet',
      'giocattolo', 'bambino', 'baby'
    ]
  },

  // ===== OPZIONI IMPORTAZIONE =====
  import: {
    maxProducts: 100,        // Numero massimo prodotti da importare
    autoUpdate: false,       // Auto-aggiornamento catalogo
    stockMinimum: 1,         // Solo prodotti con stock >= 1
    activeOnly: true         // Solo prodotti attivi su BigBuy
  },

  // ===== MAPPING CATEGORIE ZENOVA =====
  // Come mappare le categorie BigBuy alle categorie del nostro sito
  categoryMapping: {
    2525: 'Aromatherapy',
    3195: 'Self Care',
    2523: 'Wellness',
    2616: 'Mindfulness',
    2645: 'Meditation',
    2847: 'Fitness',
    2526: 'Home Fragrance',
    2511: 'Beauty',
    2659: 'Lighting',
    2621: 'Ambient'
  }
};
