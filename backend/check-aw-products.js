const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('=== PRODOTTI AW DROPSHIP NEL DATABASE ===\n');

const awPrefixes = {
  'ULFO-': { name: 'Oli Essenziali', count: 0, inDB: [] },
  'AWChill-': { name: 'Incensi Satya', count: 0, inDB: [] },
  'NSMed-': { name: 'Incensi Nag Champa', count: 0, inDB: [] },
  'AATOM-': { name: 'Diffusori Elettronici', count: 0, inDB: [] },
  'ACD-': { name: 'Reed Diffusers', count: 0, inDB: [] },
  'JNS-': { name: 'Borse Nepal', count: 0, inDB: [] },
  'AromaJ-': { name: 'Gioielli Aromaterapia', count: 0, inDB: [] },
  'AWFash-': { name: 'Vestiario Wellness', count: 0, inDB: [] },
  'GGL-': { name: 'Luci Gemstone', count: 0, inDB: [] }
};

products.forEach(p => {
  const id = p.id || p.sku;
  if (!id || typeof id !== 'string') return;

  Object.keys(awPrefixes).forEach(prefix => {
    if (id.startsWith(prefix)) {
      awPrefixes[prefix].count++;
      awPrefixes[prefix].inDB.push(id);
    }
  });
});

Object.entries(awPrefixes).forEach(([prefix, data]) => {
  console.log(`${data.name} (${prefix}): ${data.count} nel database`);
  if (data.count > 0 && data.count <= 10) {
    data.inDB.forEach(id => console.log(`  - ${id}`));
  } else if (data.count > 10) {
    data.inDB.slice(0, 5).forEach(id => console.log(`  - ${id}`));
    console.log(`  ... e altri ${data.count - 5}`);
  }
});

console.log('\n=== IMMAGINI DISPONIBILI SU DISCO ===\n');

const imagesDir = path.join(__dirname, '..', 'images', 'aw-products');

// Verifica cartelle immagini
const folders = ['diffusori', 'borse', 'oli-essenziali'];
folders.forEach(folder => {
  const folderPath = path.join(imagesDir, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    console.log(`${folder}/: ${files.length} file`);
    files.slice(0, 5).forEach(f => console.log(`  - ${f}`));
    if (files.length > 5) {
      console.log(`  ... e altri ${files.length - 5} file`);
    }
  } else {
    console.log(`${folder}/: CARTELLA NON TROVATA`);
  }
});

console.log('\n=== COSA MANCA ===\n');
console.log('Nel database:');
if (awPrefixes['ULFO-'].count === 0) console.log('  ❌ Oli Essenziali (ULFO-)');
if (awPrefixes['AWChill-'].count === 0) console.log('  ❌ Incensi Satya (AWChill-)');
if (awPrefixes['NSMed-'].count === 0) console.log('  ❌ Incensi Nag Champa (NSMed-)');
if (awPrefixes['AWFash-'].count === 0) console.log('  ❌ Vestiario Wellness (AWFash-)');
if (awPrefixes['AromaJ-'].count === 0) console.log('  ❌ Gioielli Aromaterapia (AromaJ-)');
if (awPrefixes['GGL-'].count === 0) console.log('  ❌ Luci Gemstone (GGL-)');
