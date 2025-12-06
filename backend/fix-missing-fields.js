/**
 * Script per aggiungere campi 'visible' e 'zone' ai prodotti che non li hanno
 *
 * Questo script:
 * - Legge top-100-products.json
 * - Aggiunge visible: true e zone: 'sidebar' ai prodotti che non hanno questi campi
 * - Salva il file aggiornato
 */

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'top-100-products.json');

console.log('🔧 Fix campi mancanti (visible, zone) nel catalogo prodotti\n');

// Leggi il file
let products = [];
try {
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  products = JSON.parse(rawData);
  console.log(`📦 Caricati ${products.length} prodotti\n`);
} catch (error) {
  console.error('❌ Errore lettura file:', error);
  process.exit(1);
}

// Conta prodotti da fixare
let fixed = 0;
let alreadyOk = 0;

products.forEach(product => {
  let needsFix = false;

  // Aggiungi 'visible' se manca
  if (product.visible === undefined) {
    product.visible = true;
    needsFix = true;
  }

  // Aggiungi 'zone' se manca
  if (!product.zone) {
    product.zone = 'sidebar';
    needsFix = true;
  }

  if (needsFix) {
    fixed++;
    console.log(`✅ Fixato: ${product.id} - ${product.name}`);
  } else {
    alreadyOk++;
  }
});

console.log('\n=================================');
console.log(`✅ Prodotti fixati: ${fixed}`);
console.log(`✓  Prodotti già OK: ${alreadyOk}`);
console.log(`📊 Totale prodotti: ${products.length}`);
console.log('=================================\n');

// Salva il file aggiornato
if (fixed > 0) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
    console.log('💾 File salvato con successo!');
    console.log(`📁 Percorso: ${jsonPath}\n`);
  } catch (error) {
    console.error('❌ Errore salvataggio file:', error);
    process.exit(1);
  }
} else {
  console.log('ℹ️  Nessuna modifica necessaria\n');
}

console.log('✨ Script completato!');
