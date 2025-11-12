// Mapping anchor links from home page to actual BigBuy categories
const anchorToSubcategoryMap = {
    // Categorie principali - mostrano tutti i prodotti
    'smart-living': 'all',
    'meditazione-zen': 'all',
    'cura-corpo-skin': 'all',
    'design-atmosfera': 'all',
    'zen-lifestyle': 'all',

    // SMART LIVING
    'ebook-tech': '2609,2617,2909',
    'accessori-tech': '2609,2617,2937',
    'home-garden': 'Home & Garden',

    // MEDITAZIONE E ZEN
    'massaggiatori': '2501,2502,2504',

    // CURA DEL CORPO E SKIN
    'beauty-personal': 'Health & Beauty',
    'creme-mani-piedi': '2501,2540,2546',
    'protezione-viso': '2501,2552,2554',
    'protezione-corpo': '2501,2552,2556',
    'doposole': '2501,2552,2568',
    'fragranze': 'Tech & Electronics',

    // DESIGN & ATMOSFERA
    'home-decor': 'Home & Garden',

    // ZEN LIFESTYLE
    'wellness-lifestyle': 'Health & Beauty'
};

// Mapping subcategories to parent categories
const subcategoryToCategoryMap = {
    // SMART LIVING
    'ebook-tech': 'smart-living',
    'accessori-tech': 'smart-living',
    'home-garden': 'smart-living',
    '2609,2617,2909': 'smart-living',
    '2609,2617,2937': 'smart-living',
    'Home & Garden': 'smart-living',

    // MEDITAZIONE E ZEN
    'massaggiatori': 'meditazione-zen',
    '2501,2502,2504': 'meditazione-zen',

    // CURA DEL CORPO E SKIN
    'beauty-personal': 'cura-corpo-skin',
    'creme-mani-piedi': 'cura-corpo-skin',
    'protezione-viso': 'cura-corpo-skin',
    'protezione-corpo': 'cura-corpo-skin',
    'doposole': 'cura-corpo-skin',
    'fragranze': 'cura-corpo-skin',
    'Health & Beauty': 'cura-corpo-skin',
    '2501,2540,2546': 'cura-corpo-skin',
    '2501,2552,2554': 'cura-corpo-skin',
    '2501,2552,2556': 'cura-corpo-skin',
    '2501,2552,2568': 'cura-corpo-skin',
    'Tech & Electronics': 'cura-corpo-skin',

    // DESIGN & ATMOSFERA
    'home-decor': 'design-atmosfera',

    // ZEN LIFESTYLE
    'wellness-lifestyle': 'zen-lifestyle'
};

// Sidebar Category Accordion - Simple and Direct
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sidebar script loaded');

    const categoryBtns = document.querySelectorAll('.category-btn');

    console.log('Found category buttons:', categoryBtns.length);

    if (categoryBtns.length === 0) {
        console.log('No category buttons found');
        return;
    }

    categoryBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Button clicked:', index);

            const categoryItem = this.parentElement;

            // Close all other categories
            document.querySelectorAll('.category-item').forEach(item => {
                if (item !== categoryItem) {
                    item.classList.remove('active');
                }
            });

            // Toggle current category
            categoryItem.classList.toggle('active');

            console.log('Category is now:', categoryItem.classList.contains('active') ? 'OPEN' : 'CLOSED');
        });
    });

    // Handle subcategory clicks
    const subcategoryLinks = document.querySelectorAll('.subcategory-link');

    subcategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const subcategory = this.dataset.subcategory;
            console.log('Subcategory clicked:', subcategory);

            // Remove active class from all subcategory links
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            // Remove active class from all sub-subcategory links
            document.querySelectorAll('.sub-subcategory-link').forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Filter products by subcategory
            filterProductsBySubcategory(subcategory);
        });
    });

    // Handle nested subcategory buttons (3rd level - Cura della pelle)
    const nestedBtns = document.querySelectorAll('.subcategory-btn-nested');

    nestedBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nested button clicked');

            const nestedItem = this.parentElement;

            // Toggle current nested item
            nestedItem.classList.toggle('active');

            console.log('Nested item is now:', nestedItem.classList.contains('active') ? 'OPEN' : 'CLOSED');
        });
    });

    // Handle sub-subcategory clicks (3rd level links) - Protezione Solare
    const subSubcategoryLinks = document.querySelectorAll('.sub-subcategory-link');

    console.log('Found sub-subcategory links:', subSubcategoryLinks.length);

    subSubcategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const subcategory = this.dataset.subcategory;
            console.log('✨ Sub-subcategory clicked:', subcategory);

            // Remove active class from all links
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            subSubcategoryLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Filter products by subcategory
            filterProductsBySubcategory(subcategory);
        });
    });

    // Auto-open category from URL hash
    const currentHash = window.location.hash;
    console.log('🔗 Current URL hash:', currentHash || '(nessun hash)');
    // NOTE: autoOpenCategoryFromHash() is now called from script.js AFTER products are rendered
    // This prevents the race condition where filtering happens before products are loaded

    console.log('Sidebar setup complete');
});

// Make autoOpenCategoryFromHash globally accessible so script.js can call it after products load
window.autoOpenCategoryFromHash = autoOpenCategoryFromHash;

// Auto-open category based on URL hash
function autoOpenCategoryFromHash() {
    const hash = window.location.hash.substring(1); // Remove the # symbol

    if (!hash) {
        console.log('⚠️ No hash in URL');
        return;
    }

    console.log('🔗 Hash detected:', hash);

    // Convert anchor to actual BigBuy subcategory value
    const actualSubcategory = anchorToSubcategoryMap[hash] || hash;
    console.log('📦 Mapped to subcategory:', actualSubcategory);

    // Skip filtering if it's 'all'
    if (actualSubcategory === 'all') {
        console.log('ℹ️ Category link clicked - showing all products');

        // Just open the parent category
        const parentCategory = subcategoryToCategoryMap[hash];
        if (parentCategory) {
            const categoryBtn = document.querySelector(`[data-category="${parentCategory}"]`);
            if (categoryBtn) {
                categoryBtn.parentElement.classList.add('active');
            }
        }
        return;
    }

    // Find the parent category
    const parentCategory = subcategoryToCategoryMap[hash] || subcategoryToCategoryMap[actualSubcategory];

    if (!parentCategory) {
        console.log('❌ No parent category found for:', hash);
        return;
    }

    console.log('📂 Opening parent category:', parentCategory);

    // Find and open the parent category
    const categoryBtn = document.querySelector(`[data-category="${parentCategory}"]`);
    if (categoryBtn) {
        const categoryItem = categoryBtn.parentElement;
        categoryItem.classList.add('active');
        console.log('✅ Parent category opened');
    } else {
        console.log('❌ Category button not found for:', parentCategory);
    }

    // Find and activate the subcategory link with the actual BigBuy value
    const subcategoryLink = document.querySelector(`[data-subcategory="${actualSubcategory}"]`);
    if (subcategoryLink) {
        console.log('✅ Subcategory link found');

        // Remove active from all
        document.querySelectorAll('.subcategory-link, .sub-subcategory-link').forEach(l => l.classList.remove('active'));

        // Add active to this one
        subcategoryLink.classList.add('active');

        // Open nested category if needed
        const nestedParent = subcategoryLink.closest('.subcategory-item-nested');
        if (nestedParent) {
            nestedParent.classList.add('active');
            console.log('✅ Nested category opened');
        }

        // Filter products with the actual BigBuy value
        console.log('🎯 Filtering products for:', actualSubcategory);
        filterProductsBySubcategory(actualSubcategory);
    } else {
        console.log('❌ Subcategory link not found for:', actualSubcategory);
    }
}

// Filter products by subcategory
function filterProductsBySubcategory(subcategory) {
    console.log('🔍 Filtering products by:', subcategory);

    // Get all product cards
    const productCards = document.querySelectorAll('.product-card');

    if (productCards.length === 0) {
        console.log('❌ No product cards found on page');
        return;
    }

    console.log(`📦 Found ${productCards.length} product cards`);

    let visibleCount = 0;
    const uniqueSubcategories = new Set();

    // Show/hide products based on subcategory
    productCards.forEach(card => {
        const productSubcategory = card.dataset.subcategory;
        uniqueSubcategories.add(productSubcategory);

        if (subcategory === 'all' || productSubcategory === subcategory) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`✅ Visible products: ${visibleCount} out of ${productCards.length}`);
    console.log('📊 Unique subcategories in products:');
    Array.from(uniqueSubcategories).sort().forEach(sub => {
        console.log(`  - "${sub}"`);
    });
    console.log('🔍 Filtering for subcategory:', `"${subcategory}"`);

    // Update page title or add filter indicator
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        const subcategoryNames = {
            // SMART LIVING
            '2609,2617,2909': 'eBook & Tech',
            '2609,2617,2937': 'Accessori Tech',
            'Home & Garden': 'Smart Home',

            // MEDITAZIONE E ZEN
            '2501,2502,2504': 'Massaggiatori & Relax',

            // CURA DEL CORPO E SKIN
            'Health & Beauty': 'Beauty & Personal Care',
            '2501,2540,2546': 'Creme Mani e Piedi',
            '2501,2552,2554': 'Protezione Solare - Viso',
            '2501,2552,2556': 'Protezione Solare - Corpo',
            '2501,2552,2568': 'Doposole',
            'Tech & Electronics': 'Fragranze & Profumi'
        };

        if (subcategory === 'all') {
            pageTitle.textContent = 'I Nostri Prodotti';
        } else {
            pageTitle.textContent = subcategoryNames[subcategory] || 'Prodotti';
        }
    }

    // Scroll to products
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
