const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-oli-fragranza-${Date.now()}.json`;

console.log('🌍 TRADUZIONE OLI PER FRAGRANZA IN ITALIANO\n');
console.log('='.repeat(90));

async function translateProduct(product) {
  const prompt = `Traduci in italiano questo prodotto di olio per fragranza professionale.

NOME INGLESE: ${product.name}
DESCRIZIONE INGLESE: ${product.description}

Rispondi SOLO con un JSON in questo formato:
{
  "nome": "traduzione italiana del nome (mantieni il formato '250g' se presente)",
  "descrizione": "traduzione italiana della descrizione (mantieni tono professionale e tecnico)"
}

IMPORTANTE:
- Mantieni "250g" nel nome se presente
- Traduci "Fragrance" come "Fragranza" o "Olio per Fragranza"
- Descrizione deve essere fluida e naturale in italiano
- NON aggiungere informazioni non presenti nell'originale`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`   ⚠️  Formato risposta non valido, uso fallback`);
      return {
        nome: product.name.replace(/Fragrance/g, 'Fragranza'),
        descrizione: product.description
      };
    }

    const translation = JSON.parse(jsonMatch[0]);
    return translation;
  } catch (error) {
    console.log(`   ❌ Errore traduzione: ${error.message}`);
    return {
      nome: product.name.replace(/Fragrance/g, 'Fragranza'),
      descrizione: product.description
    };
  }
}

async function main() {
  // Leggi products.json
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  console.log(`📦 Prodotti totali: ${products.length}\n`);

  // Filtra oli per fragranza
  const oliFragranza = products.filter(p => p.subcategory === 'oli-per-fragranza');
  console.log(`🎯 Oli per fragranza da tradurre: ${oliFragranza.length}\n`);

  // Backup
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
  console.log(`💾 Backup: ${BACKUP_FILE}\n`);

  console.log('='.repeat(90));
  console.log('🔄 TRADUZIONE IN CORSO:\n');

  let translatedCount = 0;

  for (const product of oliFragranza) {
    console.log(`🌍 Traduco: ${product.name}`);

    const translation = await translateProduct(product);

    // Aggiorna prodotto
    product.name = translation.nome;
    product.description = translation.descrizione;

    translatedCount++;
    console.log(`   ✅ ${translation.nome}`);
    console.log(`   ${translatedCount}/${oliFragranza.length}\n`);

    // Pausa per evitare rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(90));
  console.log(`\n📊 RIEPILOGO:`);
  console.log(`   Prodotti tradotti: ${translatedCount}`);
  console.log(`   Totale prodotti: ${products.length}`);

  // Salva
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
  console.log('\n✅ TRADUZIONE COMPLETATA!\n');
}

main().catch(console.error);
