const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Traduzioni per candele e sali da bagno
const translations = {
  // Fragranze e temi
  'Positive Vibes': 'Vibrazioni Positive',
  'Clear Thinking': 'Pensiero Chiaro',
  'Creativity': 'Creatività',
  'Peace': 'Pace',
  'Aphrodisiac': 'Afrodisiaco',
  'Be Chilled': 'Relax',
  'Russian Dolls': 'Matrioske Russe',
  'Unicorns': 'Unicorni',
  'Sea life': 'Vita Marina',
  'Romantic Garden': 'Giardino Romantico',
  'Parisian Weekend': 'Weekend Parigino',
  'Friendly Messages': 'Messaggi Amichevoli',

  // Chakra
  'Root Chakra': 'Chakra Radice',
  'Sacred Chakra': 'Chakra Sacro',
  'Solar Plexus Chakra': 'Chakra Plesso Solare',
  'Heart Chakra': 'Chakra del Cuore',
  'Throat Chakra': 'Chakra della Gola',
  'Third Eye Chakra': 'Chakra del Terzo Occhio',
  'Crown Chakra': 'Chakra della Corona',
  'Seven Charkra': 'Sette Chakra',

  // Tarocchi
  'The Magician': 'Il Mago',
  'The Moon': 'La Luna',
  'The Lovers': 'Gli Amanti',

  // Zodiac
  'Aquarious': 'Acquario',
  'Pisces': 'Pesci',
  'Aries': 'Ariete',
  'Taurus': 'Toro',
  'Gemini': 'Gemelli',
  'Cancer': 'Cancro',
  'Leo': 'Leone',
  'Virgo': 'Vergine',
  'Libra': 'Bilancia',
  'Scorpio': 'Scorpione',
  'Sagittarius': 'Sagittario',
  'Capricorn': 'Capricorno',

  // Colori
  'Red': 'Rosso',
  'Ivory': 'Avorio',

  // Forme
  'Round': 'Rotondo',
  'Heart': 'Cuore',
  'Snowball': 'Palla di Neve'
};

// Termini comuni
function translateName(englishName) {
  let italianName = englishName;

  // Traduci fragranze/temi specifici
  Object.entries(translations).forEach(([en, it]) => {
    const regex = new RegExp(en, 'gi');
    italianName = italianName.replace(regex, it);
  });

  // Traduci termini generali
  italianName = italianName
    .replace(/Aromatherapy Soy Candle/gi, 'Candela Aromaterapia Soia')
    .replace(/Art Tin Candle/gi, 'Candela Artisticain Latta')
    .replace(/Chakra Crystal Candles?/gi, 'Candela Cristallo Chakra')
    .replace(/Large Chakra Crystal Candles?/gi, 'Candela Grande Cristallo Chakra')
    .replace(/Hop Hare Crystal Magic Flower Candle/gi, 'Candela Magica Fiore Cristallo Hop Hare')
    .replace(/Set of Pillar Candles/gi, 'Set Candele Pilastro')
    .replace(/Salt Candle Holder/gi, 'Portacandele Sale')
    .replace(/Natural Salt Candle Holder/gi, 'Portacandele Sale Naturale')
    .replace(/Selenite (.+?) Candle Holder/gi, 'Portacandele Selenite $1')
    .replace(/Zodiac Crystal Candle with Gemstone Bracelet/gi, 'Candela Cristallo Zodiaco con Bracciale Pietre')
    .replace(/(\d+)g/gi, '$1g')
    .replace(/(\d+)mm/gi, '$1mm')
    .replace(/(\d+) cm/gi, '$1 cm')
    .replace(/pieces/gi, 'pezzi')
    .replace(/holes/gi, 'fori')
    .replace(/Med /gi, 'Media ');

  return italianName;
}

// Traduzione descrizione
function translateDescription(html, productName) {
  if (!html) {
    return `<p><strong>${productName}</strong> è un prodotto di alta qualità realizzato con ingredienti naturali per offrire un'esperienza aromaterapica unica.</p>
<p>Perfetto per creare un'atmosfera rilassante e armoniosa nella tua casa.</p>
<p><strong>Caratteristiche:</strong></p>
<ul>
<li>Ingredienti naturali di alta qualità</li>
<li>Fragranza duratura e avvolgente</li>
<li>Design elegante e raffinato</li>
<li>Ideale per momenti di relax e meditazione</li>
</ul>`;
  }

  let italianHtml = html;

  // Traduci frasi comuni nelle descrizioni candele
  italianHtml = italianHtml
    .replace(/Aromatherapy candle/gi, 'Candela aromaterapica')
    .replace(/Soy wax/gi, 'Cera di soia')
    .replace(/Essential oils/gi, 'Oli essenziali')
    .replace(/Hand poured/gi, 'Versata a mano')
    .replace(/Natural ingredients/gi, 'Ingredienti naturali')
    .replace(/Burn time/gi, 'Tempo di combustione')
    .replace(/approx/gi, 'circa')
    .replace(/hours/gi, 'ore')
    .replace(/Create a calming atmosphere/gi, 'Crea un\'atmosfera rilassante')
    .replace(/Perfect for/gi, 'Perfetto per')
    .replace(/meditation/gi, 'meditazione')
    .replace(/yoga/gi, 'yoga')
    .replace(/relaxation/gi, 'relax')
    .replace(/self-care/gi, 'cura di sé')
    .replace(/Made with/gi, 'Realizzato con')
    .replace(/Features/gi, 'Caratteristiche')
    .replace(/Handcrafted/gi, 'Fatto a mano')
    .replace(/Premium quality/gi, 'Qualità premium')
    .replace(/Eco-friendly/gi, 'Ecologico')
    .replace(/Vegan/gi, 'Vegano')
    .replace(/Cruelty-free/gi, 'Cruelty-free')
    .replace(/Salt crystal/gi, 'Cristallo di sale')
    .replace(/Himalayan salt/gi, 'Sale himalayano')
    .replace(/Negative ions/gi, 'Ioni negativi')
    .replace(/Air purifying/gi, 'Purifica l\'aria')
    .replace(/Calming glow/gi, 'Luce rilassante')
    .replace(/Unique piece/gi, 'Pezzo unico')
    .replace(/Natural variations/gi, 'Variazioni naturali');

  // Traduci termini specifici
  Object.entries(translations).forEach(([en, it]) => {
    const regex = new RegExp(en, 'gi');
    italianHtml = italianHtml.replace(regex, it);
  });

  return italianHtml;
}

async function importCandele() {
  const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20260105.csv';
  const productsPath = path.join(__dirname, 'data/products.json');
  const uploadsDir = path.join(__dirname, '../uploads');
  const imageSourceDir = 'C:\\Users\\giorg\\Downloads\\candele-images';

  // Carica prodotti esistenti
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`📦 Prodotti esistenti: ${products.length}`);

  // Backup
  const backupPath = `./data/products.backup-before-candele-import-${Date.now()}.json`;
  fs.copyFileSync(productsPath, backupPath);
  console.log(`✅ Backup creato: ${backupPath}\n`);

  // Controlla SKU esistenti
  const existingSkus = new Set(products.map(p => p.sku));

  const newProducts = [];

  // Crea directory uploads se non esiste
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row['Status'] === 'Active') {
          rows.push(row);
        }
      })
      .on('end', () => {
        console.log(`\n📋 CSV letto: ${rows.length} prodotti attivi\n`);

        let skipped = 0;
        let imported = 0;

        rows.forEach((row, index) => {
          const sku = row['Product code'];

          // Salta se già esiste
          if (existingSkus.has(sku)) {
            console.log(`⏭️  ${sku} già esistente, skip`);
            skipped++;
            return;
          }

          const englishName = row['Unit Name'];
          const price = parseFloat(row['Price']);
          const rrp = parseFloat(row['Unit RRP']);
          const stock = parseInt(row['Available Quantity']);
          const barcode = row['Barcode'];
          const weight = parseFloat(row['Unit net weight']);
          const materials = row['Materials/Ingredients'] || 'Cera naturale';
          const descriptionHtml = row['Webpage description (html)'];
          const descriptionPlain = row['Webpage description (plain text)'];

          // Traduzione nome
          const italianName = translateName(englishName);

          // Traduzione descrizione
          const italianDescription = translateDescription(descriptionHtml, italianName);
          const italianShortDesc = descriptionPlain
            ? translateDescription(descriptionPlain, italianName).replace(/<[^>]*>/g, '')
            : italianDescription.replace(/<[^>]*>/g, '').substring(0, 300) + '...';

          // Copia immagini locali
          const productImages = [];
          const skuLower = sku.toLowerCase();

          if (fs.existsSync(imageSourceDir)) {
            const imageFiles = fs.readdirSync(imageSourceDir).filter(f =>
              f.toLowerCase().startsWith(skuLower) && (f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'))
            );

            imageFiles.forEach((imgFile, imgIndex) => {
              const sourcePath = path.join(imageSourceDir, imgFile);
              const ext = imgFile.split('.').pop();
              const destFilename = `${skuLower}-${imgIndex + 1}.${ext}`;
              const destPath = path.join(uploadsDir, destFilename);

              // Copia immagine se non esiste già
              if (!fs.existsSync(destPath)) {
                fs.copyFileSync(sourcePath, destPath);
              }
              productImages.push(`/uploads/${destFilename}`);
            });
          }

          // Crea prodotto
          const product = {
            id: `aw-${skuLower}`,
            sku: sku,
            name: italianName,
            price: price,
            originalPrice: rrp,
            zenovaCategories: ['natural-wellness'],
            zenovaSubcategory: 'candele-gel-profumati-sali-bagno',
            supplier: 'aw-dropship',
            stock: stock,
            images: productImages,
            description: italianDescription,
            shortDescription: italianShortDesc,
            barcode: barcode,
            weight: weight,
            materials: materials,
            featured: false,
            visible: true,
            visibility: 'visible',
            tags: ['candele', 'aromaterapia', 'natural wellness', 'sali da bagno'],
            metadata: {
              type: 'Candele e Portacandele',
              use: 'Aromaterapia e decorazione'
            }
          };

          newProducts.push(product);
          imported++;

          console.log(`✅ ${imported}. ${italianName}`);
          console.log(`   SKU: ${sku} | Prezzo: €${price} | Stock: ${stock}`);
          console.log(`   Immagini: ${productImages.length}`);
        });

        // Aggiungi nuovi prodotti
        products.push(...newProducts);

        // Salva products.json
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

        console.log(`\n✅ Importazione completata!`);
        console.log(`📦 Totale prodotti: ${products.length} (+${newProducts.length})`);
        console.log(`⏭️  Prodotti già esistenti saltati: ${skipped}`);
        console.log(`🖼️  Immagini copiate in: ${uploadsDir}`);

        resolve();
      })
      .on('error', reject);
  });
}

importCandele().catch(console.error);
