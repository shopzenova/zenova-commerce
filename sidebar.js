// Mapping anchor links from home page to actual BigBuy categories
const anchorToSubcategoryMap = {
    // ======== NUOVE 5 CATEGORIE ZENOVA ========

    // SMART LIVING
    'smart-led': '2399,2400,2421',
    'domotica': '2399',
    'wireless': '2609',

    // BEAUTY - 8 sottocategorie BigBuy
    'bagno-igiene': '2507',
    'accessori-bagno': '2507',
    'additivi-bagno': '2507',
    'deodoranti': '2507',
    'esfolianti-corpo': '2507',
    'pulizia-personale': '2507',
    'set-bagno': '2507',

    'cura-capelli': '2507',
    'accessori-acconciature': '2507',
    'apparecchi-parrucchieri': '2507',
    'colorazione-capelli': '2507',
    'extension-parrucche': '2507',
    'prodotti-acconciature': '2507',
    'prodotti-cura-capelli': '2507',
    'utensili-taglio': '2507',

    'cura-pelle': '2507',
    'collo-decollete': '2507',
    'corpo-pelle': '2507',
    'labbra-pelle': '2507',
    'mani-piedi-pelle': '2507',
    'occhi-pelle': '2507',
    'protezione-solare': '2507',
    'set-regalo-pelle': '2507',
    'skincare-sole': '2507',
    'viso-pelle': '2507',

    'manicure-pedicure': '2507',
    'cura-mani-piedi': '2507',
    'fantasie-unghie': '2507',
    'mani-piedi-manicure': '2507',
    'trattamenti-unghie': '2507',
    'utensili-manicure': '2507',

    'profumi-fragranze': '2507,2508',
    'profumi-bambini': '2507,2508',
    'candele-essenze': '2507,2508',
    'profumi-donne': '2507,2510',
    'eau-fraiche': '2507,2508',
    'nebulizzatori': '2507,2508',
    'oli-essenziali-profumi': '2507,2508',
    'profumi-solidi': '2507,2508',
    'set-profumi': '2507,2508',
    'spray-corpo': '2507,2508',
    'talco-profumato': '2507,2508',
    'profumi-uomini': '2507,2509',

    'rasatura-depilazione': '2507',
    'cura-post-rasatura': '2507',
    'cura-pre-rasatura': '2507',
    'depilazione': '2507',
    'forbici': '2507',
    'rasatura-manuale': '2507',
    'rasoi-elettrici': '2507',
    'tagliacapelli': '2507',

    'trucco': '2507',
    'trucco-corpo': '2507',
    'trucco-labbra': '2507',
    'trucco-occhi': '2507',
    'set-trucchi': '2507',
    'struccanti': '2507',
    'trousse': '2507',
    'trucco-viso': '2507',

    'utensili-accessori': '2507',
    'borse-custodie': '2507',
    'forniture-tatuaggi': '2507',
    'dischetti-cotonati': '2507',
    'pennelli-trucco': '2507',
    'specchi-cosmetici': '2507',
    'strumenti-trucco': '2507',

    // HEALTH & PERSONAL CARE
    'benessere': '2501,2502',
    'accessori-saune': '2501',
    'lampade-abbronzanti': '2501',
    'massaggio-rilassamento': '2501,2502,2504',

    // NATURAL WELLNESS
    'oli-essenziali': 'wellness',
    'aromaterapia': 'wellness',
    'yoga-meditazione': 'wellness',
    'incensi-candele': 'wellness',

    // TECH INNOVATION
    'gadget-tech': 'tech',
    'smart-devices': 'tech',
    'wearable-tech': 'tech',
    'tech-wellness': 'tech'
};

// Mapping subcategories to parent categories
const subcategoryToCategoryMap = {
    // SMART LIVING
    'smart-led': 'smart-living',
    'domotica': 'smart-living',
    'wireless': 'smart-living',
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
    '2507,2509': 'beauty',
    '2507,2510': 'beauty',

    // HEALTH & PERSONAL CARE
    'benessere': 'health-personal-care',
    'accessori-saune': 'health-personal-care',
    'lampade-abbronzanti': 'health-personal-care',
    'massaggio-rilassamento': 'health-personal-care',
    '2501': 'health-personal-care',
    '2501,2502': 'health-personal-care',
    '2501,2502,2504': 'health-personal-care',

    // NATURAL WELLNESS
    'oli-essenziali': 'natural-wellness',
    'aromaterapia': 'natural-wellness',
    'yoga-meditazione': 'natural-wellness',
    'incensi-candele': 'natural-wellness',
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

    // Convert anchor to actual BigBuy subcategory value
    const actualSubcategory = anchorToSubcategoryMap[hash] || hash;
    console.log('📦 Mapped to subcategory:', actualSubcategory);

    // Handle 'all' category - show 4 products per subcategory
    if (actualSubcategory === 'all') {
        console.log('ℹ️ Category link clicked - applying "4 products per category" filter');

        // Open the parent category
        const parentCategory = subcategoryToCategoryMap[hash];
        if (parentCategory) {
            const categoryBtn = document.querySelector(`[data-category="${parentCategory}"]`);
            if (categoryBtn) {
                categoryBtn.parentElement.classList.add('active');
            }
        }

        // Apply the "4 products per category" filter
        filterProductsBySubcategory('all');
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

        // Filter products with the actual BigBuy value
        console.log('🎯 Filtering products for:', actualSubcategory);
        filterProductsBySubcategory(actualSubcategory);
    } else {
        console.log('❌ Subcategory link not found for hash:', hash);
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
