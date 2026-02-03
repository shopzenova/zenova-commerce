// ========================================
// COOKIE BANNER GDPR - Standalone
// Per pagine che non caricano script.js
// ========================================

(function() {
    // Guard: evita doppia inizializzazione se script.js è già caricato
    if (window._cookieBannerInitialized) return;

    function initCookieBanner() {
        if (window._cookieBannerInitialized) return;
        if (document.getElementById('cookieBanner')) return;
        window._cookieBannerInitialized = true;

        // Se l'utente ha già dato/negato il consenso, non mostrare il banner
        if (localStorage.getItem('zenova_cookie_consent')) {
            return;
        }

        // Crea il banner HTML
        const bannerHTML = `
            <div id="cookieBanner" class="cookie-banner">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <h4>Questo sito utilizza i cookie</h4>
                        <p>Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici per migliorare la tua esperienza.
                        Per maggiori informazioni consulta la nostra <a href="cookie-policy.html">Cookie Policy</a> e la <a href="privacy-policy.html">Privacy Policy</a>.</p>
                    </div>
                    <div class="cookie-buttons">
                        <button id="cookieAccept" class="cookie-btn cookie-accept">Accetta tutti</button>
                        <button id="cookieReject" class="cookie-btn cookie-reject">Solo necessari</button>
                    </div>
                </div>
            </div>
        `;

        // Aggiungi stili CSS
        const styleCSS = `
            <style id="cookieBannerStyles">
                .cookie-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: #fff;
                    padding: 1.5rem;
                    z-index: 10000;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.5s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .cookie-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1.5rem;
                }
                .cookie-text {
                    flex: 1;
                    min-width: 300px;
                }
                .cookie-text h4 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                    color: #fff;
                }
                .cookie-text p {
                    margin: 0;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.85);
                }
                .cookie-text a {
                    color: #667eea;
                    text-decoration: underline;
                }
                .cookie-text a:hover {
                    color: #8b9fef;
                }
                .cookie-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-shrink: 0;
                }
                .cookie-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .cookie-accept {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                }
                .cookie-accept:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                .cookie-reject {
                    background: transparent;
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .cookie-reject:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @media (max-width: 768px) {
                    .cookie-banner {
                        padding: 1rem;
                    }
                    .cookie-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    .cookie-buttons {
                        width: 100%;
                        justify-content: center;
                    }
                    .cookie-btn {
                        flex: 1;
                        padding: 0.75rem 1rem;
                    }
                }
            </style>
        `;

        // Inserisci stili e banner nel DOM
        document.head.insertAdjacentHTML('beforeend', styleCSS);
        document.body.insertAdjacentHTML('beforeend', bannerHTML);

        // Event listeners per i pulsanti
        document.getElementById('cookieAccept').addEventListener('click', function() {
            localStorage.setItem('zenova_cookie_consent', 'accepted');
            hideCookieBanner();
            console.log('Cookie accettati - Analytics attivato');
        });

        document.getElementById('cookieReject').addEventListener('click', function() {
            localStorage.setItem('zenova_cookie_consent', 'rejected');
            hideCookieBanner();
            console.log('Solo cookie necessari');
        });
    }

    function hideCookieBanner() {
        var banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease forwards';
            banner.style.cssText += '@keyframes slideDown { to { transform: translateY(100%); } }';
            setTimeout(function() { banner.remove(); }, 300);
        }
    }

    // Inizializza cookie banner
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCookieBanner);
    } else {
        initCookieBanner();
    }
})();
