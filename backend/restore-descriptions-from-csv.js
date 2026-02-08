require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Translate with MyMemory API
function translateChunk(text) {
  return new Promise((resolve) => {
    const encodedText = encodeURIComponent(text.substring(0, 500));
    const path = `/get?q=${encodedText}&langpair=en|it`;

    const options = {
      hostname: 'api.mymemory.translated.net',
      port: 443,
      path: path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.responseStatus === 200 && data.responseData) {
            resolve(data.responseData.translatedText);
          } else {
            resolve(text);
          }
        } catch (e) {
          resolve(text);
        }
      });
    });

    req.on('error', () => resolve(text));
    req.end();
  });
}

async function translateText(text) {
  if (!text) return text;

  // Remove HTML tags for translation
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (plainText.length <= 500) {
    const translated = await translateChunk(plainText);
    return `<p>${translated}</p>`;
  }

  // Split into sentences
  const sentences = plainText.split('. ');
  let result = '';
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > 450) {
      if (current) {
        const translated = await translateChunk(current);
        result += translated + ' ';
        await sleep(1000);
      }
      current = sentence;
    } else {
      current += (current ? '. ' : '') + sentence;
    }
  }

  if (current) {
    const translated = await translateChunk(current);
    result += translated;
  }

  return `<p>${result.trim()}</p>`;
}

// Parse CSV
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

async function main() {
  console.log('=== Ripristino e Traduzione Descrizioni ===\n');

  // CSV files
  const csvFiles = [
    'aw-relax-benessere.csv',
    'aw-reed-diffusers-home-fragrance.csv',
    'aw-gel-gemstones-1.csv',
    'aw-gel-gemstones-2.csv',
    'aw-gel-gemstones-3.csv',
    'aw-gel-gemstones-4.csv'
  ];

  // Build description map
  const descriptionMap = new Map();

  for (const file of csvFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`📄 Parsing ${file}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(content);

    rows.forEach(row => {
      const code = row['Product code'];
      const description = row['Webpage description (html)'] || row['Webpage description (plain text)'];

      if (code && description) {
        // Store with multiple key variations
        descriptionMap.set(code.toUpperCase(), description);
        descriptionMap.set(code.toLowerCase(), description);
        descriptionMap.set(`aw-${code.toLowerCase()}`, description);
      }
    });

    console.log(`   → ${rows.length} righe`);
  }

  console.log(`\n📦 Descrizioni caricate: ${descriptionMap.size / 3}`);

  // Get products
  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'candele-gel-profumati-sali-bagno' },
    select: { id: true, name: true, description: true }
  });

  console.log(`🔍 Prodotti: ${products.length}\n`);

  let updated = 0;
  let notFound = 0;

  for (const product of products) {
    const code = product.id.replace('aw-', '').toUpperCase();
    let originalDesc = descriptionMap.get(code) ||
                       descriptionMap.get(product.id) ||
                       descriptionMap.get(product.id.toLowerCase());

    if (originalDesc) {
      console.log(`[${updated + notFound + 1}/${products.length}] ${product.name}`);
      console.log('  → Traduzione...');

      const translatedDesc = await translateText(originalDesc);

      await prisma.product.update({
        where: { id: product.id },
        data: { description: translatedDesc }
      });

      console.log('  ✓ Salvato');
      updated++;

      await sleep(1500);
    } else {
      console.log(`[${updated + notFound + 1}/${products.length}] ${product.name}`);
      console.log('  ✗ Non trovato nel CSV');
      notFound++;
    }
  }

  console.log('\n=== Completato ===');
  console.log(`Aggiornati: ${updated}`);
  console.log(`Non trovati: ${notFound}`);

  await prisma.$disconnect();
}

main().catch(console.error);
