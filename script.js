// Product Data - Will be loaded from backend
let products = [];

// Product Layout - Controls visibility (home/sidebar/hidden)
let productLayout = { home: [], sidebar: [], hidden: [], vetrina2: [] };

// ===== CACHE & LAZY LOADING CONFIG =====
const CACHE_KEY = 'zenova_products_cache';
const CACHE_LAYOUT_KEY = 'zenova_layout_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minuti
const LAZY_LOAD_BATCH_SIZE = 50; // Prodotti per batch
let lazyLoadOffset = 0;
let isLoadingMore = false;
let allProductsLoaded = false;

// =======================
// IMAGE URL HELPER
// =======================

/**
 * Converte percorsi relativi di immagini in URL assoluti
 * @param {string} path - Percorso dell'immagine (relativo o assoluto)
 * @returns {string} URL assoluto dell'immagine
 */
function getAbsoluteImageUrl(path) {
    if (!path) return path;

    // Se path è un array, prendi il primo elemento
    if (Array.isArray(path)) {
        path = path[0];
    }

    // Se non è una stringa, restituisci path così com'è
    if (typeof path !== 'string') {
        return path;
    }

    // Se è già un URL assoluto o data URI
    if (path.startsWith('http') || path.startsWith('data:')) {
        // Le immagini AW (aroma-zone, aiku) richiedono proxy per evitare 403
        if (path.includes('aroma-zone.com') || path.includes('aiku.io') || path.includes('retina.net')) {
            return `https://zenova-commerce-production.up.railway.app/api/proxy-image?url=${encodeURIComponent(path)}`;
        }
        return path;
    }

    // Se è un percorso relativo che inizia con /uploads/, è un file statico locale
    // Restituiscilo così com'è (Vercel servirà questi file statici)
    if (path.startsWith('/uploads/')) {
        return path;
    }

    // Se è un percorso relativo che inizia con /, aggiungi il prefisso del backend
    if (path.startsWith('/')) {
        return 'https://zenova-commerce-production.up.railway.app' + path;
    }

    // Se è un percorso relativo (images/...), aggiungi / davanti
    if (path.startsWith('images/')) {
        return '/' + path;
    }

    return path;
}

// Helper to get product image URL
function getProductImageUrl(product) {
    let imgUrl = null;
    if (product.images && product.images.length > 0) {
        const img = product.images[0];
        imgUrl = typeof img === 'object' ? (img.thumbnail || img.url) : img;
    } else if (product.image) {
        imgUrl = product.image;
    }
    return getAbsoluteImageUrl(imgUrl);
}

// =======================
// CACHE HELPERS
// =======================

function getCachedProducts() {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (isExpired) {
            sessionStorage.removeItem(CACHE_KEY);
            console.log('🗑️ Cache prodotti scaduta');
            return null;
        }

        console.log(`✅ Cache valida (${Math.round((CACHE_DURATION - (Date.now() - timestamp)) / 60000)} min rimanenti)`);
        return data;
    } catch (e) {
        console.warn('⚠️ Errore lettura cache:', e);
        return null;
    }
}

function setCachedProducts(data) {
    try {
        // Skip cache se troppi prodotti (evita QuotaExceededError)
        if (data.length > 500) {
            console.log(`⏭️ Cache skip: ${data.length} prodotti troppi per sessionStorage`);
            return;
        }
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        console.log(`💾 ${data.length} prodotti salvati in cache`);
    } catch (e) {
        console.warn('⚠️ Errore salvataggio cache:', e);
    }
}

function getCachedLayout() {
    try {
        const cached = sessionStorage.getItem(CACHE_LAYOUT_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            sessionStorage.removeItem(CACHE_LAYOUT_KEY);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

function setCachedLayout(data) {
    try {
        sessionStorage.setItem(CACHE_LAYOUT_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('⚠️ Errore salvataggio cache layout:', e);
    }
}

// Skeleton loading per UX migliorata
function showLoadingSkeletons(gridId, count = 12) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const skeletonHTML = `
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-price"></div>
        </div>
    `;

    grid.innerHTML = skeletonHTML.repeat(count);
}

// Aggiungi stili skeleton dinamicamente
(function addSkeletonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .skeleton-card {
            pointer-events: none;
        }
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
        }
        .skeleton-image {
            width: 100%;
            height: 200px;
            margin-bottom: 12px;
        }
        .skeleton-title {
            width: 80%;
            height: 20px;
            margin-bottom: 8px;
        }
        .skeleton-price {
            width: 40%;
            height: 24px;
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
    `;
    document.head.appendChild(style);
})();

// Static products as fallback (kept for offline mode)
const staticProducts = [
    {
        id: 1,
        name: "Olio Essenziale Lavanda",
        category: "Aromatherapy",
        subcategory: "oli-essenziali",
        price: 24.90,
        description: "Olio essenziale puro di lavanda biologica. Perfetto per rilassamento e sonno.",
        icon: "🌿",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop"
    },
    {
        id: 2,
        name: "Diffusore Ultrasonico",
        category: "Aromatherapy",
        subcategory: "diffusori",
        price: 49.90,
        description: "Diffusore elegante con luci LED. Silenzioso e efficace per ogni ambiente.",
        icon: "💧",
        image: "https://images.unsplash.com/photo-1584993766449-a40e2ec95e99?w=600&h=600&fit=crop",
        badge: "Bestseller"
    },
    {
        id: 3,
        name: "Nebulizzatore Premium",
        category: "Aromatherapy",
        subcategory: "nebulizzatori",
        price: 89.90,
        description: "Tecnologia avanzata per diffusione ottimale degli oli essenziali.",
        icon: "✨",
        image: "https://images.unsplash.com/photo-1600428854537-7ea552fb4371?w=600&h=600&fit=crop"
    },
    {
        id: 4,
        name: "Candela Profumata Vaniglia",
        category: "Home Fragrance",
        subcategory: "candele",
        price: 34.90,
        description: "Candela in cera di soia naturale con fragranza di vaniglia e legno di sandalo.",
        icon: "🕯️",
        image: "https://images.unsplash.com/photo-1602874801006-2c9a268d0d6e?w=600&h=600&fit=crop"
    },
    {
        id: 5,
        name: "Lampada di Sale Himalayano",
        category: "Home Fragrance",
        subcategory: "lampade-sale",
        price: 45.90,
        description: "Autentica lampada di sale con effetto ionizzante e luce calda.",
        icon: "🧂",
        image: "https://images.unsplash.com/photo-1578332617099-390b6a6e8b8b?w=600&h=600&fit=crop",
        badge: "Nuovo"
    },
    {
        id: 6,
        name: "Incensi Naturali Sandalo",
        category: "Home Fragrance",
        subcategory: "incensi",
        price: 19.90,
        description: "Set di 50 bastoncini di incenso naturale al legno di sandalo.",
        icon: "🌿",
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop"
    },
    {
        id: 7,
        name: "Tappetino Yoga Premium",
        category: "Mindfulness",
        subcategory: "yoga",
        price: 54.90,
        description: "Tappetino yoga ecologico in gomma naturale, antiscivolo e confortevole.",
        icon: "🧘",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop"
    },
    {
        id: 8,
        name: "Cuscino Meditazione Zafu",
        category: "Mindfulness",
        subcategory: "meditazione",
        price: 39.90,
        description: "Cuscino rotondo tradizionale per meditazione, imbottitura in grano saraceno.",
        icon: "🪷",
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=600&fit=crop",
        badge: "In Offerta"
    },
    {
        id: 9,
        name: "Massaggiatore Smart Cervicale",
        category: "Mindfulness",
        subcategory: "massaggiatori",
        price: 79.90,
        description: "Massaggiatore intelligente con controllo app e funzione calore.",
        icon: "💆",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop"
    },
    {
        id: 10,
        name: "Lampada Smart RGB",
        category: "Smart Lighting",
        subcategory: "luci-smart",
        price: 64.90,
        description: "Lampada Wi-Fi controllabile da app con 16 milioni di colori.",
        icon: "💡",
        image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=600&fit=crop"
    },
    {
        id: 11,
        name: "Lampada Sensoriale Aurora",
        category: "Smart Lighting",
        subcategory: "lampade-sensoriali",
        price: 99.90,
        description: "Proiettore di luci aurora boreale con suoni rilassanti integrati.",
        icon: "🌈",
        image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop"
    },
    {
        id: 12,
        name: "Campana Tibetana Artigianale",
        category: "Sound Therapy",
        subcategory: "campane-tibetane",
        price: 69.90,
        description: "Campana tibetana fatta a mano con batacchio in legno incluso.",
        icon: "🔔",
        image: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=600&h=600&fit=crop",
        badge: "Bestseller"
    },
    {
        id: 13,
        name: "Sound Machine White Noise",
        category: "Sound Therapy",
        subcategory: "sound-machine",
        price: 59.90,
        description: "Generatore di suoni rilassanti con 20 tracce naturali.",
        icon: "🎵",
        image: "https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&h=600&fit=crop"
    },
    {
        id: 14,
        name: "Purificatore d'Aria HEPA",
        category: "Wellness Tech",
        subcategory: "purificatori",
        price: 149.90,
        description: "Purificatore con filtro HEPA H13 e ionizzatore integrato.",
        icon: "🌬️",
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"
    },
    {
        id: 15,
        name: "Umidificatore Smart",
        category: "Wellness Tech",
        subcategory: "umidificatori",
        price: 89.90,
        description: "Umidificatore ultrasonico con controllo umidità automatico.",
        icon: "💦",
        image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=600&fit=crop",
        badge: "Nuovo"
    },
    {
        id: 16,
        name: "Diffusore Smart Alexa",
        category: "Aromatherapy",
        subcategory: "diffusori",
        price: 119.90,
        description: "Diffusore intelligente con controllo vocale Alexa e Google Home, programmazione automatica.",
        icon: "🎙️",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop"
    },
    {
        id: 17,
        name: "Smart Speaker Meditazione",
        category: "Sound Therapy",
        subcategory: "sound-machine",
        price: 159.90,
        description: "Speaker intelligente con 500+ meditazioni guidate, suoni binaurali e controllo app dedicata.",
        icon: "🔊",
        image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop"
    },
    {
        id: 18,
        name: "Smartwatch Wellness Pro",
        category: "Wellness Tech",
        subcategory: "wearables",
        price: 249.90,
        description: "Smartwatch per tracking stress, HRV, qualità sonno, respirazione guidata e mindfulness.",
        icon: "⌚",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop"
    },
    {
        id: 19,
        name: "Anello Smart Sleep Tracker",
        category: "Wellness Tech",
        subcategory: "wearables",
        price: 299.90,
        description: "Anello intelligente per monitoraggio avanzato del sonno, temperatura corporea e recupero.",
        icon: "💍",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=600&h=600&fit=crop"
    },
    {
        id: 20,
        name: "Lampada Circadiana Smart",
        category: "Smart Lighting",
        subcategory: "luci-smart",
        price: 179.90,
        description: "Lampada che simula il ciclo solare naturale per migliorare sonno e energia durante il giorno.",
        icon: "☀️",
        image: "https://images.unsplash.com/photo-1565183928294-7d22ff5c4212?w=600&h=600&fit=crop",
        badge: "Bestseller"
    },
    {
        id: 21,
        name: "Occhiali Light Therapy",
        category: "Wellness Tech",
        subcategory: "light-therapy",
        price: 199.90,
        description: "Occhiali per terapia della luce contro jet-lag, disturbi stagionali e per boost energetico.",
        icon: "🕶️",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop"
    },
    {
        id: 22,
        name: "Braccialetto Respirazione Zen",
        category: "Mindfulness",
        subcategory: "wearables-mindfulness",
        price: 79.90,
        description: "Dispositivo indossabile che vibra dolcemente per guidare la respirazione e ridurre stress.",
        icon: "📿",
        image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop"
    },
    {
        id: 23,
        name: "Tappetino Yoga Smart",
        category: "Mindfulness",
        subcategory: "yoga",
        price: 189.90,
        description: "Tappetino con sensori di pressione e app per correzione posture in tempo reale.",
        icon: "🤸",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop"
    },
    {
        id: 24,
        name: "Specchio Smart Yoga",
        category: "Mindfulness",
        subcategory: "smart-mirror",
        price: 1299.90,
        description: "Specchio interattivo con lezioni live di yoga, pilates e meditazione. AI personal trainer.",
        icon: "🪞",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop"
    },
    {
        id: 25,
        name: "Monitor Qualità Aria Smart",
        category: "Wellness Tech",
        subcategory: "purificatori",
        price: 129.90,
        description: "Monitora CO2, VOC, PM2.5, temperatura e umidità. Notifiche app e integrazione smart home.",
        icon: "🌡️",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"
    },
    {
        id: 26,
        name: "Termometro Ambientale Smart",
        category: "Wellness Tech",
        subcategory: "smart-sensors",
        price: 59.90,
        description: "Sensore smart per temperatura e umidità con storico dati e automazioni.",
        icon: "🌡️",
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop"
    },
    {
        id: 27,
        name: "Bilancia Smart Wellness",
        category: "Wellness Tech",
        subcategory: "smart-health",
        price: 89.90,
        description: "Bilancia intelligente che misura peso, massa grassa, muscolare, idratazione e metabolismo.",
        icon: "⚖️",
        image: "https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=600&h=600&fit=crop"
    },
    {
        id: 28,
        name: "Ionizzatore Portatile",
        category: "Wellness Tech",
        subcategory: "ionizzatori",
        price: 69.90,
        description: "Ionizzatore personale USB per purificare aria intorno a te. Perfetto per ufficio e viaggi.",
        icon: "⚡",
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=600&fit=crop"
    },
    {
        id: 29,
        name: "Cuffie Meditazione Neurosensoriali",
        category: "Sound Therapy",
        subcategory: "sound-machine",
        price: 349.90,
        description: "Cuffie con tecnologia neurosensoriale per meditazione profonda e miglioramento focus.",
        icon: "🎧",
        image: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop"
    },
    {
        id: 30,
        name: "Pod Meditazione Immersiva",
        category: "Mindfulness",
        subcategory: "meditazione",
        price: 2499.90,
        description: "Capsula di meditazione con luci, suoni 3D, aromaterapia e vibrazione per esperienza totale.",
        icon: "🛸",
        image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&h=600&fit=crop"
    }
];

// ============ BACKEND INTEGRATION ============

/**
 * Map backend product to frontend format
 */
function mapBackendProductToFrontend(backendProduct) {
    // Extract first image URL
    const imageUrl = backendProduct.image ||
        (backendProduct.images && backendProduct.images.length > 0
            ? backendProduct.images[0]
            : null);

    // === MAPPATURA AUTOMATICA CATEGORIE BIGBUY ===
    const bigbuyCategory = backendProduct.category ? String(backendProduct.category) : '';
    let category = 'Prodotti';
    let subcategory = bigbuyCategory; // Usa ESATTAMENTE la categoria BigBuy
    let icon = '✨';

    // Assegna la categoria principale in base alla sottocategoria BigBuy
    if (bigbuyCategory === '2609,2617,2909' || bigbuyCategory === '2609,2617,2937') {
        category = 'Smart Living';
        icon = '📱';
    } else if (bigbuyCategory && bigbuyCategory.includes('2399')) {
        // Tutti i prodotti Home & Garden (categoria BigBuy 2399)
        category = 'Smart Living';

        // Icona specifica per lampade LED
        if (bigbuyCategory === '2399,2400,2421') {
            icon = '💡';
        } else {
            icon = '🏡';
        }
    } else if (bigbuyCategory === 'Home & Garden') {
        category = 'Smart Living';
        icon = '🏡';
    } else if (bigbuyCategory === '2501,2502,2504') {
        category = 'Meditazione e Zen';
        icon = '💆';
    } else if ((bigbuyCategory && bigbuyCategory.startsWith('2501')) ||
               bigbuyCategory === '2507,2508,2510') {
        category = 'Cura del Corpo e Skin';

        // Icone specifiche per protezione solare
        if (bigbuyCategory && bigbuyCategory.includes('2552')) {
            icon = '☀️';
        } else if (bigbuyCategory === '2507,2508,2510') {
            icon = '🌺';
        } else if (bigbuyCategory === '2501,2540,2546') {
            icon = '🤲';
        }
    }

    // Keep Zenova categories from backend for filtering
    const zenovaSubcategory = backendProduct.zenovaSubcategory || null;
    const zenovaCategory = backendProduct.zenovaCategory || null;

    return {
        id: backendProduct.id,
        sku: backendProduct.sku || backendProduct.id,
        name: backendProduct.name,
        category: category,
        subcategory: subcategory,
        price: backendProduct.retailPrice || backendProduct.price || 0,
        description: backendProduct.description || '',
        icon: icon,
        image: imageUrl,
        // Keep backend data for cart/checkout
        bigbuyId: backendProduct.id,
        images: backendProduct.images || [],
        stock: backendProduct.stock || 0,
        brand: backendProduct.brand || 'Zenova',
        ean: backendProduct.ean,
        dimensions: backendProduct.dimensions,
        weight: backendProduct.weight,
        // Zenova categories for filtering
        zenovaSubcategory: zenovaSubcategory,
        zenovaCategory: zenovaCategory,
        zenovaCategories: zenovaSubcategory ? [zenovaSubcategory] : []
    };
}

/**
 * Get icon for category
 */
function getIconForCategory(category) {
    const iconMap = {
        'Aromatherapy': '🌿',
        'Home Fragrance': '🕯️',
        'Mindfulness': '🧘',
        'Smart Lighting': '💡',
        'Sound Therapy': '🔔',
        'Wellness Tech': '🌬️',
        'Natural Skincare': '🌸',
        'Fragrances': '🌺',
        'Apparel': '👕',
        'Tea & Infusions': '🍵'
    };
    return iconMap[category] || '✨';
}

/**
 * Load products from backend OR static JSON (con CACHE)
 */
async function loadProductsFromBackend() {
    console.log('🔄 Caricamento prodotti...');

    // === STEP 1: Prova a caricare dalla cache ===
    const cachedProducts = getCachedProducts();
    const cachedLayout = getCachedLayout();

    if (cachedProducts && cachedLayout) {
        console.log('⚡ Caricamento ISTANTANEO da cache!');
        products = cachedProducts;
        productLayout = cachedLayout;
        return true;
    }

    try {
        // Check if ZenovaAPI is available (backend mode)
        if (typeof ZenovaAPI !== 'undefined') {
            // BACKEND MODE - Use API
            console.log('📡 Modalità backend - carico da API');

            // Load layout first (to know which products to hide)
            console.log('📂 Caricamento layout prodotti...');
            productLayout = await ZenovaAPI.getLayout();
            setCachedLayout(productLayout);
            console.log('✅ Layout caricato:', {
                inVetrina: productLayout.home.length,
                nascosti: productLayout.hidden.length
            });

            // Call backend API (load all products including Health)
            const backendProducts = await ZenovaAPI.getProducts(1, 10000);

            if (backendProducts && backendProducts.length > 0) {
                console.log(`✅ Ricevuti ${backendProducts.length} prodotti dal backend`);

                // Map backend products to frontend format
                const mappedProducts = backendProducts
                    .map(mapBackendProductToFrontend)
                    .filter(p => p !== null);

                // Filter out HIDDEN products (not visible anywhere)
                products = mappedProducts.filter(p => {
                    const isHidden = productLayout.hidden.includes(p.id);
                    if (isHidden) {
                        console.log(`🚫 Prodotto nascosto: ${p.name}`);
                    }
                    return !isHidden;
                });

                // Salva in cache
                setCachedProducts(products);

                console.log('✅ Prodotti convertiti e pronti:', products.length);
                console.log(`🚫 Prodotti nascosti: ${mappedProducts.length - products.length}`);
                console.log('📦 Tutte le categorie BigBuy caricate correttamente');
                return true;
            }
        }

        // STATIC MODE - Load from Railway API (products.json troppo grande per Vercel)
        console.log('📦 Modalità statica - carico da Railway API');

        // Load product layout for featured/home/hidden
        try {
            const layoutResponse = await fetch('./product-layout.json');
            productLayout = await layoutResponse.json();
            setCachedLayout(productLayout);
            console.log('✅ Layout caricato:', {
                home: productLayout.home?.length || 0,
                featured: productLayout.featured?.length || 0,
                hidden: productLayout.hidden?.length || 0
            });
        } catch (e) {
            console.warn('⚠️  product-layout.json non trovato, uso valori di default');
        }

        // Carica da Railway API invece di file statico (o localhost se locale)
        const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:3000/api'
          : 'https://zenova-commerce-production.up.railway.app/api';
        const response = await fetch(`${apiUrl}/products?pageSize=5000`);
        const jsonResponse = await response.json();

        // L'API restituisce {success: true, data: [...]} oppure array diretto
        const jsonProducts = jsonResponse.data || jsonResponse;

        if (jsonProducts && jsonProducts.length > 0) {
            console.log(`✅ Caricati ${jsonProducts.length} prodotti dall'API Railway`);

            // Filter only visible products
            products = jsonProducts
                .filter(p => p.visible !== false && p.zone !== 'hidden')
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    category: p.zenovaCategory || p.category,
                    subcategory: p.zenovaSubcategory || p.subcategory,
                    price: parseFloat(p.price) || 0,
                    retailPrice: parseFloat(p.retailPrice) || parseFloat(p.price) || 0,
                    stock: p.stock || 0,
                    image: p.image || (p.images && p.images[0]) || '',
                    images: p.images || [p.image],
                    active: p.active !== false,
                    zone: p.zone || 'home',
                    weight: p.weight || 0,
                    weightUnit: p.weightUnit || null
                }));

            // Salva in cache
            setCachedProducts(products);

            console.log('✅ Prodotti pronti:', products.length);
            return true;
        }

        // Fallback to static products
        console.warn('⚠️ Nessun prodotto caricato, uso prodotti statici di esempio');
        products = staticProducts;
        return false;

    } catch (error) {
        console.error('❌ Errore caricamento prodotti:', error);
        console.log('📦 Fallback: uso prodotti statici');
        products = staticProducts;
        return false;
    }
}

// Cart State
let cart = [];

// Wishlist State
let wishlist = [];

// ============ GLOBAL CHECKOUT FUNCTION ============
// This function is called directly from the button's onclick attribute
window.handleCheckoutClick = async function() {
    console.log('🛒 handleCheckoutClick chiamata!');
    console.log('📦 Carrello:', cart);

    if (cart.length === 0) {
        alert('Il tuo carrello è vuoto. Aggiungi dei prodotti prima di procedere.');
        return;
    }

    // Direct redirect to checkout (validation bypassed for production)
    console.log('➡️ Redirect diretto a checkout.html');
    window.location.href = 'checkout.html';
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Mostra skeleton loading SUBITO (prima di caricare i dati)
    const productsGrid = document.getElementById('productsGrid');
    const featuredGrid = document.getElementById('featuredProductsGrid');

    if (productsGrid) {
        showLoadingSkeletons('productsGrid', 12);
    }
    if (featuredGrid) {
        showLoadingSkeletons('featuredProductsGrid', 8);
    }

    // Load products from backend (usa cache se disponibile)
    await loadProductsFromBackend();

    // Then render and setup everything
    // Check if we're on prodotti.html or index.html
    if (productsGrid) {
        // We're on prodotti.html - render all products
        console.log('📄 Detected prodotti.html - rendering all products');

        // Controlla se c'è un parametro di ricerca nell'URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery) {
            console.log('🔍 Ricerca da URL:', searchQuery);
            // Rimuovi il parametro dall'URL (pulizia)
            window.history.replaceState({}, '', window.location.pathname + window.location.hash);
            // Mostra risultati ricerca
            setTimeout(() => {
                window.showSearchResultsInGrid(searchQuery);
            }, 100);
        } else if (window.location.hash) {
            // Hash presente: renderizza subito i prodotti della sottocategoria
            // Evita race condition con requestIdleCallback di renderProducts()
            const hashSubcat = window.location.hash.substring(1).split('&')[0];
            console.log('🔗 Hash trovato al caricamento:', hashSubcat);
            if (hashSubcat) renderProductsByCategory(hashSubcat);
        } else {
            renderProducts();
        }
    } else {
        // We're on index.html - render only featured
        renderFeaturedProducts();
    }
    loadCart();
    loadWishlist();
    setupEventListeners();
    // setupCategorySidebar(); // REMOVED - sidebar.js handles category accordion
    initDarkMode();

    // ✅ FIX: Inizializza click sulle card SUBITO dopo il rendering
    makeProductCardsClickable();
    setupProductDetailModal();
    setupSearch();

    // Wait for DOM to be fully ready, then apply filtering
    setTimeout(() => {
        console.log('⏰ Timeout reached, checking products in DOM...');
        const cardsCheck = document.querySelectorAll('.product-card');
        console.log(`🔍 Cards in DOM: ${cardsCheck.length}`);

        // Update category counters with actual product counts
        if (typeof window.updateCategoryCounters === 'function') {
            window.updateCategoryCounters();
        }

        // Apply hash-based filtering AFTER products are rendered
        if (typeof window.autoOpenCategoryFromHash === 'function' && window.location.hash) {
            console.log('🎯 Calling autoOpenCategoryFromHash (sidebar only) after products loaded');
            window.autoOpenCategoryFromHash();
        } else {
            // Se non c'è un hash nell'URL, applica il filtro "Tutti i Prodotti" (4 per categoria)
            console.log('📊 Nessun hash o hash vuoto: applico filtro "Tutti i Prodotti" (4 per categoria)');
            filterProductsBySubcategory('all');
        }
    }, 500);
});

// Auto-open category and product from hash
window.autoOpenCategoryFromHash = function() {
    const hash = window.location.hash.substring(1); // Remove #
    if (!hash) return;

    console.log('🎯 Processing hash:', hash);

    // Check if hash contains &product=
    const parts = hash.split('&');
    const subcategory = parts[0];
    let productId = null;

    // Look for product= parameter
    for (let part of parts) {
        if (part.startsWith('product=')) {
            productId = part.split('=')[1];
            break;
        }
    }

    // Map subcategories to main categories (allineato con sidebar prodotti.html)
    const subcategoryToCategory = {
        // Home Ambience
        'smart-led': 'home-ambience',
        'smart-led-illuminazione': 'home-ambience',
        'domotica': 'home-ambience',
        'domotica-smart-home': 'home-ambience',
        'lampade-sale': 'home-ambience',
        'portacandele-vetro': 'home-ambience',
        'portacandele-selenite': 'home-ambience',
        'lampade-selenite': 'home-ambience',
        'cupole-luminose': 'home-ambience',
        'lampade-touch': 'home-ambience',
        'copriletti-arazzi': 'home-ambience',
        'fiori-sapone': 'home-ambience',
        // Profumi e Fragranze
        'spray-ambienti': 'profumi-fragranze',
        // Massaggio e Benessere
        'set-massaggio': 'massaggio-benessere',
        'rulli-viso': 'massaggio-benessere',
        // Natural Wellness
        'oli-essenziali': 'natural-wellness',
        'oli-per-fragranza': 'natural-wellness',
        'candele-profumate': 'natural-wellness',
        'candele-gel-profumati-sali-bagno': 'natural-wellness',
        'diffusori-aromatici': 'natural-wellness',
        'diffusori-oli': 'natural-wellness',
        'wax-melts': 'natural-wellness',
        'pietre-preziose': 'natural-wellness',
        'buddha-collezione': 'natural-wellness',
        'incenso': 'natural-wellness',
        'incenso-riflusso': 'natural-wellness',
        'bruciatori-oli': 'natural-wellness',
        'vestiario-wellness': 'natural-wellness',
        'kit-benessere-cofanetti-regalo': 'natural-wellness'
    };

    // Open the parent category in sidebar if subcategory is present
    if (subcategory && subcategoryToCategory[subcategory]) {
        const mainCategory = subcategoryToCategory[subcategory];
        console.log(`📂 Opening parent category "${mainCategory}" for subcategory "${subcategory}"`);

        // Find the category button and open it manually
        const categoryBtn = document.querySelector(`.category-btn[data-category="${mainCategory}"]`);
        if (categoryBtn) {
            const categoryItem = categoryBtn.parentElement;
            const subcategoryList = categoryItem.querySelector('.subcategory-list');

            // Close all other categories first
            document.querySelectorAll('.category-item').forEach(item => {
                if (item !== categoryItem) {
                    item.classList.remove('active');
                    const sublist = item.querySelector('.subcategory-list');
                    if (sublist) sublist.style.maxHeight = '0px';
                }
            });

            // Open this category
            categoryItem.classList.add('active');
            if (subcategoryList) {
                subcategoryList.style.maxHeight = '500px';
            }
            console.log('🔓 Category opened in sidebar');
        } else {
            console.log('⚠️ Category button not found for:', mainCategory);
        }

        // Highlight the subcategory link
        setTimeout(() => {
            const subcategoryLink = document.querySelector(`.subcategory-link[data-subcategory="${subcategory}"]`);
            if (subcategoryLink) {
                // Remove active from all subcategory links
                document.querySelectorAll('.subcategory-link').forEach(link => link.classList.remove('active'));
                // Add active to current
                subcategoryLink.classList.add('active');
                console.log('✅ Subcategory link highlighted');
            } else {
                console.log('⚠️ Subcategory link not found for:', subcategory);
            }
        }, 300);
    }

    // Filter by subcategory if present
    if (subcategory) {
        console.log('📂 Filtering products for subcategory:', subcategory);
        if (typeof window.renderProductsByCategory === 'function') {
            window.renderProductsByCategory(subcategory);
        } else {
            filterProductsBySubcategory(subcategory);
        }
    }

    // Open product modal if productId present
    if (productId) {
        console.log('🛍️ Opening product:', productId);
        // Wait for products to be filtered and modal function to be ready
        const tryOpenModal = (attempts = 0) => {
            if (attempts > 10) {
                console.error('❌ Failed to open product modal after 10 attempts');
                return;
            }

            if (typeof openProductDetailModal === 'function') {
                console.log('✅ Opening product modal, attempt:', attempts + 1);
                openProductDetailModal(productId);
            } else {
                console.log('⏳ Waiting for modal function... attempt:', attempts + 1);
                setTimeout(() => tryOpenModal(attempts + 1), 300);
            }
        };

        setTimeout(() => tryOpenModal(), 800);
    }
};

// Filter Products By Subcategory - OTTIMIZZATO per performance
window.filterProductsBySubcategory = function(subcategory) {
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    // Pre-calcola le categorie di ricerca una sola volta
    const searchCategories = subcategory !== 'all' ? subcategory.split(',').map(s => s.trim()) : null;

    // Batch DOM updates con requestAnimationFrame
    requestAnimationFrame(() => {
        if (subcategory === 'all') {
            // TUTTI I PRODOTTI: mostra solo 4 prodotti per categoria
            const cardsBySubcategory = {};

            // Prima passata: raggruppa le card (senza modificare il DOM)
            productCards.forEach(card => {
                const cardSubcategory = card.getAttribute('data-subcategory');
                if (!cardSubcategory) return;

                if (!cardsBySubcategory[cardSubcategory]) {
                    cardsBySubcategory[cardSubcategory] = [];
                }
                cardsBySubcategory[cardSubcategory].push(card);
            });

            // Seconda passata: aggiorna il DOM in batch
            const toShow = [];
            const toHide = [];

            Object.values(cardsBySubcategory).forEach(cards => {
                // Ordina per prezzo (usa data attribute se disponibile per velocità)
                cards.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.price) || parseFloat(a.querySelector('.product-price')?.textContent.replace('€', '').replace(',', '.')) || 0;
                    const priceB = parseFloat(b.dataset.price) || parseFloat(b.querySelector('.product-price')?.textContent.replace('€', '').replace(',', '.')) || 0;
                    return priceA - priceB;
                });

                cards.forEach((card, index) => {
                    if (index < 4) {
                        toShow.push(card);
                        visibleCount++;
                    } else {
                        toHide.push(card);
                    }
                });
            });

            // Applica modifiche DOM in batch
            toShow.forEach(card => card.style.display = 'block');
            toHide.forEach(card => card.style.display = 'none');

        } else {
            // SOTTOCATEGORIA SPECIFICA: mostra TUTTI i prodotti matching
            const toShow = [];
            const toHide = [];

            productCards.forEach(card => {
                const cardSubcategory = card.getAttribute('data-subcategory');

                // Match veloce
                let hasMatch = false;
                if (cardSubcategory === subcategory) {
                    hasMatch = true;
                } else if (cardSubcategory) {
                    const categories = cardSubcategory.split(',');
                    hasMatch = searchCategories.some(searchCat =>
                        categories.includes(searchCat)
                    );
                }

                if (hasMatch) {
                    toShow.push(card);
                    visibleCount++;
                } else {
                    toHide.push(card);
                }
            });

            // Ordina per prezzo crescente
            toShow.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price) || 0;
                const priceB = parseFloat(b.dataset.price) || 0;
                return priceA - priceB;
            });

            // Applica modifiche DOM in batch
            toHide.forEach(card => card.style.display = 'none');

            // Riordina nel DOM per prezzo crescente
            const grid = document.getElementById('productsGrid');
            if (grid) {
                toShow.forEach(card => {
                    card.style.display = 'block';
                    grid.appendChild(card); // Sposta in fondo = nuovo ordine
                });
            }
        }
    });
};

// ===== PRODUCT CARD CREATION =====

/**
 * Create a product card element
 */
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-subcategory', product.zenovaSubcategory || product.subcategory);
    productCard.setAttribute('data-product-id', product.id);
    productCard.setAttribute('data-price', product.retailPrice || product.price || 0); // Per ordinamento veloce

    const isInWishlist = wishlist.some(item => item.id === product.id);
    const wishlistClass = isInWishlist ? 'in-wishlist' : '';
    const wishlistIcon = isInWishlist ? '♥' : '♡';

    const productPrice = (product.retailPrice && product.retailPrice > 0) ? product.retailPrice.toFixed(2) : (product.price && product.price > 0) ? product.price.toFixed(2) : '0.00';

    // Get category name (support both zenovaCategory and category)
    const categoryName = product.zenovaCategory || product.category || 'Prodotti';
    const displayCategory = categoryName
        .replace('beauty', 'Beauty')
        .replace('health-personal-care', 'Health & Personal Care')
        .replace('smart-living', 'Smart Living')
        .replace('natural-wellness', 'Benessere Naturale')
        .replace('tech', 'Tech Innovation');

    // Get thumbnail for grid (small, fast loading) and full image for modal
    let thumbnailUrl, fullImageUrl;
    if (product.images && product.images.length > 0) {
        const img = product.images[0];
        if (typeof img === 'object') {
            thumbnailUrl = img.thumbnail || img.url; // Use thumbnail if available
            fullImageUrl = img.url; // Full HD for modal
        } else {
            thumbnailUrl = fullImageUrl = img; // Old format: string URL
        }
    } else if (product.image) {
        thumbnailUrl = fullImageUrl = product.image; // Fallback to old format
    }

    // Converti percorsi relativi in URL assoluti
    thumbnailUrl = getAbsoluteImageUrl(thumbnailUrl);
    fullImageUrl = getAbsoluteImageUrl(fullImageUrl);

    productCard.innerHTML = `
        ${product.badge ? `<div class="product-badge product-badge-${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</div>` : ''}
        <button class="product-card-wishlist-btn ${wishlistClass}" data-product-id="${product.id}">
            ${wishlistIcon}
        </button>
        <div class="product-image">
            ${thumbnailUrl ? `<div class="img-skeleton"></div><img src="${thumbnailUrl}" alt="${product.name}" loading="lazy" decoding="async" onload="this.style.opacity=1;if(this.previousElementSibling)this.previousElementSibling.remove()" onerror="this.dataset.retries=(parseInt(this.dataset.retries||0)+1);if(this.dataset.retries<2){setTimeout(()=>{this.src=this.src+'&r='+this.dataset.retries},1500)}else{this.style.display='none';if(this.previousElementSibling)this.previousElementSibling.innerHTML='📦'}" style="opacity:0;transition:opacity 0.3s">` : (product.icon || '📦')}
        </div>
        <div class="product-info">
            <div class="product-category">${displayCategory}</div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-footer">
                <span class="product-price">€${productPrice}</span>
                ${(product.stock === 0 || product.available === false) ?
                    `<button class="add-to-cart-btn" disabled style="opacity:0.5;cursor:not-allowed;background:#ccc;color:#666;">Non disponibile</button>` :
                    `<button class="add-to-cart-btn" data-product-id="${product.id}">Aggiungi al carrello</button>`
                }
            </div>
        </div>
    `;

    // Add event listeners
    const wishlistBtn = productCard.querySelector('.product-card-wishlist-btn');
    const cartBtn = productCard.querySelector('.add-to-cart-btn');

    wishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(product.id);
        updateProductCardsWishlist();
    });

    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!cartBtn.disabled) addToCart(product.id);
    });

    // Open product detail modal when clicking on card
    productCard.addEventListener('click', () => {
        openProductDetailModal(product.id);
    });

    return productCard;
}

// ===== RENDER PRODUCTS =====

/**
 * Render featured products (ONLY for homepage - index.html)
 * Vetrina 1: 5 prodotti (Best Seller)
 * Vetrina 2: 10 prodotti (Scopri Anche)
 */
function renderFeaturedProducts() {
    const vetrina1Grid = document.getElementById('vetrina1Grid');
    const vetrina2Grid = document.getElementById('vetrina2Grid');

    // Fallback to old grid if new ones don't exist
    const featuredGrid = document.getElementById('featuredProductsGrid');

    if (!vetrina1Grid && !vetrina2Grid && !featuredGrid) return; // Not on homepage

    console.log('🏠 Rendering vetrine for homepage...');

    // === VETRINA 1 (5 prodotti) ===
    if (vetrina1Grid) {
        vetrina1Grid.innerHTML = '';

        // Get products for vetrina 1 (use "home" array, limit to 5)
        const vetrina1Products = products.filter(p => {
            if (productLayout.home.length > 0) {
                return productLayout.home.includes(p.id);
            }
            return p.zone === 'home';
        }).slice(0, 5); // Limit to 5

        console.log(`✨ Vetrina 1: ${vetrina1Products.length} prodotti`);

        if (vetrina1Products.length === 0) {
            vetrina1Grid.innerHTML = '<div class="no-products-message"><p>Nessun prodotto in vetrina 1</p></div>';
        } else {
            vetrina1Products.forEach(product => {
                const card = createProductCard(product);
                vetrina1Grid.appendChild(card);
            });
        }
    }

    // === VETRINA 2 (10 prodotti) ===
    if (vetrina2Grid) {
        vetrina2Grid.innerHTML = '';

        // Get products for vetrina 2 (use "vetrina2" or "sidebar" array, limit to 10)
        const vetrina2Products = products.filter(p => {
            if (productLayout.vetrina2 && productLayout.vetrina2.length > 0) {
                return productLayout.vetrina2.includes(p.id);
            }
            if (productLayout.sidebar.length > 0) {
                return productLayout.sidebar.includes(p.id);
            }
            return p.zone === 'sidebar';
        }).slice(0, 10); // Limit to 10

        console.log(`✨ Vetrina 2: ${vetrina2Products.length} prodotti`);

        if (vetrina2Products.length === 0) {
            vetrina2Grid.innerHTML = '<div class="no-products-message"><p>Nessun prodotto in vetrina 2</p></div>';
        } else {
            vetrina2Products.forEach(product => {
                const card = createProductCard(product);
                vetrina2Grid.appendChild(card);
            });
        }
    }

    // === FALLBACK: Old single grid ===
    if (featuredGrid && !vetrina1Grid && !vetrina2Grid) {
        featuredGrid.innerHTML = '';
        const featuredProducts = products.filter(p => {
            if (productLayout.home.length > 0) {
                return productLayout.home.includes(p.id);
            }
            return p.zone === 'home';
        });

        featuredProducts.forEach(product => {
            const card = createProductCard(product);
            featuredGrid.appendChild(card);
        });
    }

    console.log('✅ Vetrine rendered');
}

/**
 * Initialize featured products carousel
 */
function initFeaturedCarousel(totalProducts) {
    if (totalProducts === 0) return;

    let currentIndex = 0;
    const track = document.getElementById('featuredProductsTrack');
    const prevBtn = document.getElementById('featuredPrev');
    const nextBtn = document.getElementById('featuredNext');
    const dotsContainer = document.getElementById('featuredDots');

    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    // Create dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalProducts; i++) {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function updateCarousel() {
        // Mostra 3 prodotti alla volta
        const itemsToShow = Math.min(3, totalProducts);
        const offset = -(currentIndex * (100 / itemsToShow));
        track.style.transform = `translateX(${offset}%)`;

        // Update dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
        resetAutoplay();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalProducts;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalProducts) % totalProducts;
        updateCarousel();
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    // Auto-play carousel every 5 seconds
    let autoplayInterval = setInterval(nextSlide, 5000);

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    // Pause on hover
    track.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    updateCarousel();
    console.log('🎠 Carousel initialized with auto-play');
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    console.log(`🎨 Rendering products for shop page`);

    // IMPORTANTE: Filtra prodotti nascosti (visible: false) E prodotti nell'array hidden di productLayout
    const hiddenIds = (productLayout && productLayout.hidden) ? productLayout.hidden : [];
    const visibleProducts = products.filter(p => {
        // Escludi se visible è false O se è nell'array hidden
        return p.visible !== false && !hiddenIds.includes(p.id);
    });
    console.log(`👁️  Prodotti visibili totali: ${visibleProducts.length} su ${products.length} (nascosti: ${hiddenIds.length})`);

    // ✅ SHOP PAGE: Mostra 100 prodotti in evidenza scelti dall'admin
    let productsToRender = [];

    if (productLayout && productLayout.featured && productLayout.featured.length > 0) {
        // Backend mode: Mostra prodotti marcati come featured dall'admin
        productsToRender = visibleProducts.filter(p => productLayout.featured.includes(p.id));
        console.log(`⭐ Prodotti featured dall'admin (backend): ${productsToRender.length}`);
    } else {
        // Static mode: usa campo 'featured' da products.json
        productsToRender = visibleProducts.filter(p => p.featured === true);
        console.log(`⭐ Prodotti featured (statico): ${productsToRender.length}`);
    }

    // Se non ci sono featured o sono meno di 20, completa con selezione automatica
    if (productsToRender.length < 20) {
        console.log(`📊 Featured insufficienti (${productsToRender.length}), completo con selezione automatica`);

        // Raggruppa prodotti per sottocategoria (escludi già featured)
        const featuredIds = productsToRender.map(p => p.id);
        const remainingProducts = visibleProducts.filter(p => !featuredIds.includes(p.id));

        const productsBySubcategory = {};
        remainingProducts.forEach(p => {
            const subcat = p.zenovaSubcategory || p.subcategory || 'altri';
            if (!productsBySubcategory[subcat]) {
                productsBySubcategory[subcat] = [];
            }
            productsBySubcategory[subcat].push(p);
        });

        // Prendi 4-5 prodotti per ogni sottocategoria
        const autoFeatured = [];
        const maxPerSubcategory = 5;
        const maxTotalProducts = 100;

        Object.keys(productsBySubcategory).forEach(subcat => {
            const subcatProducts = productsBySubcategory[subcat];
            const toTake = Math.min(maxPerSubcategory, subcatProducts.length);
            autoFeatured.push(...subcatProducts.slice(0, toTake));
        });

        // Aggiungi prodotti automatici fino a 100
        const needed = maxTotalProducts - productsToRender.length;
        productsToRender.push(...autoFeatured.slice(0, needed));
    }

    // Limita a max 100 prodotti totali
    productsToRender = productsToRender.slice(0, 100);

    console.log(`✨ Rendering ${productsToRender.length} prodotti in evidenza`);

    // ✅ PERFORMANCE: Usa DocumentFragment per batch insert
    const fragment = document.createDocumentFragment();

    // ✅ PERFORMANCE: Caricamento progressivo - prima 20, poi il resto
    const initialBatch = productsToRender.slice(0, 20);
    const remainingBatch = productsToRender.slice(20);

    // Render primo batch immediatamente
    initialBatch.forEach(product => {
        const productCard = createProductCard(product);
        fragment.appendChild(productCard);
    });
    productsGrid.appendChild(fragment);

    // Render resto con requestIdleCallback per non bloccare UI
    if (remainingBatch.length > 0) {
        const renderRemaining = () => {
            const remainingFragment = document.createDocumentFragment();
            remainingBatch.forEach(product => {
                const productCard = createProductCard(product);
                remainingFragment.appendChild(productCard);
            });
            productsGrid.appendChild(remainingFragment);
            console.log(`📦 Caricati altri ${remainingBatch.length} prodotti`);
        };

        // Usa requestIdleCallback se disponibile, altrimenti setTimeout
        if ('requestIdleCallback' in window) {
            requestIdleCallback(renderRemaining, { timeout: 500 });
        } else {
            setTimeout(renderRemaining, 100);
        }
    }

    // ✅ FIX: Assicurati che le card siano cliccabili dopo il rendering
    console.log('✅ Prodotti featured renderizzati, cards ora cliccabili');

    // Re-initialize click handlers for product cards
    makeProductCardsClickable();
}

// Function to reset to featured products (called when closing sidebar)
window.resetToFeaturedProducts = function() {
    console.log('🔄 Reset a prodotti featured');
    renderProducts();
};

// Mostra risultati ricerca nella griglia principale
window.showSearchResultsInGrid = function(query) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid || !query) return;

    console.log('🔍 Mostro prodotti filtrati per:', query);

    // Filtra i prodotti per la query di ricerca
    const productsArray = products.length > 0 ? products : (window.products || []);
    const filteredProducts = productsArray.filter(product => {
        if (product.visible === false) return false;
        const q = query.toLowerCase();
        return (product.name || '').toLowerCase().includes(q) ||
               (product.brand || '').toLowerCase().includes(q) ||
               (product.category || '').toLowerCase().includes(q) ||
               (product.zenovaSubcategory || '').toLowerCase().includes(q) ||
               (product.description || '').toLowerCase().includes(q);
    });

    console.log(`📦 Trovati ${filteredProducts.length} prodotti per "${query}"`);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">🔍</div>
                <h3 style="color: #666; margin-bottom: 1rem;">Nessun risultato per "${query}"</h3>
                <p style="color: #999;">Prova con parole chiave diverse</p>
                <button onclick="window.resetToFeaturedProducts()"
                        style="margin-top: 1rem; background: #8B6F47; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                    Torna ai prodotti in evidenza
                </button>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = '';

    // Aggiungi header con risultati
    const searchHeader = document.createElement('div');
    searchHeader.style.cssText = 'grid-column: 1 / -1; padding: 1rem; background: #f5f0eb; border-radius: 12px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;';
    searchHeader.innerHTML = `
        <span style="font-size: 1.1rem; color: #333;">
            🔍 Risultati per "<strong>${query}</strong>" (${filteredProducts.length} prodotti)
        </span>
        <button onclick="window.resetToFeaturedProducts(); this.parentElement.remove();"
                style="background: #8B6F47; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
            ✕ Chiudi ricerca
        </button>
    `;
    productsGrid.appendChild(searchHeader);

    // Render prodotti filtrati
    const fragment = document.createDocumentFragment();
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        fragment.appendChild(productCard);
    });
    productsGrid.appendChild(fragment);

    // Scroll in alto
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    makeProductCardsClickable();
    console.log('✅ Griglia aggiornata con risultati ricerca');
};

// NEW: Render products filtered by specific category/subcategory
function renderProductsByCategory(searchTerm) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.warn('⚠️ productsGrid not found');
        return;
    }

    console.log(`🎯 Rendering products for: ${searchTerm}`);

    // IMPORTANTE: Per le categorie sidebar, mostra tutti i prodotti (anche quelli in 'hidden')
    // 'hidden' serve solo per escluderli dai 100 in evidenza, NON dalle categorie
    const visibleProducts = products.filter(p => p.visible !== false);
    console.log(`👁️  Prodotti visibili totali: ${visibleProducts.length} su ${products.length}`);

    // Try filtering by zenovaSubcategory first (for anchor names like "profumi-donne")
    let filteredProducts = visibleProducts.filter(product => {
        return product.zenovaSubcategory === searchTerm;
    });

    // If no results, try exact match on subcategory (for BigBuy IDs like "2507,2508,2510")
    if (filteredProducts.length === 0) {
        const normalizeCategories = (catString) => {
            return catString.split(',').map(c => c.trim()).sort().join(',');
        };

        const searchNormalized = normalizeCategories(searchTerm);

        filteredProducts = visibleProducts.filter(product => {
            if (!product.subcategory) return false;
            const productNormalized = normalizeCategories(product.subcategory);
            return productNormalized === searchNormalized;
        });
    }

    console.log(`📦 Found ${filteredProducts.length} visible products for "${searchTerm}"`);

    // Ordina per prezzo crescente
    filteredProducts.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
    });
    console.log('📊 Products sorted by price (ascending)');

    // Clear grid
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">📦</div>
                <h3 style="color: #666; margin-bottom: 1rem;">Nessun Prodotto</h3>
                <p style="color: #999;">Nessun prodotto disponibile in questa categoria al momento.</p>
                <p style="color: #999; margin-top: 1rem;">Stiamo lavorando per aggiungere nuovi prodotti!</p>
            </div>
        `;
        return;
    }

    // ✅ PERFORMANCE: Usa DocumentFragment e caricamento progressivo
    const fragment = document.createDocumentFragment();
    const initialBatch = filteredProducts.slice(0, 20);
    const remainingBatch = filteredProducts.slice(20);

    // Render primo batch immediatamente
    initialBatch.forEach(product => {
        const productCard = createProductCard(product);
        fragment.appendChild(productCard);
    });
    productsGrid.appendChild(fragment);

    // Render resto dopo
    if (remainingBatch.length > 0) {
        const renderRemaining = () => {
            const remainingFragment = document.createDocumentFragment();
            remainingBatch.forEach(product => {
                const productCard = createProductCard(product);
                remainingFragment.appendChild(productCard);
            });
            productsGrid.appendChild(remainingFragment);
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(renderRemaining, { timeout: 500 });
        } else {
            setTimeout(renderRemaining, 100);
        }
    }

    // Make cards clickable
    makeProductCardsClickable();

    // Scroll in alto per vedere i prodotti
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    console.log('✅ Prodotti renderizzati per categoria');
}

// Make function globally accessible
window.renderProductsByCategory = renderProductsByCategory;

// Add to Cart
function addToCart(productId) {
    const productsArray = products.length > 0 ? products : (window.products || []);
    const product = productsArray.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showNotification('Prodotto aggiunto al carrello!');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCart();
        }
    }
}

// Update Cart Display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartCountMobile = document.querySelector('.cart-count-mobile');
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count (both desktop and mobile)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    if (cartCountMobile) cartCountMobile.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Il tuo carrello è vuoto</p>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            // Get image URL or fallback
            let imageHtml = '';
            const imageUrl = getAbsoluteImageUrl(item.image);
            if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('/'))) {
                imageHtml = `<img src="${imageUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" loading="lazy" onerror="this.parentElement.innerHTML='📦'">`;
            } else if (item.icon) {
                imageHtml = item.icon;
            } else {
                imageHtml = '📦';
            }

            return `
                <div class="cart-item">
                    <div class="cart-item-image">${imageHtml}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">€${(item.price || 0).toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Rimuovi">×</button>
                </div>
            `;
        }).join('');
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2)}`;

    // Avviso ordine minimo €10
    const checkoutBtn = document.querySelector('.btn-checkout');
    let minOrderWarning = document.getElementById('minOrderWarning');
    if (!minOrderWarning) {
        minOrderWarning = document.createElement('div');
        minOrderWarning.id = 'minOrderWarning';
        minOrderWarning.style.cssText = 'color:#e74c3c;font-size:13px;margin-top:8px;text-align:center;';
        cartTotal.parentNode.appendChild(minOrderWarning);
    }
    if (total > 0 && total < 10) {
        minOrderWarning.textContent = `Ordine minimo €10.00 — mancano €${(10 - total).toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        minOrderWarning.textContent = '';
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('zenova-cart', JSON.stringify(cart));
}

// Load Cart from LocalStorage
function loadCart() {
    const savedCart = localStorage.getItem('zenova-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// ============ CART VALIDATION WITH BACKEND ============

/**
 * Validate cart with backend before checkout
 * Checks product availability, prices, and stock
 */
async function validateCartWithBackend() {
    console.log('🔄 Validazione carrello con backend...');

    // Skip backend validation - allow direct checkout
    console.warn('⚠️ Validazione bypassata - modalità sviluppo');

    // Return immediately without try-catch to avoid blocking
    return Promise.resolve(true);
}

// ============ WISHLIST FUNCTIONS ============

// Add to Wishlist
function addToWishlist(productId) {
    const productsArray = products.length > 0 ? products : (window.products || []);
    const product = productsArray.find(p => p.id === productId);
    const existingItem = wishlist.find(item => item.id === productId);

    if (!existingItem) {
        wishlist.push(product);
        saveWishlist();
        updateWishlist();
        showNotification('Aggiunto ai preferiti!');
    } else {
        showNotification('Prodotto già nei preferiti');
    }
}

// Remove from Wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist();
    updateWishlist();
    showNotification('Rimosso dai preferiti');
}

// Toggle Wishlist
function toggleWishlist(productId) {
    const isInWishlist = wishlist.some(item => item.id === productId);

    if (isInWishlist) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId);
    }
}

// Check if product is in wishlist
function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

// Update Wishlist Display
function updateWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlistCount = document.getElementById('wishlistCount');
    const wishlistBtn = document.getElementById('wishlistBtn');

    // Update wishlist count
    wishlistCount.textContent = wishlist.length;

    // Update button appearance
    if (wishlist.length > 0) {
        wishlistBtn.classList.add('has-items');
    } else {
        wishlistBtn.classList.remove('has-items');
    }

    // Update wishlist items
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p class="empty-wishlist">Non hai ancora prodotti preferiti</p>';
    } else {
        wishlistItems.innerHTML = wishlist.map(item => {
            const imageUrl = getAbsoluteImageUrl(item.image);
            return `
            <div class="wishlist-item">
                <button class="wishlist-remove-btn" onclick="removeFromWishlist(${item.id})">&times;</button>
                <div class="wishlist-item-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${item.name}" loading="lazy">` : item.icon}
                </div>
                <div class="wishlist-item-info">
                    <div class="wishlist-item-category">${item.category}</div>
                    <div class="wishlist-item-name">${item.name}</div>
                    <div class="wishlist-item-price">€${(item.price || 0).toFixed(2)}</div>
                    <div class="wishlist-item-actions">
                        <button class="wishlist-add-cart-btn" onclick="addToCartFromWishlist('${item.id}')">
                            Aggiungi al Carrello
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // Update wishlist button in product detail modal
    updateWishlistButtonInModal();
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
    addToCart(productId);
    showNotification('Aggiunto al carrello!');
}

// Update wishlist button in modal
function updateWishlistButtonInModal() {
    const wishlistBtnModal = document.querySelector('.product-detail-wishlist-btn');
    if (wishlistBtnModal && currentProductId) {
        if (isInWishlist(currentProductId)) {
            wishlistBtnModal.innerHTML = '♥';
            wishlistBtnModal.style.color = 'var(--soft-terracotta)';
            wishlistBtnModal.style.borderColor = 'var(--soft-terracotta)';
        } else {
            wishlistBtnModal.innerHTML = '♡';
            wishlistBtnModal.style.color = '';
            wishlistBtnModal.style.borderColor = '';
        }
    }
}

// Update wishlist buttons in product cards
function updateProductCardsWishlist() {
    const wishlistButtons = document.querySelectorAll('.product-card-wishlist-btn');

    wishlistButtons.forEach(button => {
        const productId = parseInt(button.getAttribute('data-product-id'));
        const isInList = isInWishlist(productId);

        if (isInList) {
            button.classList.add('in-wishlist');
            button.innerHTML = '♥';
        } else {
            button.classList.remove('in-wishlist');
            button.innerHTML = '♡';
        }
    });
}

// Save Wishlist to LocalStorage
function saveWishlist() {
    localStorage.setItem('zenova-wishlist', JSON.stringify(wishlist));
}

// Load Wishlist from LocalStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('zenova-wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
        updateWishlist();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const cartBtn = document.getElementById('cartBtn');
    const cartBtnMobile = document.getElementById('cartBtnMobile');
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    const closeCart = document.getElementById('closeCart');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const closeWishlist = document.getElementById('closeWishlist');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            // TODO: Open mobile menu sidebar when implemented
        });
    }

    // Cart listeners (desktop)
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            wishlistSidebar.classList.remove('active');
            overlay.classList.add('active');
        });
    }

    // Cart listeners (mobile)
    if (cartBtnMobile) {
        cartBtnMobile.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            wishlistSidebar.classList.remove('active');
            overlay.classList.add('active');
        });
    }

    // Search listeners (mobile)
    if (searchBtnMobile && searchBtn) {
        searchBtnMobile.addEventListener('click', () => {
            searchBtn.click(); // Trigger desktop search
        });
    }

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Wishlist listeners
    wishlistBtn.addEventListener('click', () => {
        wishlistSidebar.classList.add('active');
        cartSidebar.classList.remove('active');
        overlay.classList.add('active');
    });

    closeWishlist.addEventListener('click', () => {
        wishlistSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Overlay closes both
    overlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        wishlistSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // About Modal
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const aboutLink = document.querySelector('a[href="#about"]');

    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.classList.add('active');
        });
    }

    if (closeAboutModal) {
        closeAboutModal.addEventListener('click', () => {
            aboutModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (aboutModal) {
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for other navigation links
    document.querySelectorAll('a[href^="#"]:not([href="#about"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ignora link con solo "#" o "#" vuoto
            if (!href || href === '#' || href.length <= 1) {
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');

    if (!checkoutBtn) {
        console.warn('⚠️ Pulsante checkout non trovato nel DOM');
        return;
    }

    console.log('✅ Pulsante checkout trovato, aggiunto event listener');

    checkoutBtn.addEventListener('click', async () => {
        console.log('🛒 Click su pulsante checkout');
        console.log('📦 Carrello:', cart);

        if (cart.length === 0) {
            alert('Il tuo carrello è vuoto. Aggiungi dei prodotti prima di procedere.');
            return;
        }

        // Direct redirect to checkout (validation bypassed for production)
        console.log('➡️ Redirect diretto a checkout.html');
        window.location.href = 'checkout.html';
    });
}

// Show Notification
function showNotification(message) {
    // Simple notification - can be enhanced with a custom notification component
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #8B6F47;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Setup Category Sidebar - DISABLED: sidebar.js handles this
function setupCategorySidebar() {
    const categoryBtns = document.querySelectorAll('.category-btn');

    console.log('📂 Setting up sidebar, found buttons:', categoryBtns.length);

    if (categoryBtns.length === 0) {
        console.log('⚠️ No category buttons found in sidebar');
        return;
    }

    categoryBtns.forEach((btn, index) => {
        console.log('➕ Adding listener to button', index);
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('🔘 Category button clicked:', index);

            const categoryItem = this.parentElement;

            // Close all other categories
            document.querySelectorAll('.category-item').forEach(item => {
                if (item !== categoryItem) {
                    item.classList.remove('active');
                    const sublist = item.querySelector('.subcategory-list');
                    if (sublist) sublist.style.maxHeight = '0px';
                }
            });

            // Toggle current category
            const wasActive = categoryItem.classList.contains('active');
            const subcategoryList = categoryItem.querySelector('.subcategory-list');

            if (wasActive) {
                categoryItem.classList.remove('active');
                if (subcategoryList) subcategoryList.style.maxHeight = '0px';
                console.log('🔽 Closed category');
            } else {
                categoryItem.classList.add('active');
                if (subcategoryList) subcategoryList.style.maxHeight = '500px';
                console.log('🔼 Opened category');
            }
        });
    });

    // Handle subcategory clicks - filter products on page
    const subcategoryLinks = document.querySelectorAll('.subcategory-link');

    subcategoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const subcategory = link.dataset.subcategory;
            console.log('📂 Filtering by subcategory:', subcategory);

            // Remove active class from all links
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');

            // Use the global filter function
            if (typeof filterProductsBySubcategory === 'function') {
                filterProductsBySubcategory(subcategory);
            }

            // Scroll to products section
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============ SEARCH FUNCTIONALITY ============

// Setup Search System
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const suggestionTags = document.querySelectorAll('.search-suggestion-tag');

    if (!searchBtn || !searchModal) return;

    // Open search modal
    searchBtn.addEventListener('click', () => {
        searchModal.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
        displayInitialResults();
    });

    // Close search modal
    closeSearch.addEventListener('click', closeSearchModal);

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });

    // Close with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    function closeSearchModal() {
        const query = searchInput.value.trim().toLowerCase();
        searchModal.classList.remove('active');
        searchInput.value = '';

        // Se c'era una ricerca, porta alla categoria correlata
        // Ma solo se NON siamo già su prodotti.html
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (query.length >= 3 && currentPage !== 'prodotti.html') {
            const category = findCategoryFromSearch(query);
            if (category) {
                console.log(`🔍 Ricerca "${query}" -> categoria "${category}"`);
                window.location.href = `prodotti.html#${category}`;
            }
        }
    }

    // Trova la categoria più rilevante dalla ricerca
    function findCategoryFromSearch(query) {
        // Mappa di parole chiave -> categoria
        const categoryMap = {
            // Incensi
            'incens': 'incenso',
            'bastoncin': 'incenso',
            'backflow': 'incenso',
            // Candele
            'candel': 'candele-profumate',
            'cera': 'candele-profumate',
            // Diffusori
            'diffusor': 'diffusori-oli',
            'oli essenzial': 'diffusori-oli',
            'aroma': 'diffusori-oli',
            // Profumi
            'profum': 'profumi-donne',
            'parfum': 'profumi-donne',
            'eau de': 'profumi-donne',
            // Trucco
            'trucco': 'trucco-viso',
            'makeup': 'trucco-viso',
            'rossett': 'trucco-labbra',
            'mascara': 'trucco-occhi',
            'ombrett': 'trucco-occhi',
            // Cura corpo
            'crema': 'cura-corpo',
            'sapone': 'cura-corpo',
            'bagno': 'sali-bagno',
            'sale': 'sali-bagno',
            // Tech
            'lampada': 'lampade-led',
            'led': 'lampade-led',
            'umidificat': 'umidificatori',
            // Meditazione
            'yoga': 'accessori-yoga',
            'meditazion': 'accessori-meditazione',
            'chakra': 'accessori-meditazione',
            // Tè
            'te ': 'te-infusi',
            'tea': 'te-infusi',
            'infus': 'te-infusi',
            'tisana': 'te-infusi'
        };

        // Cerca corrispondenza nelle parole chiave
        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (query.includes(keyword)) {
                return category;
            }
        }

        // Cerca corrispondenza diretta nelle sottocategorie dei prodotti
        const productsArray = products.length > 0 ? products : (window.products || []);
        const matchingProduct = productsArray.find(p =>
            p.name.toLowerCase().includes(query) ||
            (p.zenovaSubcategory || '').toLowerCase().includes(query)
        );

        if (matchingProduct && matchingProduct.zenovaSubcategory) {
            return matchingProduct.zenovaSubcategory;
        }

        return null;
    }

    // Real-time search with debouncing (300ms delay)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        if (query.length === 0) {
            displayInitialResults();
        } else {
            // Show loading state
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🔄</div>
                    <div>Ricerca in corso...</div>
                </div>
            `;

            // Wait 300ms before searching (debouncing)
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        }
    });

    // Enter key: vai direttamente ai risultati nella griglia
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                // Chiudi search modal
                searchModal.classList.remove('active');

                // Vai a prodotti.html con i risultati filtrati
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                if (currentPage === 'prodotti.html') {
                    // Già su prodotti, mostra i risultati nella griglia
                    savedSearchQuery = query;
                    showSearchResultsInGrid(query);
                } else {
                    // Vai a prodotti.html
                    window.location.href = `prodotti.html?search=${encodeURIComponent(query)}`;
                }
            }
        }
    });

    // Handle suggestion tag clicks
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const searchTerm = tag.dataset.search;
            searchInput.value = searchTerm;
            performSearch(searchTerm.toLowerCase());
        });
    });

    // Display initial results (all products or popular ones)
    function displayInitialResults() {
        // Check if products are loaded
        if (!products || products.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">⏳</div>
                    <div class="search-empty-text">Caricamento prodotti...</div>
                    <div class="search-empty-hint">Attendi un momento</div>
                </div>
            `;
            return;
        }
        const recentProducts = products.slice(0, 5);
        displayResults(recentProducts, '');
    }

    // Perform search (OPTIMIZED)
    function performSearch(query) {
        const startTime = performance.now();

        // Check if products are loaded
        if (!products || products.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">⏳</div>
                    <div class="search-empty-text">Caricamento prodotti...</div>
                    <div class="search-empty-hint">Attendi un momento e riprova</div>
                </div>
            `;
            return;
        }

        // Filter only visible products and separate by match priority
        const nameMatches = [];
        const descMatches = [];

        for (const product of products) {
            if (product.visible === false) continue;

            const nameMatch = product.name.toLowerCase().includes(query);
            const categoryMatch = (product.category || '').toLowerCase().includes(query);
            const subcategoryMatch = (product.zenovaSubcategory || '').toLowerCase().includes(query);
            const brandMatch = (product.brand || '').toLowerCase().includes(query);
            const skuMatch = (product.sku || '').toLowerCase().includes(query);
            const idMatch = (product.id || '').toLowerCase().includes(query);

            if (nameMatch || categoryMatch || subcategoryMatch || brandMatch || skuMatch || idMatch) {
                nameMatches.push(product);
            } else {
                // Search in description (cleaned from HTML)
                const descMatch = product.description
                    ? product.description.replace(/<[^>]*>/g, '').toLowerCase().includes(query)
                    : false;
                if (descMatch) descMatches.push(product);
            }
        }

        // Name/category matches first, description-only matches after
        const results = [...nameMatches, ...descMatches].slice(0, 30);

        const endTime = performance.now();
        console.log(`🔍 Search completed in ${(endTime - startTime).toFixed(2)}ms - Found ${results.length} results`);

        displayResults(results, query);
    }

    // Display search results (OPTIMIZED)
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <div class="search-empty-text">Nessun risultato trovato</div>
                    <div class="search-empty-hint">Prova con parole chiave diverse</div>
                </div>
            `;
            return;
        }

        let html = '';

        // Show info if there are more results
        if (results.length === 30) {
            html += `
                <div style="background: #f0f7ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align: center; color: #0066cc; font-size: 14px;">
                    ℹ️ Mostrando i primi 30 risultati. Affina la ricerca per risultati più precisi.
                </div>
            `;
        }

        html += results.map(product => {
            // Highlight matching text ONLY in name (skip description for performance)
            const highlightedName = highlightText(product.name, query);

            // Extract short description (first 100 chars, no HTML)
            const shortDesc = product.description
                ? product.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                : product.category || '';

            // Get image URL (handle both formats)
            let searchImage = product.image;
            if (!searchImage && product.images && product.images.length > 0) {
                const img = product.images[0];
                searchImage = typeof img === 'object' ? (img.url || img.thumbnail) : img;
            }
            const searchImageUrl = getAbsoluteImageUrl(searchImage);

            return `
                <div class="search-result-item" onclick="handleSearchResultClick('${product.id}')">
                    <div class="search-result-icon">
                        ${searchImageUrl ? `<img src="${searchImageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" loading="lazy">` : '📦'}
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-category">${product.zenovaSubcategory || product.category || 'Prodotto'}</div>
                        <div class="search-result-name">${highlightedName}</div>
                        <div class="search-result-description">${shortDesc}</div>
                    </div>
                    <div class="search-result-price">€${(product.price || 0).toFixed(2)}</div>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = html;
    }

    // Highlight matching text
    function highlightText(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
}

// Handle clicking on a search result
window.handleSearchResultClick = function(productId) {
    // Salva la query di ricerca PRIMA di chiudere
    const searchInput = document.getElementById('searchInput');
    savedSearchQuery = searchInput ? searchInput.value.trim() : null;
    console.log('🔍 Salvata query ricerca:', savedSearchQuery);

    // Close search modal
    document.getElementById('searchModal').classList.remove('active');
    searchInput.value = '';

    // Get product info
    const productsArray = products.length > 0 ? products : (window.products || []);
    const product = productsArray.find(p => p.id === productId);
    if (!product) {
        console.error('Prodotto non trovato:', productId);
        return;
    }

    // Check if we're already on prodotti.html
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'prodotti.html') {
        // Already on shop page - just open modal
        openProductDetailModal(productId);
    } else {
        // Navigate to shop page with product and category info
        const subcategory = product.zenovaSubcategory || '';
        const category = product.zenovaCategory || '';

        // Navigate to prodotti.html with hash for category and product
        window.location.href = `prodotti.html#${subcategory}&product=${productId}`;
    }
};

// ============ PRODUCT DETAIL MODAL ============

let currentProductId = null;
let savedScrollPosition = 0;
let savedSidebarState = []; // Salva stato sidebar
let currentProductCategory = null; // Categoria del prodotto corrente
let currentProductSubcategory = null; // Sottocategoria del prodotto corrente
let savedSearchQuery = null; // Salva la ricerca per riaprirla dopo chiusura prodotto

// Gallery state
let currentGalleryIndex = 0;
let currentGalleryImages = [];

// Open product detail modal
function openProductDetailModal(productId) {
    // Cerca in products (script.js) o window.products (category-products.js)
    const productsArray = products.length > 0 ? products : (window.products || []);
    const product = productsArray.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Prodotto non trovato:', productId, 'in array di', productsArray.length, 'prodotti');
        return;
    }

    currentProductId = productId;
    currentProductCategory = product.zenovaCategory || null; // Salva categoria prodotto
    currentProductSubcategory = product.zenovaSubcategory || null; // Salva sottocategoria

    // Salva la posizione di scroll corrente
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // ✅ Salva lo stato della sidebar (quali categorie sono aperte)
    savedSidebarState = [];
    document.querySelectorAll('.category-item.active, .subcategory-item-nested.active').forEach(item => {
        savedSidebarState.push(item);
        const categoryBtn = item.querySelector('.category-btn');
        const categoryName = categoryBtn ? categoryBtn.dataset.category : 'unknown';
        console.log('   💾 Salvato elemento:', categoryName);
    });
    console.log('💾 Stato sidebar salvato:', savedSidebarState.length, 'elementi aperti');
    console.log('📂 Categoria prodotto:', currentProductCategory);
    console.log('📁 Sottocategoria prodotto:', currentProductSubcategory);

    const modal = document.getElementById('productDetailModal');

    // Use ALL product images from BigBuy (not just 1 repeated)
    if (product.images && product.images.length > 0) {
        currentGalleryImages = product.images; // Tutte le immagini reali!
        console.log('🖼️ Immagini caricate:', currentGalleryImages);
    } else if (product.image) {
        currentGalleryImages = [product.image];
        console.log('🖼️ Usando product.image:', product.image);
    } else {
        currentGalleryImages = [product.icon];
        console.log('🖼️ Usando product.icon:', product.icon);
    }
    currentGalleryIndex = 0;

    // Update gallery
    updateGallery();

    // Breadcrumb (only exists in prodotti.html)
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.category || 'Prodotti';
    }

    // Brand Badge (only exists in prodotti.html)
    const brandBadge = document.getElementById('productBrand');
    if (brandBadge) {
        if (product.brand) {
            brandBadge.textContent = `Brand: ${product.brand}`;
            brandBadge.style.display = 'inline-block';
        } else {
            brandBadge.style.display = 'none';
        }
    }

    // Product Name
    document.getElementById('productDetailName').textContent = product.name;

    // Tags (from zenovaCategories) - only exists in prodotti.html
    const tagsContainer = document.getElementById('productTags');
    if (tagsContainer) {
        if (product.zenovaCategories && product.zenovaCategories.length > 0) {
            tagsContainer.innerHTML = product.zenovaCategories
                .map(tag => `<span class="product-tag">${tag}</span>`)
                .join('');
            tagsContainer.style.display = 'flex';
        } else if (product.category) {
            const categories = product.category.split(',').map(c => c.trim());
            tagsContainer.innerHTML = categories
                .map(tag => `<span class="product-tag">${tag}</span>`)
                .join('');
            tagsContainer.style.display = 'flex';
        } else {
            tagsContainer.style.display = 'none';
        }
    }

    // Price
    document.getElementById('productDetailPrice').textContent = `€${(product.price || 0).toFixed(2)}`;

    // Stock - only exists in prodotti.html
    const stockElement = document.getElementById('productStock');
    if (stockElement) {
        if (product.stock !== undefined) {
            if (product.stock > 50) {
                stockElement.textContent = `✓ Disponibile (${product.stock} unità)`;
                stockElement.className = 'product-stock';
            } else if (product.stock > 0) {
                stockElement.textContent = `⚠ Poche disponibilità (${product.stock} unità)`;
                stockElement.className = 'product-stock low-stock';
            } else {
                stockElement.textContent = '✗ Non disponibile';
                stockElement.className = 'product-stock out-of-stock';
            }
        } else {
            stockElement.textContent = '✓ Disponibile';
            stockElement.className = 'product-stock';
        }
    }

    // Disabilita bottone carrello nel modale se prodotto non disponibile
    const detailAddBtn = document.getElementById('productDetailAddBtn');
    if (detailAddBtn) {
        const notAvailable = product.stock === 0 || product.available === false;
        detailAddBtn.disabled = notAvailable;
        detailAddBtn.textContent = notAvailable ? 'Non disponibile' : 'Aggiungi al carrello';
        detailAddBtn.style.opacity = notAvailable ? '0.5' : '1';
        detailAddBtn.style.cursor = notAvailable ? 'not-allowed' : 'pointer';
        detailAddBtn.style.background = notAvailable ? '#ccc' : '';
    }

    // Description
    document.getElementById('productDetailDescription').innerHTML = product.description || 'Descrizione non disponibile';

    // Technical Info - only exists in prodotti.html
    const techInfoGrid = document.getElementById('techInfoGrid');
    if (techInfoGrid) {
        const techInfo = [];

        // Standard product fields
        if (product.ean) techInfo.push({ label: 'EAN', value: product.ean });

        // Handle dimensions - can be object or string
        if (product.dimensions) {
            if (typeof product.dimensions === 'object') {
                const dims = product.dimensions;
                if (dims.width || dims.height || dims.depth) {
                    techInfo.push({
                        label: 'Dimensioni',
                        value: `${dims.width || '-'} x ${dims.height || '-'} x ${dims.depth || '-'} cm`
                    });
                }
            } else if (typeof product.dimensions === 'string') {
                techInfo.push({ label: 'Dimensioni', value: product.dimensions });
            }
        }

        if (product.weight) {
            // Se c'è weightUnit personalizzato (es: "pz" per pezzi), usalo
            if (product.weightUnit && product.weightUnit !== 'kg') {
                const weightDisplay = `${Math.round(product.weight)} ${product.weightUnit}`;
                techInfo.push({ label: 'Quantità', value: weightDisplay });
            } else {
                // Il peso nel DB è sempre in kg
                const weightKg = parseFloat(product.weight);
                const weightDisplay = weightKg >= 1
                    ? `${weightKg.toFixed(2)} kg`
                    : `${(weightKg * 1000).toFixed(0)} g`;
                techInfo.push({ label: 'Peso', value: weightDisplay });
            }
        }

        if (product.brand) techInfo.push({ label: 'Produttore', value: product.brand });

        // Extended features from AW products
        if (product.features && typeof product.features === 'object') {
            const features = product.features;

            if (features.barcode) techInfo.push({ label: 'Barcode', value: features.barcode });
            if (features.family) techInfo.push({ label: 'Famiglia', value: features.family });
            if (features.materials) techInfo.push({ label: 'Materiali', value: features.materials });

            if (features.packageWeight) {
                const pkgWeightDisplay = features.packageWeight >= 1
                    ? `${features.packageWeight.toFixed(2)} kg`
                    : `${(features.packageWeight * 1000).toFixed(0)} g`;
                techInfo.push({ label: 'Peso Imballaggio', value: pkgWeightDisplay });
            }

            if (features.countryOfOrigin) techInfo.push({ label: 'Paese di Origine', value: features.countryOfOrigin });
            if (features.unitsPerOuter) techInfo.push({ label: 'Unità per Scatola', value: features.unitsPerOuter.toString() });
            if (features.cpnpNumber) techInfo.push({ label: 'CPNP', value: features.cpnpNumber });
        }

        if (techInfo.length > 0) {
            techInfoGrid.innerHTML = techInfo
                .map(item => `
                    <div class="tech-info-item">
                        <div class="tech-info-label">${item.label}</div>
                        <div class="tech-info-value">${item.value}</div>
                    </div>
                `)
                .join('');
            const productTechnicalInfo = document.getElementById('productTechnicalInfo');
            if (productTechnicalInfo) productTechnicalInfo.style.display = 'block';
        } else {
            const productTechnicalInfo = document.getElementById('productTechnicalInfo');
            if (productTechnicalInfo) productTechnicalInfo.style.display = 'none';
        }
    }

    // Generate features with REAL product data
    const features = getProductFeatures(product);
    const featuresList = document.getElementById('productDetailFeatures');
    featuresList.innerHTML = features.map(f => `<li>${f}</li>`).join('');

    // Update wishlist button state
    updateWishlistButtonInModal();

    // Prevent scrollbar shift when modal opens
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply padding BEFORE showing modal to prevent layout shift
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    // Reset modal scroll position BEFORE showing
    const modalContent = document.querySelector('.product-detail-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }

    // Show modal (single RAF to avoid shake)
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

// Make function globally accessible for category pages
window.openProductDetailModal = openProductDetailModal;

// Update gallery display
function updateGallery() {
    const imageContainer = document.getElementById('productDetailImage');
    const dotsContainer = document.getElementById('galleryDots');
    const counterElement = document.getElementById('galleryCounter');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    // Update image
    const currentImage = currentGalleryImages[currentGalleryIndex];
    console.log('🔧 updateGallery - currentImage:', currentImage);

    // Handle both string URLs and image objects {url: "..."}
    let imageUrl = typeof currentImage === 'string' ? currentImage : (currentImage?.url || currentImage?.thumbnail);
    console.log('🔧 updateGallery - imageUrl estratto:', imageUrl);

    // Converti percorsi relativi in URL assoluti
    imageUrl = getAbsoluteImageUrl(imageUrl);
    console.log('🔧 updateGallery - imageUrl finale:', imageUrl);

    // Accept both absolute URLs (http/data) and relative paths (starting with /)
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('/'))) {
        console.log('✅ Impostando immagine:', imageUrl);
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="Product Image" style="width: 100%; height: 100%; object-fit: contain; padding: 1rem;" loading="lazy">`;
    } else if (typeof currentImage === 'string' && currentImage.includes('<svg')) {
        console.log('✅ Impostando SVG');
        imageContainer.innerHTML = currentImage;
    } else {
        console.log('❌ Nessuna immagine valida, mostro placeholder');
        // Fallback: mostra placeholder se nessuna immagine valida
        imageContainer.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">Immagine non disponibile</div>`;
    }

    // Le frecce sono sempre visibili
    const hasMultipleImages = currentGalleryImages.length > 1;

    // Nascondi solo dots e counter se c'è una sola immagine
    if (dotsContainer) {
        dotsContainer.style.display = hasMultipleImages ? 'flex' : 'none';
    }
    if (counterElement) {
        counterElement.style.display = hasMultipleImages ? 'block' : 'none';
    }

    // Update counter
    if (counterElement && hasMultipleImages) {
        counterElement.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
    }

    // Update dots
    if (hasMultipleImages) {
        dotsContainer.innerHTML = currentGalleryImages.map((img, index) =>
            `<div class="gallery-dot ${index === currentGalleryIndex ? 'active' : ''}" onclick="goToGalleryImage(${index})"></div>`
        ).join('');
    }
}

// Navigate gallery
function nextGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    updateGallery();
}

function prevGalleryImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateGallery();
}

function goToGalleryImage(index) {
    currentGalleryIndex = index;
    updateGallery();
}

// Close product detail modal
function closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.remove('active');
    currentProductId = null;

    // Restore body scroll and padding (prevent page shift)
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';

    // ✅ Se c'era una ricerca attiva, mostra tutti i prodotti filtrati nella griglia
    if (savedSearchQuery && savedSearchQuery.length > 0) {
        console.log('🔍 Mostro prodotti filtrati per:', savedSearchQuery);
        const query = savedSearchQuery;
        savedSearchQuery = null; // Resetta subito per evitare loop

        // Filtra i prodotti per la query di ricerca
        const productsArray = products.length > 0 ? products : (window.products || []);
        const filteredProducts = productsArray.filter(product => {
            if (product.visible === false) return false;
            const q = query.toLowerCase();
            return (product.name || '').toLowerCase().includes(q) ||
                   (product.brand || '').toLowerCase().includes(q) ||
                   (product.category || '').toLowerCase().includes(q) ||
                   (product.zenovaSubcategory || '').toLowerCase().includes(q);
        });

        console.log(`📦 Trovati ${filteredProducts.length} prodotti per "${query}"`);

        // Se siamo su prodotti.html, mostra i risultati nella griglia
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid && filteredProducts.length > 0) {
            productsGrid.innerHTML = '';

            // Aggiungi titolo ricerca
            const searchHeader = document.createElement('div');
            searchHeader.style.cssText = 'grid-column: 1 / -1; padding: 1rem; background: #f5f0eb; border-radius: 12px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;';
            searchHeader.innerHTML = `
                <span style="font-size: 1.1rem; color: #333;">
                    🔍 Risultati per "<strong>${query}</strong>" (${filteredProducts.length} prodotti)
                </span>
                <button onclick="window.resetToFeaturedProducts(); this.parentElement.remove();"
                        style="background: #8B6F47; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                    ✕ Chiudi ricerca
                </button>
            `;
            productsGrid.appendChild(searchHeader);

            // Render prodotti filtrati
            const fragment = document.createDocumentFragment();
            filteredProducts.forEach(product => {
                const productCard = createProductCard(product);
                fragment.appendChild(productCard);
            });
            productsGrid.appendChild(fragment);

            // Scroll in alto per vedere i risultati
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Scroll anche al productsGrid per mobile
            setTimeout(() => {
                productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            console.log('✅ Griglia aggiornata con risultati ricerca');
            return; // Non eseguire il resto
        }

        // Se non siamo su prodotti.html, vai lì con il filtro
        if (!productsGrid) {
            window.location.href = `prodotti.html?search=${encodeURIComponent(query)}`;
            return;
        }
    }

    // ✅ Ripristina lo stato della sidebar (riapri le categorie che erano aperte)
    setTimeout(() => {
        if (savedSidebarState.length > 0) {
            // Ripristina categorie che erano già aperte
            savedSidebarState.forEach(item => {
                item.classList.add('active');
                const categoryBtn = item.querySelector('.category-btn');
                const categoryName = categoryBtn ? categoryBtn.dataset.category : 'unknown';
                console.log('   🔄 Ripristinato elemento:', categoryName);
            });
            console.log('🔄 Stato sidebar ripristinato:', savedSidebarState.length, 'elementi riaperti');
        } else if (currentProductCategory && currentProductSubcategory) {
            // Se nessuna categoria era aperta, apri quella del prodotto e mostra la sottocategoria
            // FIX: Mappa "wellness" -> "natural-wellness" per compatibilità
            const mappedCategory = currentProductCategory === 'wellness' ? 'natural-wellness' : currentProductCategory;
            console.log('🔍 Cerco categoria:', currentProductCategory, '→', mappedCategory);
            const categoryButton = document.querySelector(`[data-category="${mappedCategory}"]`);

            if (categoryButton) {
                // Per tutte le categorie
                const categoryItem = categoryButton.parentElement;
                console.log('🔍 categoryItem trovato:', categoryItem);
                categoryItem.classList.add('active');
                console.log('📂 Aperta categoria del prodotto:', currentProductCategory);
                // Verifica se ha la classe active
                console.log('✅ Classe active presente?', categoryItem.classList.contains('active'));
            } else {
                console.error('❌ categoryButton NON TROVATO per:', currentProductCategory);
            }

            // Trova e attiva il link della sottocategoria nella sidebar
            // Cerca sia href="#xxx" che data-subcategory (per compatibilità)
            let subcategoryLink = document.querySelector(`[href="#${currentProductSubcategory}"]`);

            // Se non trovato, cerca tra tutti i link della categoria
            if (!subcategoryLink) {
                const allLinks = document.querySelectorAll('.subcategory-link, .sub-subcategory-link');
                for (const link of allLinks) {
                    const href = link.getAttribute('href');
                    if (href && href.includes(currentProductSubcategory)) {
                        subcategoryLink = link;
                        break;
                    }
                }
            }

            if (subcategoryLink) {
                subcategoryLink.classList.add('active');
                console.log('✅ Attivato link sottocategoria:', currentProductSubcategory);

                // Se è una sottocategoria nested (3° livello), apri anche il parent (2° livello)
                const nestedParent = subcategoryLink.closest('.subcategory-item-nested');
                if (nestedParent) {
                    nestedParent.classList.add('active');
                    console.log('📁 Aperto parent nested (2° livello)');
                }

                // Scroll alla sottocategoria nella sidebar per evidenziarla
                setTimeout(() => {
                    subcategoryLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 150);
            } else {
                console.warn('⚠️ Link sottocategoria non trovato:', currentProductSubcategory);
            }

            // Mostra TUTTI i prodotti di quella sottocategoria
            if (typeof window.renderProductsByCategory === 'function') {
                window.renderProductsByCategory(currentProductSubcategory);
                console.log('🎯 Visualizzati tutti i prodotti della sottocategoria:', currentProductSubcategory);
            }
        }
    }, 50);

    // Ripristina la posizione di scroll salvata
    setTimeout(() => {
        window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant'
        });
    }, 100);
}

// Get product features based on REAL product data from BigBuy
function getProductFeatures(product) {
    const features = [];

    // Estrai caratteristiche REALI dalla descrizione HTML di BigBuy
    if (product.description) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = product.description;

        // Trova tutte le liste <ul> nella descrizione
        const lists = tempDiv.querySelectorAll('ul');

        lists.forEach(ul => {
            // Prendi solo gli <li> di primo livello (non nested)
            const items = ul.querySelectorAll(':scope > li');
            items.forEach(li => {
                // Pulisci il testo da HTML interno
                let text = li.textContent.trim();

                // Rimuovi liste interne se presenti
                const nestedUl = li.querySelector('ul');
                if (nestedUl) {
                    // Estrai i valori delle liste interne e uniscili
                    const nestedItems = Array.from(nestedUl.querySelectorAll('li'))
                        .map(item => item.textContent.trim())
                        .filter(item => item.length > 0);

                    if (nestedItems.length > 0) {
                        // Rimuovi il testo della lista interna dal testo principale
                        text = text.split('\n')[0].trim();
                        text += `: ${nestedItems.join(', ')}`;
                    }
                }

                // Aggiungi solo se il testo è valido e non troppo lungo
                if (text && text.length > 3 && text.length < 200) {
                    features.push(text);
                }
            });
        });
    }

    // Se non abbiamo trovato caratteristiche dalla descrizione, mostra info base
    if (features.length === 0) {
        if (product.stock > 0) {
            features.push(`Disponibilità: ${product.stock} unità`);
        }
        if (product.weight) {
            const weightKg = parseFloat(product.weight);
            const weightDisplay = weightKg >= 1
                ? `${weightKg.toFixed(2)} kg`
                : `${(weightKg * 1000).toFixed(0)} g`;
            features.push(`Peso: ${weightDisplay}`);
        }
        if (product.dimensions) {
            const dims = product.dimensions;
            if (dims.width && dims.height && dims.depth) {
                features.push(`Dimensioni: ${dims.width} x ${dims.height} x ${dims.depth} cm`);
            }
        }
    }

    return features;
}

// Setup product detail modal
function setupProductDetailModal() {
    const closeBtn = document.getElementById('closeProductDetail');
    const modal = document.getElementById('productDetailModal');
    const addBtn = document.getElementById('productDetailAddBtn');
    const wishlistBtn = document.querySelector('.product-detail-wishlist-btn');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (!closeBtn || !modal) return;

    // Gallery navigation
    if (prevBtn) prevBtn.addEventListener('click', prevGalleryImage);
    if (nextBtn) nextBtn.addEventListener('click', nextGalleryImage);

    // Touch swipe support for gallery
    const galleryContainer = document.getElementById('productDetailImage');
    if (galleryContainer) {
        let touchStartX = 0;
        galleryContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        galleryContainer.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) nextGalleryImage();
                else prevGalleryImage();
            }
        }, { passive: true });
    }

    // Close button
    closeBtn.addEventListener('click', closeProductDetailModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProductDetailModal();
        }
    });

    // Close with ESC key & Arrow key navigation
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeProductDetailModal();
            } else if (e.key === 'ArrowLeft') {
                prevGalleryImage();
            } else if (e.key === 'ArrowRight') {
                nextGalleryImage();
            }
        }
    });

    // Add to cart button
    addBtn.addEventListener('click', () => {
        if (currentProductId) {
            addToCart(currentProductId);
            closeProductDetailModal();
            showNotification('Prodotto aggiunto al carrello!');
        }
    });

    // Wishlist button
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            if (currentProductId) {
                toggleWishlist(currentProductId);
                updateWishlistButtonInModal();
            }
        });
    }
}

// Flag per evitare di aggiungere l'event listener più volte
let isProductCardsClickableInitialized = false;

// Make product cards clickable
function makeProductCardsClickable() {
    if (isProductCardsClickableInitialized) {
        console.log('⚠️ makeProductCardsClickable() già inizializzata, skip');
        return;
    }

    console.log('🎯 makeProductCardsClickable() - attivazione event listener per product cards');
    isProductCardsClickableInitialized = true;

    // Use event delegation for dynamically added cards
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');

        if (productCard) {
            const isCartBtn = e.target.closest('.add-to-cart-btn');
            const isWishlistBtn = e.target.closest('.product-card-wishlist-btn');

            if (!isCartBtn && !isWishlistBtn) {
                const productId = getProductIdFromCard(productCard);

                if (productId) {
                    console.log('🛍️ Apertura dettaglio prodotto:', productId);
                    openProductDetailModal(productId);
                } else {
                    console.error('❌ Product ID non trovato sulla card!');
                }
            }
        }
    });
}

// Get product ID from card element
function getProductIdFromCard(card) {
    // ✅ FIX: Leggi ID direttamente dalla card
    const productId = card.getAttribute('data-product-id');
    if (productId) {
        return productId;
    }

    // Fallback: prova dal bottone wishlist
    const wishlistBtn = card.querySelector('.product-card-wishlist-btn');
    if (wishlistBtn) {
        const productId = wishlistBtn.getAttribute('data-product-id');
        if (productId) {
            return productId; // ✅ FIX: ritorna stringa, non parseInt (BigBuy usa ID alfanumerici)
        }
    }
    return null;
}

// ✅ REMOVED: Moved to main DOMContentLoaded to avoid race conditions
// Initialize product detail modal when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     setupSearch();
//     setupProductDetailModal();
//     makeProductCardsClickable();
//     initDarkMode();
// });

// ============ DARK MODE FUNCTIONALITY ============

let darkModeInitialized = false;

function initDarkMode() {
    // Prevent multiple initializations
    if (darkModeInitialized) return;

    const themeToggle = document.getElementById('themeToggle');

    // Check if button exists (it's only on some pages)
    if (!themeToggle) return;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('zenova-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', toggleDarkMode);

    darkModeInitialized = true;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    // Save preference
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('zenova-theme', 'dark');
    } else {
        localStorage.setItem('zenova-theme', 'light');
    }
}

// ============ NEWSLETTER POP-UP FUNCTIONALITY ============

function initNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (!popup) return;

    const closeBtn = document.getElementById('closeNewsletterPopup');
    const form = document.getElementById('newsletterForm');

    // Check if user already interacted with popup
    const popupClosed = localStorage.getItem('zenova-newsletter-closed');
    const popupSubscribed = localStorage.getItem('zenova-newsletter-subscribed');

    if (popupClosed || popupSubscribed) {
        return; // Don't show popup
    }

    // Show popup after 10 seconds
    setTimeout(() => {
        popup.classList.add('active');
    }, 10000);

    // Exit intent - show popup when mouse leaves window
    let exitIntentShown = false;
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && !exitIntentShown && !popup.classList.contains('active')) {
            popup.classList.add('active');
            exitIntentShown = true;
        }
    });

    // Close popup
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('active');
        localStorage.setItem('zenova-newsletter-closed', 'true');
    });

    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('active');
            localStorage.setItem('zenova-newsletter-closed', 'true');
        }
    });

    // Close with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            popup.classList.remove('active');
            localStorage.setItem('zenova-newsletter-closed', 'true');
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail').value;

        // Save email to localStorage (in real app, send to backend)
        localStorage.setItem('zenova-newsletter-email', email);
        localStorage.setItem('zenova-newsletter-subscribed', 'true');

        // Show success message
        popup.querySelector('.newsletter-popup-content').innerHTML = `
            <div class="newsletter-success">
                <div class="newsletter-icon">🎉</div>
                <h3 class="newsletter-title">Grazie!</h3>
                <p class="newsletter-subtitle">Ti abbiamo inviato il codice sconto del <strong>10%</strong> all'indirizzo:<br><strong>${email}</strong></p>
                <p class="newsletter-privacy">Controlla la tua casella di posta!</p>
            </div>
        `;

        // Close popup after 4 seconds
        setTimeout(() => {
            popup.classList.remove('active');
        }, 4000);
    });
}

// Newsletter popup disabilitato

// ========================================
// MOBILE CATEGORY DROPDOWN TOGGLE
// ========================================

/**
 * Gestisce l'apertura/chiusura dei dropdown categorie su mobile
 * Su mobile, :hover non funziona, serve click
 */
let mobileDropdownsInitialized = false;

function initMobileCategoryDropdowns() {
    // Solo su mobile (max-width: 768px)
    if (window.innerWidth > 768) return;

    // Evita inizializzazioni multiple
    if (mobileDropdownsInitialized) return;
    mobileDropdownsInitialized = true;

    console.log('📱 Inizializzazione dropdown mobile...');

    const dropdowns = document.querySelectorAll('.category-nav-dropdown');
    console.log(`📱 Trovati ${dropdowns.length} dropdown`);

    dropdowns.forEach((dropdown, index) => {
        const trigger = dropdown.querySelector('.category-nav-item');
        const menu = dropdown.querySelector('.category-dropdown-menu');
        const isMegaMenu = menu && menu.classList.contains('mega-menu');

        if (!trigger || !menu) {
            console.log(`📱 Dropdown ${index}: trigger o menu mancante`);
            return;
        }

        console.log(`📱 Dropdown ${index}: ${trigger.textContent.trim()}, mega-menu: ${isMegaMenu}`);

        // Previeni il comportamento di default del link
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log(`📱 Click su: ${trigger.textContent.trim()}`);

            // Chiudi tutti gli altri dropdown
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('open');
                }
            });

            // Toggle questo dropdown
            const isOpening = !dropdown.classList.contains('open');
            dropdown.classList.toggle('open');

            console.log(`📱 Dropdown ${isOpening ? 'aperto' : 'chiuso'}`);

            // Posiziona menu centrato nel viewport su mobile
            if (isOpening) {
                const rect = trigger.getBoundingClientRect();
                menu.style.position = 'fixed';
                menu.style.top = `${rect.bottom + 5}px`;
                menu.style.left = '0px';
                menu.style.transform = 'none';
                menu.style.zIndex = '9999';
                // Dopo il render, misura la larghezza reale e centra
                requestAnimationFrame(() => {
                    const w = menu.offsetWidth || 180;
                    menu.style.left = `${Math.max(8, (window.innerWidth - w) / 2)}px`;
                });
            } else {
                menu.style.position = '';
                menu.style.top = '';
                menu.style.left = '';
                menu.style.transform = '';
                menu.style.zIndex = '';
            }
        });
    });

    // Chiudi dropdown quando si clicca fuori
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.category-nav-dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// Inizializza al caricamento
document.addEventListener('DOMContentLoaded', initMobileCategoryDropdowns);

// Logo cliccabile → torna alla home (su tutte le pagine)
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});

// Re-inizializza se si passa da desktop a mobile
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !mobileDropdownsInitialized) {
        initMobileCategoryDropdowns();
    } else if (window.innerWidth > 768) {
        mobileDropdownsInitialized = false; // Reset per permettere re-init se torna mobile
    }
});

// ========================================
// COOKIE BANNER GDPR
// ========================================

function initCookieBanner() {
    // Guard: evita doppia esecuzione (es. se cookie-banner.js è già caricato)
    if (document.getElementById('cookieBanner') || window._cookieBannerInitialized) return;
    window._cookieBannerInitialized = true;

    // Se l'utente ha già dato/negato il consenso, non mostrare il banner
    if (localStorage.getItem('zenova_cookie_consent')) {
        return;
    }

    // Crea il banner HTML
    const bannerHTML = `
        <div id="cookieBanner" class="cookie-banner">
            <div class="cookie-content">
                <div class="cookie-text">
                    <h4>Questo sito utilizza i cookie</h4>
                    <p>Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici per migliorare la tua esperienza.
                    Per maggiori informazioni consulta la nostra <a href="cookie-policy.html">Cookie Policy</a> e la <a href="privacy-policy.html">Privacy Policy</a>.</p>
                </div>
                <div class="cookie-buttons">
                    <button id="cookieAccept" class="cookie-btn cookie-accept">Accetta tutti</button>
                    <button id="cookieReject" class="cookie-btn cookie-reject">Solo necessari</button>
                </div>
            </div>
        </div>
    `;

    // Aggiungi stili CSS
    const styleCSS = `
        <style id="cookieBannerStyles">
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #fff;
                padding: 1.5rem;
                z-index: 10000;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.5s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1.5rem;
            }
            .cookie-text {
                flex: 1;
                min-width: 300px;
            }
            .cookie-text h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1.1rem;
                color: #fff;
            }
            .cookie-text p {
                margin: 0;
                font-size: 0.9rem;
                line-height: 1.5;
                color: rgba(255, 255, 255, 0.85);
            }
            .cookie-text a {
                color: #667eea;
                text-decoration: underline;
            }
            .cookie-text a:hover {
                color: #8b9fef;
            }
            .cookie-buttons {
                display: flex;
                gap: 1rem;
                flex-shrink: 0;
            }
            .cookie-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .cookie-accept {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
            }
            .cookie-accept:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .cookie-reject {
                background: transparent;
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .cookie-reject:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            @media (max-width: 768px) {
                .cookie-banner {
                    padding: 1rem;
                }
                .cookie-content {
                    flex-direction: column;
                    text-align: center;
                }
                .cookie-buttons {
                    width: 100%;
                    justify-content: center;
                }
                .cookie-btn {
                    flex: 1;
                    padding: 0.75rem 1rem;
                }
            }
        </style>
    `;

    // Inserisci stili e banner nel DOM
    document.head.insertAdjacentHTML('beforeend', styleCSS);
    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    // Event listeners per i pulsanti
    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem('zenova_cookie_consent', 'accepted');
        hideCookieBanner();
        // Qui puoi attivare Google Analytics o altri script
        console.log('Cookie accettati - Analytics attivato');
    });

    document.getElementById('cookieReject').addEventListener('click', () => {
        localStorage.setItem('zenova_cookie_consent', 'rejected');
        hideCookieBanner();
        console.log('Solo cookie necessari');
    });
}

function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.animation = 'slideDown 0.3s ease forwards';
        banner.style.cssText += '@keyframes slideDown { to { transform: translateY(100%); } }';
        setTimeout(() => banner.remove(), 300);
    }
}

// Inizializza cookie banner
document.addEventListener('DOMContentLoaded', initCookieBanner);

// ========================================
// ANDROID BACK BUTTON SUPPORT
// ========================================
// Quando l'utente preme "Indietro" sul telefono, chiude la modal invece di uscire dal sito

let modalHistoryState = false;

// Funzione per pushare stato quando si apre una modal
function pushModalState() {
    if (!modalHistoryState) {
        history.pushState({ modal: true }, '');
        modalHistoryState = true;
        console.log('📱 History state pushed for modal');
    }
}

// Funzione per rimuovere stato quando si chiude una modal
function popModalState() {
    if (modalHistoryState) {
        modalHistoryState = false;
        console.log('📱 Modal state cleared');
    }
}

// Controlla se c'è una modal aperta
function isAnyModalOpen() {
    const productModal = document.getElementById('productDetailModal');
    const cartSidebar = document.getElementById('cartSidebar');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const searchModal = document.getElementById('searchModal');

    return (productModal && productModal.classList.contains('active')) ||
           (cartSidebar && cartSidebar.classList.contains('active')) ||
           (wishlistSidebar && wishlistSidebar.classList.contains('active')) ||
           (searchModal && searchModal.classList.contains('active'));
}

// Chiude tutte le modal aperte
function closeAllModals() {
    let closed = false;

    // Chiudi product modal
    const productModal = document.getElementById('productDetailModal');
    if (productModal && productModal.classList.contains('active')) {
        if (typeof closeProductDetailModal === 'function') {
            closeProductDetailModal();
        } else {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        closed = true;
        console.log('📱 Chiusa product modal con Back button');
    }

    // Chiudi cart sidebar
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (cartSidebar && cartSidebar.classList.contains('active')) {
        cartSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        closed = true;
        console.log('📱 Chiuso carrello con Back button');
    }

    // Chiudi wishlist sidebar
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    if (wishlistSidebar && wishlistSidebar.classList.contains('active')) {
        wishlistSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        closed = true;
        console.log('📱 Chiusa wishlist con Back button');
    }

    // Chiudi search modal
    const searchModal = document.getElementById('searchModal');
    if (searchModal && searchModal.classList.contains('active')) {
        searchModal.classList.remove('active');
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        closed = true;
        console.log('📱 Chiusa ricerca con Back button');
    }

    return closed;
}

// Listener per il tasto Indietro (popstate)
window.addEventListener('popstate', (e) => {
    if (isAnyModalOpen()) {
        // C'è una modal aperta, chiudila invece di navigare indietro
        closeAllModals();
        // Re-push state per permettere un altro "back" se ci sono ancora modal
        if (isAnyModalOpen()) {
            history.pushState({ modal: true }, '');
        } else {
            modalHistoryState = false;
        }
        console.log('📱 Back button intercettato - modal chiusa');
    }
});

// Observer per rilevare quando si aprono le modal e pushare lo state
const modalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('active')) {
                // Una modal è stata aperta
                pushModalState();
            }
        }
    });
});

// Inizializza l'observer quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    const modalsToWatch = [
        document.getElementById('productDetailModal'),
        document.getElementById('cartSidebar'),
        document.getElementById('wishlistSidebar'),
        document.getElementById('searchModal')
    ];

    modalsToWatch.forEach(modal => {
        if (modal) {
            modalObserver.observe(modal, { attributes: true });
        }
    });

    console.log('📱 Android Back Button support inizializzato');
});
