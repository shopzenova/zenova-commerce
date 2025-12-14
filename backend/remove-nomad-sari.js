const fs = require('fs');

console.log('🗑️  Rimozione prodotti Nomad Sari duplicati...\n');

// Carica prodotti
const topProducts = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf8'));

console.log('📋 Prodotti totali prima:', topProducts.length);

// Nomi esatti da rimuovere
const toRemove = [
  'Collezione Nomad Sari On the Med - Vestito (LXL) - Bianco, Blu & Oro con Simbolo Occhio Greco',
  'Collezione Nomad Sari On the Med - Vestito (LXL) - Blu Mare & Bianco',
  'Collezione Nomad Sari On the Med - Vestito (LXL) - Turchese & Bianco',
  '(LXL) Nomad Sari On the Med Collezione - Pantaloni Lounge - Oro & Blu Motivo Greco - Dipinto a Mano',
  '(LXL) Nomad Sari On the Med Collezione - Pantaloni Lounge - Rich Blu & Oro Dipinto a Mano Occhio Greco Protettivo Design',
  '(LXL) Nomad Sari On the Med Collezione - Pantaloni Lounge - Turchese & Oro Design con Pesci',
  '(ML) Nomad Sari On the Med Collezione - Vestito -  Bianco , Blu & Oro Occhio Greco Protettivo Design',
  '(ML) Nomad Sari On the Med Collezione - Vestito - Blu Mare & Oro Design con Pesci',
  '(ML) Nomad Sari On the Med Collezione - Vestito - Turchese & Oro Design Corallo',
  '(ML) Nomad Sari On the Med Collezione - Pantaloni Lounge - Oro & Blu Motivo Greco - Dipinto a Mano',
  '(ML) Nomad Sari On the Med Collezione - Pantaloni Lounge - Rich Blu & Oro Dipinto a Mano Occhio Greco Protettivo Design',
  '(ML) Nomad Sari On the Med Collezione - Pantaloni Lounge - Turchese & Oro Design con Pesci'
];

// Backup
const backupPath = `./top-100-products.backup-remove-nomad-${Date.now()}.json`;
fs.writeFileSync(backupPath, JSON.stringify(topProducts, null, 2));
console.log('💾 Backup creato:', backupPath);

// Filtra prodotti
const filtered = topProducts.filter(p => !toRemove.includes(p.name));

const removed = topProducts.length - filtered.length;

console.log('\n📊 RISULTATO:');
console.log('   Prodotti rimossi:', removed);
console.log('   Prodotti rimanenti:', filtered.length);

// Salva
fs.writeFileSync('./top-100-products.json', JSON.stringify(filtered, null, 2));
console.log('\n✅ File top-100-products.json aggiornato!');
console.log('⚠️  Riavvia il backend per applicare le modifiche');
