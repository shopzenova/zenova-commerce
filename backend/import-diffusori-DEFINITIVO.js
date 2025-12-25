const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './diffusori-aatom-NEW.csv';
const BACKUP_FILE = `./products.backup-import-definitivo-${Date.now()}.json`;
const IMAGES_DIR = '../images/aw-products/';

console.log('🔥 IMPORT DEFINITIVO DIFFUSORI AATOM\n');
console.log('✅ Prezzi: RRP (vendita al pubblico)');
console.log('✅ Immagini: Prodotto in funzione come principale');
console.log('✅ Categoria: diffusori-aromatici\n');
console.log('='.repeat(90));

// Traduzioni nomi prodotti
const translations = {
  'Milan Atomiser - USB - Colour Change': 'Diffusore Aromatico Milan - USB - Cambio Colore LED',
  'Santorini Atomiser - Shell Effect - USB - Colour Change - Timer': 'Diffusore Aromatico Santorini - Effetto Conchiglia - USB - LED - Timer',
  'Small Wood Effect Atomiser - USB - Colour Change': 'Diffusore Aromatico Piccolo Effetto Legno - USB - LED',
  'Medium Wood Effect Atomiser - USB - Colour Change': 'Diffusore Aromatico Medio Effetto Legno - USB - LED',
  'Palermo Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Palermo - USB - LED - Timer',
  'Florence Atomiser (plug) - Colour Change - Timer - Remote Control': 'Diffusore Aromatico Florence (plug) - LED - Timer - Telecomando',
  'Vienna Atomiser (plug) - Colour Change - Timer - Remote Control': 'Diffusore Aromatico Vienna (plug) - LED - Timer - Telecomando',
  'Prague Atomiser - Marble Effect - USB - Colour Change': 'Diffusore Aromatico Prague - Effetto Marmo - USB - LED',
  'Amsterdam Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Amsterdam - USB - LED - Timer',
  'Copenhagen Atomiser - Marble Effect - USB - Colour Change': 'Diffusore Aromatico Copenhagen - Effetto Marmo - USB - LED',
  'Dubai Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Dubai - USB - LED - Timer',
  'Tokyo Atomiser - USB - Colour Change': 'Diffusore Aromatico Tokyo - USB - LED',
  'Seattle Atomiser - Wood Effect - USB - Colour Change': 'Diffusore Aromatico Seattle - Effetto Legno - USB - LED',
  'Zurich Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Zurich - USB - LED - Timer',
  'Berlin Atomiser - USB - Colour Change': 'Diffusore Aromatico Berlin - USB - LED',
  'Himalayan Salt  Aroma Diffuser - Night Light - USB-C - Flame effect (Salt included)': 'Diffusore Aromatico Sale Himalayano - Luce Notturna - USB-C - Effetto Fiamma (Sale Incluso)',
  'Dry Aromatherapy Diffuser - Nebulizer - USB-C - No Water Required': 'Diffusore Aromatico a Secco - Nebulizzatore - USB-C - Senza Acqua',
  'Large Volcano Effect Aroma Diffuser (plug) Two Colours': 'Diffusore Aromatico Grande Effetto Vulcano (plug) Due Colori',
  'Medium Volcano Effect Aroma Diffuser (plug) Two Colours': 'Diffusore Aromatico Medio Effetto Vulcano (plug) Due Colori',
  'Ceramic Aroma Diffuser (plug) with Remote Control': 'Diffusore Aromatico Ceramica (plug) con Telecomando',
  'Oil Burner - Ceramic - White': 'Bruciatore Oli Essenziali - Ceramica - Bianco',
  'Oil Burner - Ceramic - Black': 'Bruciatore Oli Essenziali - Ceramica - Nero',
  'Essential Oils - Lavender - 10ml': 'Olio Essenziale - Lavanda - 10ml',
  'Essential Oils - Eucalyptus - 10ml': 'Olio Essenziale - Eucalipto - 10ml',
  'Essential Oils - Tea Tree - 10ml': 'Olio Essenziale - Tea Tree - 10ml',
  'Essential Oils - Peppermint - 10ml': 'Olio Essenziale - Menta Piperita - 10ml',
  'Fragrance Oils - Sandalwood - 10ml': 'Olio Profumato - Sandalo - 10ml',
  'Fragrance Oils - Vanilla - 10ml': 'Olio Profumato - Vaniglia - 10ml'
};

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`\n✅ CSV letto: ${csvData.length} prodotti\n`);

    // Crea mappa SKU -> dati
    const productMap = {};
    csvData.forEach(row => {
      const sku = row['Product code'];
      const originalName = row['Unit Name'];
      const translatedName = translations[originalName] || originalName;

      productMap[sku] = {
        name: translatedName,
        price: parseFloat(row['Unit RRP']), // PREZZO VENDITA!
        costPrice: parseFloat(row['Price']),
        stock: parseInt(row['Available Quantity']) || 0,
        description: row['Webpage description (plain text)'] || '',
        images: row['Images'] ? row['Images'].split(',').map(img => img.trim()) : []
      };
    });

    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`✅ Caricati ${products.length} prodotti dal database\n`);

    // Backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Backup: ${BACKUP_FILE}\n`);

    // Leggi immagini locali disponibili
    const availableFiles = fs.readdirSync(IMAGES_DIR)
      .filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`📂 Trovati ${availableFiles.length} file immagini locali\n`);

    let updatedCount = 0;

    console.log('🔄 AGGIORNAMENTO PRODOTTI:\n');
    console.log('='.repeat(90));

    products.forEach(product => {
      if (product.sku && product.sku.startsWith('AATOM-')) {
        const csvProduct = productMap[product.sku];

        if (csvProduct) {
          const skuLower = product.sku.toLowerCase();

          // Trova tutte le immagini locali per questo SKU (ordinate)
          const productFiles = availableFiles
            .filter(f => f.startsWith(skuLower))
            .sort();

          if (productFiles.length >= 2) {
            // Crea array con percorsi locali
            const localImages = productFiles.map(file => `images/aw-products/${file}`);

            // 🔥 IMPORTANTE: Scambia 1a con 2a (prodotto in funzione diventa principale!)
            [localImages[0], localImages[1]] = [localImages[1], localImages[0]];

            // Aggiorna prodotto
            product.name = csvProduct.name;
            product.price = csvProduct.price; // RRP (vendita)
            product.originalPrice = csvProduct.price;
            product.stock = csvProduct.stock;
            product.description = csvProduct.description;
            product.images = localImages;
            product.mainImage = localImages[0];
            product.image = localImages[0];
            product.category = 'Natural Wellness';
            product.zenovaCategory = 'diffusori-aromatici';
            product.visible = true;

            // Tags
            product.tags = product.tags || [];
            if (csvProduct.stock === 0) {
              if (!product.tags.includes('non-disponibile')) {
                product.tags.push('non-disponibile');
              }
            } else {
              product.tags = product.tags.filter(t => t !== 'non-disponibile');
            }

            const profit = csvProduct.price - csvProduct.costPrice;
            const profitPercent = (profit / csvProduct.price * 100).toFixed(1);

            console.log(`\n✅ ${product.sku}: ${csvProduct.name}`);
            console.log(`   💰 Prezzo vendita: €${csvProduct.price.toFixed(2)} (costo: €${csvProduct.costPrice.toFixed(2)})`);
            console.log(`   📈 Margine: €${profit.toFixed(2)} (${profitPercent}%)`);
            console.log(`   📦 Stock: ${csvProduct.stock} unità`);
            console.log(`   🖼️  Immagini: ${localImages.length} (principale: prodotto in funzione)`);
            console.log(`   🏷️  Categoria: diffusori-aromatici`);

            updatedCount++;
          } else if (productFiles.length === 1) {
            // Solo 1 immagine
            const localImages = [`images/aw-products/${productFiles[0]}`];

            product.name = csvProduct.name;
            product.price = csvProduct.price;
            product.originalPrice = csvProduct.price;
            product.stock = csvProduct.stock;
            product.description = csvProduct.description;
            product.images = localImages;
            product.mainImage = localImages[0];
            product.image = localImages[0];
            product.category = 'Natural Wellness';
            product.zenovaCategory = 'diffusori-aromatici';
            product.visible = true;

            console.log(`\n⚠️  ${product.sku}: Solo 1 immagine - €${csvProduct.price.toFixed(2)}`);
            updatedCount++;
          } else {
            console.log(`\n❌ ${product.sku}: Nessuna immagine locale trovata`);
          }
        } else {
          console.log(`\n⚠️  ${product.sku}: Non trovato nel CSV`);
        }
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log(`\n📊 Prodotti aggiornati: ${updatedCount}\n`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('✅ File products.json salvato!\n');

    console.log('='.repeat(90));
    console.log('🎉 IMPORT COMPLETATO CON SUCCESSO!\n');
    console.log('✓ Tutti i prezzi sono RRP (vendita al pubblico)');
    console.log('✓ Immagine principale: prodotto in funzione (non scatola)');
    console.log('✓ Immagini locali (no URL remoti)');
    console.log('✓ Categoria: diffusori-aromatici');
    console.log('✓ Stock aggiornati dal CSV\n');
    console.log('🔄 Ricarica il browser con Ctrl + Shift + R per vedere i cambiamenti!\n');
  });
