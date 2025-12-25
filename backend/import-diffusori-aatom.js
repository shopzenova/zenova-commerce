const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = './top-100-products.json';
const CSV_FILE = './diffusori-aatom-NEW.csv';
const BACKUP_FILE = `./top-100-products.backup-before-aatom-import-${Date.now()}.json`;

console.log('📦 IMPORT DIFFUSORI AROMATICI AATOM\n');
console.log('='.repeat(90));

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`\n✅ CSV letto: ${csvData.length} prodotti AATOM\n`);

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

      // Swap prime due immagini (prodotto in uso come prima)
      if (imageUrls.length >= 2) {
        [imageUrls[0], imageUrls[1]] = [imageUrls[1], imageUrls[0]];
      }

      // Crea prodotto
      const newProduct = {
        id: sku,
        sku: sku,
        name: name,
        description: `Diffusore aromatico di alta qualità. ${name}. Perfetto per creare un'atmosfera rilassante e profumata nella tua casa.`,
        price: rrpPrice,
        originalPrice: rrpPrice,
        costPrice: costPrice,
        images: imageUrls,
        mainImage: imageUrls[0] || '',
        category: 'natural-wellness',
        categoryId: 4,
        zenovaCategory: 'natural-wellness',
        zenovaSubcategory: 'diffusori-aromatici',
        subcategory: 'diffusori-aromatici',
        stock: stock,
        inStock: stock > 0,
        featured: false,
        tags: ['diffusore', 'aromatico', 'wellness', 'relax'],
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
    console.log(`   Importati AATOM: ${importedCount}`);
    console.log(`   Totale ora: ${products.length}`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
    console.log('\n✅ IMPORT COMPLETATO!\n');
  });
