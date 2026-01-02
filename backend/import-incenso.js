const fs = require('fs');
const csv = require('csv-parser');

// ============================================================================
// CONFIGURAZIONE - MODIFICA QUESTI VALORI PER OGNI NUOVA IMPORTAZIONE
// ============================================================================

const CSV_FILE = './incenso-NEW.csv';                    // Nome del file CSV
const CATEGORIA = 'incenso';                     // es: diffusori-oli, oli-essenziali, pietre-preziose
const NOME_CATEGORIA = 'Incenso';                // es: Diffusori Oli, Oli Essenziali, Pietre Preziose
const TAGS = ['incenso', 'incenso in cono', 'aromaterapia', 'india', 'bulk', 'natural wellness'];                  // Tags per i prodotti
const DESCRIZIONE_DEFAULT = 'Coni di incenso indiani di alta qualità per aromaterapia e purificazione ambienti.';   // Usata se manca nel CSV

// ============================================================================
// SETUP AUTOMATICO - NON MODIFICARE
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
      const description = descriptionPlain || `${DESCRIZIONE_DEFAULT} ${name}.`;

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
        importedAt: new Date().toISOString().split('T')[0] // Data import: 2025-12-25
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
    console.log(`   Importati ${NOME_CATEGORIA}: ${importedCount}`);
    console.log(`   Totale ora: ${products.length}`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
    console.log('\n✅ IMPORT COMPLETATO!\n');
  });
