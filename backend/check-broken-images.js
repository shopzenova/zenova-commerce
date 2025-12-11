const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

console.log('=== CONTROLLO IMMAGINI ROTTE ===\n');

let brokenLocal = [];
let workingLocal = [];
let noLocalImage = [];

products.forEach(p => {
  const id = p.id || p.sku;

  if (p.localImage && p.localImage.trim() !== '') {
    // Ha localImage impostato
    const imagePath = path.join(__dirname, '..', p.localImage);

    if (fs.existsSync(imagePath)) {
      workingLocal.push({ id, path: p.localImage });
    } else {
      brokenLocal.push({
        id,
        path: p.localImage,
        category: p.zenovaCategory,
        subcategory: p.zenovaSubcategory
      });
    }
  } else {
    // Non ha localImage
    if (id && typeof id === 'string' &&
        (id.startsWith('ULFO-') || id.startsWith('AWChill-') ||
         id.startsWith('NSMed-') || id.startsWith('AATOM-') ||
         id.startsWith('ACD-') || id.startsWith('JNS-') ||
         id.startsWith('AromaJ-') || id.startsWith('AWFash-') ||
         id.startsWith('GGL-'))) {
      noLocalImage.push({
        id,
        name: p.name,
        category: p.zenovaCategory,
        hasRemote: (p.images && p.images.length > 0) || (p.image && p.image.trim() !== '')
      });
    }
  }
});

console.log(`✅ Immagini locali FUNZIONANTI: ${workingLocal.length}`);
workingLocal.slice(0, 10).forEach(p => console.log(`  - ${p.id}: ${p.path}`));
if (workingLocal.length > 10) console.log(`  ... e altre ${workingLocal.length - 10}`);

console.log(`\n❌ Immagini locali ROTTE: ${brokenLocal.length}`);
brokenLocal.slice(0, 20).forEach(p => {
  console.log(`  - ${p.id}: ${p.path}`);
  console.log(`    Cat: ${p.category} / ${p.subcategory}`);
});
if (brokenLocal.length > 20) console.log(`  ... e altre ${brokenLocal.length - 20}`);

console.log(`\n⚠️  Prodotti AW SENZA localImage: ${noLocalImage.length}`);
const grouped = {};
noLocalImage.forEach(p => {
  const prefix = p.id.split('-')[0];
  if (!grouped[prefix]) grouped[prefix] = [];
  grouped[prefix].push(p);
});

Object.entries(grouped).forEach(([prefix, items]) => {
  console.log(`\n  ${prefix}: ${items.length} prodotti`);
  items.slice(0, 3).forEach(p => {
    console.log(`    - ${p.id}: ${p.hasRemote ? 'ha remote' : 'NO IMAGE!'}`);
  });
});
