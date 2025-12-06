/**
 * Scarica immagini HD da CSV AW Dropship
 */
const fs = require('fs');
const https = require('https');
const path = require('path');
const readline = require('readline');

const csvFile = process.argv[2] || './aw-diffusori.csv';
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');

// Crea directory se non esiste
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log(`📦 Parsing CSV: ${csvFile}\n`);

const stats = {
  products: 0,
  imagesDownloaded: 0,
  imagesSkipped: 0,
  errors: 0
};

/**
 * Download singola immagine
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*'
      },
      timeout: 30000
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Parse CSV manualmente (gestisce virgole dentro virgolette)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

/**
 * Processa CSV
 */
async function processCSV() {
  const fileStream = fs.createReadStream(csvFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers = [];
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;

    if (lineNumber === 1) {
      // Prima riga = headers
      headers = parseCSVLine(line);
      console.log(`📋 Colonne: ${headers.join(', ')}\n`);
      continue;
    }

    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const productCode = row['Product code'];
    const imagesString = row['Images'];

    if (!productCode) {
      console.log(`⚠️  Riga ${lineNumber}: nessun Product code`);
      continue;
    }

    if (!imagesString) {
      console.log(`⚠️  ${productCode}: nessuna immagine`);
      stats.errors++;
      continue;
    }

    // Estrai URL immagini (separati da virgola e spazio)
    const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url.length > 0);

    if (imageUrls.length === 0) {
      console.log(`⚠️  ${productCode}: URL immagini vuoto`);
      stats.errors++;
      continue;
    }

    console.log(`\n📦 ${productCode} - ${imageUrls.length} immagini`);
    stats.products++;

    // Scarica ogni immagine
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];

      // Determina estensione (default jpg)
      const ext = imageUrl.includes('.webp') ? 'webp' :
                  imageUrl.includes('.png') ? 'png' : 'jpg';

      const filename = i === 0 ?
        `${productCode}.${ext}` :
        `${productCode}-${i + 1}.${ext}`;

      const filepath = path.join(imagesDir, filename);

      // Skip se già esiste
      if (fs.existsSync(filepath) && fs.statSync(filepath).size > 10000) {
        console.log(`   ⏭️  ${filename} (già scaricata)`);
        stats.imagesSkipped++;
        continue;
      }

      // Download
      try {
        await downloadImage(imageUrl, filepath);
        const fileSize = Math.round(fs.statSync(filepath).size / 1024);
        console.log(`   ✅ ${filename} (${fileSize}KB)`);
        stats.imagesDownloaded++;

        // Pausa tra immagini
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`   ❌ ${filename}: ${error.message}`);
        stats.errors++;
      }
    }

    // Pausa tra prodotti
    await new Promise(r => setTimeout(r, 1000));
  }

  // Statistiche finali
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 STATISTICHE FINALI:');
  console.log(`   Prodotti: ${stats.products}`);
  console.log(`   ✅ Immagini scaricate: ${stats.imagesDownloaded}`);
  console.log(`   ⏭️  Immagini skippate: ${stats.imagesSkipped}`);
  console.log(`   ❌ Errori: ${stats.errors}`);
  console.log(`\n📁 Immagini salvate in: ${imagesDir}`);
  console.log('═'.repeat(60));
}

// Avvia
processCSV().then(() => {
  console.log('\n✅ Download completato!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Errore:', error);
  process.exit(1);
});
