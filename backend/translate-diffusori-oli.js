require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Traduzione nomi fragranze
const fragranceTranslations = {
  'Gooseberry & White Tea': 'Uva Spina e Tè Bianco',
  'Honey & Ginger': 'Miele e Zenzero',
  'Lavender & Chamomile': 'Lavanda e Camomilla',
  'Wild Fig': 'Fico Selvatico',
  'Vanilla Noir': 'Vaniglia Nera',
  'Rose Garden': 'Giardino di Rose',
  'Sandalwood': 'Legno di Sandalo',
  'Sweet Pea': 'Pisello Odoroso',
  'Grapefruit & Pink Pepper': 'Pompelmo e Pepe Rosa',
  'Orange Clove': 'Arancia e Chiodi di Garofano',
  'Wild Mint': 'Menta Selvatica',
  'Peony & Blush Suede': 'Peonia e Pelle Scamosciata',
  'Cactus Flower': 'Fiore di Cactus',
  'Jasmine Flower': 'Fiore di Gelsomino',
  'Rhubarb Rhubarb': 'Rabarbaro',
  'Fell Berry': 'Bacca di Montagna',
  'Seasalt and Moss': 'Sale Marino e Muschio',
  'Japanese Bloom': 'Fioritura Giapponese',
  'Tea & Roses': 'Tè e Rose',
  'Pressed Peonie': 'Peonie Pressate',
  'White Fig': 'Fico Bianco',
  'Provence': 'Provenza',
  'Clementine': 'Clementina',
  'Citrus': 'Agrumi',
  'Windermere': 'Windermere',
  'Moroccan Roll': 'Spezie Marocchine'
};

// Traduci nome prodotto
function translateProductName(name) {
  if (!name) return name;

  // Pattern: "XXXml Reed Diffuser - Fragranza"
  const reedMatch = name.match(/(\d+ml)\s*Reed\s*Diffuser\s*[-–]\s*(.+)/i);
  if (reedMatch) {
    const size = reedMatch[1];
    let fragrance = reedMatch[2].trim();
    const translatedFragrance = fragranceTranslations[fragrance] || fragrance;
    return `Diffusore a Bastoncini ${size} - ${translatedFragrance}`;
  }

  // Pattern: "Reed Diffuser Refill"
  const refillMatch = name.match(/(\d+ml)\s*Reed\s*Diffuser\s*Refill\s*[-–]\s*(.+)/i);
  if (refillMatch) {
    const size = refillMatch[1];
    let fragrance = refillMatch[2].trim();
    const translatedFragrance = fragranceTranslations[fragrance] || fragrance;
    return `Ricarica Diffusore ${size} - ${translatedFragrance}`;
  }

  // Pattern: "Box of XXXml Reed Diffuser"
  const boxMatch = name.match(/Box\s*of\s*(\d+ml)\s*Reed\s*Diffuser\s*[-–]\s*(.+)/i);
  if (boxMatch) {
    const size = boxMatch[1];
    let fragrance = boxMatch[2].trim();
    const translatedFragrance = fragranceTranslations[fragrance] || fragrance;
    return `Diffusore a Bastoncini ${size} - ${translatedFragrance}`;
  }

  // Altri pattern generici inglese -> italiano
  return name
    .replace(/Reed Diffuser/gi, 'Diffusore a Bastoncini')
    .replace(/Essential Oil Diffuser/gi, 'Diffusore di Oli Essenziali')
    .replace(/Aroma Diffuser/gi, 'Diffusore di Aromi')
    .replace(/Fragrance/gi, 'Fragranza')
    .replace(/Home Fragrance/gi, 'Fragranza per la Casa');
}

// API MyMemory per tradurre descrizioni
function translateWithMyMemory(text) {
  return new Promise((resolve) => {
    if (!text || text.length < 10) {
      resolve(text);
      return;
    }

    // Rimuovi HTML e limita a 500 char
    const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 450);
    const encodedText = encodeURIComponent(plainText);

    const options = {
      hostname: 'api.mymemory.translated.net',
      port: 443,
      path: `/get?q=${encodedText}&langpair=en|it`,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            // Verifica che non sia errore MYMEMORY
            if (translated.includes('MYMEMORY') || translated.includes('LIMIT')) {
              console.log('    ⚠️  Rate limit raggiunto, salto traduzione');
              resolve(null); // null = salta questo prodotto
            } else {
              resolve(`<p>${translated}</p>`);
            }
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

// Crea descrizione italiana generica per diffusori
function createItalianDescription(name, size) {
  const sizeMatch = name.match(/(\d+)ml/i);
  const actualSize = sizeMatch ? sizeMatch[1] + 'ml' : (size || '');

  // Estrai fragranza dal nome
  let fragrance = '';
  const fragMatch = name.match(/[-–]\s*(.+)$/);
  if (fragMatch) {
    fragrance = fragMatch[1].trim();
    // Traduci se possibile
    fragrance = fragranceTranslations[fragrance] || fragrance;
  }

  if (name.includes('Refill') || name.includes('Ricarica')) {
    return `<p>Ricarica per diffusore a bastoncini da ${actualSize}${fragrance ? ` alla fragranza di <b>${fragrance}</b>` : ''}. Prolunga la vita del tuo diffusore con questa ricarica ecologica in bottiglia di vetro con tappo in alluminio.</p>
<ul>
<li>Durata: fino a 3 mesi</li>
<li>Materiali: Bottiglia in vetro, Fragranza</li>
<li>Origine: Regno Unito</li>
</ul>`;
  }

  return `<p>Diffusore a bastoncini da ${actualSize}${fragrance ? ` con fragranza di <b>${fragrance}</b>` : ''} per profumare la tua casa in modo naturale e duraturo. Include bottiglia in vetro elegante e bastoncini in rattan indonesiano.</p>
<ul>
<li>Capacità: ${actualSize}</li>
<li>Durata: fino a 12 settimane</li>
<li>Materiali: Bottiglia in vetro, Bastoncini in rattan, Fragranza</li>
</ul>
<p><i>Istruzioni: Rimuovere l'imballaggio, aprire il coperchio e inserire i bastoncini. Per un rilascio più rapido della fragranza, capovolgere i bastoncini dopo che hanno assorbito l'olio.</i></p>`;
}

function isEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const englishWords = ['the ', ' and ', ' with ', ' for ', ' this ', 'essential oil', 'reed diffuser', 'fragrance', 'aroma', 'scent', 'your ', ' will ', 'home'];
  return englishWords.some(w => lower.includes(w));
}

async function main() {
  console.log('=== Traduzione Prodotti diffusori-oli ===\n');

  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'diffusori-oli' },
    select: { id: true, name: true, description: true }
  });

  console.log(`Prodotti totali: ${products.length}\n`);

  let updatedNames = 0;
  let updatedDescs = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const nameEn = isEnglish(p.name);
    const descEn = isEnglish(p.description);

    if (!nameEn && !descEn) {
      continue; // Già in italiano
    }

    console.log(`[${i + 1}/${products.length}] ${p.id}`);
    console.log(`  Nome: ${p.name?.substring(0, 50)}...`);

    const updates = {};

    // Traduci nome se in inglese
    if (nameEn) {
      const newName = translateProductName(p.name);
      if (newName !== p.name) {
        updates.name = newName;
        console.log(`  → Nome IT: ${newName}`);
        updatedNames++;
      }
    }

    // Crea descrizione italiana
    if (descEn || !p.description) {
      // Usa descrizione generata (più affidabile di API)
      const newDesc = createItalianDescription(updates.name || p.name, null);
      updates.description = newDesc;
      console.log(`  → Descrizione IT generata`);
      updatedDescs++;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: updates
      });
      console.log(`  ✓ Aggiornato`);
    }

    // Piccola pausa per non sovraccaricare il DB
    await sleep(50);
  }

  console.log('\n=== Completato ===');
  console.log(`Nomi tradotti: ${updatedNames}`);
  console.log(`Descrizioni aggiornate: ${updatedDescs}`);

  await prisma.$disconnect();
}

main().catch(console.error);
