require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Traduce con MyMemory Translate API (gratuita)
async function translateText(text, retries = 3) {
  // Rimuovi HTML tags per tradurre solo il testo
  const textOnly = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (textOnly.length === 0) return text;

  // MyMemory ha limite 500 caratteri
  if (textOnly.length > 500) {
    const sentences = textOnly.split('. ');
    let result = '';
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > 450) {
        if (current) {
          const translated = await translateSingleChunk(current);
          result += translated + ' ';
          await sleep(1000);
        }
        current = sentence;
      } else {
        current += (current ? '. ' : '') + sentence;
      }
    }

    if (current) {
      const translated = await translateSingleChunk(current);
      result += translated;
    }

    return result.trim();
  }

  return translateSingleChunk(textOnly);
}

function translateSingleChunk(text) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const path = `/get?q=${encodedText}&langpair=en|it`;

    const options = {
      hostname: 'api.mymemory.translated.net',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
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
            resolve(text); // Fallback al testo originale
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

// Funzione per rilevare se il testo è in inglese
function isEnglish(text) {
  if (!text) return false;
  const textLower = text.toLowerCase();
  const englishKeywords = [
    'experience', 'with this', 'the power', 'healing', 'connect with',
    'burning time', 'fragrance', 'scented', 'candle', 'crystals',
    'you will', 'you\'ll', 'after burning', 'light this', 'as you light',
    'designed', 'perfect for', 'made with', 'realizzato con real'
  ];
  const matches = englishKeywords.filter(kw => textLower.includes(kw)).length;
  return matches >= 2;
}

async function main() {
  console.log('=== Traduzione Candele Profumate ===\n');

  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'candele-profumate' },
    select: { id: true, name: true, description: true }
  });

  console.log(`Trovati ${products.length} prodotti\n`);

  let translated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    console.log(`\n[${translated + skipped + errors + 1}/${products.length}] ${product.name}`);

    if (!product.description) {
      console.log('  → Nessuna descrizione, skip');
      skipped++;
      continue;
    }

    if (!isEnglish(product.description)) {
      console.log('  → Già in italiano, skip');
      skipped++;
      continue;
    }

    try {
      console.log('  → Traduzione in corso...');
      const translatedDesc = await translateText(product.description);

      // Wrap in paragraph tags if not present
      let finalDesc = translatedDesc;
      if (!finalDesc.startsWith('<p>')) {
        finalDesc = '<p>' + finalDesc.replace(/\n\n/g, '</p><p>') + '</p>';
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { description: finalDesc }
      });
      console.log('  ✓ Tradotto e salvato');
      translated++;

      // Pausa per rate limit
      await sleep(1500);

    } catch (error) {
      console.log('  ✗ Errore:', error.message);
      errors++;
    }
  }

  console.log('\n=== Riepilogo ===');
  console.log(`Tradotti: ${translated}`);
  console.log(`Saltati: ${skipped}`);
  console.log(`Errori: ${errors}`);

  await prisma.$disconnect();
}

main().catch(console.error);
