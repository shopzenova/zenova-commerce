const fs = require('fs');
const csv = require('csv-parser');

const PRODUCTS_FILE = '../products.json';
const CSV_FILE = './diffusori-aatom-NEW.csv';
const BACKUP_FILE = `./products.backup-margine30-${Date.now()}.json`;
const MARGINE = 0.30; // 30%

console.log('💰 AGGIORNAMENTO PREZZI CON MARGINE 30%\n');
console.log('Formula: RRP Fornitore × 1.30 → arrotondato a prezzo commerciale\n');
console.log('='.repeat(90));

// Funzione per arrotondare a prezzo commerciale
function arrotondaCommerciale(prezzo) {
  if (prezzo < 10) {
    // Sotto 10€: arrotonda a .99
    return Math.floor(prezzo) + 0.99;
  } else if (prezzo < 20) {
    // 10-20€: arrotonda a .90
    return Math.floor(prezzo) + 0.90;
  } else if (prezzo < 50) {
    // 20-50€: arrotonda a .90
    const base = Math.floor(prezzo / 5) * 5; // Arrotonda a multipli di 5
    return base + 0.90;
  } else {
    // Sopra 50€: arrotonda a .90 (multipli di 5)
    const base = Math.floor(prezzo / 5) * 5;
    return base + 0.90;
  }
}

// Leggi CSV
const csvData = [];
fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`\n✅ CSV letto: ${csvData.length} prodotti\n`);

    // Crea mappa SKU -> prezzi
    const priceMap = {};
    csvData.forEach(row => {
      const rrpFornitore = parseFloat(row['Unit RRP']);
      const costoFornitore = parseFloat(row['Price']);
      const prezzoConMargine = rrpFornitore * (1 + MARGINE);
      const prezzoFinale = arrotondaCommerciale(prezzoConMargine);

      priceMap[row['Product code']] = {
        costo: costoFornitore,
        rrpFornitore: rrpFornitore,
        calcolato: prezzoConMargine,
        finale: prezzoFinale
      };
    });

    // Leggi products.json
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    console.log(`✅ Caricati ${products.length} prodotti dal database\n`);

    // Backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
    console.log(`💾 Backup: ${BACKUP_FILE}\n`);

    let updatedCount = 0;

    console.log('💰 AGGIORNAMENTO PREZZI:\n');
    console.log('='.repeat(90));

    products.forEach(product => {
      if (product.sku && product.sku.startsWith('AATOM-')) {
        const prezzi = priceMap[product.sku];

        if (prezzi) {
          const vecchioPrezzo = product.price;
          const nuovoPrezzo = prezzi.finale;

          product.price = nuovoPrezzo;
          product.originalPrice = nuovoPrezzo;

          const margineEuro = nuovoPrezzo - prezzi.costo;
          const marginePerc = (margineEuro / nuovoPrezzo * 100).toFixed(1);

          console.log(`\n💰 ${product.sku}: ${product.name}`);
          console.log(`   RRP Fornitore: €${prezzi.rrpFornitore.toFixed(2)}`);
          console.log(`   +30%: €${prezzi.calcolato.toFixed(2)}`);
          console.log(`   ✅ Prezzo finale commerciale: €${nuovoPrezzo.toFixed(2)}`);
          console.log(`   📈 Margine sul costo: €${margineEuro.toFixed(2)} (${marginePerc}%)`);

          if (vecchioPrezzo !== nuovoPrezzo) {
            console.log(`   📊 Cambio: €${vecchioPrezzo.toFixed(2)} → €${nuovoPrezzo.toFixed(2)}`);
          }

          updatedCount++;
        }
      }
    });

    console.log('\n' + '='.repeat(90));
    console.log(`\n📊 Prezzi aggiornati: ${updatedCount}\n`);

    // Salva
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log('✅ File products.json salvato!\n');

    console.log('='.repeat(90));
    console.log('🎉 AGGIORNAMENTO COMPLETATO!\n');
    console.log('✓ Tutti i prezzi hanno +30% sul RRP fornitore');
    console.log('✓ Prezzi arrotondati a valori commerciali (.90, .99)');
    console.log('✓ Margini ottimizzati per la vendita al dettaglio\n');
  });
