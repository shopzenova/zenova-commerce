/**
 * Script per aggiornare le sottocategorie di tutti i prodotti
 */

const fs = require('fs');
const path = require('path');
const { getProductSubcategory } = require('./config/category-mapping');

console.log('🔄 Inizio aggiornamento sottocategorie...\n');

// Carica prodotti
const jsonPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Trovati ${products.length} prodotti da processare\n`);

let updatedCount = 0;
let noSubcategoryCount = 0;

// Aggiorna ogni prodotto
products.forEach((product, index) => {
  // Salta prodotti esclusi
  if (product.zenovaCategories && product.zenovaCategories.includes('exclude')) {
    return;
  }

  // Calcola sottocategoria
  const subcategory = getProductSubcategory(product);

  if (subcategory && subcategory !== product.zenovaSubcategory) {
    console.log(`✏️  [${index + 1}/${products.length}] ${product.name.substring(0, 50)}...`);
    console.log(`   Categoria: ${product.zenovaCategories ? product.zenovaCategories.join(', ') : 'nessuna'}`);
    console.log(`   Vecchia subcategory: ${product.zenovaSubcategory || 'nessuna'}`);
    console.log(`   Nuova subcategory: ${subcategory}\n`);

    product.zenovaSubcategory = subcategory;
    updatedCount++;
  } else if (!subcategory) {
    noSubcategoryCount++;
  }
});

// Salva il file aggiornato
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));

console.log('\n✅ Aggiornamento completato!');
console.log(`📊 Statistiche:`);
console.log(`   - Prodotti aggiornati: ${updatedCount}`);
console.log(`   - Prodotti senza sottocategoria: ${noSubcategoryCount}`);
console.log(`   - Totale prodotti: ${products.length}`);
