// Checkout System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout system loaded');

    // Initialize Stripe (MOCK for development - replace with real key in production)
    let stripe, elements, cardElement;
    try {
        // Try to initialize Stripe, but don't block if key is invalid
        stripe = Stripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz123456');
        elements = stripe.elements();

        // Create card element
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: 'Quicksand, sans-serif',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                }
            }
        });

        // Try to mount card element
        const cardElementContainer = document.getElementById('card-element');
        if (cardElementContainer) {
            cardElement.mount('#card-element');
        }

        // Handle card errors
        if (cardElement) {
            cardElement.on('change', function(event) {
                const displayError = document.getElementById('card-errors');
                if (displayError) {
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                }
            });
        }
    } catch (error) {
        console.warn('⚠️ Stripe non inizializzato (modalità sviluppo):', error.message);
    }

    // Get cart data
    const cart = JSON.parse(localStorage.getItem('zenova-cart') || '[]');
    let shippingData = {};
    let currentStep = 1;

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

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment forms
            document.getElementById('stripeCardForm').classList.add('hidden');
            document.getElementById('paypalContainer').classList.add('hidden');
            document.getElementById('bankTransferInfo').classList.add('hidden');
            document.getElementById('cashOnDeliveryInfo').classList.add('hidden');

            // Show selected payment form
            const selectedMethod = this.value;
            if (selectedMethod === 'card') {
                document.getElementById('stripeCardForm').classList.remove('hidden');
            } else if (selectedMethod === 'paypal') {
                document.getElementById('paypalContainer').classList.remove('hidden');
                renderPayPalButton();
            } else if (selectedMethod === 'bank') {
                document.getElementById('bankTransferInfo').classList.remove('hidden');
            } else if (selectedMethod === 'cash') {
                document.getElementById('cashOnDeliveryInfo').classList.remove('hidden');
            }
        });
    });

    // Stripe payment form
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = document.getElementById('submitPayment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        submitButton.disabled = true;
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');

        // TEMPORARY FIX: Bypass backend and simulate successful payment
        console.log('⚠️ Modalità sviluppo - bypass backend Stripe');

        // Simulate processing delay
        setTimeout(() => {
            const orderId = generateOrderId();
            saveOrder(orderId, shippingData, 'card', 'demo_payment_' + Date.now());
            goToStep(3);
        }, 1500);

        return; // Skip the backend call below

        // Create Stripe Checkout session via backend
        try {
            console.log('🔄 Creazione sessione Stripe Checkout...');
            console.log('📦 Dati spedizione:', shippingData);

            // Check if ZenovaAPI is available
            if (typeof ZenovaAPI === 'undefined') {
                throw new Error('ZenovaAPI non disponibile');
            }

            // Verify shipping data is complete
            if (!shippingData.email || !shippingData.firstName) {
                throw new Error('Dati di spedizione mancanti. Compila il form di spedizione prima di procedere.');
            }

            // Prepare cart items with full data
            const cartItems = cart.map(item => ({
                productId: item.id,
                bigbuyId: item.bigbuyId || item.id,
                name: item.name,
                description: item.description || '',
                price: item.price,
                quantity: item.quantity,
                images: item.images || []
            }));

            console.log('🛒 Carrello da inviare:', cartItems);

            // Create checkout session via backend
            console.log('📡 Chiamata API createCheckout...');
            const result = await ZenovaAPI.createCheckout(cartItems, {
                email: shippingData.email,
                name: `${shippingData.firstName} ${shippingData.lastName}`,
                phone: shippingData.phone
            });

            console.log('📥 Risposta ricevuta:', result);

            // If successful, user will be redirected to Stripe Checkout
            // (the redirect happens inside ZenovaAPI.createCheckout)

            console.log('✅ Checkout creato con successo');

        } catch (error) {
            console.error('❌ Errore checkout:', error);
            document.getElementById('card-errors').textContent = 'Errore durante il checkout. Riprova.';
            submitButton.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }

        /* REAL IMPLEMENTATION (uncomment when ready):

        try {
            // Create payment intent on your server
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: calculateTotal() * 100, // in cents
                    currency: 'eur'
                })
            });
            const { clientSecret } = await response.json();

            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: shippingData.firstName + ' ' + shippingData.lastName,
                        email: shippingData.email
                    }
                }
            });

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                submitButton.disabled = false;
                buttonText.classList.remove('hidden');
                spinner.classList.add('hidden');
            } else {
                // Payment successful
                const orderId = generateOrderId();
                saveOrder(orderId, shippingData, 'card', paymentIntent.id);
                goToStep(3);
            }
        } catch (err) {
            console.error('Payment error:', err);
            submitButton.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
        */
    });

    // Bank transfer confirmation
    document.getElementById('confirmBankTransfer').addEventListener('click', function() {
        const orderId = generateOrderId();
        saveOrder(orderId, shippingData, 'bank');
        goToStep(3);
    });

    // Cash on delivery confirmation
    document.getElementById('confirmCashPayment').addEventListener('click', function() {
        const orderId = generateOrderId();
        saveOrder(orderId, shippingData, 'cash');
        goToStep(3);
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

    // Functions
    function loadOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        summaryItems.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <div class="item-image">${item.icon || '📦'}</div>
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

        // Check for cash on delivery fee
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        let shippingCost = 0;
        if (selectedMethod && selectedMethod.value === 'cash') {
            shippingCost = 5.00;
            document.getElementById('summaryShipping').textContent = '€5.00';
        } else {
            document.getElementById('summaryShipping').textContent = 'Gratis';
        }

        const total = subtotal - discount + shippingCost;

        document.getElementById('summarySubtotal').textContent = `€${subtotal.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `€${total.toFixed(2)}`;
        document.getElementById('payment-amount').textContent = total.toFixed(2);
    }

    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('zenova-cart') || '[]');
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const promo = JSON.parse(localStorage.getItem('zenova_promo') || 'null');
        if (promo) {
            subtotal -= subtotal * promo.discount;
        }

        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (selectedMethod && selectedMethod.value === 'cash') {
            subtotal += 5.00;
        }

        return subtotal;
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

        console.log('Order placed:', order);

        /* REAL IMPLEMENTATION:

        fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Order sent to server:', data);

            // If using dropshipping automation:
            // Your server would then forward the order to the supplier's API
        })
        .catch(error => {
            console.error('Error sending order:', error);
        });
        */
    }

    function renderPayPalButton() {
        // Clear existing button
        document.getElementById('paypal-button-container').innerHTML = '';

        // Render PayPal button
        /* UNCOMMENT WHEN PAYPAL IS CONFIGURED:

        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: calculateTotal().toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    const orderId = generateOrderId();
                    saveOrder(orderId, shippingData, 'paypal', details.id);
                    goToStep(3);
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                alert('Si è verificato un errore con PayPal. Riprova.');
            }
        }).render('#paypal-button-container');
        */

        // Demo button (remove when PayPal is configured)
        document.getElementById('paypal-button-container').innerHTML = `
            <button class="btn btn-primary" onclick="handleDemoPayPal()">
                Paga con PayPal (Demo)
            </button>
        `;
    }

    // Make demo PayPal function available globally
    window.handleDemoPayPal = function() {
        const orderId = generateOrderId();
        saveOrder(orderId, shippingData, 'paypal');
        goToStep(3);
    };

    // Redirect if cart is empty
    if (cart.length === 0) {
        alert('Il tuo carrello è vuoto!');
        window.location.href = 'prodotti.html';
    }
});
