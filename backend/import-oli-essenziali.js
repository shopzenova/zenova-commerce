const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = './top-100-products.json';
const CSV_FILE = './oli-essenziali-NEW.csv';
const BACKUP_FILE = `./top-100-products.backup-before-oli-essenziali-import-${Date.now()}.json`;

console.log('📦 IMPORT OLI ESSENZIALI\n');
console.log('='.repeat(90));

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`\n✅ CSV letto: ${csvData.length} oli essenziali\n`);

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
      const rrpPrice = parseFloat(row['Unit RRP']);
      const costPrice = parseFloat(row['Price']);
      const stock = parseInt(row['Available Quantity']) || 0;
      const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
      const descriptionPlain = row['Webpage description (plain text)'] || '';

      // Swap prime due immagini (prodotto in uso come prima)
      if (imageUrls.length >= 2) {
        [imageUrls[0], imageUrls[1]] = [imageUrls[1], imageUrls[0]];
      }

      // Usa la descrizione completa dal CSV se disponibile
      const description = descriptionPlain || `Olio essenziale puro di alta qualità. ${name}. Perfetto per aromaterapia, diffusione e benessere naturale.`;

      // Crea prodotto
      const newProduct = {
        id: sku,
        sku: sku,
        name: name,
        description: description,
        price: rrpPrice,
        originalPrice: rrpPrice,
        costPrice: costPrice,
        images: imageUrls,
        mainImage: imageUrls[0] || '',
        category: 'natural-wellness',
        categoryId: 4,
        zenovaCategory: 'natural-wellness',
        zenovaSubcategory: 'oli-essenziali',
        subcategory: 'oli-essenziali',
        stock: stock,
        inStock: stock > 0,
        featured: false,
        tags: ['olio essenziale', 'aromaterapia', 'wellness', 'naturale', 'puro'],
        source: 'aw',
        supplier: 'AW',
        awId: sku,
        rating: 4.5,
        reviews: 0
      };

      products.push(newProduct);
      importedCount++;

      console.log(`✅ ${sku}: ${name}`);
      console.log(`   💰 Prezzo: €${rrpPrice.toFixed(2)} (RRP) | Costo: €${costPrice.toFixed(2)}`);
      console.log(`   📦 Stock: ${stock} unità`);
      console.log(`   🖼️  Immagini: ${imageUrls.length}`);
      console.log('');
    });

    console.log('='.repeat(90));
    console.log(`\n📊 RIEPILOGO:`);
    console.log(`   Prodotti prima: ${products.length - importedCount}`);
    console.log(`   Importati oli essenziali: ${importedCount}`);
    console.log(`   Totale ora: ${products.length}`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
    console.log('\n✅ IMPORT COMPLETATO!\n');
  });
