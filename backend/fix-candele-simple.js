const fs = require('fs');
const path = require('path');

console.log('🔄 Spostamento prodotti da diffusori a Candele Gel...\n');

// Carica database
const dbPath = path.join(__dirname, '..', 'products.json');
let products = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log(`📦 Database: ${products.length} prodotti\n`);

// Backup
const backupPath = path.join(__dirname, `products.backup-fix-candele-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${path.basename(backupPath)}\n`);

// Trova prodotti nella categoria diffusori generica
const toMove = products.filter(p => p.zenovaSubcategory === 'diffusori');

console.log(`📊 Trovati ${toMove.length} prodotti in "diffusori" da spostare\n`);

let moved = 0;
products.forEach(p => {
  if (p.zenovaSubcategory === 'diffusori') {
    p.zenovaSubcategory = 'Candele Gel Profumati e Sali da Bagno';
    p.subcategory = 'candele-gel-sali';
    console.log(`✅ ${p.name.substring(0, 50)}`);
    moved++;
  }
});

// Salva
fs.writeFileSync(dbPath, JSON.stringify(products, null, 2));

console.log('\n' + '='.repeat(60));
console.log('✅ COMPLETATO');
console.log('='.repeat(60));
console.log(`📊 Prodotti spostati: ${moved}`);
console.log(`💾 Backup: ${path.basename(backupPath)}`);
console.log('='.repeat(60));
