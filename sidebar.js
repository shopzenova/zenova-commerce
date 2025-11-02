// Mapping subcategories to parent categories
const subcategoryToCategoryMap = {
    'oli-essenziali': 'aromatherapy',
    'diffusori': 'aromatherapy',
    'nebulizzatori': 'aromatherapy',
    'candele': 'home-fragrance',
    'lampade-sale': 'home-fragrance',
    'incensi': 'home-fragrance',
    'eau-de-parfum': 'fragrances',
    'eau-de-toilette': 'fragrances',
    'profumi-naturali': 'fragrances',
    'yoga': 'mindfulness',
    'meditazione': 'mindfulness',
    'massaggiatori': 'mindfulness',
    'wearables-mindfulness': 'mindfulness',
    'smart-mirror': 'mindfulness',
    'luci-smart': 'smart-lighting',
    'lampade-sensoriali': 'smart-lighting',
    'campane-tibetane': 'sound-therapy',
    'sound-machine': 'sound-therapy',
    'purificatori': 'wellness-tech',
    'umidificatori': 'wellness-tech',
    'ionizzatori': 'wellness-tech',
    'wearables': 'wellness-tech',
    'light-therapy': 'wellness-tech',
    'smart-sensors': 'wellness-tech',
    'smart-health': 'wellness-tech',
    'oli-naturali': 'skincare',
    'maschere': 'skincare',
    'yoga-wear': 'apparel',
    'loungewear': 'apparel',
    'accessori': 'apparel',
    'te-verde': 'tea',
    'tisane': 'tea',
    'matcha': 'tea'
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

            // Add active class to clicked link
            this.classList.add('active');

            // Filter products by subcategory
            filterProductsBySubcategory(subcategory);
        });
    });

    // Auto-open category from URL hash
    autoOpenCategoryFromHash();

    console.log('Sidebar setup complete');
});

// Auto-open category based on URL hash
function autoOpenCategoryFromHash() {
    const hash = window.location.hash.substring(1); // Remove the # symbol

    if (!hash) return;

    console.log('Hash detected:', hash);

    // Find the parent category for this subcategory
    const parentCategory = subcategoryToCategoryMap[hash];

    if (parentCategory) {
        console.log('Opening parent category:', parentCategory);

        // Find and open the parent category
        const categoryBtn = document.querySelector(`[data-category="${parentCategory}"]`);
        if (categoryBtn) {
            const categoryItem = categoryBtn.parentElement;
            categoryItem.classList.add('active');
        }

        // Find and activate the subcategory link
        const subcategoryLink = document.querySelector(`[data-subcategory="${hash}"]`);
        if (subcategoryLink) {
            // Remove active from all
            document.querySelectorAll('.subcategory-link').forEach(l => l.classList.remove('active'));

            // Add active to this one
            subcategoryLink.classList.add('active');

            // Filter products
            filterProductsBySubcategory(hash);
        }
    }
}

// Filter products by subcategory
function filterProductsBySubcategory(subcategory) {
    console.log('Filtering products by:', subcategory);

    // Get all product cards
    const productCards = document.querySelectorAll('.product-card');

    if (productCards.length === 0) {
        console.log('No product cards found on page');
        return;
    }

    // Show/hide products based on subcategory
    productCards.forEach(card => {
        const productSubcategory = card.dataset.subcategory;

        if (subcategory === 'all' || productSubcategory === subcategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Update page title or add filter indicator
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        const subcategoryNames = {
            'oli-essenziali': 'Oli Essenziali',
            'diffusori': 'Diffusori',
            'nebulizzatori': 'Nebulizzatori',
            'candele': 'Candele Profumate',
            'lampade-sale': 'Lampade di Sale',
            'incensi': 'Incensi Naturali',
            'yoga': 'Tappetini Yoga',
            'meditazione': 'Cuscini Meditazione',
            'massaggiatori': 'Massaggiatori Smart',
            'luci-smart': 'Luci Smart',
            'lampade-sensoriali': 'Lampade Sensoriali',
            'campane-tibetane': 'Campane Tibetane',
            'sound-machine': 'Sound Machine',
            'purificatori': 'Purificatori d\'Aria',
            'umidificatori': 'Umidificatori Smart',
            'ionizzatori': 'Ionizzatori',
            'oli-naturali': 'Oli Naturali',
            'maschere': 'Maschere Viso',
            'te-verde': 'Tè Verde',
            'tisane': 'Tisane Rilassanti',
            'matcha': 'Matcha Premium'
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
