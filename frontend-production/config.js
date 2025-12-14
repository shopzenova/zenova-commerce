/**
 * Zenova Frontend Configuration
 *
 * ISTRUZIONI:
 * 1. Dopo aver deployato il backend su Render.com
 * 2. Copia l'URL del backend (es: https://zenova-backend.onrender.com)
 * 3. Sostituisci l'URL qui sotto
 * 4. Ri-carica questo file su FTP
 */

// ⚠️ CAMBIA QUESTO URL dopo il deploy del backend!
const API_BASE_URL = 'http://localhost:3000/api';

// Quando il backend è online su Render, cambia in:
// const API_BASE_URL = 'https://zenova-backend.onrender.com/api';

// Esporta per uso globale
window.ZENOVA_CONFIG = {
    API_BASE_URL: API_BASE_URL
};
