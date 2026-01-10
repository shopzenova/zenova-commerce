const fs = require('fs');

console.log('=== CORREZIONE SOLO 42 CANDELE + 32 INCENSI ULTIMI IMPORTATI ===\n');

// Backup
const timestamp = Date.now();
const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
fs.writeFileSync(
  `data/products.backup-before-fix-ultimi-${timestamp}.json`,
  JSON.stringify(products, null, 2)
);
console.log(`✅ Backup creato\n`);

let modified = 0;

// Trova prodotti con source: undefined E ID che inizia con "aw-"
const daCorreggere = products.filter(p =>
  p.source === undefined && p.id && p.id.startsWith('aw-')
);

console.log(`📦 Prodotti da correggere: ${daCorreggere.length}\n`);

// Separa candele e incensi
const candele = daCorreggere.filter(p =>
  p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
);

const incensi = daCorreggere.filter(p =>
  p.name && (
    p.name.toLowerCase().includes('incens') ||
    p.name.toLowerCase().includes('coni') ||
    p.name.toLowerCase().includes('cone') ||
    p.name.toLowerCase().includes('backflow')
  )
);

console.log(`🕯️  Candele: ${candele.length}`);
console.log(`🔥 Incensi: ${incensi.length}\n`);

// CORREGGI CANDELE
console.log('1️⃣  Correzione candele...\n');

candele.forEach(p => {
  p.source = 'aw';
  p.visible = true;
  p.zone = 'sidebar';

  // Determina sottocategoria
  const nameLower = p.name.toLowerCase();

  if (nameLower.includes('portacandel') || nameLower.includes('candle holder')) {
    p.zenovaSubcategory = 'portacandele';
  } else if (nameLower.includes('candela') || nameLower.includes('candle')) {
    p.zenovaSubcategory = 'candele-profumate';
  }

  // Assicurati che abbiano categoria
  if (!p.zenovaCategory) {
    p.zenovaCategory = 'natural-wellness';
  }

  console.log(`   ✓ ${p.id}: ${p.zenovaSubcategory}`);
  modified++;
});

// CORREGGI INCENSI
console.log(`\n2️⃣  Correzione incensi...\n`);

incensi.forEach(p => {
  p.source = 'aw';
  p.visible = true;
  p.zone = 'sidebar';

  // Determina sottocategoria
  const nameLower = p.name.toLowerCase();

  if (nameLower.includes('backflow') || nameLower.includes('riflusso') || nameLower.includes('cascata')) {
    p.zenovaSubcategory = 'incenso-riflusso';
  } else if (nameLower.includes('coni') || nameLower.includes('cone')) {
    p.zenovaSubcategory = 'incenso-coni';
  } else {
    p.zenovaSubcategory = 'incenso';
  }

  // Assicurati che abbiano categoria
  if (!p.zenovaCategory) {
    p.zenovaCategory = 'natural-wellness';
  }

  console.log(`   ✓ ${p.id}: ${p.zenovaSubcategory}`);
  modified++;
});

// Salva
fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));

console.log(`\n✅ COMPLETATO!`);
console.log(`   Prodotti corretti: ${modified}`);
console.log(`   File salvato: data/products.json\n`);

// Verifica finale
console.log('📊 VERIFICA FINALE:\n');

const verificaUndefined = products.filter(p => p.id && p.id.startsWith('aw-') && p.source === undefined);
const verificaCandele = products.filter(p => p.source === 'aw' && p.zenovaSubcategory && (p.zenovaSubcategory.includes('candel') || p.zenovaSubcategory === 'portacandele'));
const verificaIncensi = products.filter(p => p.source === 'aw' && p.zenovaSubcategory && p.zenovaSubcategory.includes('incenso'));

console.log(`   Prodotti aw-* ancora con source undefined: ${verificaUndefined.length}`);
console.log(`   Candele/portacandele AW totali: ${verificaCandele.length}`);
console.log(`   Incensi AW totali: ${verificaIncensi.length}`);

if (verificaUndefined.length === 0) {
  console.log('\n✅✅✅ TUTTI I PRODOTTI CORRETTI!\n');
} else {
  console.log('\n⚠️  Alcuni prodotti hanno ancora source undefined:\n');
  verificaUndefined.slice(0, 5).forEach(p => {
    console.log(`   ${p.id} | ${p.name.substring(0, 50)}`);
  });
}
