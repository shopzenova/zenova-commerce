/**
 * Category Products Handler - Zenova E-commerce
 * Gestisce il caricamento e visualizzazione prodotti per categoria
 */

const API_BASE = 'http://localhost:3000/api';

// Mapping categorie
const CATEGORY_MAP = {
    'smart-living': 'smart-living',
    'cura-corpo-skin': 'cura-corpo-skin',
    'meditazione-zen': 'meditazione-zen',
    'design-atmosfera': 'design-atmosfera',
    'gourmet-tea-coffee': 'gourmet-tea-coffee'
};

// Stato globale
let allProducts = [];
let currentCategory = null;

/**
 * Inizializzazione pagina
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Determina la categoria dalla pagina corrente
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        currentCategory = productsGrid.getAttribute('data-category');
        console.log('📂 Categoria corrente:', currentCategory);
    }

    // Carica i prodotti
    await loadCategoryProducts();

    // Aggiorna i contatori nel menu navigazione
    updateCategoryCounts();
});

/**
 * Carica prodotti dal backend e filtra per categoria
 */
async function loadCategoryProducts() {
    try {
        // Carica TUTTI i prodotti visibili (senza filtro zona) per mostrare prodotti da home + sidebar
        const response = await fetch(`${API_BASE}/products?pageSize=10000`);

        if (!response.ok) {
            throw new Error('Errore nel caricamento dei prodotti');
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            allProducts = result.data;
            console.log('📦 Prodotti totali caricati:', allProducts.length);

            // Filtra prodotti per categoria corrente
            const filteredProducts = filterProductsByCategory(currentCategory);
            console.log(`🎯 Prodotti in "${currentCategory}":`, filteredProducts.length);

            // Renderizza prodotti
            renderCategoryProducts(filteredProducts);
        } else {
            console.error('❌ Formato risposta non valido');
            showEmptyState('Errore nel caricamento dei prodotti');
        }
    } catch (error) {
        console.error('❌ Errore caricamento prodotti:', error);
        showEmptyState('Impossibile caricare i prodotti. Riprova più tardi.');
    }
}

/**
 * Filtra prodotti per categoria Zenova
 */
function filterProductsByCategory(category) {
    if (!category) return allProducts;

    return allProducts.filter(product => {
        // Controlla se il prodotto ha zenovaCategories
        if (!product.zenovaCategories || !Array.isArray(product.zenovaCategories)) {
            return false;
        }

        // Controlla se la categoria è nelle zenovaCategories del prodotto
        return product.zenovaCategories.includes(category);
    });
}

/**
 * Renderizza i prodotti nella griglia
 */
function renderCategoryProducts(products) {
    const productsGrid = document.getElementById('productsGrid');

    if (!productsGrid) {
        console.error('❌ productsGrid non trovato');
        return;
    }

    if (!products || products.length === 0) {
        showEmptyState(`Nessun prodotto disponibile in questa categoria al momento.<br><br>Stiamo lavorando per aggiungere nuovi prodotti!`);
        return;
    }

    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');

    // Aggiungi event listeners per i bottoni
    attachProductEventListeners();
}

/**
 * Crea card HTML per un prodotto
 */
function createProductCard(product) {
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'https://via.placeholder.com/300x300?text=No+Image';

    const price = parseFloat(product.price) || 0;
    const stock = parseInt(product.stock) || 0;
    const isOutOfStock = stock <= 0;

    // Badge categoria
    const categoryBadges = (product.zenovaCategories || [])
        .filter(cat => cat !== 'exclude')
        .map(cat => getCategoryBadge(cat))
        .join('');

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                ${isOutOfStock ? '<div class="out-of-stock-badge">Esaurito</div>' : ''}
                ${categoryBadges}
                <button class="wishlist-btn-card" data-product-id="${product.id}" title="Aggiungi ai preferiti">
                    ♡
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                ${product.brand ? `<p class="product-brand">${product.brand}</p>` : ''}
                <div class="product-price">€${price.toFixed(2)}</div>
                ${stock > 0 && stock <= 10 ? `<p class="product-stock-warning">Solo ${stock} disponibili</p>` : ''}
                <div class="product-actions">
                    <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Non Disponibile' : 'Aggiungi al Carrello'}
                    </button>
                    <button class="btn btn-secondary btn-quick-view" data-product-id="${product.id}">
                        Dettagli
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Ottiene il badge HTML per una categoria
 */
function getCategoryBadge(category) {
    const badges = {
        'smart-living': '<div class="category-badge smart-living">🏠 Smart Living</div>',
        'cura-corpo-skin': '<div class="category-badge cura-corpo">💆 Cura Corpo</div>',
        'meditazione-zen': '<div class="category-badge meditazione">🧘 Zen</div>',
        'design-atmosfera': '<div class="category-badge design">🎨 Design</div>',
        'gourmet-tea-coffee': '<div class="category-badge gourmet">☕ Gourmet</div>'
    };

    return badges[category] || '';
}

/**
 * Mostra stato vuoto
 */
function showEmptyState(message) {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;">📦</div>
                <h3 style="color: #666; margin-bottom: 1rem;">Nessun Prodotto</h3>
                <p style="color: #999;">${message}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 2rem; display: inline-block;">
                    Torna alla Home
                </a>
            </div>
        `;
    }
}

/**
 * Aggiorna i contatori di prodotti nel menu navigazione
 */
function updateCategoryCounts() {
    const categories = ['smart-living', 'cura-corpo-skin', 'meditazione-zen', 'design-atmosfera', 'gourmet-tea-coffee'];

    categories.forEach(cat => {
        const count = filterProductsByCategory(cat).length;
        const countElement = document.getElementById(getCountElementId(cat));
        if (countElement) {
            countElement.textContent = `${count} prodotti`;
        }
    });
}

/**
 * Ottiene l'ID dell'elemento contatore per una categoria
 */
function getCountElementId(category) {
    const map = {
        'smart-living': 'smartLivingCount',
        'cura-corpo-skin': 'curaCorpoCount',
        'meditazione-zen': 'meditazioneCount',
        'design-atmosfera': 'designCount',
        'gourmet-tea-coffee': 'gourmetCount'
    };
    return map[category];
}

/**
 * Aggiunge event listeners ai bottoni prodotto
 */
function attachProductEventListeners() {
    // Bottoni "Aggiungi al Carrello"
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });

    // Bottoni "Dettagli" / Quick View
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            showProductDetail(productId);
        });
    });

    // Bottoni Wishlist
    document.querySelectorAll('.wishlist-btn-card').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-product-id');
            toggleWishlist(productId);
        });
    });
}

/**
 * Aggiunge prodotto al carrello
 */
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Prodotto non trovato:', productId);
        return;
    }

    // Usa la funzione globale se esiste (da script.js)
    if (typeof window.addToCart === 'function') {
        window.addToCart(product);
    } else {
        console.log('✅ Prodotto aggiunto al carrello:', product.name);
        alert(`✅ ${product.name} aggiunto al carrello!`);
    }
}

/**
 * Mostra dettagli prodotto
 */
function showProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Prodotto non trovato:', productId);
        return;
    }

    // Usa la funzione globale se esiste (da script.js)
    if (typeof window.openProductDetailModal === 'function') {
        window.openProductDetailModal(product);
    } else {
        console.log('📄 Apertura dettagli prodotto:', product.name);
        // Fallback: redirect a pagina prodotto
        window.location.href = `prodotto.html?id=${productId}`;
    }
}

/**
 * Toggle wishlist
 */
function toggleWishlist(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Prodotto non trovato:', productId);
        return;
    }

    // Usa la funzione globale se esiste (da script.js)
    if (typeof window.toggleWishlist === 'function') {
        window.toggleWishlist(product);
    } else {
        console.log('❤️ Toggle wishlist:', product.name);
        alert(`❤️ ${product.name} aggiunto ai preferiti!`);
    }
}

console.log('✅ category-products.js caricato');
