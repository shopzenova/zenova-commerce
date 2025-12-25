const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './aw-diffusori.csv';
const BACKUP_FILE = `./products.backup-fix-aatom-${Date.now()}.json`;

console.log('🔧 SISTEMAZIONE DIFFUSORI AROMATICI AATOM\n');
console.log('='.repeat(90));

// Traduzioni nomi prodotti
const translations = {
  'Milan Atomiser - USB - Colour Change': 'Diffusore Aromatico Milan - USB - Cambio Colore LED',
  'Santorini Atomiser - Shell Effect - USB - Colour Change - Timer': 'Diffusore Aromatico Santorini - Effetto Conchiglia - USB - LED - Timer',
  'Aarhus Atomiser - Classic Pod - USB - Colour Change - Timer': 'Diffusore Aromatico Aarhus - Design Classico - USB - LED - Timer',
  'Palma Atomiser - Shell Effect - USB - Colour Change - Timer': 'Diffusore Aromatico Palma - Effetto Conchiglia - USB - LED - Timer',
  'Palermo Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Palermo - USB - LED - Timer',
  'Marseille Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Marsiglia - USB - LED - Timer',
  'Helsinki  Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Helsinki - USB - LED - Timer',
  'Barcelona Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Barcellona - USB - LED - Timer',
  'Copenhagen Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Copenhagen - USB - LED - Timer',
  'Paris  Atomiser - USB - Colour Change - Timer': 'Diffusore Aromatico Parigi - USB - LED - Timer',
  'Himalayas Aroma Diffuser - USB-C - Remote control - Flame Effect': 'Diffusore Aromatico Himalaya - USB-C - Telecomando - Effetto Fiamma',
  'Blaze Aroma Diffuser - Himalayan Salt Chamber - USB-C - Flame Effect (Salt included)': 'Diffusore Aromatico Blaze - Camera Sale Himalayano - USB-C - Effetto Fiamma',
  'Modern Aroma Diffuser - Led Clock - USB-C - Flame Effect': 'Diffusore Aromatico Moderno - Orologio LED - USB-C - Effetto Fiamma',
  'Aroma Diffuser': 'Diffusore Aromatico',
  'Atomiser': 'Diffusore',
  'USB': 'USB',
  'Colour Change': 'Cambio Colore LED',
  'Timer': 'Timer',
  'Shell Effect': 'Effetto Conchiglia',
  'Flame Effect': 'Effetto Fiamma'
};

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`✅ CSV letto: ${csvData.length} prodotti\n`);

    // Crea mappa SKU -> dati CSV
    const csvMap = {};
    csvData.forEach(row => {
      csvMap[row['Product code']] = {
        sku: row['Product code'],
        name: row['Unit Name'],
        costPrice: parseFloat(row['Price']),
        sellPrice: parseFloat(row['Unit RRP']),
        stock: row['Available Quantity'] || 0,
        status: row['Status'],
        images: row['Images'] ? row['Images'].split(',').map(img => img.trim()) : [],
        description: row['Webpage description (plain text)'] || ''
      };
    });

    // Leggi products.json
    console.log('📦 Caricamento products.json...');
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`✅ Caricati ${products.length} prodotti totali\n`);

    // Backup
    console.log('💾 Creazione backup...');
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`✅ Backup: ${BACKUP_FILE}\n`);

    // Trova e aggiorna prodotti AATOM
    let updatedCount = 0;
    let fixedPrices = 0;
    let fixedStock = 0;
    let fixedNames = 0;
    let fixedImages = 0;

    console.log('🔧 AGGIORNAMENTO PRODOTTI AATOM:\n');
    console.log('='.repeat(90));

    products.forEach(product => {
      if (product.sku && product.sku.startsWith('AATOM-')) {
        const csvProduct = csvMap[product.sku];

        if (csvProduct) {
          console.log(`\n📦 ${product.sku}: ${product.name}`);
          let changes = [];

          // 1. Aggiorna PREZZO (da costo a vendita)
          if (product.price !== csvProduct.sellPrice) {
            console.log(`   💰 Prezzo: €${product.price} → €${csvProduct.sellPrice} (RRP)`);
            product.price = csvProduct.sellPrice;
            fixedPrices++;
            changes.push('prezzo');
          }

          // 2. Aggiorna STOCK (anche se 0 o non disponibile)
          const newStock = parseInt(csvProduct.stock) || 0;
          if (product.stock !== newStock) {
            console.log(`   📊 Stock: ${product.stock} → ${newStock}`);
            product.stock = newStock;
            fixedStock++;
            changes.push('stock');
          }

          // 2b. Aggiungi etichetta "Momentaneamente non disponibile" se stock = 0
          if (newStock === 0) {
            if (!product.tags) product.tags = [];
            if (!product.tags.includes('non-disponibile')) {
              product.tags.push('non-disponibile');
              console.log(`   🏷️  Etichetta: "Momentaneamente non disponibile"`);
            }
          } else {
            // Rimuovi etichetta se torna disponibile
            if (product.tags && product.tags.includes('non-disponibile')) {
              product.tags = product.tags.filter(t => t !== 'non-disponibile');
              console.log(`   ✅ Rimossa etichetta "non disponibile" - prodotto disponibile`);
            }
          }

          // 2c. Gestisci status "Discontinuing"
          if (csvProduct.status === 'Discontinuing') {
            if (!product.tags) product.tags = [];
            if (!product.tags.includes('in-dismissione')) {
              product.tags.push('in-dismissione');
              console.log(`   ⚠️  Status: ${csvProduct.status} → Aggiunta etichetta "in dismissione"`);
            }
          }

          // 3. Aggiorna IMMAGINI (se ce ne sono di più nel CSV)
          if (csvProduct.images.length > 0 && csvProduct.images.length > (product.images ? product.images.length : 0)) {
            console.log(`   🖼️  Immagini: ${product.images ? product.images.length : 0} → ${csvProduct.images.length}`);
            product.images = csvProduct.images.map(url => url.trim());
            fixedImages++;
            changes.push('immagini');
          }

          // 4. Traduci NOME
          let translatedName = product.name;
          Object.entries(translations).forEach(([en, it]) => {
            translatedName = translatedName.replace(new RegExp(en, 'gi'), it);
          });

          if (translatedName !== product.name) {
            console.log(`   🌐 Nome: ${product.name}`);
            console.log(`        → ${translatedName}`);
            product.name = translatedName;
            fixedNames++;
            changes.push('nome');
          }

          // 5. Assicura sottocategoria corretta
          if (product.zenovaSubcategory !== 'diffusori-aromatici') {
            console.log(`   📂 Sottocategoria: ${product.zenovaSubcategory} → diffusori-aromatici`);
            product.zenovaSubcategory = 'diffusori-aromatici';
            changes.push('categoria');
          }

          // 6. Traduci DESCRIZIONE (base)
          if (product.description && product.description.includes('Aroma Diffuser')) {
            product.description = product.description
              .replace(/Aroma Diffuser/gi, 'Diffusore Aromatico')
              .replace(/essential oil/gi, 'olio essenziale')
              .replace(/fragrance/gi, 'fragranza')
              .replace(/Tank capacity/gi, 'Capacità serbatoio')
              .replace(/LED light/gi, 'Luce LED')
              .replace(/Powered by USB/gi, 'Alimentato via USB')
              .replace(/Timer/gi, 'Timer')
              .replace(/Height/gi, 'Altezza')
              .replace(/Diameter/gi, 'Diametro')
              .replace(/Weight/gi, 'Peso');
          }

          if (changes.length > 0) {
            updatedCount++;
            console.log(`   ✅ Aggiornato: ${changes.join(', ')}`);
          } else {
            console.log(`   ⏭️  Nessuna modifica necessaria`);
          }
        } else {
          console.log(`\n⚠️  ${product.sku}: NON TROVATO nel CSV`);
        }
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log('\n📊 RIEPILOGO MODIFICHE:\n');
    console.log(`  Prodotti aggiornati: ${updatedCount}`);
    console.log(`  Prezzi corretti (costo→vendita): ${fixedPrices}`);
    console.log(`  Stock aggiornati: ${fixedStock}`);
    console.log(`  Nomi tradotti: ${fixedNames}`);
    console.log(`  Immagini aggiunte: ${fixedImages}`);

    // Salva products.json aggiornato
    console.log('\n💾 Salvataggio products.json...');
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('✅ File salvato!\n');

    console.log('='.repeat(90));
    console.log('🎉 DIFFUSORI AROMATICI AATOM SISTEMATI!\n');
    console.log('📋 Prossimi passi:');
    console.log('   1. Verifica i prodotti aggiornati');
    console.log('   2. Controlla le traduzioni');
    console.log('   3. Testa sul sito\n');
  });
