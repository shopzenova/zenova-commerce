/**
 * Scarica tutte le immagini AW localmente
 */
const fs = require('fs');
const https = require('https');
const path = require('path');

const awProducts = JSON.parse(fs.readFileSync('./aw-catalog-full.json', 'utf8'));
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');

// Crea directory se non esiste
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('📥 Download immagini AW...\n');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  let downloaded = 0;
  let errors = 0;

  for (const product of awProducts) {
    if (product.code.startsWith('BeardoB-')) continue; // Skip

    try {
      // Download main image
      const imageUrl = product.image.webp || product.image.original;
      const filename = `${product.code}-main.webp`;
      const filepath = path.join(imagesDir, filename);

      // Skip if already exists
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  Skip ${product.code} (già scaricato)`);
        continue;
      }

      await downloadImage(imageUrl, filepath);
      console.log(`✅ ${product.code}: ${filename}`);
      downloaded++;

      // Wait 100ms between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));

    } catch (error) {
      console.error(`❌ ${product.code}: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 RISULTATI:`);
  console.log(`   ✅ Scaricate: ${downloaded}`);
  console.log(`   ❌ Errori: ${errors}`);
}

downloadAllImages().then(() => {
  console.log('\n✅ Download completato!\n');
  console.log('💡 Ora esegui: node update-aw-catalog-local-images.js');
  process.exit(0);
}).catch(error => {
  console.error('❌ Errore:', error);
  process.exit(1);
});
