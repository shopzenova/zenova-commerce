const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'top-100-products.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Find Boralamp and add subcategory
const boralamp = data.find(p => p.id === 'V0103929');
if (boralamp) {
  boralamp.zenovaSubcategory = 'gadget-tech';
  console.log('✅ Aggiunta sottocategoria "gadget-tech" al Boralamp');
  console.log('Prodotto:', boralamp.name);
  console.log('Categoria:', boralamp.zenovaCategories);
  console.log('Sottocategoria:', boralamp.zenovaSubcategory);

  // Save
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('\n✅ File salvato!');
} else {
  console.log('❌ Prodotto Boralamp non trovato');
}
