const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = './top-100-products.json';
const IMAGES_DIR = '../images/aw-products';
const BACKUP_FILE = `./products.backup-update-images-${Date.now()}.json`;

console.log('🖼️  Aggiornamento percorsi immagini AATOM...\n');

// Backup
console.log('💾 Creazione backup...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup salvato: ${BACKUP_FILE}\n`);

// Leggi tutte le immagini disponibili
const availableImages = fs.readdirSync(path.join(__dirname, IMAGES_DIR));
console.log(`📁 Trovate ${availableImages.length} immagini nella cartella\n`);

// Aggiorna i prodotti AATOM
let updatedCount = 0;
products.forEach(product => {
    if (product.sku && product.sku.toLowerCase().startsWith('aatom')) {
        const skuLower = product.sku.toLowerCase();

        // Trova tutte le immagini che corrispondono a questo SKU
        const matchingImages = availableImages.filter(img =>
            img.toLowerCase().startsWith(skuLower + '__') ||
            img.toLowerCase().startsWith(skuLower + '_')
        );

        if (matchingImages.length > 0) {
            // Aggiorna i percorsi delle immagini
            product.images = matchingImages.map(img => `images/aw-products/${img}`);
            product.mainImage = product.images[0];
            updatedCount++;
            console.log(`✅ ${product.sku}: ${matchingImages.length} immagini aggiornate`);
        } else {
            console.log(`⚠️  ${product.sku}: nessuna immagine trovata`);
        }
    }
});

// Salva il file aggiornato
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

console.log(`\n✅ Aggiornamento completato!`);
console.log(`📦 Prodotti aggiornati: ${updatedCount}`);
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
