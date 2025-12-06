/**
 * Test download di immagini AW originali (senza resize)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const catalogPath = './aw-catalog-full.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const outputDir = path.join(__dirname, '..', 'images', 'aw-products-test');

// Crea directory se non esiste
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🧪 TEST: Download immagini originali AW (senza resize)\n');

// Funzione per cambiare dimensione del resize
function getHDImageUrl(url, size = 1200) {
  // Sostituisci /rs::[width]:[height]::/ con dimensioni maggiori
  return url.replace(/\/rs::\d+:\d+::/, `/rs::${size}:${size}::`);
}

// Funzione per scaricare un'immagine
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(outputDir, filename));

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          // Ottieni dimensione file
          const stats = fs.statSync(path.join(outputDir, filename));
          resolve(stats.size);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(path.join(outputDir, filename), () => {});
      reject(err);
    });
  });
}

// Testa le prime 2 immagini
async function testImages() {
  console.log('📥 Scaricando prime 2 immagini per test...\n');

  // Testa diverse dimensioni
  const sizes = [1200, 1600, 2000];

  for (const size of sizes) {
    console.log(`\n========================================`);
    console.log(`📏 TESTANDO DIMENSIONE: ${size}x${size}`);
    console.log(`========================================`);

    for (let i = 0; i < 2; i++) {
      const product = catalog[i];
      const code = product.code;

      // URL originale (64x64)
      const smallUrl = product.image.webp;
      // URL HD
      const hdUrl = getHDImageUrl(smallUrl, size);

      console.log(`\n🖼️  Prodotto: ${code}`);
      console.log(`   Small URL (64x64): ${smallUrl}`);
      console.log(`   HD URL (${size}x${size}): ${hdUrl}`);

      try {
        const filename = `${code}-${size}x${size}.webp`;
        const fileSize = await downloadImage(hdUrl, filename);
        const fileSizeKB = (fileSize / 1024).toFixed(2);

        console.log(`   ✅ Scaricata: ${filename}`);
        console.log(`   📦 Dimensione: ${fileSizeKB} KB`);

        if (fileSize < 2000) {
          console.log(`   ⚠️  File molto piccolo (${fileSizeKB} KB) - icona`);
        } else if (fileSize > 100000) {
          console.log(`   🎉🎉 File grande (${fileSizeKB} KB) - OTTIMA qualità HD!`);
        } else if (fileSize > 30000) {
          console.log(`   ✅ File di buona dimensione (${fileSizeKB} KB) - buona qualità`);
        }
      } catch (error) {
        console.log(`   ❌ Errore: ${error.message}`);
      }
    }
  }

  console.log('\n\n✅ Test completato!');
  console.log(`📁 Immagini salvate in: ${outputDir}`);
  console.log('\n💡 Verifica le immagini scaricate per vedere la qualità.');
  console.log('   Se sono HD, esegui lo script completo per scaricare tutte le 96 immagini.');
}

testImages().catch(console.error);
