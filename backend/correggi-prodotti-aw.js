const fs = require('fs');

console.log('=== CORREZIONE PRODOTTI AW ===\n');

// Backup
const timestamp = Date.now();
const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
fs.writeFileSync(
  `data/products.backup-fix-aw-categorie-${timestamp}.json`,
  JSON.stringify(products, null, 2)
);
console.log(`✅ Backup creato: products.backup-fix-aw-categorie-${timestamp}.json\n`);

let modified = 0;

// 1. CORREGGI PORTACANDELE
console.log('1️⃣  Correzione portacandele...\n');

const portacandele = products.filter(p =>
  p.source === 'aw' &&
  p.name &&
  (p.name.toLowerCase().includes('portacandel') || p.name.toLowerCase().includes('candle holder')) &&
  p.zenovaSubcategory === 'diffusori'
);

console.log(`   Trovati ${portacandele.length} portacandele con sottocategoria "diffusori"`);

portacandele.forEach(p => {
  p.zenovaSubcategory = 'portacandele';
  console.log(`   ✓ ${p.id}: diffusori → portacandele`);
  modified++;
});

// 2. CORREGGI INCENSI A CONI
console.log(`\n2️⃣  Correzione incensi a coni...\n`);

const incensi = products.filter(p =>
  p.source === 'aw' &&
  p.name &&
  (p.name.toLowerCase().includes('incense cones') || p.name.toLowerCase().includes('coni'))
);

console.log(`   Trovati ${incensi.length} incensi a coni`);

incensi.forEach(p => {
  // Subcategory è già "incenso", va bene
  // Ma aggiungiamo un campo specifico per distinguerli
  if (p.zenovaSubcategory === 'incenso') {
    p.zenovaSubcategory = 'incenso-coni';
    console.log(`   ✓ ${p.id}: incenso → incenso-coni`);
    modified++;
  }
});

// 3. AGGIUNGI CAMPI MANCANTI A TUTTI I PRODOTTI AW
console.log(`\n3️⃣  Aggiunta campi mancanti (visible, zone)...\n`);

const awProducts = products.filter(p => p.source === 'aw');

awProducts.forEach(p => {
  // Aggiungi visible se mancante
  if (p.visible === undefined) {
    p.visible = true;
    modified++;
  }

  // Aggiungi zone se mancante
  if (p.zone === undefined) {
    p.zone = 'sidebar';
    modified++;
  }
});

console.log(`   ✓ Aggiunti campi mancanti a ${awProducts.length} prodotti AW`);

// Salva modifiche
fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));

console.log(`\n✅ COMPLETATO!`);
console.log(`   Totale modifiche: ${modified}`);
console.log(`   File salvato: data/products.json\n`);

// Verifica
console.log('📊 VERIFICA CORREZIONI:\n');

const verificaPortacandele = products.filter(p =>
  p.source === 'aw' && p.zenovaSubcategory === 'portacandele'
);

const verificaIncensiConi = products.filter(p =>
  p.source === 'aw' && p.zenovaSubcategory === 'incenso-coni'
);

const verificaVisible = products.filter(p =>
  p.source === 'aw' && p.visible === undefined
);

const verificaZone = products.filter(p =>
  p.source === 'aw' && p.zone === undefined
);

console.log(`   Portacandele con categoria corretta: ${verificaPortacandele.length}`);
console.log(`   Incensi coni con categoria corretta: ${verificaIncensiConi.length}`);
console.log(`   Prodotti AW senza visible: ${verificaVisible.length}`);
console.log(`   Prodotti AW senza zone: ${verificaZone.length}\n`);

if (verificaVisible.length === 0 && verificaZone.length === 0) {
  console.log('✅✅✅ TUTTE LE CORREZIONI APPLICATE CON SUCCESSO!\n');
} else {
  console.log('⚠️  Alcuni prodotti hanno ancora campi mancanti\n');
}
