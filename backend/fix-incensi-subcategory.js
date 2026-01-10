const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'data/products.json');

console.log('🔧 FIX: Rimuovo "undefined" stringa da zenovaSubcategory incensi AW\n');

// Carica prodotti
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('Prodotti totali:', products.length);

// Trova incensi AW con problema
const awIncensiProblema = products.filter(p =>
  p.id && p.id.startsWith('aw-') &&
  p.subcategory === 'incenso' &&
  p.zenovaSubcategory === 'undefined'  // Stringa "undefined"!
);

console.log('Incensi AW con zenovaSubcategory="undefined" (stringa):', awIncensiProblema.length);

if (awIncensiProblema.length > 0) {
  console.log('\n📝 Fixing...\n');

  let fixed = 0;
  products.forEach(p => {
    if (p.id && p.id.startsWith('aw-') &&
        p.subcategory === 'incenso' &&
        p.zenovaSubcategory === 'undefined') {

      // Rimuovi il campo o mettilo a null
      delete p.zenovaSubcategory;
      // OPPURE: p.zenovaSubcategory = null;

      fixed++;
      console.log(`✅ ${fixed}. Fixed: ${p.id} - ${p.name.substring(0, 40)}`);
    }
  });

  // Salva
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log(`\n🎉 Fix completato! ${fixed} incensi AW aggiornati.`);
  console.log('📁 File salvato:', productsPath);
} else {
  console.log('\n✅ Nessun incenso da fixare!');
}
