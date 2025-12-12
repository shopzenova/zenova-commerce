// Admin Panel JavaScript

// API Configuration
const API_BASE = 'http://localhost:3000/api';

// Authentication
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Demo authentication (replace with real authentication later)
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';

        // Save session
        localStorage.setItem('zenova_admin_logged', 'true');
    } else {
        alert('Credenziali non valide');
    }
});

// Check if already logged in
window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('zenova_admin_logged') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('zenova_admin_logged');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

// Section Navigation
const navLinks = document.querySelectorAll('.admin-nav-link');
const sections = document.querySelectorAll('.admin-section');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const sectionId = this.dataset.section;

        // Remove active class from all links and sections
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        // Add active class to clicked link and corresponding section
        this.classList.add('active');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Function to switch sections programmatically
function switchSection(sectionId) {
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
    const targetSection = document.getElementById(sectionId);

    if (targetLink && targetSection) {
        targetLink.classList.add('active');
        targetSection.classList.add('active');
    }
}

// Drag and Drop for Products
let draggedElement = null;

const productCards = document.querySelectorAll('.product-card-admin');
const dropZones = document.querySelectorAll('.product-drop-zone');

productCards.forEach(card => {
    card.addEventListener('dragstart', function(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        dropZones.forEach(zone => zone.classList.remove('drag-over'));
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    });

    zone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedElement) {
            const productId = draggedElement.dataset.id;
            const targetZoneId = this.id; // 'homeProducts', 'sidebarProducts', 'hiddenProducts'

            // Map zone ID to zone name
            const zoneMap = {
                'homeProducts': 'home',
                'sidebarProducts': 'sidebar',
                'hiddenProducts': 'hidden'
            };
            const newZone = zoneMap[targetZoneId];

            // Update product zone in allProducts array
            const product = allProducts.find(p => p.id === productId);
            if (product && newZone) {
                product.zone = newZone;
                console.log(`✅ Prodotto "${product.name}" spostato in zona: ${newZone}`);
            }

            // Move element in DOM
            this.appendChild(draggedElement);
            updateZoneCounts();
            saveProductLayout();
        }
    });
});

// Update zone product counts
function updateZoneCounts() {
    dropZones.forEach(zone => {
        const count = zone.querySelectorAll('.product-card-admin').length;
        const zoneHeader = zone.parentElement.querySelector('.zone-count');
        if (zoneHeader) {
            zoneHeader.textContent = `${count} prodotti`;
        }
    });
}

// Save product layout to server and localStorage
async function saveProductLayout() {
    const layout = {
        home: [],
        sidebar: [],
        hidden: [],
        featured: [] // IMPORTANTE: deve essere incluso!
    };

    // Leggi il layout dall'array di prodotti invece che dal DOM
    allProducts.forEach(product => {
        if (product.zone === 'home') {
            layout.home.push(product.id);
        } else if (product.zone === 'sidebar') {
            layout.sidebar.push(product.id);
        } else if (product.zone === 'hidden') {
            layout.hidden.push(product.id);
        } else {
            // Default: sidebar
            layout.sidebar.push(product.id);
        }
    });

    // Save to localStorage
    localStorage.setItem('zenova_product_layout', JSON.stringify(layout));

    // Save to server
    try {
        const response = await fetch(`${API_BASE}/admin/products/layout`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ layout })
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ Layout salvato su server:', layout);
            console.log(`📊 Salvati: ${layout.home.length} home, ${layout.sidebar.length} sidebar, ${layout.hidden.length} hidden`);
        }
    } catch (error) {
        console.error('❌ Errore salvataggio layout:', error);
    }
}

// Load product layout from localStorage
function loadProductLayout() {
    const savedLayout = localStorage.getItem('zenova_product_layout');
    if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        console.log('Layout caricato:', layout);
        // Implement layout restoration logic here
    }
}

// Pricing Calculator
function calculatePrice() {
    const bigbuyPrice = parseFloat(document.getElementById('bigbuyPrice').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost').value) || 0;
    const managementCost = parseFloat(document.getElementById('managementCost').value) || 0;
    const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;

    // Calculate total cost
    const totalCost = bigbuyPrice + shippingCost + managementCost;

    // Calculate margin amount
    const marginAmount = totalCost * (profitMargin / 100);

    // Calculate final price
    const finalPrice = totalCost + marginAmount;

    // Calculate net profit (margin - management costs already included)
    const netProfit = marginAmount;

    // Round to .90 or .99
    const roundedPrice = Math.ceil(finalPrice) - 0.10;

    // Update UI
    document.getElementById('totalCost').textContent = `€ ${totalCost.toFixed(2)}`;
    document.getElementById('marginAmount').textContent = `€ ${marginAmount.toFixed(2)}`;
    document.getElementById('finalPrice').textContent = `€ ${roundedPrice.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `€ ${netProfit.toFixed(2)}`;
}

// Auto-calculate on input change
const priceInputs = ['bigbuyPrice', 'shippingCost', 'managementCost', 'profitMargin'];
priceInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', calculatePrice);
    }
});

// Sync Now Function
async function syncNow() {
    const syncBtn = document.querySelector('.btn-sync');
    const syncSpinner = document.querySelector('.sync-spinner');
    const syncStatusText = document.querySelector('.sync-status-text');

    // Start animation
    syncBtn.disabled = true;
    syncBtn.textContent = 'Sincronizzazione...';
    syncStatusText.textContent = '⏳ Sincronizzazione in corso...';
    syncStatusText.style.color = '#f39c12';

    try {
        // Call real API
        const response = await fetch(`${API_BASE}/admin/sync/now`, {
            method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
            syncBtn.disabled = false;
            syncBtn.textContent = 'Sincronizza Ora';
            syncStatusText.textContent = '✅ Sincronizzato - Tutto aggiornato';
            syncStatusText.style.color = '#43e97b';

            // Update last sync time
            const now = new Date();
            const timeString = `Oggi alle ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            document.querySelector('.sync-info small').textContent = `Ultima sincronizzazione: ${timeString}`;

            // Show notification
            showNotification('Sincronizzazione completata!', 'success');

            // Add log entry
            const description = `${result.data.productsUpdated} prodotti aggiornati, ${result.data.stockUpdates} stock aggiornati, ${result.data.newProducts} nuovi disponibili`;
            addSyncLogEntry('Sincronizzazione completata', description, 'success');

            // Reload stats and products
            loadDashboardStats();
            loadProducts();
        }
    } catch (error) {
        console.error('❌ Errore sincronizzazione:', error);
        syncBtn.disabled = false;
        syncBtn.textContent = 'Sincronizza Ora';
        syncStatusText.textContent = '❌ Errore sincronizzazione';
        syncStatusText.style.color = '#e74c3c';
        showNotification('Errore durante la sincronizzazione', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#43e97b' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add sync log entry
function addSyncLogEntry(title, description, type = 'success') {
    const logList = document.querySelector('.log-list');
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
        <span class="log-icon">${type === 'success' ? '✅' : '⚠️'}</span>
        <div class="log-info">
            <strong>${title}</strong>
            <p>${timeString} - ${description}</p>
        </div>
    `;

    logList.insertBefore(logItem, logList.firstChild);

    // Keep only last 10 entries
    while (logList.children.length > 10) {
        logList.removeChild(logList.lastChild);
    }
}

// Add CSS animations
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

// Load dashboard statistics from API
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const result = await response.json();

        if (result.success) {
            const stats = result.data;

            // Update stat cards
            document.querySelector('.stat-card:nth-child(1) h3').textContent = stats.totalProducts;
            document.querySelector('.stat-card:nth-child(2) h3').textContent = stats.availableProducts;
            document.querySelector('.stat-card:nth-child(3) h3').textContent = stats.todayOrders;
            document.querySelector('.stat-card:nth-child(4) h3').textContent =
                stats.todaySales > 0 ? `€ ${stats.todaySales.toLocaleString()}` : '€ 0';

            console.log('✅ Statistiche caricate:', stats);
        }
    } catch (error) {
        console.error('❌ Errore caricamento statistiche:', error);
    }
}

// Variabile globale per tenere traccia di tutti i prodotti
let allProducts = [];

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/admin/products?zone=all`);
        const result = await response.json();

        if (result.success) {
            allProducts = result.data;
            console.log(`✅ Caricati ${allProducts.length} prodotti`);

            // Popola le zone con i prodotti reali
            populateProductZones(allProducts);

            // Salva il layout dal server
            if (result.layout) {
                localStorage.setItem('zenova_product_layout', JSON.stringify(result.layout));
            }
        }
    } catch (error) {
        console.error('❌ Errore caricamento prodotti:', error);
    }
}

// Popola le zone prodotti
function populateProductZones(products, updateList = true) {
    const homeZone = document.getElementById('homeProducts');
    const sidebarZone = document.getElementById('sidebarProducts');
    const hiddenZone = document.getElementById('hiddenProducts');

    // Filtra prodotti per zona
    const homeProducts = products.filter(p => p.zone === 'home');
    const sidebarProducts = products.filter(p => p.zone === 'sidebar');
    const hiddenProducts = products.filter(p => p.zone === 'hidden');

    console.log('📊 Zone counts:', {
        home: homeProducts.length,
        sidebar: sidebarProducts.length,
        hidden: hiddenProducts.length
    });

    // Svuota le zone
    homeZone.innerHTML = '';
    sidebarZone.innerHTML = '';
    hiddenZone.innerHTML = '';

    // Popola home (mostra solo i primi 6)
    homeProducts.slice(0, 6).forEach(product => {
        homeZone.appendChild(createProductCard(product));
    });

    // Popola sidebar (mostra solo i primi 4)
    sidebarProducts.slice(0, 4).forEach(product => {
        sidebarZone.appendChild(createProductCard(product));
    });

    // Popola hidden
    hiddenProducts.forEach(product => {
        hiddenZone.appendChild(createProductCard(product));
    });

    updateZoneCounts();

    // Popola anche la lista completa dei prodotti solo al primo caricamento
    if (updateList) {
        populateAllProductsList(products);
    }
}

// Popola la lista completa con selezione zona
function populateAllProductsList(products) {
    const listContainer = document.getElementById('allProductsList');
    if (!listContainer) return;

    // Update total count
    const totalCountElement = document.getElementById('totalProductsCount');
    if (totalCountElement) {
        totalCountElement.textContent = products.length.toLocaleString();
    }

    listContainer.innerHTML = '';

    // Show warning if too many products
    if (products.length > 1000) {
        const warning = document.createElement('div');
        warning.style.cssText = 'padding: 15px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; margin-bottom: 15px; text-align: center;';
        warning.innerHTML = `
            ⚠️ <strong>${products.length.toLocaleString()} prodotti</strong> caricati.
            Usa la ricerca per filtrare i risultati e migliorare le performance.
        `;
        listContainer.appendChild(warning);
    }

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-list-item';
        productItem.innerHTML = `
            <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/60'}"
                 alt="${product.name}"
                 class="product-list-img">
            <div class="product-list-info">
                <h4>${product.name}</h4>
                <p class="product-price">€ ${product.price.toFixed(2)}</p>
            </div>
            <select class="product-zone-select" data-product-id="${product.id}">
                <option value="sidebar" ${product.zone === 'sidebar' || !product.zone ? 'selected' : ''}>Sidebar (Shop)</option>
                <option value="home" ${product.zone === 'home' ? 'selected' : ''}>Home (Vetrina)</option>
                <option value="hidden" ${product.zone === 'hidden' ? 'selected' : ''}>Nascosto</option>
            </select>
            <button class="btn-icon btn-move-category"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-image="${product.images && product.images[0] ? product.images[0] : ''}"
                    data-current-category="${product.zenovaCategory || ''}"
                    data-current-subcategory="${product.zenovaSubcategory || ''}"
                    title="Sposta in altra categoria">📂</button>
            <button class="btn-icon" title="${product.visible ? 'Nascondi prodotto dal sito' : 'Rendi visibile sul sito'}" onclick="toggleProductVisibility('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.visible})">
                ${product.visible ? '👁️' : '👁️‍🗨️'}
            </button>
            <button class="btn-icon" title="Elimina prodotto" onclick="deleteProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">🗑️</button>
        `;

        // Event listener per cambio zona
        const select = productItem.querySelector('.product-zone-select');
        select.addEventListener('change', (e) => {
            const productId = e.target.dataset.productId;
            const newZone = e.target.value;
            updateProductZone(productId, newZone, products);
        });

        listContainer.appendChild(productItem);
    });

    // Attacca event listener ai pulsanti "Sposta Categoria"
    attachMoveCategoryListeners();

    // Setup ricerca prodotti
    setupProductSearch(products);
}

// Aggiorna zona prodotto
function updateProductZone(productId, newZone, products) {
    // Trova il prodotto nell'array globale allProducts
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const oldZone = product.zone;
        product.zone = newZone;
        console.log(`✅ Prodotto ${product.name} spostato da "${oldZone}" a "${newZone}"`);

        // Aggiorna solo le tre zone in alto (home, sidebar, hidden)
        updateVisualZones(allProducts);

        // Salva il layout
        saveProductLayout();
    }
}

// Aggiorna solo le zone visive senza toccare la lista
function updateVisualZones(products) {
    const homeZone = document.getElementById('homeProducts');
    const sidebarZone = document.getElementById('sidebarProducts');
    const hiddenZone = document.getElementById('hiddenProducts');

    // Filtra prodotti per zona
    const homeProducts = products.filter(p => p.zone === 'home');
    const sidebarProducts = products.filter(p => p.zone === 'sidebar');
    const hiddenProducts = products.filter(p => p.zone === 'hidden');

    console.log('📊 Zone counts:', {
        home: homeProducts.length,
        sidebar: sidebarProducts.length,
        hidden: hiddenProducts.length
    });

    // Svuota le zone
    if (homeZone) homeZone.innerHTML = '';
    if (sidebarZone) sidebarZone.innerHTML = '';
    if (hiddenZone) hiddenZone.innerHTML = '';

    // Popola home (mostra solo i primi 6)
    homeProducts.slice(0, 6).forEach(product => {
        if (homeZone) homeZone.appendChild(createProductCard(product));
    });

    // Popola sidebar (mostra solo i primi 4)
    sidebarProducts.slice(0, 4).forEach(product => {
        if (sidebarZone) sidebarZone.appendChild(createProductCard(product));
    });

    // Popola hidden
    hiddenProducts.forEach(product => {
        if (hiddenZone) hiddenZone.appendChild(createProductCard(product));
    });

    updateZoneCounts();
}

// Setup ricerca prodotti
function setupProductSearch(products) {
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const productItems = document.querySelectorAll('.product-list-item');
        let visibleCount = 0;

        productItems.forEach(item => {
            const productName = item.querySelector('h4').textContent.toLowerCase();

            // Se la barra di ricerca è vuota, mostra tutti i prodotti
            if (searchTerm === '') {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                // Cerca se il nome contiene il termine di ricerca
                if (productName.includes(searchTerm)) {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            }
        });

        // Update visible count UI
        const searchInfo = document.getElementById('productSearchInfo');
        const visibleCountElement = document.getElementById('visibleProductsCount');

        if (searchTerm === '') {
            if (searchInfo) searchInfo.style.display = 'none';
        } else {
            if (searchInfo) searchInfo.style.display = 'block';
            if (visibleCountElement) visibleCountElement.textContent = visibleCount.toLocaleString();
        }

        console.log(`🔍 Ricerca "${searchTerm}": ${visibleCount} prodotti trovati su ${productItems.length}`);
    });
}

// Crea card prodotto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card-admin';
    card.draggable = true;
    card.dataset.id = product.id;

    const statusClass = product.available ? 'available' : 'unavailable';
    const statusText = product.available ? '✅ Disponibile' : '❌ Esaurito';

    card.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
        <img src="${product.image || 'https://via.placeholder.com/80'}" alt="${product.name}">
        <div class="product-admin-info">
            <h4>${product.name.substring(0, 50)}${product.name.length > 50 ? '...' : ''}</h4>
            <p class="product-price">€ ${product.price.toFixed(2)}</p>
            <span class="product-status ${statusClass}">${statusText}</span>
        </div>
        <div class="product-actions">
            <button class="btn-icon" title="${product.visible ? 'Nascondi' : 'Mostra'}" onclick="toggleProductVisibility('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.visible})">
                ${product.visible ? '👁️' : '👁️‍🗨️'}
            </button>
            <button class="btn-icon" title="Elimina" onclick="deleteProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">🗑️</button>
        </div>
    `;

    // Riattiva drag & drop per la nuova card
    setupDragAndDrop(card);

    return card;
}

// Setup drag & drop per una card
function setupDragAndDrop(card) {
    card.addEventListener('dragstart', function(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        document.querySelectorAll('.product-drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    });
}

// Load activity log
async function loadActivity() {
    try {
        const response = await fetch(`${API_BASE}/admin/activity`);
        const result = await response.json();

        if (result.success) {
            const activityList = document.querySelector('.activity-list');
            if (activityList && result.data.length > 0) {
                activityList.innerHTML = '';
                result.data.forEach(activity => {
                    const item = document.createElement('div');
                    item.className = 'activity-item';
                    item.innerHTML = `
                        <span class="activity-icon">${activity.icon}</span>
                        <div class="activity-info">
                            <p><strong>${activity.title}</strong></p>
                            <small>${formatTimeAgo(activity.timestamp)} - ${activity.description}</small>
                        </div>
                    `;
                    activityList.appendChild(item);
                });
            }
        }
    } catch (error) {
        console.error('❌ Errore caricamento attività:', error);
    }
}

// Format timestamp
function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffHours = Math.floor((now - then) / (1000 * 60 * 60));

    if (diffHours === 0) return 'Meno di un\'ora fa';
    if (diffHours === 1) return '1 ora fa';
    return `${diffHours} ore fa`;
}

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    // Carica dati reali se loggato
    if (localStorage.getItem('zenova_admin_logged') === 'true') {
        loadDashboardStats();
        loadProducts();
        loadActivity();
    }

    loadProductLayout();
    updateZoneCounts();

    // Auto-save DISABILITATO - il salvataggio avviene immediatamente quando cambi zona
    // setInterval(saveProductLayout, 30000);

    // Refresh stats every 5 minutes
    setInterval(loadDashboardStats, 5 * 60 * 1000);
});

// Export data function
function exportData() {
    const data = {
        layout: JSON.parse(localStorage.getItem('zenova_product_layout') || '{}'),
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenova-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import data function
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('zenova_product_layout', JSON.stringify(data.layout));
            loadProductLayout();
            showNotification('Configurazione importata con successo!', 'success');
        } catch (error) {
            showNotification('Errore durante l\'importazione', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== NUOVE FUNZIONALITÀ: IMPORTAZIONE ED ELIMINAZIONE PRODOTTI =====

// Importa prodotto da BigBuy
// Variabile globale per salvare i dati del prodotto in anteprima
let previewProductData = null;

// Cerca prodotto e mostra anteprima
async function searchProductPreview() {
    const skuInput = document.getElementById('importSKU');
    const categorySelect = document.getElementById('importCategory');
    const sku = skuInput.value.trim();
    const category = categorySelect.value;

    if (!sku) {
        alert('⚠️ Inserisci un SKU BigBuy valido');
        return;
    }

    if (!category) {
        alert('⚠️ Seleziona una categoria');
        return;
    }

    // Mostra loading
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '🔍 Ricerca...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/admin/products/preview/${sku}`);
        const result = await response.json();

        if (result.success) {
            // Salva i dati per l'importazione successiva
            previewProductData = {
                sku: sku,
                category: category,
                productData: result.data
            };

            // Verifica se già importato
            if (result.data.alreadyImported) {
                alert('⚠️ Questo prodotto è già stato importato nel catalogo!');
                button.textContent = originalText;
                button.disabled = false;
                return;
            }

            // Mostra l'anteprima
            document.getElementById('previewImage').src = result.data.images[0] || 'https://via.placeholder.com/120';
            document.getElementById('previewName').textContent = result.data.name;
            document.getElementById('previewBrand').innerHTML = `<strong>Brand:</strong> ${result.data.brand}`;
            document.getElementById('previewPrice').innerHTML = `<strong>Prezzo vendita:</strong> €${result.data.price.toFixed(2)}`;
            document.getElementById('previewCost').innerHTML = `<strong>Tuo costo:</strong> €${result.data.cost.toFixed(2)}`;
            document.getElementById('previewMargin').innerHTML = `<strong>Margine:</strong> €${result.data.margin}`;
            document.getElementById('previewStock').innerHTML = `<strong>Stock:</strong> ${result.data.stock}`;
            document.getElementById('previewImages').innerHTML = `<strong>Immagini:</strong> ${result.data.imageCount}`;

            // Mostra il box anteprima
            document.getElementById('productPreview').style.display = 'block';
        } else {
            alert(`❌ ${result.error}`);
        }
    } catch (error) {
        console.error('Errore ricerca prodotto:', error);
        alert(`❌ Errore durante la ricerca: ${error.message}`);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Conferma importazione prodotto
async function confirmImport() {
    if (!previewProductData) {
        alert('⚠️ Nessun prodotto da importare');
        return;
    }

    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '⏳ Importazione...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/admin/products/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sku: previewProductData.sku,
                category: previewProductData.category
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Prodotto importato con successo!\n\n${result.data.name}\nPrezzo: €${result.data.price}\nCategoria: ${result.data.category}`);

            // Reset form
            document.getElementById('importSKU').value = '';
            document.getElementById('importCategory').value = '';
            document.getElementById('productPreview').style.display = 'none';
            previewProductData = null;

            // Ricarica i prodotti
            await loadProducts();
        } else {
            alert(`❌ Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore importazione:', error);
        alert(`❌ Errore durante l'importazione: ${error.message}`);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Annulla importazione
function cancelImport() {
    document.getElementById('productPreview').style.display = 'none';
    previewProductData = null;
}

// Toggle visibilità prodotto
async function toggleProductVisibility(productId, productName, currentVisibility) {
    const newVisibility = !currentVisibility;
    const action = newVisibility ? 'visibile' : 'nascosto';

    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}/visibility`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ visible: newVisibility })
        });

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Prodotto "${productName}" ora è ${action}`);

            // Ricarica i prodotti per aggiornare l'UI
            await loadProducts();

            // Se siamo nella sezione categorie, ricarica anche quella vista
            const categoriesSection = document.getElementById('categories');
            if (categoriesSection && categoriesSection.classList.contains('active')) {
                await loadProductsByCategory();
            }
        } else {
            alert(`❌ Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore toggle visibilità:', error);
        alert(`❌ Errore durante l'aggiornamento: ${error.message}`);
    }
}

// Elimina prodotto
async function deleteProduct(productId, productName) {
    const confirmed = confirm(`🗑️ Sei sicuro di voler eliminare questo prodotto?\n\n"${productName}"\n\nQuesta azione è irreversibile!`);

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Prodotto eliminato con successo!\n\n${result.data.name}\n\nProdotti rimanenti: ${result.data.totalProducts}`);

            // Ricarica i prodotti
            await loadProducts();
        } else {
            alert(`❌ Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore eliminazione:', error);
        alert(`❌ Errore durante l'eliminazione: ${error.message}`);
    }
}

// Toggle featured product
async function toggleFeatured(productId, productName, currentlyFeatured) {
    try {
        const action = currentlyFeatured ? 'rimuovere da' : 'mettere in';
        const confirmed = confirm(`⭐ ${action.toUpperCase()} evidenza?\n\n"${productName}"\n\n${currentlyFeatured ? 'Non verrà più mostrato tra i prodotti in evidenza.' : 'Verrà mostrato tra i 100 prodotti in evidenza nello shop.'}`);

        if (!confirmed) return;

        const response = await fetch(`${API_BASE}/admin/products/${productId}/featured`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ ${result.message}\n\nTotale prodotti in evidenza: ${result.data.totalFeatured}`);

            // Ricarica la vista corrente
            await loadProductsByCategory();
        } else {
            alert(`❌ Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore toggle featured:', error);
        alert(`❌ Errore durante l'operazione: ${error.message}`);
    }
}

// ============================================
// BROWSER CATALOGO BIGBUY FTP
// ============================================

let catalogState = {
    currentPage: 1,
    pageSize: 20,
    totalProducts: 0,
    filteredCount: 0,
    importedCount: 0,
    products: []
};

// Carica prodotti dal catalogo FTP
async function loadCatalogProducts(page = 1) {
    try {
        const category = document.getElementById('catalogCategory').value;
        const search = document.getElementById('catalogSearch').value;

        // Build query string
        const params = new URLSearchParams({
            page: page,
            pageSize: catalogState.pageSize
        });

        if (category && category !== 'all') {
            params.append('category', category);
        }

        if (search && search.trim()) {
            params.append('search', search.trim());
        }

        console.log('📥 Caricamento catalogo FTP...', {
            page,
            category,
            search
        });

        const response = await fetch(`${API_BASE}/admin/catalog/ftp?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
            catalogState.currentPage = result.page;
            catalogState.totalProducts = result.total;
            catalogState.filteredCount = result.filtered;
            catalogState.importedCount = result.imported;
            catalogState.products = result.data;

            // Update stats
            document.getElementById('catalogTotalCount').textContent = result.total.toLocaleString();
            document.getElementById('catalogFilteredCount').textContent = result.filtered.toLocaleString();
            document.getElementById('catalogImportedCount').textContent = result.imported.toLocaleString();

            // Render products
            renderCatalogProducts(result.data);

            // Render pagination
            const totalPages = Math.ceil(result.filtered / catalogState.pageSize);
            renderCatalogPagination(page, totalPages);

            console.log('✅ Catalogo caricato:', {
                prodotti: result.data.length,
                totali: result.total,
                filtrati: result.filtered,
                importati: result.imported
            });
        } else {
            alert(`❌ Errore caricamento catalogo: ${result.error}`);
        }
    } catch (error) {
        console.error('❌ Errore caricamento catalogo:', error);
        alert(`❌ Errore: ${error.message}`);
    }
}

// Render catalog products grid
function renderCatalogProducts(products) {
    const grid = document.getElementById('catalogProductsGrid');

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3>Nessun prodotto trovato</h3>
                <p>Prova a cambiare i filtri di ricerca</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => {
        const image = product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/250';
        const price = parseFloat(product.pvd || 0).toFixed(2);
        const retailPrice = parseFloat(product.price || 0).toFixed(2);
        const margin = product.margin || '0';
        const stock = product.stock || 0;
        const categories = product.zenovaCategories ? product.zenovaCategories.join(', ') : 'N/A';
        const isImported = product.imported || false;

        return `
            <div class="catalog-product-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;"
                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'"
                 onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                <div style="position: relative;">
                    <img src="${image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
                    ${isImported ? '<div style="position: absolute; top: 10px; right: 10px; background: #43e97b; color: white; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: bold;">✓ IMPORTATO</div>' : ''}
                    <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 6px; font-size: 11px;">
                        Stock: ${stock}
                    </div>
                </div>
                <div style="padding: 15px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.3; height: 40px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${product.name}</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <div style="font-size: 11px; color: #999;">Acquisto</div>
                            <div style="font-size: 16px; font-weight: bold; color: #667eea;">€ ${price}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: #999;">Vendita</div>
                            <div style="font-size: 16px; font-weight: bold; color: #43e97b;">€ ${retailPrice}</div>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #999; margin-bottom: 10px;">
                        Margine: <span style="color: #43e97b; font-weight: bold;">${margin}%</span>
                    </div>
                    <div style="font-size: 11px; color: #666; margin-bottom: 10px; height: 30px; overflow: hidden;">
                        📂 ${categories}
                    </div>
                    <div style="font-size: 10px; color: #999; margin-bottom: 15px;">
                        SKU: ${product.id}
                    </div>
                    ${isImported ?
                        '<button disabled style="width: 100%; padding: 10px; background: #e0e0e0; color: #999; border: none; border-radius: 8px; font-weight: 600; cursor: not-allowed;">✓ Già nel Catalogo</button>' :
                        `<button onclick="importCatalogProduct('${product.id}')" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                            ➕ Importa nel Catalogo
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Render pagination controls
function renderCatalogPagination(currentPage, totalPages) {
    const pagination = document.getElementById('catalogPagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="loadCatalogProducts(${currentPage - 1})" style="padding: 8px 15px; background: white; border: 2px solid #667eea; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 600;">← Precedente</button>`;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button onclick="loadCatalogProducts(1)" style="padding: 8px 12px; background: white; border: 2px solid #e0e0e0; border-radius: 6px; cursor: pointer;">1</button>`;
        if (startPage > 2) {
            html += `<span style="padding: 8px;">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button style="padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-weight: bold;">${i}</button>`;
        } else {
            html += `<button onclick="loadCatalogProducts(${i})" style="padding: 8px 12px; background: white; border: 2px solid #e0e0e0; border-radius: 6px; cursor: pointer;">${i}</button>`;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span style="padding: 8px;">...</span>`;
        }
        html += `<button onclick="loadCatalogProducts(${totalPages})" style="padding: 8px 12px; background: white; border: 2px solid #e0e0e0; border-radius: 6px; cursor: pointer;">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="loadCatalogProducts(${currentPage + 1})" style="padding: 8px 15px; background: white; border: 2px solid #667eea; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 600;">Successiva →</button>`;
    }

    pagination.innerHTML = html;
}

// Import product from catalog to curated catalog
async function importCatalogProduct(productId) {
    try {
        const confirmed = confirm(`📦 Importare questo prodotto nel catalogo curato Zenova?\n\nSKU: ${productId}\n\nIl prodotto sarà subito disponibile sul sito.`);

        if (!confirmed) return;

        console.log(`📥 Importazione prodotto ${productId}...`);

        const response = await fetch(`${API_BASE}/admin/catalog/import/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Prodotto importato con successo!\n\n${result.data.name}\n\nIl prodotto è ora disponibile sul tuo sito.`);

            // Reload catalog to update "imported" status
            await loadCatalogProducts(catalogState.currentPage);

            // Also reload products in other sections
            await loadProducts();
        } else {
            if (result.error === 'Product already exists in curated catalog') {
                alert('⚠️ Questo prodotto è già nel tuo catalogo curato!');
            } else {
                alert(`❌ Errore: ${result.error}`);
            }
        }
    } catch (error) {
        console.error('❌ Errore importazione:', error);
        alert(`❌ Errore durante l'importazione: ${error.message}`);
    }
}

// Auto-load catalog when section is opened
document.addEventListener('DOMContentLoaded', function() {
    // Listen for navigation clicks
    const catalogNavLink = document.querySelector('[data-section="catalog"]');
    if (catalogNavLink) {
        catalogNavLink.addEventListener('click', function() {
            // Load catalog on first open
            if (catalogState.products.length === 0) {
                loadCatalogProducts(1);
            }
        });
    }

    // Search on Enter key
    const searchInput = document.getElementById('catalogSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadCatalogProducts(1);
            }
        });
    }
});

// ============================================
// GESTIONE PRODOTTI PER CATEGORIE
// ============================================

// Mappa nomi categorie user-friendly
const categoryNames = {
    'beauty': 'Beauty',
    'health-personal-care': 'Health & Personal Care',
    'smart-living': 'Smart Living',
    'natural-wellness': 'Natural Wellness',
    'tech': 'Tech Innovation'
};

// Carica e visualizza prodotti raggruppati per categoria
async function loadProductsByCategory() {
    console.log('🔄 loadProductsByCategory chiamata!');
    console.trace();

    const mainCategory = document.getElementById('mainCategoryFilter').value;
    const gridContainer = document.getElementById('categoriesGrid');

    // Show loading
    gridContainer.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #999;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔄</div>
            <h3>Caricamento prodotti...</h3>
        </div>
    `;

    try {
        // Carica tutti i prodotti se non li abbiamo già
        if (allProducts.length === 0) {
            await loadProducts();
        }

        // Filtra prodotti per categoria principale
        let filteredProducts = allProducts;
        if (mainCategory !== 'all') {
            filteredProducts = allProducts.filter(p => p.zenovaCategory === mainCategory);
        }

        console.log(`📊 Prodotti trovati per "${mainCategory}":`, filteredProducts.length);

        if (filteredProducts.length === 0) {
            gridContainer.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                    <h3>Nessun prodotto trovato</h3>
                    <p>Non ci sono prodotti per questa categoria</p>
                </div>
            `;
            return;
        }

        // Raggruppa per sottocategoria
        const subcategoryGroups = {};
        filteredProducts.forEach(product => {
            const subcat = product.zenovaSubcategory || 'non-categorizzato';
            if (!subcategoryGroups[subcat]) {
                subcategoryGroups[subcat] = [];
            }
            subcategoryGroups[subcat].push(product);
        });

        console.log('📂 Sottocategorie trovate:', Object.keys(subcategoryGroups));

        // Renderizza ogni sottocategoria
        gridContainer.innerHTML = '';

        // Ordina sottocategorie alfabeticamente
        const sortedSubcategories = Object.keys(subcategoryGroups).sort();

        sortedSubcategories.forEach(subcategory => {
            const products = subcategoryGroups[subcategory];
            const subcategoryCard = createSubcategoryCard(subcategory, products, mainCategory);
            gridContainer.appendChild(subcategoryCard);
        });

        // Attacca event listener ai pulsanti "Sposta Categoria"
        attachMoveCategoryListeners();

    } catch (error) {
        console.error('❌ Errore caricamento prodotti per categoria:', error);
        gridContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #e74c3c;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Errore caricamento prodotti</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Crea card per una sottocategoria
function createSubcategoryCard(subcategory, products, mainCategory) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // Header sottocategoria
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
    `;

    const subcategoryName = subcategory.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    header.innerHTML = `
        <div>
            <h3 style="margin: 0; font-size: 20px; color: #667eea;">📁 ${subcategoryName}</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #999;">
                ${products.length} prodott${products.length === 1 ? 'o' : 'i'}
                ${mainCategory !== 'all' ? `- ${categoryNames[mainCategory] || mainCategory}` : ''}
            </p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="expandSubcategory('${subcategory}')"
                    style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                👁️ Mostra Tutti
            </button>
        </div>
    `;

    card.appendChild(header);

    // Products grid (mostra solo primi 6)
    const productsGrid = document.createElement('div');
    productsGrid.id = `subcategory-${subcategory}`;
    productsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
    `;

    const visibleProducts = products.slice(0, 6);
    visibleProducts.forEach(product => {
        productsGrid.appendChild(createCategoryProductCard(product));
    });

    card.appendChild(productsGrid);

    // Mostra messaggio se ci sono più prodotti
    if (products.length > 6) {
        const moreMessage = document.createElement('div');
        moreMessage.style.cssText = `
            text-align: center;
            margin-top: 15px;
            padding: 15px;
            background: #f5f7fa;
            border-radius: 8px;
            color: #666;
        `;
        moreMessage.textContent = `... e altri ${products.length - 6} prodotti. Clicca "Mostra Tutti" per vederli.`;
        card.appendChild(moreMessage);
    }

    return card;
}

// Crea card prodotto per la vista categorie
function createCategoryProductCard(product) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: #fafafa;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: all 0.2s;
        border: 2px solid ${product.visible === false ? '#e74c3c' : 'transparent'};
    `;

    // Escape del nome per attributi HTML
    const safeName = product.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    card.innerHTML = `
        <img src="${product.image || 'https://via.placeholder.com/150'}"
             alt="${safeName}"
             style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;">
        <div style="flex: 1;">
            <h5 style="margin: 0 0 5px 0; font-size: 13px; line-height: 1.3; height: 40px; overflow: hidden;">
                ${product.name.substring(0, 60)}${product.name.length > 60 ? '...' : ''}
            </h5>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #667eea;">€ ${product.price.toFixed(2)}</p>
            ${product.visible === false ?
                '<p style="margin: 5px 0 0 0; font-size: 11px; color: #e74c3c; font-weight: bold;">🚫 NASCOSTO</p>' :
                '<p style="margin: 5px 0 0 0; font-size: 11px; color: #43e97b; font-weight: bold;">✅ VISIBILE</p>'
            }
        </div>
        <div style="display: flex; gap: 5px; justify-content: space-between; flex-wrap: wrap;">
            <button type="button" class="btn-move-category"
                    data-product-id="${product.id}"
                    data-product-name="${safeName}"
                    data-product-image="${product.image || ''}"
                    data-current-category="${product.zenovaCategory || ''}"
                    data-current-subcategory="${product.zenovaSubcategory || ''}"
                    title="Sposta in altra categoria"
                    style="flex: 1; min-width: 100%; padding: 8px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                📂 Sposta Categoria
            </button>
            <button class="btn-toggle-visibility"
                    data-product-id="${product.id}"
                    data-product-name="${safeName}"
                    data-visible="${product.visible !== false}"
                    title="${product.visible !== false ? 'Nascondi prodotto' : 'Mostra prodotto'}"
                    style="flex: 1; padding: 8px; background: ${product.visible !== false ? '#f39c12' : '#43e97b'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
                ${product.visible !== false ? '🙈' : '👁️'}
            </button>
            <button class="btn-toggle-featured"
                    data-product-id="${product.id}"
                    data-product-name="${safeName}"
                    data-featured="${product.isFeatured || false}"
                    title="${product.isFeatured ? 'Rimuovi da evidenza' : 'Metti in evidenza'}"
                    style="padding: 8px 12px; background: ${product.isFeatured ? '#FFD700' : '#95a5a6'}; color: ${product.isFeatured ? '#000' : '#fff'}; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">
                ⭐
            </button>
            <button class="btn-delete-product"
                    data-product-id="${product.id}"
                    data-product-name="${safeName}"
                    title="Elimina prodotto"
                    style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                🗑️
            </button>
        </div>
    `;

    // Aggiungi event listeners
    const deleteBtn = card.querySelector('.btn-delete-product');
    const visibilityBtn = card.querySelector('.btn-toggle-visibility');
    const featuredBtn = card.querySelector('.btn-toggle-featured');

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            await deleteProduct(product.id, product.name);
            await loadProductsByCategory();
        });
    }

    if (visibilityBtn) {
        visibilityBtn.addEventListener('click', () => {
            toggleProductVisibility(product.id, product.name, product.visible !== false);
        });
    }

    if (featuredBtn) {
        featuredBtn.addEventListener('click', () => {
            toggleFeatured(product.id, product.name, product.isFeatured || false);
        });
    }

    return card;
}

// Event delegation - UN SOLO listener per tutti i pulsanti
let delegationListenerAttached = false;

function attachMoveCategoryListeners() {
    if (delegationListenerAttached) {
        console.log('✅ Event delegation già attivo');
        return;
    }

    console.log('🔗 Attacco event delegation per pulsanti Sposta Categoria');

    // Event delegation sul main content
    const mainContent = document.querySelector('.admin-content');
    if (!mainContent) return;

    mainContent.addEventListener('click', function(e) {
        // Ignora se il click viene dal modal
        if (e.target.closest('#editCategoryModal')) {
            return;
        }

        const btn = e.target.closest('.btn-move-category');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Blocca anche altri listener

            const productId = btn.dataset.productId;
            const productName = btn.dataset.productName;
            const productImage = btn.dataset.productImage;
            const currentCategory = btn.dataset.currentCategory;
            const currentSubcategory = btn.dataset.currentSubcategory;

            console.log('📂 Click:', productName);

            // Apri il modal in modo asincrono per evitare conflitti
            setTimeout(() => {
                openEditModal(productId, productName, productImage, currentCategory, currentSubcategory);
            }, 10);
        }
    });

    delegationListenerAttached = true;
}

// Espandi sottocategoria per mostrare tutti i prodotti
function expandSubcategory(subcategory) {
    // Trova tutti i prodotti della sottocategoria
    const mainCategory = document.getElementById('mainCategoryFilter').value;
    let filteredProducts = allProducts;

    if (mainCategory !== 'all') {
        filteredProducts = allProducts.filter(p => p.zenovaCategory === mainCategory);
    }

    const products = filteredProducts.filter(p => (p.zenovaSubcategory || 'non-categorizzato') === subcategory);

    // Crea modale per mostrare tutti i prodotti
    showProductsModal(subcategory, products);
}

// Mostra modale con tutti i prodotti di una sottocategoria
function showProductsModal(subcategory, products) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;

    const subcategoryName = subcategory.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 1200px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    `;

    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <div>
                <h2 style="margin: 0; color: #667eea;">📁 ${subcategoryName}</h2>
                <p style="margin: 5px 0 0 0; color: #999;">${products.length} prodott${products.length === 1 ? 'o' : 'i'} totali</p>
            </div>
            <button onclick="this.closest('[style*=fixed]').remove()"
                    style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">
                ✕ Chiudi
            </button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
            ${products.map(p => createCategoryProductCard(p).outerHTML).join('')}
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Attacca event listener ai pulsanti "Sposta Categoria"
    setTimeout(() => attachMoveCategoryListeners(), 100);

    // Chiudi cliccando fuori
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ===== SINCRONIZZAZIONE AUTOMATICA BEAUTY + HEALTH =====

async function runAutoSync() {
    const statusEl = document.getElementById('autoSyncStatus');
    const detailsEl = document.getElementById('autoSyncDetails');
    const button = event.target;

    try {
        // Avvia animazione
        button.disabled = true;
        button.textContent = '⏳ Sincronizzazione...';
        statusEl.textContent = '🔄 Sincronizzazione in corso...';
        statusEl.style.color = 'rgba(255,255,255,0.9)';
        detailsEl.textContent = 'Scaricamento prodotti da BigBuy...';

        console.log('🔄 Avvio sincronizzazione automatica Beauty + Health...');

        // Chiamata API
        const response = await fetch(`${API_BASE}/admin/auto-sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            const stats = result.data.stats;
            const beautyAdded = stats.beauty.added;
            const healthAdded = stats.health.added;
            const totalAdded = beautyAdded + healthAdded;

            console.log('✅ Sincronizzazione completata:', result.data);

            // Aggiorna UI
            statusEl.textContent = `✅ Sincronizzazione completata!`;
            detailsEl.innerHTML = `
                💄 Beauty: <strong>+${beautyAdded}</strong> nuovi prodotti<br>
                🏥 Health: <strong>+${healthAdded}</strong> nuovi prodotti<br>
                ⏱️ Durata: ${result.data.duration}s
            `;

            button.disabled = false;
            button.textContent = 'Avvia Auto-Sync';

            // Mostra notifica
            showNotification(`✅ Sincronizzazione completata! +${totalAdded} nuovi prodotti`, 'success');

            // Ricarica statistiche e prodotti
            setTimeout(() => {
                loadDashboardStats();
                loadProducts();
            }, 1000);

        } else {
            throw new Error(result.error || 'Sincronizzazione fallita');
        }

    } catch (error) {
        console.error('❌ Errore sincronizzazione automatica:', error);

        statusEl.textContent = '❌ Errore sincronizzazione';
        detailsEl.textContent = error.message || 'Si è verificato un errore';

        button.disabled = false;
        button.textContent = 'Riprova Auto-Sync';

        showNotification('❌ Errore durante la sincronizzazione', 'error');
    }
}

console.log('Pannello Admin Zenova caricato ✅');

// ============================================================================
// MODAL MODIFICA CATEGORIA
// ============================================================================

// Mapping delle sottocategorie per ogni categoria principale
const SUBCATEGORIES_MAP = {
    'smart-living': [
        { value: 'smart-led-illuminazione', label: 'Smart LED Illuminazione' },
        { value: 'domotica-smart-home', label: 'Domotica & Smart Home' }
    ],
    'beauty': [
        { value: 'makeup', label: 'Makeup' },
        { value: 'skincare', label: 'Skincare' },
        { value: 'profumi', label: 'Profumi' },
        { value: 'corpo', label: 'Corpo' }
    ],
    'health-personal-care': [
        { value: 'hair-care', label: 'Hair Care' },
        { value: 'barba', label: 'Barba' },
        { value: 'massaggio-benessere', label: 'Massaggio & Benessere' },
        { value: 'protezione-solare', label: 'Protezione Solare' }
    ],
    'tech-innovation': [
        { value: 'gadget-tech', label: 'Gadget Tech' },
        { value: 'smart-devices', label: 'Smart Devices' },
        { value: 'wearable-tech', label: 'Wearable Tech' },
        { value: 'tech-wellness', label: 'Tech Wellness' }
    ],
    'natural-wellness': [
        { value: 'aromaterapia', label: 'Aromaterapia' },
        { value: 'yoga-meditazione', label: 'Yoga & Meditazione' },
        { value: 'decorazione-zen', label: 'Decorazione Zen' }
    ]
};

// Funzione per aprire il modal
function openEditModal(productId, productName, productImage, currentCategory, currentSubcategory) {
    console.log('📂 Apertura modal per prodotto:', productId, productName);

    const modal = document.getElementById('editCategoryModal');
    const categorySelect = document.getElementById('editCategory');

    if (!modal) {
        console.error('❌ Modal non trovato!');
        return;
    }

    // Popola i dati del prodotto nel modal
    document.getElementById('editProductId').value = productId;
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductId').textContent = `ID: ${productId}`;
    document.getElementById('modalProductImage').src = productImage || 'https://via.placeholder.com/80';

    // Imposta la categoria corrente
    categorySelect.value = currentCategory || '';

    // Aggiorna le sottocategorie
    updateSubcategories(currentCategory, currentSubcategory);

    // Mostra il modal con debug migliorato
    modal.classList.add('show');
    modal.style.display = 'flex';
    modal.style.zIndex = '99999'; // Force high z-index
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // More visible background
    modal.style.opacity = '1'; // FORCE opacity to 1 - FIX per animazione che non parte
    modal.style.animation = 'none'; // Disabilita animazione che causa problemi

    console.log('✅ Modal aperto con:', {
        classList: modal.classList.toString(),
        display: modal.style.display,
        zIndex: modal.style.zIndex,
        opacity: modal.style.opacity,
        visibility: window.getComputedStyle(modal).visibility
    });
}

// Funzione per aggiornare il dropdown delle sottocategorie
function updateSubcategories(category, selectedSubcategory = '') {
    const subcategorySelect = document.getElementById('editSubcategory');

    if (!subcategorySelect) {
        console.error('❌ Dropdown sottocategorie non trovato');
        return;
    }

    // Pulisci il dropdown
    subcategorySelect.innerHTML = '<option value="">Seleziona sottocategoria...</option>';

    if (category && SUBCATEGORIES_MAP[category]) {
        // Abilita il dropdown
        subcategorySelect.disabled = false;

        // Aggiungi le opzioni
        SUBCATEGORIES_MAP[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.value;
            option.textContent = sub.label;
            if (sub.value === selectedSubcategory) {
                option.selected = true;
            }
            subcategorySelect.appendChild(option);
        });
    } else {
        subcategorySelect.disabled = true;
    }
}

// Event listener per il cambio categoria - inizializzato dopo DOMContentLoaded

// Funzione per chiudere il modal
function closeEditModal() {
    console.log('🔴 closeEditModal chiamato!');
    console.trace(); // Mostra chi ha chiamato questa funzione

    const modal = document.getElementById('editCategoryModal');
    const editForm = document.getElementById('editCategoryForm');

    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        console.log('⚠️ Modal chiuso da:', new Error().stack);
    }
    if (editForm) {
        editForm.reset();
    }

    console.log('✅ Modal chiuso');
}

// Inizializza event listeners per il modal quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('editCategoryModal');
    const modalContent = document.querySelector('#editCategoryModal .modal-content');
    const modalClose = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelEdit');
    const categorySelect = document.getElementById('editCategory');
    const editForm = document.getElementById('editCategoryForm');

    console.log('🔧 Inizializzazione event listeners modal...');

    // Previeni propagazione click dal modal-content
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeEditModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeEditModal();
        });
    }

    // NON CHIUDERE MAI sul background - solo con X o Annulla
    console.log('✅ Event listeners modal registrati (background click DISABILITATO)');

    // Event listener per cambio categoria
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            updateSubcategories(e.target.value);
        });
    }

    // Gestione submit form
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = document.getElementById('editProductId').value;
            const newCategory = categorySelect.value;
            const subcategorySelect = document.getElementById('editSubcategory');
            const newSubcategory = subcategorySelect.value;

            if (!newCategory || !newSubcategory) {
                showNotification('⚠️ Seleziona categoria e sottocategoria', 'error');
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/admin/products/${productId}/category`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        category: newCategory,
                        subcategory: newSubcategory
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('✅ Categoria aggiornata con successo!', 'success');
                    closeEditModal();

                    // Ricarica i prodotti per mostrare le modifiche
                    await loadProducts();

                    // Ricarica solo se siamo nella sezione categorie
                    const categoriesSection = document.getElementById('categories');
                    if (categoriesSection && categoriesSection.classList.contains('active')) {
                        setTimeout(() => {
                            if (typeof loadProductsByCategory === 'function') {
                                loadProductsByCategory();
                            }
                        }, 300);
                    }
                } else {
                    throw new Error(result.error || 'Aggiornamento fallito');
                }
            } catch (error) {
                console.error('Errore aggiornamento categoria:', error);
                showNotification('❌ Errore durante l\'aggiornamento', 'error');
            }
        });
    }
});

// ===== GESTIONE ORDINI =====

/**
 * Carica e visualizza ordini
 */
async function loadOrders(statusFilter = '') {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    try {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Caricamento ordini...</p>';

        const url = statusFilter
            ? `http://localhost:3000/api/orders?status=${statusFilter}`
            : 'http://localhost:3000/api/orders';

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Errore caricamento ordini');
        }

        const orders = result.data;

        if (orders.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; padding: 40px; color: #666;">
                    Nessun ordine trovato${statusFilter ? ' per questo stato' : ''}.
                </p>
            `;
            return;
        }

        // Renderizza ordini
        container.innerHTML = orders.map(order => renderOrderCard(order)).join('');

        // Aggiungi event listeners
        orders.forEach(order => {
            addOrderEventListeners(order.id);
        });

    } catch (error) {
        console.error('Errore caricamento ordini:', error);
        container.innerHTML = `
            <p style="text-align: center; padding: 40px; color: #e74c3c;">
                ❌ Errore caricamento ordini: ${error.message}
            </p>
        `;
    }
}

/**
 * Renderizza card ordine
 */
function renderOrderCard(order) {
    const statusLabels = {
        pending: 'In attesa',
        processing: 'In elaborazione',
        shipped: 'Spedito',
        delivered: 'Consegnato',
        cancelled: 'Annullato'
    };

    const statusClasses = {
        pending: 'pending',
        processing: 'processing',
        shipped: 'shipped',
        delivered: 'delivered',
        cancelled: 'cancelled'
    };

    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('it-IT') + ' - ' + date.toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'});

    const productsText = order.items.length === 1
        ? order.items[0].name
        : `${order.items.length} prodotti`;

    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status ${statusClasses[order.status]}">${statusLabels[order.status]}</span>
            </div>
            <div class="order-details">
                <p><strong>Cliente:</strong> ${order.customer.name || order.customer.email}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Prodotti:</strong> ${productsText}</p>
                <p><strong>Totale:</strong> €${order.totals.total.toFixed(2)}</p>
                <p><strong>Data:</strong> ${dateStr}</p>
            </div>
            <div class="order-actions">
                <select class="order-status-select" data-order-id="${order.id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>In attesa</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>In elaborazione</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Spedito</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Consegnato</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annullato</option>
                </select>
                <button class="btn-small order-details-btn" data-order-id="${order.id}">Dettagli</button>
            </div>
        </div>
    `;
}

/**
 * Aggiungi event listeners per ordine
 */
function addOrderEventListeners(orderId) {
    // Cambio stato
    const statusSelect = document.querySelector(`.order-status-select[data-order-id="${orderId}"]`);
    if (statusSelect) {
        statusSelect.addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            await updateOrderStatus(orderId, newStatus);
        });
    }

    // Dettagli ordine
    const detailsBtn = document.querySelector(`.order-details-btn[data-order-id="${orderId}"]`);
    if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
            showOrderDetails(orderId);
        });
    }
}

/**
 * Aggiorna stato ordine
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`✅ Ordine aggiornato: ${newStatus}`, 'success');
            // Ricarica ordini per aggiornare la visualizzazione
            const currentFilter = document.getElementById('orderStatusFilter').value;
            await loadOrders(currentFilter);
        } else {
            throw new Error(result.error || 'Errore aggiornamento');
        }
    } catch (error) {
        console.error('Errore aggiornamento stato:', error);
        showNotification(`❌ Errore: ${error.message}`, 'error');
    }
}

/**
 * Mostra dettagli ordine
 */
async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Ordine non trovato');
        }

        const order = result.data;

        // Crea HTML dettagli
        const itemsHtml = order.items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <strong>${item.name}</strong><br>
                Quantità: ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}
            </div>
        `).join('');

        const detailsHtml = `
            <div style="max-width: 600px;">
                <h3>Ordine ${order.id}</h3>
                <hr>
                <h4>Cliente</h4>
                <p><strong>Nome:</strong> ${order.customer.name || '-'}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Telefono:</strong> ${order.customer.phone || '-'}</p>
                <hr>
                <h4>Prodotti</h4>
                ${itemsHtml}
                <hr>
                <h4>Totali</h4>
                <p><strong>Subtotale:</strong> €${order.totals.subtotal.toFixed(2)}</p>
                <p><strong>Spedizione:</strong> €${order.totals.shipping.toFixed(2)}</p>
                <p><strong>Totale:</strong> €${order.totals.total.toFixed(2)}</p>
                <hr>
                <h4>Spedizione</h4>
                <p><strong>Corriere:</strong> ${order.shipping.carrier || '-'}</p>
                <p><strong>Tracking:</strong> ${order.shipping.trackingNumber || '-'}</p>
                <hr>
                <p><strong>Data ordine:</strong> ${new Date(order.createdAt).toLocaleString('it-IT')}</p>
            </div>
        `;

        // Mostra in un alert o modal (per semplicità uso alert, puoi creare un modal dedicato)
        const modalContainer = document.createElement('div');
        modalContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        modalContainer.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                ${detailsHtml}
                <button onclick="this.closest('div[style*=fixed]').remove()" style="margin-top: 20px; padding: 10px 20px; background: #8B6F47; color: white; border: none; border-radius: 4px; cursor: pointer;">Chiudi</button>
            </div>
        `;
        document.body.appendChild(modalContainer);

        // Chiudi cliccando fuori
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.remove();
            }
        });

    } catch (error) {
        console.error('Errore caricamento dettagli:', error);
        showNotification(`❌ Errore: ${error.message}`, 'error');
    }
}

// Inizializzazione gestione ordini
document.addEventListener('DOMContentLoaded', function() {
    const ordersSection = document.getElementById('orders');
    const orderStatusFilter = document.getElementById('orderStatusFilter');

    if (ordersSection) {
        // Carica ordini quando si apre la sezione ordini
        const ordersNavBtn = document.querySelector('[data-section="orders"]');
        if (ordersNavBtn) {
            ordersNavBtn.addEventListener('click', () => {
                setTimeout(() => {
                    loadOrders();
                }, 100);
            });
        }

        // Filtro per stato
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', (e) => {
                loadOrders(e.target.value);
            });
        }

        // Se la sezione ordini è già visibile, carica subito
        if (ordersSection.classList.contains('active')) {
            loadOrders();
        }
    }
});


console.log('Modal modifica categoria inizializzato ✅');
console.log('Gestione ordini inizializzata ✅');
