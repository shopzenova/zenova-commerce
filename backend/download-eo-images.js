const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const csv = require('csv-parser');

// Directory per salvare le immagini
const IMAGES_DIR = path.join(__dirname, '../images/aw-products/oli-essenziali');

// Assicurati che la directory esista
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Funzione per scaricare un'immagine
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Leggi il CSV e scarica le immagini
const products = [];

fs.createReadStream('aw-eo-import.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.Status === 'Active' && row.Images) {
      products.push({
        sku: row['Product code'],
        name: row['Unit Name'],
        images: row.Images.split(', ')
      });
    }
  })
  .on('end', async () => {
    console.log(`📦 Trovati ${products.length} prodotti attivi`);
    console.log(`🖼️  Inizio download immagini...\n`);

    let downloaded = 0;
    let errors = 0;

    for (const product of products) {
      console.log(`\n📦 ${product.sku} - ${product.name}`);
      console.log(`   ${product.images.length} immagini da scaricare`);

      // Scarica la prima immagine (principale)
      if (product.images[0]) {
        const imageUrl = product.images[0];
        const ext = '.jpg'; // Default jpg
        const filename = `${product.sku}${ext}`;
        const filepath = path.join(IMAGES_DIR, filename);

        try {
          await downloadImage(imageUrl, filepath);
          console.log(`   ✅ Salvata: ${filename}`);
          downloaded++;
        } catch (error) {
          console.log(`   ❌ Errore: ${error.message}`);
          errors++;
        }

        // Piccola pausa per non sovraccaricare il server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n\n✅ Download completato!`);
    console.log(`   ${downloaded} immagini scaricate con successo`);
    console.log(`   ${errors} errori`);
    console.log(`\n📁 Immagini salvate in: ${IMAGES_DIR}`);
  });
