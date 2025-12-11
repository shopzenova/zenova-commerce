const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('=== ANALISI IMMAGINI MANCANTI ===\n');

const categories = {
  'oli-essenziali': [],
  'incensi': [],
  'diffusori-elettronici': [],
  'reed-diffusers': [],
  'borse': [],
  'gioielli': [],
  'vestiario': [],
  'luci': [],
  'altri': []
};

let withLocalImage = 0;
let withoutLocalImage = 0;
let withRemoteImage = 0;

products.forEach(p => {
  const id = p.id || p.sku;
  const hasLocal = p.localImage && p.localImage.trim() !== '';
  const hasRemote = (p.images && p.images.length > 0) || (p.image && p.image.trim() !== '');

  if (hasLocal) {
    withLocalImage++;
  } else {
    withoutLocalImage++;
  }

  if (hasRemote) {
    withRemoteImage++;
  }

  // Classifica per categoria AW Dropship
  if (!hasLocal && id && typeof id === 'string') {
    if (id.startsWith('ULFO-')) {
      categories['oli-essenziali'].push({id, name: p.name});
    } else if (id.startsWith('AWChill-') || id.startsWith('NSMed-')) {
      categories['incensi'].push({id, name: p.name});
    } else if (id.startsWith('AATOM-')) {
      categories['diffusori-elettronici'].push({id, name: p.name});
    } else if (id.startsWith('ACD-')) {
      categories['reed-diffusers'].push({id, name: p.name});
    } else if (id.startsWith('JNS-')) {
      categories['borse'].push({id, name: p.name});
    } else if (id.startsWith('AromaJ-')) {
      categories['gioielli'].push({id, name: p.name});
    } else if (id.startsWith('AWFash-')) {
      categories['vestiario'].push({id, name: p.name});
    } else if (id.startsWith('GGL-')) {
      categories['luci'].push({id, name: p.name});
    } else if (hasRemote && !hasLocal) {
      categories['altri'].push({id, name: p.name, supplier: p.supplier || p.brand});
    }
  }
});

console.log('TOTALE PRODOTTI:', products.length);
console.log('  - Con immagine locale:', withLocalImage);
console.log('  - Senza immagine locale:', withoutLocalImage);
console.log('  - Con immagine remota:', withRemoteImage);

console.log('\n=== PRODOTTI AW DROPSHIP SENZA IMMAGINE LOCALE ===\n');

Object.entries(categories).forEach(([cat, items]) => {
  if (items.length > 0) {
    console.log(`\n${cat.toUpperCase()}: ${items.length} prodotti`);
    items.slice(0, 5).forEach(item => {
      console.log(`  - ${item.id}: ${item.name ? item.name.substring(0, 50) : 'N/A'}`);
    });
    if (items.length > 5) {
      console.log(`  ... e altri ${items.length - 5} prodotti`);
    }
  }
});

console.log('\n=== RIEPILOGO DOWNLOAD NECESSARI ===\n');
let totalToDownload = 0;
Object.entries(categories).forEach(([cat, items]) => {
  if (items.length > 0) {
    console.log(`  ${cat}: ${items.length} immagini da scaricare`);
    totalToDownload += items.length;
  }
});
console.log(`\nTOTALE IMMAGINI DA SCARICARE: ${totalToDownload}`);
