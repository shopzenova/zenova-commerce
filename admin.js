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
        hidden: []
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

    listContainer.innerHTML = '';

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

        console.log(`🔍 Ricerca "${searchTerm}": ${visibleCount} prodotti trovati`);
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
async function importProductFromBigBuy() {
    const skuInput = document.getElementById('importSKU');
    const sku = skuInput.value.trim();

    if (!sku) {
        alert('⚠️ Inserisci un SKU BigBuy valido');
        return;
    }

    // Mostra loading
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Importazione...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/admin/products/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sku })
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Prodotto importato con successo!\n\n${result.data.name}\nPrezzo: €${result.data.price}`);
            skuInput.value = '';

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

console.log('Pannello Admin Zenova caricato ✅');
