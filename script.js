// Product Data - Will be loaded from backend
let products = [];

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

    // Determine category and subcategory based on product name
    const productName = backendProduct.name.toLowerCase();
    let category = null; // null = nascosto
    let subcategory = 'altro';
    let icon = '✨';

    // ESCLUDI prodotti indesiderati (cucce cani, ecc.)
    if (productName.includes('cuccia') || productName.includes('cani') || productName.includes('cane') ||
        productName.includes('giocattolo') || productName.includes('videocamera') ||
        productName.includes('luce galleggiante') || productName.includes('piscina') ||
        backendProduct.category === 'Home & Garden') {
        return null; // Nascondi questi prodotti
    }

    // === BENESSERE (BigBuy) ===

    // Massaggio e rilassamento
    if (productName.includes('massaggiatore') || productName.includes('idromassaggio') ||
        productName.includes('set regalo') && productName.includes('medisana') ||
        productName.includes('testina') && productName.includes('therabody')) {
        category = 'Benessere';
        subcategory = 'massaggio-rilassamento';
        icon = '💆';
    }
    // Lampade abbronzanti (vuota per ora)
    // Accessori per saune (vuota per ora)

    // === BELLEZZA (BigBuy) ===

    // Profumi e fragranze
    else if (productName.includes('profumo') || productName.includes('eau de') ||
             productName.includes('edt') || productName.includes('edp')) {
        category = 'Bellezza';
        subcategory = 'profumi-fragranze';
        icon = '🌺';
    }
    // Cura dei capelli
    else if (productName.includes('phon') || productName.includes('spazzola') ||
             productName.includes('arricciacapelli') ||
             productName.includes('balsamo') && !productName.includes('labbra') ||
             productName.includes('spray') && !productName.includes('protezione solare') ||
             (productName.includes('babyliss') && !productName.includes('rasoio')) ||
             (productName.includes('revlon') && !productName.includes('rasoio'))) {
        category = 'Bellezza';
        subcategory = 'cura-capelli';
        icon = '💇';
    }
    // Rasatura e depilazione
    else if (productName.includes('epilatore') || productName.includes('rasoio') ||
             productName.includes('depilazione') || productName.includes('pulitore')) {
        category = 'Bellezza';
        subcategory = 'rasatura-depilazione';
        icon = '✂️';
    }
    // Cura della pelle
    else if (productName.includes('crema') || productName.includes('essenza') ||
             productName.includes('protezione solare')) {
        category = 'Bellezza';
        subcategory = 'cura-pelle';
        icon = '🌸';
    }
    // Bagno e igiene personale
    else if (productName.includes('integratore') || productName.includes('balsamo labbra') ||
             productName.includes('gel doccia')) {
        category = 'Bellezza';
        subcategory = 'bagno-igiene';
        icon = '🧴';
    }
    // Utensili e accessori
    else if (productName.includes('caricabatterie')) {
        category = 'Bellezza';
        subcategory = 'utensili-accessori';
        icon = '🔌';
    }
    // Trucco (vuota per ora)
    // Solo prodotti Health & Beauty (NO Home & Garden)
    else if (backendProduct.category === 'Health & Beauty') {
        category = 'Bellezza';
        subcategory = 'altro';
        icon = '✨';
    }
    // Tutti gli altri prodotti (Home & Garden, ecc.) = null = nascosti
    else {
        return null;
    }

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
        zenovaCategories: backendProduct.zenovaCategories || []
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
 * Load products from backend
 */
async function loadProductsFromBackend() {
    console.log('🔄 Caricamento prodotti dal backend...');

    try {
        // Check if ZenovaAPI is available
        if (typeof ZenovaAPI === 'undefined') {
            console.warn('⚠️ ZenovaAPI non disponibile, uso prodotti statici');
            products = staticProducts;
            return false;
        }

        // Call backend API
        const backendProducts = await ZenovaAPI.getProducts(1, 100);

        if (backendProducts && backendProducts.length > 0) {
            console.log(`✅ Ricevuti ${backendProducts.length} prodotti dal backend`);

            // Map backend products to frontend format and filter out hidden products
            products = backendProducts
                .map(mapBackendProductToFrontend)
                .filter(p => p !== null); // Rimuovi prodotti nascosti

            console.log('✅ Prodotti convertiti e pronti:', products.length);
            console.log('📊 Prodotti visibili: Benessere + Bellezza solamente');
            return true;
        } else {
            console.warn('⚠️ Nessun prodotto ricevuto dal backend, uso prodotti statici');
            products = staticProducts;
            return false;
        }
    } catch (error) {
        console.error('❌ Errore caricamento prodotti dal backend:', error);
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

    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Validazione in corso...';
        checkoutBtn.disabled = true;
    }

    console.log('🔄 Inizio validazione carrello...');
    const isValid = await validateCartWithBackend();
    console.log('✅ Validazione completata:', isValid);

    if (isValid) {
        console.log('➡️ Reindirizzamento a checkout.html');
        window.location.href = 'checkout.html';
    } else {
        console.log('❌ Validazione fallita');
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Procedi all\'acquisto';
            checkoutBtn.disabled = false;
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Load products from backend first
    await loadProductsFromBackend();

    // Then render and setup everything
    renderProducts();
    loadCart();
    loadWishlist();
    setupEventListeners();
    // setupCategorySidebar(); // REMOVED - sidebar.js handles category accordion
    initDarkMode();
});

// Render Products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-subcategory', product.subcategory);

        const isInWishlist = wishlist.some(item => item.id === product.id);
        const wishlistClass = isInWishlist ? 'in-wishlist' : '';
        const wishlistIcon = isInWishlist ? '♥' : '♡';

        productCard.innerHTML = `
            ${product.badge ? `<div class="product-badge product-badge-${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</div>` : ''}
            <button class="product-card-wishlist-btn ${wishlistClass}" data-product-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}'); updateProductCardsWishlist();">
                ${wishlistIcon}
            </button>
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : product.icon}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">€${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}');">
                        Aggiungi al carrello
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
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
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Il tuo carrello è vuoto</p>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            // Get image URL or fallback
            let imageHtml = '';
            if (item.image && item.image.startsWith('http')) {
                imageHtml = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
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
                        <div class="cart-item-price">€${item.price.toFixed(2)}</div>
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
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2)}`;
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
    try {
        console.log('🔄 Validazione carrello con backend...');

        // TEMPORARY FIX: Skip backend validation when backend is not running
        // This allows testing the checkout flow without a running backend
        console.warn('⚠️ Backend non disponibile - skip validazione (modalità sviluppo)');
        return true; // Allow checkout without validation in development

        // Check if ZenovaAPI is available
        if (typeof ZenovaAPI === 'undefined') {
            console.warn('⚠️ ZenovaAPI non disponibile, skip validazione');
            return true; // Allow checkout without validation in development
        }

        // Prepare cart items for validation
        const cartItems = cart.map(item => ({
            productId: item.id,
            bigbuyId: item.bigbuyId || item.id,
            quantity: item.quantity
        }));

        // Call backend validation API
        const result = await ZenovaAPI.validateCart(cartItems);

        if (result.success) {
            console.log('✅ Carrello validato con successo');

            // Check if there are any issues
            if (result.data.issues && result.data.issues.length > 0) {
                // Show issues to user
                let message = 'Attenzione:\n\n';
                result.data.issues.forEach(issue => {
                    message += `- ${issue.message}\n`;
                });
                alert(message);
                return false;
            }

            return true;
        } else {
            console.error('❌ Errore validazione carrello:', result.error);
            alert('Errore durante la validazione del carrello. Riprova.');
            return false;
        }
    } catch (error) {
        console.error('❌ Errore validazione carrello:', error);
        alert('Errore di connessione. Verifica la tua connessione e riprova.');
        return false;
    }
}

// ============ WISHLIST FUNCTIONS ============

// Add to Wishlist
function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
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
        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <button class="wishlist-remove-btn" onclick="removeFromWishlist(${item.id})">&times;</button>
                <div class="wishlist-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : item.icon}
                </div>
                <div class="wishlist-item-info">
                    <div class="wishlist-item-category">${item.category}</div>
                    <div class="wishlist-item-name">${item.name}</div>
                    <div class="wishlist-item-price">€${item.price.toFixed(2)}</div>
                    <div class="wishlist-item-actions">
                        <button class="wishlist-add-cart-btn" onclick="addToCartFromWishlist('${item.id}')">
                            Aggiungi al Carrello
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
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
    const closeCart = document.getElementById('closeCart');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const closeWishlist = document.getElementById('closeWishlist');
    const overlay = document.getElementById('overlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const wishlistSidebar = document.getElementById('wishlistSidebar');

    // Cart listeners
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        wishlistSidebar.classList.remove('active');
        overlay.classList.add('active');
    });

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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
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

        // Validate cart with backend before checkout
        console.log('🔄 Inizio validazione carrello...');
        checkoutBtn.textContent = 'Validazione in corso...';
        checkoutBtn.disabled = true;

        const isValid = await validateCartWithBackend();

        console.log('✅ Validazione completata:', isValid);

        if (isValid) {
            console.log('➡️ Reindirizzamento a checkout.html');
            window.location.href = 'checkout.html';
        } else {
            console.log('❌ Validazione fallita');
            checkoutBtn.textContent = 'Procedi all\'acquisto';
            checkoutBtn.disabled = false;
        }
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
// function setupCategorySidebar() {
//     const categoryBtns = document.querySelectorAll('.category-btn');
//
//     console.log('Setting up sidebar, found buttons:', categoryBtns.length);
//
//     if (categoryBtns.length === 0) {
//         console.log('No category buttons found, exiting');
//         // Show message on page if buttons not found
//         const sidebar = document.querySelector('.categories-sidebar');
//         if (sidebar) {
//             const msg = document.createElement('div');
//             msg.style.cssText = 'color: red; padding: 10px; background: #fff;';
//             msg.textContent = 'ERRORE: Pulsanti non trovati!';
//             sidebar.prepend(msg);
//         }
//         return; // Exit if no sidebar exists
//     }
//
//     // Show success message
//     const sidebar = document.querySelector('.categories-sidebar');
//     if (sidebar) {
//         const msg = document.createElement('div');
//         msg.style.cssText = 'color: green; padding: 10px; background: #e8f5e9; margin-bottom: 10px; border-radius: 5px; font-size: 12px;';
//         msg.textContent = `✓ Sidebar attiva! Trovati ${categoryBtns.length} pulsanti`;
//         sidebar.querySelector('.sidebar-header').after(msg);
//
//         // Remove message after 3 seconds
//         setTimeout(() => msg.remove(), 3000);
//     }
//
//     categoryBtns.forEach((btn, index) => {
//         console.log('Adding listener to button', index);
//         btn.addEventListener('click', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//
//             alert('Click rilevato su categoria ' + index);
//             console.log('Button clicked!', index);
//
//             const categoryItem = this.parentElement;
//             console.log('Category item:', categoryItem);
//
//             // Close all other categories
//             document.querySelectorAll('.category-item').forEach(item => {
//                 if (item !== categoryItem) {
//                     item.classList.remove('active');
//                     const sublist = item.querySelector('.subcategory-list');
//                     if (sublist) sublist.style.maxHeight = '0px';
//                 }
//             });
//
//             // Toggle current category
//             const wasActive = categoryItem.classList.contains('active');
//             const subcategoryList = categoryItem.querySelector('.subcategory-list');
//
//             if (wasActive) {
//                 categoryItem.classList.remove('active');
//                 if (subcategoryList) subcategoryList.style.maxHeight = '0px';
//                 console.log('Closed category');
//             } else {
//                 categoryItem.classList.add('active');
//                 if (subcategoryList) subcategoryList.style.maxHeight = '500px';
//                 console.log('Opened category');
//             }
//
//             // Visual debug - change button color
//             this.style.background = wasActive ? '' : 'rgba(212, 163, 115, 0.3)';
//         });
//     });
//
//     // Handle subcategory clicks - filter products on page
//     const subcategoryLinks = document.querySelectorAll('.subcategory-link');
//
//     subcategoryLinks.forEach(link => {
//         link.addEventListener('click', (e) => {
//             e.preventDefault();
//             const subcategory = link.dataset.subcategory;
//             console.log('Filtering by subcategory:', subcategory);
//
//             // Remove active class from all links
//             subcategoryLinks.forEach(l => l.classList.remove('active'));
//             // Add active class to clicked link
//             link.classList.add('active');
//
//             // Filter products
//             const productCards = document.querySelectorAll('.product-card');
//             productCards.forEach(card => {
//                 if (subcategory === 'all') {
//                     card.style.display = 'block';
//                 } else {
//                     const cardSubcategory = card.getAttribute('data-subcategory');
//                     if (cardSubcategory === subcategory) {
//                         card.style.display = 'block';
//                     } else {
//                         card.style.display = 'none';
//                     }
//                 }
//             });
//
//             // Scroll to products section
//             document.querySelector('.products-grid').scrollIntoView({ behavior: 'smooth' });
//         });
//     });
// }

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
        searchModal.classList.remove('active');
        searchInput.value = '';
    }

    // Real-time search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            displayInitialResults();
        } else {
            performSearch(query);
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
        const recentProducts = products.slice(0, 5);
        displayResults(recentProducts, '');
    }

    // Perform search
    function performSearch(query) {
        const results = products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(query);
            const categoryMatch = product.category.toLowerCase().includes(query);
            const descMatch = product.description.toLowerCase().includes(query);

            return nameMatch || categoryMatch || descMatch;
        });

        displayResults(results, query);
    }

    // Display search results
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-empty">
                    <div class="search-empty-icon">🔍</div>
                    <div class="search-empty-text">Nessun risultato trovato</div>
                    <div class="search-empty-hint">Prova con parole chiave diverse come "lavanda", "diffusore" o "yoga"</div>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(product => {
            // Highlight matching text
            const highlightedName = highlightText(product.name, query);
            const highlightedDesc = highlightText(product.description, query);

            return `
                <div class="search-result-item" onclick="handleSearchResultClick('${product.id}')">
                    <div class="search-result-icon">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);">` : product.icon}
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-category">${product.category}</div>
                        <div class="search-result-name">${highlightedName}</div>
                        <div class="search-result-description">${highlightedDesc}</div>
                    </div>
                    <div class="search-result-price">€${product.price.toFixed(2)}</div>
                </div>
            `;
        }).join('');
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
    // Close search modal
    document.getElementById('searchModal').classList.remove('active');
    document.getElementById('searchInput').value = '';

    // Open product detail modal
    openProductDetailModal(productId);
};

// ============ PRODUCT DETAIL MODAL ============

let currentProductId = null;
let savedScrollPosition = 0;

// Gallery state
let currentGalleryIndex = 0;
let currentGalleryImages = [];

// Open product detail modal
function openProductDetailModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;

    // Salva la posizione di scroll corrente
    savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    const modal = document.getElementById('productDetailModal');

    // Use ALL product images from BigBuy (not just 1 repeated)
    if (product.images && product.images.length > 0) {
        currentGalleryImages = product.images; // Tutte le immagini reali!
    } else if (product.image) {
        currentGalleryImages = [product.image];
    } else {
        currentGalleryImages = [product.icon];
    }
    currentGalleryIndex = 0;

    // Update gallery
    updateGallery();

    // Breadcrumb
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    breadcrumbCategory.textContent = product.category || 'Prodotti';

    // Brand Badge
    const brandBadge = document.getElementById('productBrand');
    if (product.brand) {
        brandBadge.textContent = `Brand: ${product.brand}`;
        brandBadge.style.display = 'inline-block';
    } else {
        brandBadge.style.display = 'none';
    }

    // Product Name
    document.getElementById('productDetailName').textContent = product.name;

    // Tags (from zenovaCategories)
    const tagsContainer = document.getElementById('productTags');
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

    // Price
    document.getElementById('productDetailPrice').textContent = `€${product.price.toFixed(2)}`;

    // Stock
    const stockElement = document.getElementById('productStock');
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

    // Description
    document.getElementById('productDetailDescription').innerHTML = product.description || 'Descrizione non disponibile';

    // Technical Info
    const techInfoGrid = document.getElementById('techInfoGrid');
    const techInfo = [];

    if (product.ean) techInfo.push({ label: 'EAN', value: product.ean });
    if (product.dimensions) {
        const dims = product.dimensions;
        techInfo.push({
            label: 'Dimensioni',
            value: `${dims.width || '-'} x ${dims.height || '-'} x ${dims.depth || '-'} cm`
        });
    }
    if (product.weight) techInfo.push({ label: 'Peso', value: `${product.weight} kg` });
    if (product.brand) techInfo.push({ label: 'Produttore', value: product.brand });

    if (techInfo.length > 0) {
        techInfoGrid.innerHTML = techInfo
            .map(item => `
                <div class="tech-info-item">
                    <div class="tech-info-label">${item.label}</div>
                    <div class="tech-info-value">${item.value}</div>
                </div>
            `)
            .join('');
        document.getElementById('productTechnicalInfo').style.display = 'block';
    } else {
        document.getElementById('productTechnicalInfo').style.display = 'none';
    }

    // Generate features with REAL product data
    const features = getProductFeatures(product);
    const featuresList = document.getElementById('productDetailFeatures');
    featuresList.innerHTML = features.map(f => `<li>${f}</li>`).join('');

    // Update wishlist button state
    updateWishlistButtonInModal();

    // Show modal
    modal.classList.add('active');

    // Scrolla sempre in alto all'apertura del modal
    const modalContent = document.querySelector('.product-detail-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
}

// Update gallery display
function updateGallery() {
    const imageContainer = document.getElementById('productDetailImage');
    const dotsContainer = document.getElementById('galleryDots');
    const counterElement = document.getElementById('galleryCounter');

    // Update image
    const currentImage = currentGalleryImages[currentGalleryIndex];
    if (currentImage.startsWith('http')) {
        imageContainer.innerHTML = `<img src="${currentImage}" alt="Product Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-lg);">`;
    } else {
        imageContainer.innerHTML = currentImage;
    }

    // Update counter
    if (counterElement) {
        counterElement.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
    }

    // Update dots
    dotsContainer.innerHTML = currentGalleryImages.map((img, index) =>
        `<div class="gallery-dot ${index === currentGalleryIndex ? 'active' : ''}" onclick="goToGalleryImage(${index})"></div>`
    ).join('');
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

    // Ripristina la posizione di scroll salvata
    setTimeout(() => {
        window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant'
        });
    }, 0);
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
            features.push(`Peso: ${product.weight} kg`);
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

// Make product cards clickable
function makeProductCardsClickable() {
    // Use event delegation for dynamically added cards
    document.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.add-to-cart-btn') && !e.target.closest('.product-card-wishlist-btn')) {
            const productId = getProductIdFromCard(productCard);
            if (productId) {
                openProductDetailModal(productId);
            }
        }
    });
}

// Get product ID from card element
function getProductIdFromCard(card) {
    // Find the wishlist button and extract ID from data attribute
    const wishlistBtn = card.querySelector('.product-card-wishlist-btn');
    if (wishlistBtn) {
        const productId = wishlistBtn.getAttribute('data-product-id');
        if (productId) {
            return productId; // ✅ FIX: ritorna stringa, non parseInt (BigBuy usa ID alfanumerici)
        }
    }
    return null;
}

// Initialize product detail modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    setupProductDetailModal();
    makeProductCardsClickable();
    initDarkMode();
});

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

// Initialize newsletter popup
document.addEventListener('DOMContentLoaded', () => {
    initNewsletterPopup();
});

// ============================================
// TESTIMONIALS SLIDER
// ============================================

const testimonials = [
    {
        id: 1,
        name: "Sofia Romano",
        location: "Milano, Italia",
        product: "Diffusore Ultrasonico",
        rating: 5,
        text: "Ho acquistato il diffusore ultrasonico e la mia casa si è trasformata in un'oasi di pace. L'app è incredibilmente intuitiva e la qualità del prodotto è eccezionale. Finalmente riesco a rilassarmi dopo una lunga giornata di lavoro.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    {
        id: 2,
        name: "Marco Ferretti",
        location: "Roma, Italia",
        product: "Lampada Circadiana",
        rating: 5,
        text: "La lampada circadiana ha completamente migliorato la qualità del mio sonno. L'intelligenza artificiale regola automaticamente la luce in base al mio ritmo circadiano. Un investimento che consiglio a tutti!",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    },
    {
        id: 3,
        name: "Giulia Bianchi",
        location: "Firenze, Italia",
        product: "Cuscino Meditazione Premium",
        rating: 5,
        text: "Pratico yoga da anni e questo cuscino è semplicemente perfetto. La qualità dei materiali è fantastica e il design minimalista si integra perfettamente nel mio spazio zen. Zenova ha capito davvero cosa significa benessere.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
        id: 4,
        name: "Alessandro Conti",
        location: "Torino, Italia",
        product: "Umidificatore Smart",
        rating: 5,
        text: "L'umidificatore smart di Zenova è un concentrato di tecnologia e design. Controllo tutto dallo smartphone e l'aria in casa mia non è mai stata così pura. Spedizione velocissima e packaging curatissimo!",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
        id: 5,
        name: "Francesca Ricci",
        location: "Bologna, Italia",
        product: "Campana Tibetana",
        rating: 5,
        text: "La campana tibetana di Zenova produce un suono incredibilmente puro e rilassante. Uso la funzione di sound therapy ogni sera prima di dormire e i risultati sono strabilianti. Un prodotto che cambia la vita.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
    }
];

let currentTestimonialIndex = 0;
let testimonialAutoplayInterval = null;

function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    const dotsContainer = document.getElementById('testimonialsDots');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');

    if (!track) return; // Exit if not on a page with testimonials

    // Render all testimonials
    renderTestimonials();

    // Create dots
    createTestimonialDots();

    // Add navigation event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateTestimonial('prev');
            resetAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            navigateTestimonial('next');
            resetAutoplay();
        });
    }

    // Add dot click listeners
    const dots = document.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentTestimonialIndex = index;
            updateTestimonialSlider();
            resetAutoplay();
        });
    });

    // Start autoplay
    startTestimonialAutoplay();

    // Pause on hover
    const sliderContainer = document.querySelector('.testimonials-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', pauseTestimonialAutoplay);
        sliderContainer.addEventListener('mouseleave', startTestimonialAutoplay);
    }
}

function renderTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    track.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <div class="testimonial-stars">
                    ${'★'.repeat(testimonial.rating)}
                </div>
                <p class="testimonial-text">${testimonial.text}</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">
                        <img src="${testimonial.avatar}" alt="${testimonial.name}">
                    </div>
                    <div class="testimonial-info">
                        <h4 class="testimonial-name">${testimonial.name}</h4>
                        <p class="testimonial-location">${testimonial.location}</p>
                        <p class="testimonial-product">Prodotto: ${testimonial.product}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createTestimonialDots() {
    const dotsContainer = document.getElementById('testimonialsDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = testimonials.map((_, index) =>
        `<button class="testimonial-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`
    ).join('');
}

function navigateTestimonial(direction) {
    if (direction === 'next') {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    } else {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    }
    updateTestimonialSlider();
}

function updateTestimonialSlider() {
    const track = document.getElementById('testimonialsTrack');
    const dots = document.querySelectorAll('.testimonial-dot');

    if (!track) return;

    // Update slider position
    const offset = -currentTestimonialIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    // Update dots
    dots.forEach((dot, index) => {
        if (index === currentTestimonialIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function startTestimonialAutoplay() {
    if (testimonialAutoplayInterval) return; // Already running

    testimonialAutoplayInterval = setInterval(() => {
        navigateTestimonial('next');
    }, 5000); // Change testimonial every 5 seconds
}

function pauseTestimonialAutoplay() {
    if (testimonialAutoplayInterval) {
        clearInterval(testimonialAutoplayInterval);
        testimonialAutoplayInterval = null;
    }
}

function resetAutoplay() {
    pauseTestimonialAutoplay();
    startTestimonialAutoplay();
}

// Initialize testimonials slider
document.addEventListener('DOMContentLoaded', () => {
    initTestimonialsSlider();
});
