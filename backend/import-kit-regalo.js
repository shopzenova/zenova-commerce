/**
 * Import Kit Regalo da AW CSV a PostgreSQL
 * - Stamford Incense Gift Sets → €10.00
 * - Altri prodotti → prezzo RRP originale
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

const CSV_FILE = './kit-regalo-NEW.csv';
const CATEGORIA = 'natural-wellness';
const SUBCATEGORIA = 'kit-benessere-cofanetti-regalo';

// Traduzioni nomi prodotti
const nameTranslations = {
  'Stamford Incense Gift Set - Floral': 'Set Regalo Incenso Stamford - Floreale',
  'Stamford Incense Gift Set - Exotic': 'Set Regalo Incenso Stamford - Esotico',
  'Stamford Incense Gift Set - Aromatherapy': 'Set Regalo Incenso Stamford - Aromaterapia',
  'Stamford Incense Gift Set - Moods': 'Set Regalo Incenso Stamford - Moods',
  'Stamford Incense Gift Set - Mystical': 'Set Regalo Incenso Stamford - Mistico',
  'Stamford Incense Gift Set - Spiritual': 'Set Regalo Incenso Stamford - Spirituale',
  'Stamford Incense Gift Set - Angel (White)': 'Set Regalo Incenso Stamford - Angelo (Bianco)',
  'Mini Singing Bowl Gift Set - Green': 'Set Regalo Mini Campana Tibetana - Verde',
  'Mini Singing Bowl Gift Set - Black': 'Set Regalo Mini Campana Tibetana - Nero',
  'Flower Of Life Sing Bowl Set': 'Set Campana Tibetana Fiore della Vita',
  'Hand Beaten & Engraved Singing Bowl Gift Set - 14cm - Green Tara': 'Set Regalo Campana Tibetana Incisa a Mano - 14cm - Tara Verde',
  'Large Chakra Set of Seven Singing Bowls (19.5-35cm)': 'Set Grande 7 Campane Tibetane Chakra (19.5-35cm)',
  'Lrg Yin & Yang Singing Bowl Set- White/Purple 14cm': 'Set Grande Campana Tibetana Yin & Yang - Bianco/Viola 14cm',
  'Herbal Teapot Set - Butterflies': 'Set Teiera Erbe - Farfalle',
  'Herbal Teapot Set - China Fans': 'Set Teiera Erbe - Ventagli Cinesi',
  'Herbal Teapot Set - Green Mosaic': 'Set Teiera Erbe - Mosaico Verde',
  'Rope Incense and Silver Plated Holder Set - Tree of Life': 'Set Incenso Corda con Porta Incenso Argentato - Albero della Vita',
  'Rope Incense and Silver Plated Holder Set - Flower of Life': 'Set Incenso Corda con Porta Incenso Argentato - Fiore della Vita',
  'Rope Incense and Silver Plated Holder Set - Mandala Flower': 'Set Incenso Corda con Porta Incenso Argentato - Mandala Fiore',
  'Rope Incense and Silver Plated Holder Set - Pancha Buddha': 'Set Incenso Corda con Porta Incenso Argentato - Pancha Buddha'
};

// Traduzioni descrizioni
const descTranslations = {
  'AWGifts Dropship Europe': 'Zenova',
  'contains 6 individual boxes full of incense sticks': 'contiene 6 scatole individuali piene di bastoncini di incenso',
  'higher fragrance percentage giving a more intense long-lasting aroma': 'percentuale di fragranza più alta per un aroma più intenso e duraturo',
  'Now you can offer in your e-shop': 'Set regalo perfetto',
  'Stamford Incense Sticks as lovely gift set suitable for every occasion': 'adatto ad ogni occasione',
  'They are ready to fill every room in your home': 'Pronto a riempire ogni stanza della tua casa',
  'with that unique alluring scent': 'con quel profumo unico e seducente',
  'Simply light a tip of the stick and wait for it to glow': 'Accendi semplicemente la punta del bastoncino e attendi che diventi incandescente',
  'Then blow out the flame and place in an incense holder': 'Poi soffia sulla fiamma e posiziona in un porta incenso',
  'This gift set is great value for your money with mix of various popular fragrances': 'Questo set regalo è un ottimo affare con un mix di varie fragranze popolari',
  'incense sticks': 'bastoncini di incenso',
  'Singing Bowl': 'Campana Tibetana',
  'singing bowl': 'campana tibetana',
  'Gift Set': 'Set Regalo',
  'gift set': 'set regalo',
  'Handmade': 'Fatto a mano',
  'handmade': 'fatto a mano',
  'Nepal': 'Nepal',
  'Tibet': 'Tibet',
  'Tibetan': 'Tibetano',
  'meditation': 'meditazione',
  'relaxation': 'rilassamento',
  'healing': 'guarigione',
  'chakra': 'chakra',
  'Chakra': 'Chakra',
  'spiritual': 'spirituale',
  'Herbal': 'Erbe',
  'herbal': 'erbe',
  'Teapot': 'Teiera',
  'teapot': 'teiera',
  'Rope Incense': 'Incenso Corda',
  'rope incense': 'incenso corda',
  'Silver Plated': 'Argentato',
  'Tree of Life': 'Albero della Vita',
  'Flower of Life': 'Fiore della Vita',
  'Add to Your portfolio': 'Aggiungi alla tua collezione'
};

function translateText(text) {
  if (!text) return '';
  let translated = text;
  for (const [eng, ita] of Object.entries(descTranslations)) {
    translated = translated.replace(new RegExp(eng, 'gi'), ita);
  }
  // Clean up HTML entities
  translated = translated.replace(/&nbsp;/g, ' ');
  translated = translated.replace(/&#39;/g, "'");
  translated = translated.replace(/&amp;/g, '&');
  return translated.trim();
}

function getTranslatedName(name) {
  return nameTranslations[name] || translateText(name);
}

async function importProducts() {
  console.log('🎁 Importazione Kit Regalo da AW...\n');

  const products = [];

  // Read CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        // Only import Active products
        if (row.Status === 'Active') {
          products.push(row);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📦 Trovati ${products.length} prodotti attivi\n`);

  let imported = 0;
  let skipped = 0;

  for (const row of products) {
    const productCode = row['Product code'];
    const originalName = row['Unit Name'];
    const translatedName = getTranslatedName(originalName);
    const description = translateText(row['Webpage description (plain text)'] || '');
    const costPrice = parseFloat(row['Price']) || 0;
    const rrp = parseFloat(row['Unit RRP']) || 0;
    const stock = parseInt(row['Available Quantity']) || 0;
    const imagesStr = row['Images'] || '';
    const images = imagesStr.split(',').map(url => url.trim()).filter(url => url);

    // Prezzo: €10 per set incenso Stamford, altrimenti RRP
    const isStamfordIncense = productCode.startsWith('StamGS');
    const price = isStamfordIncense ? 10.00 : rrp;

    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { id: productCode }
    });

    if (existing) {
      console.log(`⏭️  ${productCode} - ${translatedName} - già esistente, skip`);
      skipped++;
      continue;
    }

    // Create product with correct Prisma schema fields
    try {
      await prisma.product.create({
        data: {
          id: productCode,
          name: translatedName,
          description: description || `${translatedName} - Set regalo di alta qualità.`,
          price: price,
          retailPrice: price,
          originalPrice: price,
          wholesalePrice: costPrice,
          images: images,
          image: images[0] || null,
          category: CATEGORIA,
          zenovaCategory: CATEGORIA,
          zenovaSubcategory: SUBCATEGORIA,
          subcategory: SUBCATEGORIA,
          stock: stock,
          visible: true,
          active: true,
          source: 'aw'
        }
      });

      const priceNote = isStamfordIncense ? '(€10.00 custom)' : `(€${price.toFixed(2)} RRP)`;
      console.log(`✅ ${productCode} - ${translatedName} - ${priceNote}`);
      imported++;
    } catch (error) {
      console.error(`❌ Errore ${productCode}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Importazione completata!`);
  console.log(`   ✅ Importati: ${imported}`);
  console.log(`   ⏭️  Skippati: ${skipped}`);
  console.log(`   📦 Totale: ${products.length}`);
}

importProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
