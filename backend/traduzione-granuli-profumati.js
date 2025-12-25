const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-granuli-${Date.now()}.json`;

console.log('🌍 TRADUZIONE GRANULI PROFUMATI IN ITALIANO (solo descrizioni)\n');
console.log('='.repeat(90));

// Descrizione template in italiano per granuli profumati
const descrizioneTemplate = `Questi raffinati granuli profumati sono progettati specificamente per ambienti diversi della tua casa. Ideali per bruciatori d'olio, per profumare cassetti e armadi, utili nei posacenere per combattere l'odore di tabacco e per rinfrescare il bagno.

I granuli profumati sono una soluzione versatile e duratura per profumare gli ambienti:
- Perfetti per bruciatori d'olio e lampade catalitiche
- Ideali per cassetti, armadi e spazi chiusi
- Utili per neutralizzare odori sgradevoli
- Lunga durata e profumo intenso
- Facili da usare e riutilizzabili

Ogni confezione contiene granuli di alta qualità formulati con fragranze selezionate per creare un'atmosfera piacevole e accogliente nella tua casa. Basta riscaldare i granuli in un bruciatore d'olio o posizionarli in contenitori decorativi per diffondere il profumo nell'ambiente.`;

// Carica prodotti
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
console.log(`📦 Prodotti totali: ${products.length}\n`);

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

console.log('='.repeat(90));
console.log('🔄 TRADUZIONE IN CORSO (solo descrizioni):\n');

let translatedCount = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'diffusori') {
    // Aggiorna SOLO la descrizione, lascia il nome invariato
    product.description = descrizioneTemplate;

    translatedCount++;

    console.log(`✅ ${product.sku}`);
    console.log(`   Nome: ${product.name}`);
    console.log(`   Descrizione: AGGIORNATA`);
    console.log('');
  }
});

console.log('='.repeat(90));
console.log(`\n📊 RIEPILOGO:`);
console.log(`   Granuli profumati tradotti: ${translatedCount}`);
console.log(`   (Solo Descrizioni - Nomi mantenuti invariati)`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`\n💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE COMPLETATA!\n');
