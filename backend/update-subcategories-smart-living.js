/**
 * Script per aggiornare SOLO le sottocategorie dei prodotti Smart Living (veloce)
 */

const fs = require('fs');
const path = require('path');
const { getProductSubcategory } = require('./config/category-mapping');

console.log('🔄 Inizio aggiornamento sottocategorie SMART LIVING...\n');

// Carica prodotti
const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Trovati ${products.length} prodotti totali\n`);

let updatedCount = 0;

// Aggiorna SOLO prodotti Smart Living
products.forEach((product, index) => {
  // Filtra solo Smart Living
  if (!product.zenovaCategories || !product.zenovaCategories.includes('smart-living')) {
    return;
  }

  // Calcola sottocategoria
  const subcategory = getProductSubcategory(product);

  if (subcategory) {
    console.log(`✏️  ${product.name.substring(0, 60)}...`);
    console.log(`   Vecchia: ${product.zenovaSubcategory || 'nessuna'} → Nuova: ${subcategory}\n`);

    product.zenovaSubcategory = subcategory;
    updatedCount++;
  }
});

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));

console.log('\n✅ Aggiornamento completato!');
console.log(`📊 Prodotti Smart Living aggiornati: ${updatedCount}`);
