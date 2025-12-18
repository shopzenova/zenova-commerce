const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const prisma = new PrismaClient();

// Funzione per leggere il CSV
async function readCSV(filePath) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Funzione per ottenere le immagini di un prodotto
function getProductImages(productCode, imagesDir) {
  const normalizedCode = productCode.toLowerCase();
  const files = fs.readdirSync(imagesDir);

  const productImages = files
    .filter(file => file.toLowerCase().startsWith(normalizedCode + '__'))
    .sort() // Ordina per avere immagini consistenti
    .map(file => `/uploads/diffusers/${file}`); // Path relativo per il frontend

  return productImages;
}

// Funzione per convertire codice prodotto in bigbuyId fittizio
function generateBigbuyId(productCode) {
  // Crea un ID numerico dal codice prodotto
  // Es: AATOM-01 -> 900001, AATOM-19 -> 900019
  const match = productCode.match(/AATOM-(\d+)/);
  if (match) {
    return 900000 + parseInt(match[1]);
  }
  // Fallback per codici non standard
  return 999000 + Math.abs(productCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000);
}

// Funzione principale
async function importDiffusers() {
  try {
    console.log('🚀 Inizio importazione diffusori AW...\n');

    const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20251218.csv';
    const imagesDir = 'C:\\Users\\giorg\\zenova-ecommerce\\aw-diffusers-images';

    // Leggi il CSV
    console.log('📖 Lettura CSV...');
    const csvData = await readCSV(csvPath);
    console.log(`✅ Letti ${csvData.length} prodotti dal CSV\n`);

    // Filtra solo prodotti attivi o in discontinuazione (esclude discontinued)
    const activeProducts = csvData.filter(p =>
      p.Status && (p.Status === 'Active' || p.Status === 'Discontinuing')
    );
    console.log(`✅ Prodotti da importare (Active/Discontinuing): ${activeProducts.length}\n`);

    // Elimina vecchi diffusori AATOM
    console.log('🗑️  Rimozione vecchi diffusori AATOM...');
    const deleted = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'AATOM-'
        }
      }
    });
    console.log(`✅ Rimossi ${deleted.count} diffusori esistenti\n`);

    // Importa nuovi diffusori
    console.log('📦 Importazione nuovi diffusori...\n');
    let imported = 0;
    let skipped = 0;

    for (const product of activeProducts) {
      try {
        const productCode = product['Product code'];
        const productName = product['Unit Name'];
        const unitPrice = parseFloat(product['Unit price'] || 0);
        const unitRRP = parseFloat(product['Unit RRP'] || 0);
        const description = product['Webpage description (html)'] || product['Webpage description (plain text)'] || '';
        const weight = parseFloat(product['Unit net weight'] || 0);
        const dimensions = product['Unit dimensions'] || '';
        const materials = product['Materials/Ingredients'] || '';
        const barcode = product['Barcode'] || '';
        // Usa quantità reale dal CSV
        const availableQty = parseInt(product['Available Quantity'] || 0);
        const stock = product['Stock'] === 'Discontinued' ? 0 : availableQty;

        // Ottieni immagini
        const images = getProductImages(productCode, imagesDir);

        // Prepara features JSON
        const features = {
          barcode: barcode,
          family: product['Family'] || 'Aroma Diffusers',
          materials: materials,
          dimensions: dimensions,
          weight: weight,
          packageWeight: parseFloat(product['Package weight (shipping)'] || 0),
          countryOfOrigin: product['Country of origin'] || '',
          unitsPerOuter: parseInt(product['Units per outer'] || 1),
          cpnpNumber: product['CPNP number'] || ''
        };

        // Genera bigbuyId fittizio
        const bigbuyId = generateBigbuyId(productCode);

        // Crea prodotto
        await prisma.product.create({
          data: {
            bigbuyId: bigbuyId,
            sku: productCode,
            name: productName,
            description: description,
            category: 'Natural Wellness',
            price: unitPrice,
            retailPrice: unitRRP > 0 ? unitRRP : unitPrice * 2.5, // Margine del 150%
            stock: stock,
            images: JSON.stringify(images),
            features: JSON.stringify(features),
            weight: weight,
            dimensions: dimensions,
            active: true
          }
        });

        imported++;
        console.log(`✅ [${imported}/${activeProducts.length}] ${productCode} - ${productName}`);

      } catch (error) {
        skipped++;
        console.error(`❌ Errore importando ${product['Product code']}: ${error.message}`);
      }
    }

    console.log(`\n✨ Importazione completata!`);
    console.log(`   ✅ Importati: ${imported}`);
    console.log(`   ❌ Saltati: ${skipped}`);
    console.log(`   📦 Totale: ${activeProducts.length}\n`);

    // Copia immagini nella cartella uploads
    console.log('📸 Copia immagini nella cartella uploads...');
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'diffusers');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const imageFiles = fs.readdirSync(imagesDir);
    for (const file of imageFiles) {
      const sourcePath = path.join(imagesDir, file);
      const destPath = path.join(uploadsDir, file);
      fs.copyFileSync(sourcePath, destPath);
    }
    console.log(`✅ Copiate ${imageFiles.length} immagini\n`);

  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui importazione
importDiffusers();
