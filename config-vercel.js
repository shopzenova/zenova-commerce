/**
 * Zenova - Vercel Configuration
 * Configuration for static site deployment on Vercel
 */

// Products will be loaded from static JSON file
const PRODUCTS_JSON_PATH = './products.json';

// Since we don't have a backend, we'll use a simplified configuration
const API_MODE = 'static'; // 'static' or 'api'

// Export for use in scripts
if (typeof window !== 'undefined') {
    window.ZENOVA_CONFIG = {
        API_MODE: API_MODE,
        PRODUCTS_PATH: PRODUCTS_JSON_PATH
    };
}
