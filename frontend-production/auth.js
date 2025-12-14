// Authentication System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system loaded');

    // Tab Switching
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginFormContainer = document.getElementById('loginForm');
    const registerFormContainer = document.getElementById('registerForm');

    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding form
            if (targetTab === 'login') {
                loginFormContainer.classList.add('active');
                registerFormContainer.classList.remove('active');
            } else {
                registerFormContainer.classList.add('active');
                loginFormContainer.classList.remove('active');
            }
        });
    });

    // Login Form Handler
    const loginFormElement = document.getElementById('loginFormElement');
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Get registered users from localStorage
        const users = JSON.parse(localStorage.getItem('zenova_users') || '[]');

        // Find user
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Save logged in user
            localStorage.setItem('zenova_current_user', JSON.stringify({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                loggedInAt: new Date().toISOString()
            }));

            alert(`Benvenuto ${user.firstName}! Login effettuato con successo.`);
            window.location.href = 'index.html';
        } else {
            alert('Email o password non corretti. Riprova.');
        }
    });

    // Register Form Handler
    const registerFormElement = document.getElementById('registerFormElement');
    registerFormElement.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validation
        if (password.length < 8) {
            alert('La password deve essere di almeno 8 caratteri.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Le password non coincidono.');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('zenova_users') || '[]');

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            alert('Questa email è già registrata. Effettua il login.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('zenova_users', JSON.stringify(users));

        // Auto login
        localStorage.setItem('zenova_current_user', JSON.stringify({
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            loggedInAt: new Date().toISOString()
        }));

        alert(`Benvenuto ${firstName}! Account creato con successo.`);
        window.location.href = 'index.html';
    });

    // Social Login Buttons (placeholder functionality)
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            alert(`Il login con ${provider} sarà disponibile a breve. Per ora usa email e password.`);
        });
    });
});

// Check if user is logged in (utility function for other pages)
function getCurrentUser() {
    const userJson = localStorage.getItem('zenova_current_user');
    return userJson ? JSON.parse(userJson) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('zenova_current_user');
    window.location.href = 'auth.html';
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.getCurrentUser = getCurrentUser;
    window.logout = logout;
}
