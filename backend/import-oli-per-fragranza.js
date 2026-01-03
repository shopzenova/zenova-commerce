const fs = require('fs');
const csv = require('csv-parser');

// ============================================================================
// CONFIGURAZIONE
// ============================================================================

const CSV_FILE = './oli-per-fragranza-NEW.csv';
const CATEGORIA = 'oli-per-fragranza';
const NOME_CATEGORIA = 'Oli per Fragranza';
const TAGS = ['olio fragranza', 'profumo', 'diffusore', 'aromaterapia', 'natural wellness', 'bruciatore oli'];
const DESCRIZIONE_DEFAULT = 'Olio per fragranza puro di alta qualità da 250g, ideale per bruciatori, potpourri e pietre profumate.';

// ============================================================================
// SETUP AUTOMATICO
// ============================================================================

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-${CATEGORIA}-import-${Date.now()}.json`;

console.log(`📦 IMPORT ${NOME_CATEGORIA.toUpperCase()}\n`);
console.log('='.repeat(90));

// ============================================================================
// IMPORTAZIONE
// ============================================================================

const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`\n✅ CSV letto: ${csvData.length} prodotti ${NOME_CATEGORIA}\n`);

    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`📦 Prodotti attuali nel database: ${products.length}`);

    // Backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Backup: ${BACKUP_FILE}\n`);

    console.log('='.repeat(90));
    console.log('📥 IMPORTAZIONE PRODOTTI:\n');

    let importedCount = 0;

    csvData.forEach(row => {
      const sku = row['Product code'];
      const name = row['Unit Name'] || '';
      const rrpPrice = parseFloat(row['Unit RRP']) || 0;
      const costPrice = parseFloat(row['Price']);

      // Converti stock text in numero
      let stock = 0;
      const stockText = row['Stock'] || '';
      if (stockText === 'Normal') stock = 50;
      else if (stockText === 'Low') stock = 10;
      else if (stockText === 'VeryLow') stock = 2;
      else if (stockText === 'OutofStock') stock = 0;
      else stock = parseInt(row['Available Quantity']) || 0;

      const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
      const descriptionPlain = row['Webpage description (plain text)'] || '';

      // Swap prime due immagini (prodotto in uso come prima)
      if (imageUrls.length >= 2) {
        [imageUrls[0], imageUrls[1]] = [imageUrls[1], imageUrls[0]];
      }

      // Usa la descrizione completa dal CSV se disponibile
      const description = descriptionPlain || `${DESCRIZIONE_DEFAULT} ${name}.`;

      // Calcola prezzo vendita se RRP è 0
      const finalPrice = rrpPrice > 0 ? rrpPrice : (costPrice * 2.5);

      // Crea prodotto
      const newProduct = {
        id: sku,
        sku: sku,
        name: name,
        description: description,
        price: finalPrice,
        originalPrice: finalPrice,
        costPrice: costPrice,
        images: imageUrls,
        mainImage: imageUrls[0] || '',
        category: 'natural-wellness',
        categoryId: 4,
        zenovaCategory: 'natural-wellness',
        zenovaSubcategory: CATEGORIA,
        subcategory: CATEGORIA,
        stock: stock,
        inStock: stock > 0,
        featured: false,
        tags: TAGS,
        source: 'aw',
        supplier: 'AW',
        awId: sku,
        rating: 4.5,
        reviews: 0,
        importedAt: new Date().toISOString().split('T')[0]
      };

      products.push(newProduct);
      importedCount++;

      console.log(`✅ ${sku}: ${name.substring(0, 60)}`);
      console.log(`   💰 Prezzo: €${finalPrice.toFixed(2)} (RRP) | Costo: €${costPrice.toFixed(2)}`);
      console.log(`   📦 Stock: ${stock} unità (${stockText || 'N/A'})`);
      console.log(`   🖼️  Immagini: ${imageUrls.length}`);
      console.log('');
    });

    console.log('='.repeat(90));
    console.log(`\n📊 RIEPILOGO:`);
    console.log(`   Prodotti prima: ${products.length - importedCount}`);
    console.log(`   Importati ${NOME_CATEGORIA}: ${importedCount}`);
    console.log(`   Totale ora: ${products.length}`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
    console.log('\n✅ IMPORT COMPLETATO!\n');
  });
