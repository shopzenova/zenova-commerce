const fs = require('fs');

console.log('🌍 TRADUZIONE COMPLETA INCENSI IN ITALIANO\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-incenso-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Traduzioni nomi fragranze
const fragranze = {
  "Amber": "Ambra",
  "Apple Cinnamon": "Mela e Cannella",
  "Citronella": "Citronella",
  "Dragons Blood": "Sangue di Drago",
  "Frank & Myrrh": "Incenso e Mirra",
  "Honeysuckle": "Caprifoglio",
  "Jasmine": "Gelsomino",
  "Lavender": "Lavanda",
  "Strawberry": "Fragola",
  "Vertiver Gold": "Vetiver Dorato",
  "Tulsi Basil": "Basilico Tulsi",
  "Opium": "Oppio",
  "Nagchampa": "Nag Champa",
  "Coconut": "Cocco",
  "Tibetan Musk": "Muschio Tibetano",
  "Patchouli": "Patchouli",
  "Peach Mango": "Pesca e Mango",
  "Sandalwood": "Sandalo",
  "Lemon": "Limone",
  "Orange & Cinnamon": "Arancia e Cannella",
  "Vanilla": "Vaniglia",
  "Violet": "Violetta",
  "Midnight  Rose": "Rosa di Mezzanotte",
  "Midnight Rose": "Rosa di Mezzanotte",
  "Ylang Ylang": "Ylang Ylang"
};

// Benefici aromaterapici per fragranza
const benefici = {
  "Ambra": "Calmante e sensuale, favorisce meditazione e rilassamento profondo.",
  "Mela e Cannella": "Riscaldante e accogliente, perfetto per creare atmosfera casalinga.",
  "Citronella": "Repellente naturale per insetti, rinfrescante e purificante.",
  "Sangue di Drago": "Protettivo e purificante, tradizionalmente usato per aumentare potenza e coraggio.",
  "Incenso e Mirra": "Sacro e meditativo, ideale per pratiche spirituali e rilassamento.",
  "Caprifoglio": "Dolce e floreale, attrae prosperità e felicità.",
  "Gelsomino": "Afrodisiaco naturale, rilassante e uplifting.",
  "Lavanda": "Calmante per eccellenza, riduce stress e favorisce il sonno.",
  "Fragola": "Dolce e fruttato, porta gioia e energia positiva.",
  "Vetiver Dorato": "Radicante e stabilizzante, aiuta concentrazione e grounding.",
  "Basilico Tulsi": "Purificante e sacro, migliora chiarezza mentale.",
  "Oppio": "Esotico e profondo, favorisce rilassamento e sensualità.",
  "Nag Champa": "Fragranza tradizionale indiana, meditativa e purificante.",
  "Cocco": "Tropicale e rilassante, porta sensazione di vacanza e pace.",
  "Muschio Tibetano": "Sensuale ed esotico, calmante e afrodisiaco.",
  "Patchouli": "Terroso e radicante, favorisce meditazione e sensualità.",
  "Pesca e Mango": "Fruttato e dolce, energizzante e uplifting.",
  "Sandalo": "Sacro e calmante, perfetto per meditazione e rilassamento.",
  "Limone": "Purificante ed energizzante, migliora concentrazione.",
  "Arancia e Cannella": "Riscaldante e gioioso, perfetto per festività.",
  "Vaniglia": "Dolce e confortante, riduce ansia e stress.",
  "Violetta": "Delicato e floreale, calmante e romantico.",
  "Rosa di Mezzanotte": "Lussuoso e romantico, favorisce amore e compassione.",
  "Ylang Ylang": "Afrodisiaco potente, calmante e equilibrante emotivo."
};

// Descrizione base per coni
const descrizioneConi = (fragranzaIT) => {
  return `Coni di Incenso Bulk - Fragranza ${fragranzaIT}

${benefici[fragranzaIT] || "Incenso di alta qualità per aromaterapia e purificazione ambienti."}

✨ Caratteristiche:
• Formato: Coni indiani tradizionali (25mm altezza)
• Confezione: Bulk professionale
• Qualità: Premium grade per uso intensivo
• Origine: India
• Tempo combustione: 15-20 minuti per cono

🌿 Utilizzi:
• Purificazione e profumazione ambienti
• Meditazione e pratiche spirituali
• Yoga e aromaterapia
• Centri benessere e spa
• Rivendita al dettaglio

💼 Confezione Bulk:
Formato economico per professionisti, centri benessere, negozi specializzati.
Ideale per uso intensivo o rivendita.

⚠️ Avvertenze:
• Bruciare sempre in apposito porta-incenso
• Non lasciare incustodito
• Tenere lontano da materiali infiammabili
• Aerare il locale dopo l'uso`;
};

// Descrizione base per bastoncini
const descrizioneBastoncini = (fragranzaIT) => {
  return `Bastoncini di Incenso Bulk - Fragranza ${fragranzaIT}

${benefici[fragranzaIT] || "Incenso di alta qualità per aromaterapia e purificazione ambienti."}

✨ Caratteristiche:
• Formato: Bastoncini indiani tradizionali
• Confezione: Bulk professionale
• Qualità: Premium grade per uso intensivo
• Origine: India
• Tempo combustione: 30-40 minuti per bastoncino

🌿 Utilizzi:
• Purificazione e profumazione ambienti
• Meditazione e pratiche spirituali
• Yoga e aromaterapia
• Centri benessere e spa
• Rivendita al dettaglio

💼 Confezione Bulk:
Formato economico per professionisti, centri benessere, negozi specializzati.
Ideale per uso intensivo o rivendita.

⚠️ Avvertenze:
• Bruciare sempre in apposito porta-incenso
• Non lasciare incustodito
• Tenere lontano da materiali infiammabili
• Aerare il locale dopo l'uso`;
};

console.log('🌍 APPLICAZIONE TRADUZIONI:\n');

let count = 0;

products.forEach(product => {
  // Identifico i prodotti incenso appena importati
  if (product.sku && (product.sku.startsWith('BinC-') || product.sku.startsWith('BincS-'))) {

    // Coni (BinC-XX)
    if (product.sku.startsWith('BinC-')) {
      const match = product.name.match(/Bulk\s+Incense Cones - (.+)/);
      if (match) {
        const fragranzaEN = match[1].trim();
        const fragranzaIT = fragranze[fragranzaEN] || fragranzaEN;

        product.name = `Coni di Incenso Bulk - ${fragranzaIT}`;
        product.description = descrizioneConi(fragranzaIT);

        console.log(`✅ ${product.sku}: ${product.name}`);
        count++;
      }
    }

    // Bastoncini (BincS-XX)
    if (product.sku.startsWith('BincS-')) {
      const match = product.name.match(/Bulk\s+Incense - (.+)/);
      if (match) {
        const fragranzaEN = match[1].trim();
        const fragranzaIT = fragranze[fragranzaEN] || fragranzaEN;

        product.name = `Bastoncini di Incenso Bulk - ${fragranzaIT}`;
        product.description = descrizioneBastoncini(fragranzaIT);

        console.log(`✅ ${product.sku}: ${product.name}`);
        count++;
      }
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 RIEPILOGO: ${count}/48 incensi tradotti\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE INCENSI COMPLETATA!\n');
