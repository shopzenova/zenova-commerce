/**
 * GENERA DESCRIZIONI MIGLIORI PER PROFUMI
 *
 * Analizza il nome del prodotto per estrarre: brand, tipo (EDT/EDP), ml, genere
 * e genera una descrizione unica e professionale.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mappa tipi fragranza
const fragranceTypes = {
  'EDP': { full: 'Eau de Parfum', desc: 'una concentrazione intensa e duratura, ideale per chi cerca una scia persistente e avvolgente' },
  'EDT': { full: 'Eau de Toilette', desc: 'una fragranza fresca e versatile, perfetta per l\'uso quotidiano con una scia leggera e piacevole' },
  'EDC': { full: 'Eau de Cologne', desc: 'una fragranza leggera e rinfrescante, perfetta per un tocco di freschezza in ogni momento della giornata' },
  'PARFUM': { full: 'Parfum', desc: 'la massima concentrazione di essenze, per una fragranza intensa, esclusiva e di lunga durata' },
};

// Brand premium con note descrittive
const brandNotes = {
  'dior': 'Maison Dior, icona dell\'eleganza e della raffinatezza nella profumeria di lusso',
  'chanel': 'Chanel, simbolo di stile intramontabile e sofisticatezza',
  'armani': 'Giorgio Armani, sinonimo di eleganza italiana e design senza tempo',
  'versace': 'Versace, espressione di lusso audace e glamour mediterraneo',
  'paco rabanne': 'Paco Rabanne, innovazione e audacia nella profumeria contemporanea',
  'hugo boss': 'Hugo Boss, l\'essenza dello stile maschile moderno e sofisticato',
  'calvin klein': 'Calvin Klein, minimalismo contemporaneo e freschezza autentica',
  'dolce & gabbana': 'Dolce & Gabbana, passione italiana e sensualità mediterranea',
  'd&g': 'Dolce & Gabbana, passione italiana e sensualità mediterranea',
  'jean paul gaultier': 'Jean Paul Gaultier, creatività senza confini e stile iconico',
  'ysl': 'Yves Saint Laurent, audacia parigina e lusso contemporaneo',
  'yves saint laurent': 'Yves Saint Laurent, audacia parigina e lusso contemporaneo',
  'burberry': 'Burberry, tradizione britannica e eleganza contemporanea',
  'givenchy': 'Givenchy, l\'alta moda francese al servizio della profumeria',
  'valentino': 'Valentino, romanticismo italiano e haute couture',
  'carolina herrera': 'Carolina Herrera, eleganza sofisticata e femminilità moderna',
  'lacoste': 'Lacoste, spirito sportivo e freschezza dinamica',
  'mugler': 'Mugler, fragranze visionarie e indimenticabili',
  'thierry mugler': 'Mugler, fragranze visionarie e indimenticabili',
  'guerlain': 'Guerlain, tradizione secolare nell\'arte della profumeria francese',
  'hermès': 'Hermès, artigianalità e lusso senza compromessi',
  'hermes': 'Hermès, artigianalità e lusso senza compromessi',
  'prada': 'Prada, avanguardia e raffinatezza nel design italiano',
  'bulgari': 'Bulgari, gioielleria romana e lusso mediterraneo',
  'bvlgari': 'Bulgari, gioielleria romana e lusso mediterraneo',
  'tom ford': 'Tom Ford, lusso moderno e sensualità sofisticata',
  'narciso rodriguez': 'Narciso Rodriguez, purezza e sensualità contemporanea',
  'davidoff': 'Davidoff, fragranze fresche e sofisticate per l\'uomo di mondo',
  'montblanc': 'Montblanc, eleganza classica e artigianalità europea',
  'jimmy choo': 'Jimmy Choo, glamour e modernità nella profumeria di lusso',
  'roberto cavalli': 'Roberto Cavalli, sensualità selvaggia e stile italiano',
  'issey miyake': 'Issey Miyake, minimalismo giapponese e innovazione olfattiva',
  'kenzo': 'Kenzo, creatività e natura in armonia',
  'azzaro': 'Azzaro, carisma e seduzione nella tradizione francese',
  'diesel': 'Diesel, spirito ribelle e originalità contemporanea',
  'loewe': 'Loewe, artigianalità spagnola e raffinatezza moderna',
  'salvatore ferragamo': 'Salvatore Ferragamo, eleganza fiorentina e maestria artigianale',
  'cerruti': 'Cerruti, stile italiano raffinato e contemporaneo',
  'victor & rolf': 'Viktor & Rolf, haute couture olandese e creatività estrema',
  'viktor & rolf': 'Viktor & Rolf, haute couture olandese e creatività estrema',
  'lattafa': 'Lattafa, profumeria orientale di alta qualità',
  'police': 'Police, stile urban e personalità forte',
  'salvador dali': 'Salvador Dalí, arte surrealista nella profumeria',
};

function parseProductName(name) {
  const result = {
    brand: '',
    gender: '',
    type: '',
    typeFull: '',
    typeDesc: '',
    ml: '',
    extra: ''
  };

  // Estrai genere
  if (name.includes('Uomo') || name.includes('Pour Homme') || name.includes('For Him') || name.includes('Man ') || name.includes(' Man')) {
    result.gender = 'uomo';
  } else if (name.includes('Donna') || name.includes('Pour Femme') || name.includes('For Her') || name.includes('Woman')) {
    result.gender = 'donna';
  } else if (name.includes('Unisex')) {
    result.gender = 'unisex';
  }

  // Estrai tipo fragranza
  for (const [key, val] of Object.entries(fragranceTypes)) {
    if (name.toUpperCase().includes(key)) {
      result.type = key;
      result.typeFull = val.full;
      result.typeDesc = val.desc;
      break;
    }
  }

  // Estrai ml
  const mlMatch = name.match(/(\d+)\s*ml/i);
  if (mlMatch) {
    result.ml = mlMatch[1];
  }

  // Estrai brand dal nome (dopo "Profumo Uomo/Donna")
  const brandMatch = name.match(/Profumo\s+(?:Uomo|Donna|Unisex)\s+(.+?)(?:\s+(?:EDT|EDP|EDC|PARFUM|Eau|EAU|\d+\s*ml))/i);
  if (brandMatch) {
    result.brand = brandMatch[1].trim();
  } else {
    // Prova pattern alternativo
    const altMatch = name.match(/Profumo\s+(?:Uomo|Donna|Unisex)\s+(.+)/i);
    if (altMatch) {
      result.brand = altMatch[1].replace(/\s+\d+\s*ml.*$/i, '').replace(/\s+(EDT|EDP|EDC).*$/i, '').trim();
    }
  }

  // Cerca note brand
  const brandLower = result.brand.toLowerCase();
  for (const [key, note] of Object.entries(brandNotes)) {
    if (brandLower.includes(key)) {
      result.brandNote = note;
      break;
    }
  }

  return result;
}

function generateDescription(name, parsed) {
  const { brand, gender, type, typeFull, typeDesc, ml, brandNote } = parsed;

  const genderText = gender === 'uomo' ? 'maschile' : gender === 'donna' ? 'femminile' : 'unisex';
  const genderPer = gender === 'uomo' ? 'per lui' : gender === 'donna' ? 'per lei' : 'per lui e per lei';

  let desc = '';

  // Apertura con brand
  if (brandNote) {
    desc += `${brand} — ${brandNote}. `;
  }

  // Corpo principale
  if (typeFull && ml) {
    desc += `Fragranza ${genderText} in formato ${typeFull}${ml ? ` da ${ml} ml` : ''}, con ${typeDesc}. `;
  } else if (typeFull) {
    desc += `Fragranza ${genderText} in formato ${typeFull}, con ${typeDesc}. `;
  } else if (ml) {
    desc += `Fragranza ${genderText} da ${ml} ml, una composizione esclusiva ${genderPer}. `;
  } else {
    desc += `Fragranza ${genderText} esclusiva, una composizione raffinata ${genderPer}. `;
  }

  // Dettagli
  desc += `Vaporizzatore spray, applicazione facile e dosaggio preciso. `;
  desc += `Prodotto 100% originale con garanzia di autenticità. `;

  // Chiusura
  if (gender === 'uomo') {
    desc += `Ideale per l'uomo moderno che cerca un profumo distintivo per ogni occasione.`;
  } else if (gender === 'donna') {
    desc += `Perfetto per la donna che desidera esprimere la propria personalità con una fragranza unica.`;
  } else {
    desc += `Una fragranza versatile e contemporanea, perfetta per chi ama distinguersi con eleganza.`;
  }

  return desc;
}

async function main() {
  console.log('🔄 Generazione descrizioni profumi...\n');

  const profumi = await prisma.product.findMany({
    where: {
      zenovaSubcategory: { in: ['profumi-uomini', 'profumi-donne'] },
      source: 'bigbuy'
    },
    select: { id: true, name: true, description: true }
  });

  console.log(`📦 Profumi da aggiornare: ${profumi.length}\n`);

  // Mostra 5 esempi prima di procedere
  console.log('📋 Esempi di nuove descrizioni:\n');
  for (const p of profumi.slice(0, 5)) {
    const parsed = parseProductName(p.name);
    const newDesc = generateDescription(p.name, parsed);
    console.log(`  📌 ${p.name}`);
    console.log(`     Brand: ${parsed.brand || '?'} | ${parsed.type || '?'} | ${parsed.ml || '?'}ml | ${parsed.gender || '?'}`);
    console.log(`     NUOVA: ${newDesc.substring(0, 150)}...`);
    console.log();
  }

  // Aggiorna tutti
  console.log('💾 Aggiornamento database...');
  let updated = 0;
  let errors = 0;

  for (const p of profumi) {
    const parsed = parseProductName(p.name);
    const newDesc = generateDescription(p.name, parsed);

    try {
      await prisma.product.update({
        where: { id: p.id },
        data: { description: newDesc }
      });
      updated++;
      if (updated % 100 === 0) {
        console.log(`   ${updated}/${profumi.length} aggiornati...`);
      }
    } catch (e) {
      errors++;
    }
  }

  console.log(`\n✅ Completato! ${updated} descrizioni aggiornate, ${errors} errori`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Errore:', e);
  prisma.$disconnect();
  process.exit(1);
});
