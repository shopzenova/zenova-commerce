const fs = require('fs');
const path = require('path');

// Carica il catalogo
const catalogPath = path.join(__dirname, 'top-100-products.json');
let catalog = [];

try {
  const data = fs.readFileSync(catalogPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`📦 Catalogo attuale: ${catalog.length} prodotti`);
} catch (error) {
  console.log('❌ Errore lettura catalogo:', error.message);
  process.exit(1);
}

let massaggiatori = 0;
let profumi = 0;
let altri = 0;

// Sposta i prodotti con categoria "Health & Beauty" nelle categorie corrette
catalog.forEach(product => {
  if (product.category === 'Health & Beauty') {
    const name = product.name || '';

    // Massaggiatori, elettrostimolatori, idromassaggio -> Massaggio e Rilassamento
    if (name.includes('Massaggiatore') || name.includes('Elettrostimolatore') ||
        name.includes('Idromassaggio') || name.includes('massaggio')) {
      product.category = '2501,2502,2504';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2501,2502,2504';
      }
      console.log(`💆 ${name} -> Massaggio e Rilassamento`);
      massaggiatori++;
    }

    // Profumi -> Fragranze & Profumi
    else if (name.includes('Profumo') || name.includes('Eau de') || name.includes('EDT') ||
             name.includes('EDP') || name.includes('Cofanetto Profumo')) {
      product.category = '2507,2508,2510';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2507,2508,2510';
      }
      console.log(`🌺 ${name} -> Fragranze & Profumi`);
      profumi++;
    }

    // Altri prodotti (phon, rasoi, epilatori, mascara, ecc.) -> categoria generica (non visualizzati)
    else {
      product.category = '2501';
      if (product.raw && product.raw.CATEGORY) {
        product.raw.CATEGORY = '2501';
      }
      console.log(`⚠️  ${name} -> Categoria generica (non visualizzato)`);
      altri++;
    }
  }
});

// Salva il catalogo
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

console.log(`\n✅ Catalogo aggiornato!`);
console.log(`💆 Massaggiatori: ${massaggiatori}`);
console.log(`🌺 Profumi: ${profumi}`);
console.log(`⚠️  Altri: ${altri}`);
console.log(`📦 Totale spostati: ${massaggiatori + profumi + altri}`);
