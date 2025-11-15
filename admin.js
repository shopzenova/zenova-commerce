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
            <button class="btn-icon" title="Modifica">✏️</button>
            <button class="btn-icon" title="Nascondi">👁️</button>
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

console.log('Pannello Admin Zenova caricato ✅');
