const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf-8'));

// Trova tutti i 12 diffusori RDEO
const rdeoIds = [
  'RDEO-01', 'RDEO-02', 'RDEO-03', 'RDEO-04', 'RDEO-05', 'RDEO-06',
  'RDEO-07', 'RDEO-08', 'RDEO-09', 'RDEO-10', 'RDEO-11', 'RDEO-12'
];

let updated = 0;

products.forEach((p, index) => {
  if (rdeoIds.includes(p.id)) {
    const namePart = p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name;
    console.log(`Aggiorno ${p.id}: ${namePart}`);
    console.log(`  PRIMA: price=${p.price}, originalPrice=${p.originalPrice}`);

    // Fix: wholesale = 12.92, retail = 22.50
    products[index].price = 12.92;
    products[index].originalPrice = 22.50;

    console.log(`  DOPO: price=12.92, originalPrice=22.50`);
    console.log('');
    updated++;
  }
});

console.log(`✅ Aggiornati ${updated} diffusori RDEO`);

// Salva backup
fs.writeFileSync('./top-100-products.backup-rdeo-fix.json', JSON.stringify(products, null, 2));
console.log('💾 Backup salvato: top-100-products.backup-rdeo-fix.json');

// Salva file aggiornato
fs.writeFileSync('./top-100-products.json', JSON.stringify(products, null, 2));
console.log('💾 File aggiornato: top-100-products.json');
console.log('');
console.log('Ora aggiorno PostgreSQL...');
