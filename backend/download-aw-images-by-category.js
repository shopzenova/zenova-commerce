/**
 * Scarica immagini AW Dropship per CATEGORIA per evitare sovraccarico server
 * Come suggerito dal supporto AW: scaricare famiglia per famiglia
 */
require('dotenv').config(); // Carica variabili d'ambiente

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

// Configura directory immagini
const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Log file per tracciare progressi
const logFile = path.join(__dirname, 'download-aw-images-log.json');
let downloadLog = {};
if (fs.existsSync(logFile)) {
  downloadLog = JSON.parse(fs.readFileSync(logFile, 'utf8'));
}

const awClient = new AWDropshipClient();

// Statistiche globali
const stats = {
  categories: 0,
  productsProcessed: 0,
  imagesDownloaded: 0,
  imagesSkipped: 0,
  errors: 0,
  startTime: Date.now()
};

/**
 * Download singola immagine con retry
 */
async function downloadImage(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      },
      timeout: 30000 // 30 secondi timeout
    }, (response) => {
      // Gestisci redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`   🔄 Redirect: ${redirectUrl}`);
        downloadImage(redirectUrl, filepath, retries).then(resolve).catch(reject);
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
        fs.unlinkSync(filepath); // Rimuovi file corrotto
        reject(err);
      });
    });

    request.on('error', (err) => {
      if (retries > 0) {
        console.log(`   ⚠️  Retry (${retries} tentativi rimasti)...`);
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
 * Scarica immagini per un singolo prodotto
 */
async function downloadProductImages(product) {
  const productCode = product.code || product.id || product.slug;

  if (!product.image) {
    console.log(`   ⚠️  ${productCode}: nessuna immagine disponibile`);
    return { success: false, reason: 'no-image' };
  }

  // Determina URL immagine (preferisci webp se disponibile)
  let imageUrl = null;
  if (typeof product.image === 'string') {
    imageUrl = product.image;
  } else if (product.image.webp) {
    imageUrl = product.image.webp;
  } else if (product.image.original) {
    imageUrl = product.image.original;
  } else if (product.image.url) {
    imageUrl = product.image.url;
  }

  if (!imageUrl) {
    console.log(`   ⚠️  ${productCode}: formato immagine non riconosciuto`);
    return { success: false, reason: 'invalid-format' };
  }

  // Determina nome file ed estensione
  const ext = imageUrl.includes('.webp') ? 'webp' : 'jpg';
  const filename = `${productCode}-main.${ext}`;
  const filepath = path.join(imagesDir, filename);

  // Skip se già scaricato
  if (fs.existsSync(filepath)) {
    const fileSize = fs.statSync(filepath).size;
    if (fileSize > 0) {
      stats.imagesSkipped++;
      return { success: true, skipped: true };
    }
  }

  // Download
  try {
    await downloadImage(imageUrl, filepath);
    stats.imagesDownloaded++;
    console.log(`   ✅ ${productCode}: ${filename}`);

    // Aggiorna log
    downloadLog[productCode] = {
      downloaded: true,
      timestamp: new Date().toISOString(),
      filename: filename
    };

    return { success: true };
  } catch (error) {
    stats.errors++;
    console.error(`   ❌ ${productCode}: ${error.message}`);

    downloadLog[productCode] = {
      downloaded: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    return { success: false, error: error.message };
  }
}

/**
 * Scarica immagini per una categoria
 */
async function downloadCategoryImages(categorySlug, categoryName) {
  console.log(`\n📁 CATEGORIA: ${categoryName} (${categorySlug})`);
  console.log('─'.repeat(60));

  let page = 1;
  let hasMore = true;
  let categoryStats = {
    products: 0,
    downloaded: 0,
    skipped: 0,
    errors: 0
  };

  while (hasMore) {
    try {
      console.log(`\n   📄 Pagina ${page}...`);

      // Ottieni prodotti per questa categoria
      const result = await awClient.getProducts(page, 20, {
        department_slug: categorySlug
      });

      if (!result.data || result.data.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   📦 ${result.data.length} prodotti trovati`);

      // Scarica immagini per ogni prodotto
      for (const product of result.data) {
        stats.productsProcessed++;
        categoryStats.products++;

        const downloadResult = await downloadProductImages(product);

        if (downloadResult.success) {
          if (downloadResult.skipped) {
            categoryStats.skipped++;
          } else {
            categoryStats.downloaded++;
          }
        } else {
          categoryStats.errors++;
        }

        // Delay tra immagini (500ms)
        await new Promise(r => setTimeout(r, 500));
      }

      // Controlla se ci sono altre pagine
      if (page >= result.pagination.lastPage) {
        hasMore = false;
      } else {
        page++;
        // Delay più lungo tra pagine (2 secondi)
        console.log('   ⏳ Attendo 2 secondi prima della prossima pagina...');
        await new Promise(r => setTimeout(r, 2000));
      }

    } catch (error) {
      console.error(`   ❌ Errore pagina ${page}:`, error.message);
      stats.errors++;

      // Attendi prima di riprovare
      if (page < 5) { // Riprova solo per le prime pagine
        console.log('   ⏳ Attendo 5 secondi prima di riprovare...');
        await new Promise(r => setTimeout(r, 5000));
        continue;
      } else {
        hasMore = false;
      }
    }
  }

  // Riepilogo categoria
  console.log(`\n   📊 RIEPILOGO CATEGORIA:`);
  console.log(`      Prodotti: ${categoryStats.products}`);
  console.log(`      ✅ Scaricate: ${categoryStats.downloaded}`);
  console.log(`      ⏭️  Skippate: ${categoryStats.skipped}`);
  console.log(`      ❌ Errori: ${categoryStats.errors}`);

  // Salva log
  fs.writeFileSync(logFile, JSON.stringify(downloadLog, null, 2));

  return categoryStats;
}

/**
 * Main - Scarica tutte le categorie
 */
async function main() {
  console.log('🚀 AW DROPSHIP - DOWNLOAD IMMAGINI PER CATEGORIA\n');
  console.log('📌 Strategia: scaricare famiglia per famiglia per evitare sovraccarico');
  console.log('📂 Directory: ' + imagesDir);
  console.log('═'.repeat(60));

  try {
    // Ottieni lista categorie
    console.log('\n🔍 Recupero categorie AW...');
    const categories = await awClient.getCategories();

    if (!categories || categories.length === 0) {
      console.error('❌ Nessuna categoria trovata!');
      return;
    }

    // Estrai categorie uniche
    const uniqueCategories = new Map();
    for (const product of categories) {
      if (product.department_slug && product.department_name) {
        uniqueCategories.set(product.department_slug, product.department_name);
      }
    }

    const categoryList = Array.from(uniqueCategories.entries());
    console.log(`✅ Trovate ${categoryList.length} categorie\n`);

    // Mostra lista categorie
    categoryList.forEach(([slug, name], index) => {
      console.log(`   ${index + 1}. ${name} (${slug})`);
    });

    stats.categories = categoryList.length;

    // Scarica per categoria
    for (let i = 0; i < categoryList.length; i++) {
      const [slug, name] = categoryList[i];

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`📦 CATEGORIA ${i + 1}/${categoryList.length}`);

      await downloadCategoryImages(slug, name);

      // Delay lungo tra categorie (5 secondi)
      if (i < categoryList.length - 1) {
        console.log(`\n⏳ Attendo 5 secondi prima della prossima categoria...\n`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    // Statistiche finali
    const duration = Math.round((Date.now() - stats.startTime) / 1000);
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🎉 DOWNLOAD COMPLETATO!\n');
    console.log('📊 STATISTICHE FINALI:');
    console.log(`   Categorie: ${stats.categories}`);
    console.log(`   Prodotti processati: ${stats.productsProcessed}`);
    console.log(`   ✅ Immagini scaricate: ${stats.imagesDownloaded}`);
    console.log(`   ⏭️  Immagini skippate: ${stats.imagesSkipped}`);
    console.log(`   ❌ Errori: ${stats.errors}`);
    console.log(`   ⏱️  Tempo totale: ${duration}s`);
    console.log(`\n📁 Immagini salvate in: ${imagesDir}`);
    console.log(`📝 Log salvato in: ${logFile}`);

  } catch (error) {
    console.error('\n❌ ERRORE FATALE:', error);
    process.exit(1);
  }
}

// Avvia
main().then(() => {
  console.log('\n✅ Processo completato!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Errore:', error);
  process.exit(1);
});
