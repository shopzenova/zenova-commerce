// Checkout System - PayPal Only

// API Configuration - Auto-detect environment
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = IS_LOCAL ? 'http://localhost:3000/api' : 'https://zenova-commerce-production.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout system loaded - PayPal only mode');
    console.log('Environment:', IS_LOCAL ? 'LOCAL' : 'PRODUCTION');
    console.log('API Base:', API_BASE);

    // Get cart data
    const cart = JSON.parse(localStorage.getItem('zenova-cart') || '[]');
    let shippingData = {};
    let currentStep = 1;
    let calculatedShippingCost = 0; // Will be calculated dynamically

    // Check if user is logged in
    const currentUser = getCurrentUser();
    const userInfoAlert = document.getElementById('userInfoAlert');

    if (currentUser) {
        userInfoAlert.innerHTML = `<p>Ciao ${currentUser.firstName}! <a href="#" onclick="logout()">Logout</a></p>`;

        // Pre-fill form with user data if available
        const savedAddress = JSON.parse(localStorage.getItem(`zenova_address_${currentUser.email}`) || '{}');
        if (savedAddress.firstName) {
            document.getElementById('firstName').value = savedAddress.firstName;
            document.getElementById('lastName').value = savedAddress.lastName;
            document.getElementById('email').value = savedAddress.email;
            document.getElementById('phone').value = savedAddress.phone || '';
            document.getElementById('address').value = savedAddress.address || '';
            document.getElementById('city').value = savedAddress.city || '';
            document.getElementById('postalCode').value = savedAddress.postalCode || '';
        } else {
            document.getElementById('firstName').value = currentUser.firstName;
            document.getElementById('lastName').value = currentUser.lastName;
            document.getElementById('email').value = currentUser.email;
        }
    }

    // Function to calculate shipping costs dynamically
    async function calculateShipping() {
        const countrySelect = document.getElementById('country');
        if (!countrySelect || !countrySelect.value) {
            console.log('⚠️ Paese non selezionato, uso costo spedizione predefinito');
            calculatedShippingCost = 0;
            loadOrderSummary();
            return;
        }

        const country = countrySelect.value;
        const postalCode = document.getElementById('postalCode')?.value || '';

        // Show loading indicator
        const shippingElement = document.getElementById('summaryShipping');
        if (shippingElement) {
            shippingElement.innerHTML = '<span style="color: #888;">Calcolo...</span>';
        }

        try {
            console.log('📦 Calcolo costi spedizione per:', { country, postalCode, cartItems: cart.length });

            // Prepare cart items for shipping calculation (include price for free shipping logic)
            const items = cart.map(item => ({
                id: item.bigbuyId || item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const response = await fetch(`${API_BASE}/checkout/calculate-shipping`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items,
                    destination: {
                        country,
                        postcode: postalCode
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Costi spedizione calcolati:', data);

            if (data.success && data.shipping && data.shipping.cost !== undefined) {
                calculatedShippingCost = data.shipping.cost;
                console.log(`💰 Costo spedizione: €${calculatedShippingCost.toFixed(2)} (${data.shipping.carrier})`);
            } else {
                console.warn('⚠️ Risposta API non valida, uso costo predefinito');
                calculatedShippingCost = 0;
            }

        } catch (error) {
            console.error('❌ Errore calcolo spedizione:', error);
            calculatedShippingCost = 0; // Fallback to free shipping
        }

        // Update summary with calculated cost
        loadOrderSummary();
    }

    // Add listener to country select for dynamic shipping calculation
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', calculateShipping);
        console.log('✅ Listener aggiunto a campo paese per calcolo spedizione');
    }

    // Calculate shipping on page load (if country already selected)
    if (countrySelect && countrySelect.value) {
        calculateShipping();
    }

    // Load order summary
    loadOrderSummary();

    // Shipping form handler
    const shippingForm = document.getElementById('shippingForm');
    if (!shippingForm) {
        console.error('❌ Form spedizione non trovato!');
        return;
    }

    console.log('✅ Form spedizione trovato, aggiunto listener submit');

    shippingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('📝 Form spedizione submitted!');

        // Save shipping data
        shippingData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            country: document.getElementById('country').value,
            notes: document.getElementById('notes').value
        };

        console.log('Dati spedizione salvati:', shippingData);

        // Save address for logged in users
        if (currentUser) {
            localStorage.setItem(`zenova_address_${currentUser.email}`, JSON.stringify(shippingData));
        }

        // Move to payment step
        console.log('➡️ Passo allo step 2 (pagamento)...');
        goToStep(2);
    });


    // Promo code
    document.getElementById('applyPromo').addEventListener('click', function() {
        const promoCode = document.getElementById('promoCode').value.toUpperCase();
        const promoCodes = {
            'ZENOVA10': 0.10, // 10% discount
            'WELCOME20': 0.20, // 20% discount
            'FIRST15': 0.15    // 15% discount
        };

        if (promoCodes[promoCode]) {
            localStorage.setItem('zenova_promo', JSON.stringify({
                code: promoCode,
                discount: promoCodes[promoCode]
            }));
            loadOrderSummary();
            alert(`Codice promozionale applicato! Sconto del ${promoCodes[promoCode] * 100}%`);
        } else {
            alert('Codice promozionale non valido.');
        }
    });

    // ===== PAYPAL REDIRECT BUTTON =====
    const paypalRedirectButton = document.getElementById('paypal-redirect-button');

    paypalRedirectButton.addEventListener('click', async function() {
        console.log('💳 Redirect a PayPal... Dati spedizione:', shippingData);

        // Disable button
        paypalRedirectButton.disabled = true;
        paypalRedirectButton.textContent = 'Creazione ordine...';

        try {
            // Verify shipping data
            if (!shippingData.email || !shippingData.firstName) {
                console.error('❌ Dati spedizione mancanti:', shippingData);
                throw new Error('Compila prima i dati di spedizione');
            }

            console.log('✅ Dati spedizione OK, preparo carrello...');

            // *** CHECK MIN QUANTITY ***
            const minQtyViolations = cart.filter(item => {
                const minQty = item.minQuantity || 1;
                return item.quantity < minQty;
            });
            if (minQtyViolations.length > 0) {
                const msgs = minQtyViolations.map(p => `${p.name}: minimo ${p.minQuantity} pz`).join('\n');
                alert(`Quantità insufficiente:\n\n${msgs}\n\nModifica le quantità nel carrello.`);
                paypalRedirectButton.disabled = false;
                paypalRedirectButton.textContent = 'Paga con PayPal';
                return;
            }

            // *** CHECK STOCK AVAILABILITY ***
            console.log('📦 Verifica disponibilità prodotti...');
            const unavailableProducts = cart.filter(item => !item.stock || item.stock <= 0 || item.stock < item.quantity);

            if (unavailableProducts.length > 0) {
                const productNames = unavailableProducts.map(p => p.name).join(', ');
                alert(`❌ Prodotti non disponibili o quantità insufficiente:\n\n${productNames}\n\nRimuovili dal carrello prima di procedere.`);
                paypalRedirectButton.disabled = false;
                paypalRedirectButton.textContent = 'Paga con PayPal';
                return;
            }

            // Prepare cart items
            const cartItems = cart.map(item => ({
                productId: item.id,
                source: item.source || 'bigbuy',
                bigbuyId: item.bigbuyId || (item.source === 'bigbuy' ? item.id : null),
                awId: item.awId || (item.source === 'aw' ? item.id : null),
                name: item.name,
                description: item.description || '',
                price: item.price,
                quantity: item.quantity,
                images: item.images || []
            }));

            // Create order via backend API
            const response = await fetch(`${API_BASE}/paypal/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: cartItems,
                    customer: {
                        email: shippingData.email,
                        name: `${shippingData.firstName} ${shippingData.lastName}`,
                        phone: shippingData.phone,
                        address: shippingData.address,
                        city: shippingData.city,
                        postalCode: shippingData.postalCode,
                        country: shippingData.country,
                        shippingCost: calculatedShippingCost
                    }
                })
            });

            const result = await response.json();
            console.log('✅ Ordine PayPal creato:', result);

            if (!result.success) {
                throw new Error(result.error || 'Errore creazione ordine');
            }

            // Redirect to PayPal
            if (result.data.approvalUrl) {
                console.log('➡️ Redirect a PayPal:', result.data.approvalUrl);
                window.location.href = result.data.approvalUrl;
            } else {
                throw new Error('URL PayPal mancante');
            }

        } catch (error) {
            console.error('❌ Errore creazione ordine PayPal:', error);
            alert('Errore durante la creazione dell\'ordine. Riprova.');

            // Re-enable button
            paypalRedirectButton.disabled = false;
            paypalRedirectButton.innerHTML = '<svg style="width: 24px; height: 24px; fill: white;" viewBox="0 0 24 24"><path d="M8.32 21.97a.546.546 0 0 1-.26-.32c-.03-.15-.01-.24.22-2.58a1310.1 1310.1 0 0 1 .48-4.44c.02-.2.03-.29.08-.39.06-.14.17-.25.3-.31.11-.05.14-.05.42-.05h.3l.13.06c.29.14.49.4.54.71.02.1.02.13-.02.82a624.95 624.95 0 0 1-.25 2.63c-.16 1.57-.21 2.08-.21 2.25 0 .3-.09.51-.27.66-.14.12-.3.17-.51.16-.16-.01-.27-.05-.38-.14zm2.99-2.17a.546.546 0 0 1-.26-.32c-.03-.15-.01-.24.22-2.58.23-2.34.37-3.74.48-4.44.02-.2.03-.29.08-.39.06-.14.17-.25.3-.31.11-.05.14-.05.42-.05h.3l.13.06c.29.14.49.4.54.71.02.1.02.13-.02.82-.04.69-.14 1.45-.25 2.63-.16 1.57-.21 2.08-.21 2.25 0 .3-.09.51-.27.66-.14.12-.3.17-.51.16-.16-.01-.27-.05-.38-.14zm2.99-2.17a.546.546 0 0 1-.26-.32c-.03-.15-.01-.24.22-2.58.23-2.34.37-3.74.48-4.44.02-.2.03-.29.08-.39.06-.14.17-.25.3-.31.11-.05.14-.05.42-.05h.3l.13.06c.29.14.49.4.54.71.02.1.02.13-.02.82-.04.69-.14 1.45-.25 2.63-.16 1.57-.21 2.08-.21 2.25 0 .3-.09.51-.27.66-.14.12-.3.17-.51.16-.16-.01-.27-.05-.38-.14zm-7.98-8.32a.546.546 0 0 1-.26-.32c-.03-.15-.01-.24.22-2.58.23-2.34.37-3.74.48-4.44.02-.2.03-.29.08-.39.06-.14.17-.25.3-.31.11-.05.14-.05.42-.05h.3l.13.06c.29.14.49.4.54.71.02.1.02.13-.02.82a624.95 624.95 0 0 1-.25 2.63c-.16 1.57-.21 2.08-.21 2.25 0 .3-.09.51-.27.66-.14.12-.3.17-.51.16-.16-.01-.27-.05-.38-.14z"/></svg> Paga con PayPal';
        }
    });

    // Functions
    function loadOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        summaryItems.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            // Gestione immagine prodotto (come nel carrello)
            let imageHtml = '';
            let imageUrl = item.image;

            // Se è un array, prendi il primo elemento
            if (Array.isArray(imageUrl)) {
                imageUrl = imageUrl[0];
            }

            // Convert relative URLs to absolute e usa proxy per immagini AW
            if (imageUrl && typeof imageUrl === 'string') {
                if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:') && imageUrl.startsWith('/')) {
                    imageUrl = 'https://zenova-commerce-production.up.railway.app' + imageUrl;
                }
                // Proxy per immagini AW (aroma-zone, aiku, retina) che danno 403
                if (imageUrl.includes('aroma-zone.com') || imageUrl.includes('aiku.io') || imageUrl.includes('retina.net')) {
                    imageUrl = `https://zenova-commerce-production.up.railway.app/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                }
            }

            // Generate image HTML - con fallback se immagine non carica
            if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
                imageHtml = `<img src="${imageUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" loading="lazy" onerror="this.parentElement.innerHTML='📦'">`;
            } else if (item.icon) {
                imageHtml = item.icon;
            } else {
                imageHtml = '📦';
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <div class="item-image">${imageHtml}</div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantità: ${item.quantity}</div>
                </div>
                <div class="item-price">€${itemTotal.toFixed(2)}</div>
            `;
            summaryItems.appendChild(itemEl);
        });

        // Check for promo code
        const promo = JSON.parse(localStorage.getItem('zenova_promo') || 'null');
        let discount = 0;

        if (promo) {
            discount = subtotal * promo.discount;
            document.getElementById('discountRow').classList.remove('hidden');
            document.getElementById('summaryDiscount').textContent = `-€${discount.toFixed(2)}`;
        }

        // Calculate shipping cost (from BigBuy API)
        let shippingCost = calculatedShippingCost; // Base shipping cost from BigBuy

        // Display shipping cost
        const shippingElement = document.getElementById('summaryShipping');
        if (shippingCost === 0) {
            shippingElement.textContent = 'Gratis';
        } else {
            shippingElement.textContent = `€${shippingCost.toFixed(2)}`;
        }

        const total = subtotal - discount + shippingCost;

        // Regime forfettario: niente IVA

        document.getElementById('summarySubtotal').textContent = `€${subtotal.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `€${total.toFixed(2)}`;
    }

    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('zenova-cart') || '[]');
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const promo = JSON.parse(localStorage.getItem('zenova_promo') || 'null');
        if (promo) {
            subtotal -= subtotal * promo.discount;
        }

        // Add calculated shipping cost
        let shippingCost = calculatedShippingCost;

        return subtotal + shippingCost;
    }

    function goToStep(step) {
        console.log(`🔄 goToStep chiamata con step: ${step}`);
        currentStep = step;

        // Update steps indicator
        const steps = document.querySelectorAll('.step');
        console.log(`   Found ${steps.length} step indicators`);
        steps.forEach((s, index) => {
            if (index + 1 <= step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });

        // Show/hide cards
        const shippingCard = document.getElementById('shippingCard');
        const paymentCard = document.getElementById('paymentCard');
        const confirmationCard = document.getElementById('confirmationCard');

        console.log('   Cards trovate:', {
            shipping: !!shippingCard,
            payment: !!paymentCard,
            confirmation: !!confirmationCard
        });

        if (step === 1) {
            console.log('   👉 Mostro card SPEDIZIONE');
            if (shippingCard) shippingCard.classList.remove('hidden');
            if (paymentCard) paymentCard.classList.add('hidden');
            if (confirmationCard) confirmationCard.classList.add('hidden');
        } else if (step === 2) {
            console.log('   👉 Mostro card PAGAMENTO');
            if (shippingCard) shippingCard.classList.add('hidden');
            if (paymentCard) paymentCard.classList.remove('hidden');
            if (confirmationCard) confirmationCard.classList.add('hidden');

            // Initialize Stripe
            initializeStripe();

            // Mount Stripe card element if not already mounted
            if (!cardElementMounted && cardElement) {
                setTimeout(() => {
                    cardElement.mount('#card-element');
                    cardElementMounted = true;
                    console.log('✅ Stripe card element mounted on step 2');
                }, 100);
            }

            // Update card total
            const total = calculateTotal();
            const cardTotalElement = document.getElementById('card-total');
            if (cardTotalElement) {
                cardTotalElement.textContent = total.toFixed(2);
            }
        } else if (step === 3) {
            console.log('   👉 Mostro card CONFERMA');
            if (shippingCard) shippingCard.classList.add('hidden');
            if (paymentCard) paymentCard.classList.add('hidden');
            if (confirmationCard) confirmationCard.classList.remove('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('✅ goToStep completata');
    }

    function generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `ZN-${timestamp}-${random}`;
    }

    function saveOrder(orderId, shipping, paymentMethod, paymentId = null) {
        const order = {
            id: orderId,
            items: cart,
            shipping: shipping,
            paymentMethod: paymentMethod,
            paymentId: paymentId,
            total: calculateTotal(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to orders history
        const orders = JSON.parse(localStorage.getItem('zenova_orders') || '[]');
        orders.push(order);
        localStorage.setItem('zenova_orders', JSON.stringify(orders));

        // Update order number in confirmation
        document.getElementById('orderNumber').textContent = `#${orderId}`;

        // Clear cart and promo
        localStorage.removeItem('zenova-cart');
        localStorage.removeItem('zenova_promo');

        // In a REAL implementation, send order to your server
        // and potentially to dropshipping supplier API
        sendOrderToServer(order);
    }

    function sendOrderToServer(order) {
        // This is where you would send the order to your backend
        // and integrate with dropshipping suppliers

        console.log('📤 Invio ordine al server:', order.orderId);

        // Send order to backend with improved error handling
        fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        .then(response => {
            console.log('📡 Risposta server - Status:', response.status, 'OK:', response.ok);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Ordine salvato sul server:', data);
            if (data.success) {
                console.log('✅ Ordine confermato dal backend con ID:', data.orderId || data.data?.id);
            } else {
                console.warn('⚠️ Server ha risposto ma senza successo:', data);
                showServerSyncWarning();
            }
        })
        .catch(error => {
            console.error('❌ ERRORE invio ordine al server:', error);
            console.error('❌ Ordine ID:', order.orderId);
            console.error('❌ API Base:', API_BASE);
            showServerSyncWarning();

            // Save failed order for retry
            const failedOrders = JSON.parse(localStorage.getItem('zenova_failed_orders') || '[]');
            failedOrders.push({ order, timestamp: Date.now(), error: error.message });
            localStorage.setItem('zenova_failed_orders', JSON.stringify(failedOrders));
        });
    }

    function showServerSyncWarning() {
        // Show visible warning that order may need manual verification
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 15px 25px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 90%; text-align: center;';
        warningDiv.innerHTML = '⚠️ Ordine ricevuto ma sincronizzazione server in corso.<br>Controlla la tua email per la conferma.';
        document.body.appendChild(warningDiv);

        setTimeout(() => {
            warningDiv.style.transition = 'opacity 0.5s';
            warningDiv.style.opacity = '0';
            setTimeout(() => warningDiv.remove(), 500);
        }, 8000);
    }

    // PayPal redirect is now handled by custom button (paypalRedirectButton)

    // Redirect if cart is empty
    if (cart.length === 0) {
        alert('Il tuo carrello è vuoto!');
        window.location.href = 'prodotti.html';
    }
});
