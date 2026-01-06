const fs = require('fs');

console.log('🔧 FIX CATEGORIE 30 INCENSI - SOLO zenovaCategories\n');

const jsonPath = './data/products.json';

// Backup
const backupPath = `./data/products.backup-fix-incensi-${Date.now()}.json`;
fs.copyFileSync(jsonPath, backupPath);
console.log(`✅ Backup creato: ${backupPath}\n`);

// Leggi prodotti
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`📦 Prodotti totali: ${products.length}\n`);

// SKU dei 30 incensi da fixare (escludo EID-64 e EID-63 che hanno già la categoria)
const incensiDaFixare = [
  'ABFi-06',
  'AromaBF-01', 'AromaBF-02', 'AromaBF-03', 'AromaBF-04', 'AromaBF-05',
  'AromaBF-06', 'AromaBF-07', 'AromaBF-09', 'AromaBF-10',
  'BFBF-02', 'BFBF-03', 'BFBF-04', 'BFBF-05', 'BFBF-06',
  'BackFi-02', 'BackFI-01',
  'iSatyaBF-01DS', 'iSatyaBF-02DS', 'iSatyaBF-03DS', 'iSatyaBF-04DS',
  'iSatyaBF-05DS', 'iSatyaBF-06DS', 'iSatyaBF-07DS', 'iSatyaBF-08DS',
  'iSatyaBF-09DS', 'iSatyaBF-10DS',
  'EID-62'
];

let fixed = 0;

products.forEach(p => {
  if (incensiDaFixare.includes(p.sku)) {
    // Aggiungi SOLO zenovaCategories se non ce l'ha
    if (!p.zenovaCategories || p.zenovaCategories.length === 0) {
      p.zenovaCategories = ['natural-wellness'];
      console.log(`✅ ${p.sku} - ${p.name}`);
      console.log(`   Aggiunto: zenovaCategories: ['natural-wellness']`);
      fixed++;
    }
  }
});

// Salva
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));

console.log('\n' + '═'.repeat(70));
console.log(`✅ FIX COMPLETATO!`);
console.log(`   Prodotti fixati: ${fixed}`);
console.log(`   File salvato: ${jsonPath}`);
console.log(`   Backup: ${backupPath}`);
console.log('═'.repeat(70));
