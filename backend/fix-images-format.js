const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'top-100-products.json');

// Backup del file originale
const backupPath = jsonPath.replace('.json', `-backup-${Date.now()}.json`);
fs.copyFileSync(jsonPath, backupPath);
console.log(`✅ Backup creato: ${path.basename(backupPath)}`);

// Carica prodotti
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

let fixedCount = 0;

// Normalizza le immagini
products.forEach(product => {
    if (Array.isArray(product.images)) {
        // Se le immagini sono oggetti con proprietà "url", trasformale in stringhe
        const hasObjectImages = product.images.some(img => typeof img === 'object' && img.url);

        if (hasObjectImages) {
            product.images = product.images.map(img => {
                if (typeof img === 'object' && img.url) {
                    return img.url; // Estrae solo l'URL
                }
                return img; // Mantieni stringhe come sono
            });

            // Aggiorna anche il campo "image" se esiste
            if (product.images.length > 0) {
                product.image = product.images[0];
            }

            fixedCount++;
        }
    }
});

// Salva file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');

console.log(`\n✅ Fixati ${fixedCount} prodotti`);
console.log(`📝 File salvato: ${jsonPath}`);
console.log(`\nRiavvia il backend per caricare i dati aggiornati!`);
