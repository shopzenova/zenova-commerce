const fs = require('fs');

// Leggi i prodotti
const products = JSON.parse(fs.readFileSync('top-100-products.json', 'utf-8'));

console.log(`📦 Prodotti totali prima: ${products.length}`);

// Sottocategorie per capelli da eliminare
const hairSubcategories = [
  'pettini-spazzole',
  'phon-asciugacapelli',
  'piastre-arricciacapelli',
  'shampoo-capelli',
  'balsamo-capelli',
  'lacca-spray',
  'gel-cera-capelli',
  'tintura-capelli'
];

// Keywords aggiuntive per trovare prodotti capelli
const hairKeywords = ['capelli', 'hair', 'spazzola', 'pettine', 'brush', 'comb',
                      'shampoo', 'balsamo', 'conditioner', 'piastra', 'phon',
                      'asciugacapelli', 'lacca', 'gel per capelli', 'tintura'];

// Filtra i prodotti
const beforeCount = products.length;
const filteredProducts = products.filter(p => {
  // Rimuovi se è in una sottocategoria per capelli
  if (hairSubcategories.includes(p.zenovaSubcategory)) {
    return false;
  }

  // Rimuovi se il nome contiene parole chiave capelli
  const name = (p.name || '').toLowerCase();
  const hasHairKeyword = hairKeywords.some(k => name.includes(k));

  if (hasHairKeyword) {
    // Eccezioni: mantieni profumi che hanno "capelli" nella descrizione ma sono profumi
    if (p.zenovaSubcategory && p.zenovaSubcategory.includes('profum')) {
      return true;
    }
    return false;
  }

  return true;
});

const removed = beforeCount - filteredProducts.length;

console.log(`\n🗑️  Prodotti rimossi: ${removed}`);
console.log(`✅ Prodotti rimanenti: ${filteredProducts.length}`);

// Conta quanti prodotti rimangono per ogni sottocategoria rimossa
console.log(`\n📊 Breakdown rimozione per sottocategoria:`);
hairSubcategories.forEach(sub => {
  const count = products.filter(p => p.zenovaSubcategory === sub).length;
  if (count > 0) {
    console.log(`   - ${sub}: ${count} prodotti rimossi`);
  }
});

// Salva backup
const backupPath = `top-100-products-backup-hair-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Backup creato: ${backupPath}`);

// Salva i nuovi prodotti
fs.writeFileSync('top-100-products.json', JSON.stringify(filteredProducts, null, 2));
console.log(`✅ File aggiornato: top-100-products.json`);

// Verifica prodotti Health & Personal Care rimanenti
const healthRemaining = filteredProducts.filter(p => p.zenovaCategory === 'health-personal-care');
console.log(`\n📋 Prodotti Health & Personal Care rimanenti: ${healthRemaining.length}`);
