// Mapping anchor links from home page to actual BigBuy categories
const anchorToSubcategoryMap = {
    // ======== NUOVE 5 CATEGORIE ZENOVA ========

    // SMART LIVING
    'smart-led': 'smart-led-illuminazione',
    'domotica': 'domotica-smart-home',
    'wireless': '2609',

    // BEAUTY - Mappato a categorie Zenova
    'bagno-igiene': 'gel-doccia',
    'accessori-bagno': 'gel-doccia',
    'additivi-bagno': 'gel-doccia',
    'deodoranti': 'deodoranti',
    'esfolianti-corpo': 'lozione-corpo',
    'pulizia-personale': 'gel-intimo',
    'set-bagno': 'gel-doccia',

    'cura-capelli': 'gel-viso',
    'accessori-acconciature': 'set-regalo',
    'apparecchi-parrucchieri': 'set-regalo',
    'colorazione-capelli': 'creme-viso-notte',
    'extension-parrucche': 'set-regalo',
    'prodotti-acconciature': 'gel-viso',
    'prodotti-cura-capelli': 'gel-viso',
    'utensili-taglio': 'set-regalo',

    'cura-pelle': 'creme-viso-notte',
    'collo-decollete': 'creme-viso-notte',
    'corpo-pelle': 'lozione-corpo',
    'labbra-pelle': 'matita-labbra',
    'mani-piedi-pelle': 'crema-mani',
    'occhi-pelle': 'contorno-occhi',
    'protezione-solare': 'protezione-solare',
    'set-regalo-pelle': 'set-regalo',
    'skincare-sole': 'protezione-solare',
    'viso-pelle': 'creme-viso-notte',

    'manicure-pedicure': 'lozione-corpo',
    'cura-mani-piedi': 'lozione-corpo',
    'fantasie-unghie': 'set-regalo',
    'mani-piedi-manicure': 'lozione-corpo',
    'trattamenti-unghie': 'lozione-corpo',
    'utensili-manicure': 'set-regalo',

    'profumi-fragranze': 'profumi-unisex',
    'profumi-bambini': 'profumi-unisex',
    'candele-essenze': 'profumi-unisex',
    'profumi-donne': 'profumi-donne',
    'eau-fraiche': 'profumi-unisex',
    'nebulizzatori': 'profumi-unisex',
    'oli-essenziali-profumi': 'profumi-unisex',
    'profumi-solidi': 'profumi-unisex',
    'set-profumi': 'set-regalo',
    'spray-corpo': 'deodoranti',
    'talco-profumato': 'deodoranti',
    'profumi-uomini': 'profumi-uomini',

    'rasatura-depilazione': 'dopobarba',
    'cura-post-rasatura': 'dopobarba',
    'cura-pre-rasatura': 'schiuma-barba',
    'depilazione': 'gel-viso',
    'forbici': 'set-regalo',
    'rasatura-manuale': 'dopobarba',
    'rasoi-elettrici-beauty': 'dopobarba',
    'tagliacapelli': 'dopobarba',

    'trucco': 'fondotinta',
    'trucco-corpo': 'fondotinta',
    'trucco-labbra': 'matita-labbra',
    'trucco-occhi': 'mascara',
    'set-trucchi': 'set-regalo',
    'struccanti': 'struccanti',
    'trousse': 'set-regalo',
    'trucco-viso': 'fondotinta',

    'utensili-accessori': 'set-regalo',
    'borse-custodie': 'set-regalo',
    'forniture-tatuaggi': 'set-regalo',
    'dischetti-cotonati': 'igiene-orale',
    'pennelli-trucco': 'fondotinta',
    'specchi-cosmetici': 'fondotinta',
    'strumenti-trucco': 'fondotinta',

    // HEALTH & PERSONAL CARE - Mappato a categorie Zenova
    'phon-asciugacapelli': 'phon-asciugacapelli',
    'rasoi-elettrici': 'rasoi-elettrici',
    'shampoo': 'shampoo-capelli',
    'balsamo': 'balsamo-capelli',
    'tintura-capelli': 'tintura-capelli',
    'set-massaggio': 'set-massaggio',
    'cerotti': 'cerotti-medicazioni',
    'protezione-solare': 'protezione-solare-viso',

    // NATURAL WELLNESS - AW Dropship
    'oli-essenziali': 'oli-essenziali',
    'oli-fragranza': 'oli-fragranza',
    'vestiario-wellness': 'vestiario-wellness',
    'pietre-preziose': 'pietre-preziose',
    'incenso': 'incenso',

    // TECH INNOVATION
    'gadget-tech': 'gadget-tech',
    'smart-devices': 'smart-devices',
    'wearable-tech': 'wearable-tech',
    'tech-wellness': 'tech-wellness'
};

// Mapping subcategories to parent categories
const subcategoryToCategoryMap = {
    // SMART LIVING
    'smart-led': 'smart-living',
    'domotica': 'smart-living',
    'wireless': 'smart-living',
    'smart-led-illuminazione': 'smart-living',
    'domotica-smart-home': 'smart-living',
    '2399': 'smart-living',
    '2399,2400,2421': 'smart-living',
    '2609': 'smart-living',

    // BEAUTY - tutte le sotto-sottocategorie puntano a 'beauty'
    'bagno-igiene': 'beauty',
    'accessori-bagno': 'beauty',
    'additivi-bagno': 'beauty',
    'deodoranti': 'beauty',
    'esfolianti-corpo': 'beauty',
    'pulizia-personale': 'beauty',
    'set-bagno': 'beauty',
    'cura-capelli': 'beauty',
    'accessori-acconciature': 'beauty',
    'apparecchi-parrucchieri': 'beauty',
    'colorazione-capelli': 'beauty',
    'extension-parrucche': 'beauty',
    'prodotti-acconciature': 'beauty',
    'prodotti-cura-capelli': 'beauty',
    'utensili-taglio': 'beauty',
    'cura-pelle': 'beauty',
    'collo-decollete': 'beauty',
    'corpo-pelle': 'beauty',
    'labbra-pelle': 'beauty',
    'mani-piedi-pelle': 'beauty',
    'occhi-pelle': 'beauty',
    'protezione-solare': 'beauty',
    'set-regalo-pelle': 'beauty',
    'skincare-sole': 'beauty',
    'viso-pelle': 'beauty',
    'manicure-pedicure': 'beauty',
    'cura-mani-piedi': 'beauty',
    'fantasie-unghie': 'beauty',
    'mani-piedi-manicure': 'beauty',
    'trattamenti-unghie': 'beauty',
    'utensili-manicure': 'beauty',
    'profumi-fragranze': 'beauty',
    'profumi-bambini': 'beauty',
    'candele-essenze': 'beauty',
    'profumi-donne': 'beauty',
    'eau-fraiche': 'beauty',
    'nebulizzatori': 'beauty',
    'oli-essenziali-profumi': 'beauty',
    'profumi-solidi': 'beauty',
    'set-profumi': 'beauty',
    'spray-corpo': 'beauty',
    'talco-profumato': 'beauty',
    'profumi-uomini': 'beauty',
    'rasatura-depilazione': 'beauty',
    'cura-post-rasatura': 'beauty',
    'cura-pre-rasatura': 'beauty',
    'depilazione': 'beauty',
    'forbici': 'beauty',
    'rasatura-manuale': 'beauty',
    'rasoi-elettrici': 'beauty',
    'tagliacapelli': 'beauty',
    'trucco': 'beauty',
    'trucco-corpo': 'beauty',
    'trucco-labbra': 'beauty',
    'trucco-occhi': 'beauty',
    'set-trucchi': 'beauty',
    'struccanti': 'beauty',
    'trousse': 'beauty',
    'trucco-viso': 'beauty',
    'utensili-accessori': 'beauty',
    'borse-custodie': 'beauty',
    'forniture-tatuaggi': 'beauty',
    'dischetti-cotonati': 'beauty',
    'pennelli-trucco': 'beauty',
    'specchi-cosmetici': 'beauty',
    'strumenti-trucco': 'beauty',
    '2507': 'beauty',
    '2507,2508': 'beauty',
    '2507,2508,2509': 'beauty',
    '2507,2508,2510': 'beauty',
    '2507,2508,2511': 'beauty',

    // HEALTH & PERSONAL CARE
    'phon-asciugacapelli': 'health-personal-care',
    'rasoi-elettrici': 'health-personal-care',
    'shampoo': 'health-personal-care',
    'balsamo': 'health-personal-care',
    'tintura-capelli': 'health-personal-care',
    'set-massaggio': 'health-personal-care',
    'cerotti': 'health-personal-care',
    'protezione-solare': 'health-personal-care',
    '2501,2520,2530': 'health-personal-care',
    '2501,2520,2652': 'health-personal-care',
    '2501,2520,2523': 'health-personal-care',
    '2501,2520,2525': 'health-personal-care',
    '2501,2520,3170': 'health-personal-care',
    '2501,2502,2504': 'health-personal-care',
    '2501,2502,2896': 'health-personal-care',
    '2501,2552,2554': 'health-personal-care',

    // NATURAL WELLNESS - AW Dropship
    'oli-essenziali': 'natural-wellness',
    'oli-fragranza': 'natural-wellness',
    'vestiario-wellness': 'natural-wellness',
    'pietre-preziose': 'natural-wellness',
    'incenso': 'natural-wellness',
    'wellness': 'natural-wellness',

    // TECH INNOVATION
    'gadget-tech': 'tech-innovation',
    'smart-devices': 'tech-innovation',
    'wearable-tech': 'tech-innovation',
    'tech-wellness': 'tech-innovation',
    'tech': 'tech-innovation'
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
            const categoryName = this.dataset.category;

            // Close all other categories (ECCETTO Natural Wellness - quella resta sempre aperta se già aperta)
            document.querySelectorAll('.category-item').forEach(item => {
                if (item !== categoryItem) {
                    const itemButton = item.querySelector('.category-btn');
                    const itemCategory = itemButton ? itemButton.dataset.category : null;

                    // Natural Wellness NON viene MAI chiusa automaticamente
                    if (itemCategory !== 'natural-wellness') {
                        item.classList.remove('active');
                    }
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

            // Get hash from href (e.g., "#phon-asciugacapelli")
            const hash = this.getAttribute('href');
            const anchor = hash ? hash.replace('#', '') : '';

            // Use mapping if available, otherwise use data-subcategory
            const subcategory = anchorToSubcategoryMap[anchor] || this.dataset.subcategory;

            console.log('Subcategory clicked:', anchor, '→', subcategory);

            // Skip "all" category
            if (subcategory === 'all') {
                console.log('⚠️ "Tutti i Prodotti" is disabled');
                return;
            }

            // Remove active class from all subcategory links
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            // Remove active class from all sub-subcategory links
            document.querySelectorAll('.sub-subcategory-link').forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Render products by category (from script.js)
            if (typeof window.renderProductsByCategory === 'function') {
                window.renderProductsByCategory(subcategory);
            } else {
                console.error('❌ renderProductsByCategory not found');
            }
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

            // Get hash from href (e.g., "#profumi-donne")
            const hash = this.getAttribute('href');
            const anchor = hash ? hash.replace('#', '') : '';

            // Use mapping if available, otherwise use data-subcategory
            const subcategory = anchorToSubcategoryMap[anchor] || this.dataset.subcategory;

            console.log('✨ Sub-subcategory clicked:', anchor, '→', subcategory);

            // Remove active class from all links
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            subSubcategoryLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Render products by category (from script.js)
            if (typeof window.renderProductsByCategory === 'function') {
                window.renderProductsByCategory(subcategory);
            } else {
                console.error('❌ renderProductsByCategory not found');
            }
        });
    });

    // Auto-open category from URL hash IMMEDIATELY (without filtering products)
    const currentHash = window.location.hash;
    console.log('🔗 Current URL hash:', currentHash || '(nessun hash)');

    if (currentHash) {
        console.log('⚡ Opening sidebar immediately from hash');
        openSidebarFromHash(); // Open sidebar immediately
    }
    // NOTE: Product filtering happens later in script.js AFTER products are rendered

    console.log('Sidebar setup complete');
});

// Make functions globally accessible
window.autoOpenCategoryFromHash = autoOpenCategoryFromHash;
window.openSidebarFromHash = openSidebarFromHash;

// Open sidebar IMMEDIATELY based on URL hash (without filtering products)
function openSidebarFromHash() {
    const hash = window.location.hash.substring(1);

    if (!hash) {
        console.log('⚠️ No hash in URL');
        return;
    }

    console.log('⚡ Opening sidebar for hash:', hash);

    // Convert anchor to actual BigBuy subcategory value
    const actualSubcategory = anchorToSubcategoryMap[hash] || hash;
    console.log('📦 Mapped to subcategory:', actualSubcategory);

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
    }

    // Find and activate the subcategory link using the HASH (unique identifier)
    const subcategoryLink = document.querySelector(`a[href="#${hash}"].sub-subcategory-link, a[href="#${hash}"].subcategory-link`);
    if (subcategoryLink) {
        console.log('✅ Subcategory link found by hash:', hash);

        // Remove active from all
        document.querySelectorAll('.subcategory-link, .sub-subcategory-link').forEach(l => l.classList.remove('active'));

        // Add active to this one
        subcategoryLink.classList.add('active');

        // Open nested category if needed (for 3rd level like "Labbra" inside "Cura della pelle")
        const nestedParent = subcategoryLink.closest('.subcategory-item-nested');
        if (nestedParent) {
            nestedParent.classList.add('active');
            console.log('✅ Nested category opened:', nestedParent.querySelector('.subcategory-name')?.textContent);
        }
    } else {
        console.log('❌ Subcategory link not found for hash:', hash);
    }
}

// Auto-open category based on URL hash (opens sidebar + filters products)
function autoOpenCategoryFromHash() {
    const hash = window.location.hash.substring(1); // Remove the # symbol

    if (!hash) {
        console.log('⚠️ No hash in URL');
        return;
    }

    console.log('🔗 Hash detected:', hash);

    // Parse hash to extract category and product ID
    // Format: "category&product=ID" or just "category"
    let categoryPart = hash;
    let productId = null;

    if (hash.includes('&product=')) {
        const parts = hash.split('&product=');
        categoryPart = parts[0];
        productId = parts[1];
        console.log('📦 Extracted category:', categoryPart, '| Product ID:', productId);
    }

    // Convert anchor to actual BigBuy subcategory value
    const actualSubcategory = anchorToSubcategoryMap[categoryPart] || categoryPart;
    console.log('📦 Mapped to subcategory:', actualSubcategory);

    // Handle 'all' category - disabled
    if (actualSubcategory === 'all') {
        console.log('⚠️ "Tutti i Prodotti" is disabled');
        return;
    }

    // Find the parent category (use categoryPart, not hash)
    const parentCategory = subcategoryToCategoryMap[categoryPart] || subcategoryToCategoryMap[actualSubcategory];

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

    // Find and activate the subcategory link using categoryPart (not full hash)
    const subcategoryLink = document.querySelector(`a[href="#${categoryPart}"].sub-subcategory-link, a[href="#${categoryPart}"].subcategory-link`);
    if (subcategoryLink) {
        console.log('✅ Subcategory link found by hash:', categoryPart);

        // Remove active from all
        document.querySelectorAll('.subcategory-link, .sub-subcategory-link').forEach(l => l.classList.remove('active'));

        // Add active to this one
        subcategoryLink.classList.add('active');

        // Open nested category if needed (for 3rd level like "Labbra" inside "Cura della pelle")
        const nestedParent = subcategoryLink.closest('.subcategory-item-nested');
        if (nestedParent) {
            nestedParent.classList.add('active');
            console.log('✅ Nested category opened:', nestedParent.querySelector('.subcategory-name')?.textContent);
        }

        // Render products with the actual BigBuy value
        console.log('🎯 Rendering products for:', actualSubcategory);
        if (typeof window.renderProductsByCategory === 'function') {
            window.renderProductsByCategory(actualSubcategory);
        } else {
            console.error('❌ renderProductsByCategory not found');
        }

        // If there's a product ID, open the product detail modal after a short delay
        if (productId && typeof window.openProductDetailModal === 'function') {
            console.log('🎯 Opening product detail for:', productId);
            setTimeout(() => {
                window.openProductDetailModal(productId);
            }, 300); // Wait 300ms for products to load (reduced from 500ms)
        }
    } else {
        console.log('❌ Subcategory link not found for hash:', categoryPart);
    }
}

/**
 * Update category counters based on loaded products
 */
function updateCategoryCounters() {
    console.log('📊 Updating category counters...');

    const productCards = document.querySelectorAll('.product-card');

    if (productCards.length === 0) {
        console.log('⚠️ No products loaded yet');
        return;
    }

    // Count products per subcategory
    const subcategoryCounts = {};

    productCards.forEach(card => {
        const subcategory = card.dataset.subcategory;
        if (!subcategory) return;

        // Increment exact match
        subcategoryCounts[subcategory] = (subcategoryCounts[subcategory] || 0) + 1;

        // Also increment for parent categories (single IDs)
        // E.g. "2399,2400,2421" should also count for "2399"
        const categories = subcategory.split(',');
        categories.forEach(cat => {
            const trimmedCat = cat.trim();
            subcategoryCounts[trimmedCat] = (subcategoryCounts[trimmedCat] || 0) + 1;
        });
    });

    console.log('📊 Subcategory counts:', subcategoryCounts);

    // Update all subcategory links
    const subcategoryLinks = document.querySelectorAll('.subcategory-link, .sub-subcategory-link');

    subcategoryLinks.forEach(link => {
        const subcategory = link.dataset.subcategory;

        if (subcategory === 'all') {
            // "Tutti i Prodotti" should show total count
            const countElement = link.querySelector('.subcategory-count');
            if (countElement) {
                countElement.textContent = `(${productCards.length})`;
            }
            return;
        }

        const count = subcategoryCounts[subcategory] || 0;
        const countElement = link.querySelector('.subcategory-count');

        if (countElement) {
            countElement.textContent = `(${count})`;
        }
    });

    console.log('✅ Category counters updated');
}

// Make function globally accessible
window.updateCategoryCounters = updateCategoryCounters;

// Filter products by subcategory
function filterProductsBySubcategory(subcategory) {
    console.log('🔍 [SIDEBAR.JS] Filtering products by:', subcategory);

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
    productCards.forEach((card, index) => {
        const productSubcategory = card.dataset.subcategory;
        uniqueSubcategories.add(productSubcategory);

        // Debug first 3 products
        if (index < 3) {
            console.log(`Card ${index}: subcategory="${productSubcategory}", searching for="${subcategory}"`);
        }

        if (subcategory === 'all') {
            card.style.display = 'block';
            visibleCount++;
        } else {
            let hasMatch = false;

            // Prima prova match ESATTO (per categorie specifiche come "2399,2400,2421")
            if (productSubcategory === subcategory) {
                hasMatch = true;
                if (index < 3) console.log(`  -> EXACT match!`);
            } else {
                // Poi prova match PARZIALE (per categorie generiche come "2399")
                // Se la subcategory cercata è singola (senza virgole), fa match parziale
                // Se la subcategory cercata ha virgole multiple, richiede match esatto
                const searchCategories = subcategory.split(',');

                if (searchCategories.length === 1) {
                    // Match parziale: "2399" matcha con "2399,2435,2440"
                    const productCategories = productSubcategory ? productSubcategory.split(',') : [];
                    hasMatch = productCategories.some(cat => cat.trim() === subcategory.trim());
                } else {
                    // Per categorie multiple, richiediamo che TUTTE le categorie corrispondano
                    const productCategories = productSubcategory ? productSubcategory.split(',').map(c => c.trim()) : [];
                    hasMatch = searchCategories.every(searchCat =>
                        productCategories.includes(searchCat.trim())
                    ) && searchCategories.length === productCategories.length;
                }
            }

            if (hasMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
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
            '2399,2400,2421': 'Lampade e Luci LED',
            '2399': 'Smart Home',
            'Home & Garden': 'Smart Home',

            // MEDITAZIONE E ZEN
            '2501,2502,2504': 'Massaggiatori & Relax',

            // CURA DEL CORPO E SKIN
            '2501,2540,2546': 'Creme Mani e Piedi',
            '2501,2552,2554': 'Protezione Solare - Viso',
            '2501,2552,2556': 'Protezione Solare - Corpo',
            '2501,2552,2568': 'Doposole',
            '2507,2508,2510': 'Fragranze & Profumi'
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
