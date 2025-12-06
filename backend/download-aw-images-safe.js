/**
 * Scarica immagini AW in modo SICURO e GRADUALE
 * Evita di sovraccaricare il server AW come suggerito dal supporto
 *
 * STRATEGIA:
 * - Scarica 10 immagini alla volta
 * - Pausa di 5 secondi ogni 10 immagini
 * - Pausa di 30 secondi ogni 100 immagini
 * - Riprende da dove si era interrotto
 */
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Configura
const catalogPath = './aw-catalog-full.json';
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');
const logFile = path.join(__dirname, 'download-aw-images-progress.json');

// Parametri di rate limiting (regola questi per controllare la velocità)
const BATCH_SIZE = 10;                // Immagini per batch
const PAUSE_AFTER_BATCH = 5000;       // 5 secondi tra batch
const PAUSE_AFTER_100 = 30000;        // 30 secondi ogni 100 immagini
const RETRY_ATTEMPTS = 3;              // Tentativi di retry per errore

// Crea directory se non esiste
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Carica catalogo
if (!fs.existsSync(catalogPath)) {
  console.error(`❌ File catalogo non trovato: ${catalogPath}`);
  console.log('\n💡 Prima esegui: node fetch-aw-catalog.js\n');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
console.log(`📦 Caricati ${catalog.length} prodotti dal catalogo\n`);

// Carica progressi precedenti
let progress = { downloaded: {}, errors: {}, lastIndex: 0 };
if (fs.existsSync(logFile)) {
  progress = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  console.log(`📝 Ripresa da precedente sessione: ${Object.keys(progress.downloaded).length} già scaricate\n`);
}

// Statistiche
const stats = {
  total: catalog.length,
  downloaded: Object.keys(progress.downloaded).length,
  skipped: 0,
  errors: Object.keys(progress.errors).length,
  startTime: Date.now()
};

/**
 * Download singola immagine con retry
 */
async function downloadImage(url, filepath, retries = RETRY_ATTEMPTS) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'image/*'
      },
      timeout: 30000
    }, (response) => {
      // Gestisci redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath, retries).then(resolve).catch(reject);
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
    });

    request.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          downloadImage(url, filepath, retries - 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(err);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Salva progressi su file
 */
function saveProgress() {
  fs.writeFileSync(logFile, JSON.stringify(progress, null, 2));
}

/**
 * Mostra statistiche
 */
function showStats() {
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  const remaining = stats.total - stats.downloaded - stats.errors;
  const speed = stats.downloaded > 0 ? Math.round(duration / stats.downloaded) : 0;
  const eta = speed > 0 ? Math.round((remaining * speed) / 60) : 0;

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 STATISTICHE:`);
  console.log(`   Totale: ${stats.total}`);
  console.log(`   ✅ Scaricate: ${stats.downloaded} (${Math.round(stats.downloaded/stats.total*100)}%)`);
  console.log(`   ⏭️  Skippate: ${stats.skipped}`);
  console.log(`   ❌ Errori: ${stats.errors}`);
  console.log(`   ⏱️  Tempo: ${duration}s`);
  console.log(`   ⚡ Velocità: ~${speed}s/img`);
  if (eta > 0) console.log(`   ⏳ ETA: ~${eta} minuti`);
  console.log(`${'─'.repeat(60)}\n`);
}

/**
 * Main - Download immagini
 */
async function main() {
  console.log('🚀 AW DROPSHIP - DOWNLOAD IMMAGINI SICURO E GRADUALE\n');
  console.log(`📌 Strategia: ${BATCH_SIZE} immagini → pausa ${PAUSE_AFTER_BATCH/1000}s`);
  console.log(`📌 Ogni 100 immagini: pausa ${PAUSE_AFTER_100/1000}s`);
  console.log(`📂 Directory: ${imagesDir}`);
  console.log('═'.repeat(60));

  const startIndex = progress.lastIndex || 0;

  for (let i = startIndex; i < catalog.length; i++) {
    const product = catalog[i];
    const productCode = product.code || product.id || product.slug;

    // Verifica se già scaricato o in errore
    if (progress.downloaded[productCode]) {
      stats.skipped++;
      continue;
    }

    // Determina URL immagine (preferisci webp per dimensione/qualità)
    let imageUrl = null;
    if (product.image && typeof product.image === 'object') {
      imageUrl = product.image.webp || product.image.original || product.image.url;

      // IMPORTANTE: L'API AW restituisce thumbnail 64x64!
      // Sostituisci rs::64:64:: con rs::800:800:: per immagini ad alta risoluzione
      if (imageUrl && imageUrl.includes('rs::64:64::')) {
        imageUrl = imageUrl.replace('rs::64:64::', 'rs::800:800::');
        console.log(`   🔧 Upgrade a 800x800: ${productCode}`);
      } else if (imageUrl && imageUrl.includes('rs::128:128::')) {
        imageUrl = imageUrl.replace('rs::128:128::', 'rs::800:800::');
        console.log(`   🔧 Upgrade a 800x800: ${productCode}`);
      }
    } else if (typeof product.image === 'string') {
      imageUrl = product.image;
    }

    if (!imageUrl) {
      console.log(`   ⚠️  ${productCode}: nessuna immagine`);
      progress.errors[productCode] = 'no-image';
      stats.errors++;
      continue;
    }

    // Determina nome file
    const ext = imageUrl.includes('.webp') ? 'webp' : 'jpg';
    const filename = `${productCode}.${ext}`;
    const filepath = path.join(imagesDir, filename);

    // Skip se file esiste già e non è vuoto
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
      progress.downloaded[productCode] = { filename, timestamp: new Date().toISOString(), size: fs.statSync(filepath).size };
      stats.downloaded++;
      stats.skipped++;
      continue;
    }

    // Download
    try {
      await downloadImage(imageUrl, filepath);
      const fileSize = fs.statSync(filepath).size;

      progress.downloaded[productCode] = {
        filename,
        timestamp: new Date().toISOString(),
        size: fileSize
      };
      stats.downloaded++;

      console.log(`✅ [${stats.downloaded}/${stats.total}] ${productCode} (${Math.round(fileSize/1024)}KB)`);

      // Salva progressi ogni 10 download
      if (stats.downloaded % 10 === 0) {
        progress.lastIndex = i + 1;
        saveProgress();
      }

      // Pause strategiche
      if (stats.downloaded % 100 === 0) {
        showStats();
        console.log(`⏸️  PAUSA LUNGA (${PAUSE_AFTER_100/1000}s) ogni 100 immagini per non sovraccaricare il server...`);
        await new Promise(r => setTimeout(r, PAUSE_AFTER_100));
      } else if (stats.downloaded % BATCH_SIZE === 0) {
        console.log(`⏸️  Pausa batch (${PAUSE_AFTER_BATCH/1000}s)...`);
        await new Promise(r => setTimeout(r, PAUSE_AFTER_BATCH));
      } else {
        // Pausa minima tra ogni download
        await new Promise(r => setTimeout(r, 1000));
      }

    } catch (error) {
      progress.errors[productCode] = error.message;
      stats.errors++;
      console.error(`❌ [${stats.downloaded}/${stats.total}] ${productCode}: ${error.message}`);

      // Salva progressi anche in caso di errore
      progress.lastIndex = i + 1;
      saveProgress();
    }
  }

  // Statistiche finali
  progress.lastIndex = catalog.length;
  saveProgress();

  showStats();

  console.log('🎉 DOWNLOAD COMPLETATO!\n');
  console.log(`📁 Immagini salvate in: ${imagesDir}`);
  console.log(`📝 Log progressi: ${logFile}\n`);

  if (stats.errors > 0) {
    console.log(`⚠️  ${stats.errors} immagini con errori. Riesegui lo script per riprovare.\n`);
  }
}

// Gestione interruzione (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\n⏸️  INTERRUZIONE - Salvataggio progressi...');
  saveProgress();
  showStats();
  console.log('✅ Progressi salvati. Riesegui lo script per riprendere.\n');
  process.exit(0);
});

// Avvia
main().then(() => {
  console.log('✅ Processo completato!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Errore fatale:', error);
  saveProgress();
  process.exit(1);
});
