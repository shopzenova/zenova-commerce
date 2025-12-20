const fs = require('fs');
const https = require('https');
const path = require('path');

const PRODUCTS_FILE = './top-100-products.json';
const IMAGES_DIR = '../images/aw-products';
const TEMP_DIR = 'C:\\Users\\giorg\\Downloads\\rdeo_images_temp';

console.log('📥 Download immagini RDEO...\n');

// Crea cartella temporanea
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`📁 Creata cartella: ${TEMP_DIR}\n`);
}

// Leggi prodotti
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
const rdeoProducts = products.filter(p => p.sku && p.sku.startsWith('RDEO'));

console.log(`📦 Trovati ${rdeoProducts.length} prodotti RDEO\n`);

let totalImages = 0;
let downloadedImages = 0;

// Funzione per scaricare un'immagine
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });
            } else {
                reject(new Error(`Status code: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Download immagini per ogni prodotto
async function downloadAllImages() {
    for (const product of rdeoProducts) {
        const sku = product.sku.toLowerCase();
        console.log(`📦 ${product.sku}: ${product.images.length} immagini`);

        for (let i = 0; i < product.images.length; i++) {
            const imageUrl = product.images[i];
            const extension = 'jpeg'; // Default extension
            const filename = `${sku}__${String(i + 1).padStart(5, '0')}.${extension}`;
            const filepath = path.join(TEMP_DIR, filename);

            try {
                await downloadImage(imageUrl, filepath);
                downloadedImages++;
                totalImages++;
                process.stdout.write(`  ✅ ${filename}\r`);
            } catch (error) {
                console.log(`  ❌ Errore download ${filename}: ${error.message}`);
            }
        }
        console.log(''); // Newline
    }

    console.log(`\n✅ Download completato!`);
    console.log(`📊 Immagini scaricate: ${downloadedImages}/${totalImages}`);
    console.log(`📁 Cartella: ${TEMP_DIR}`);
}

downloadAllImages().catch(console.error);
