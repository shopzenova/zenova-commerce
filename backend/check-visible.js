const products = require('./top-100-products.json');

const smartTech = products.filter(p =>
  p.zenovaCategories &&
  (p.zenovaCategories.includes('smart-living') || p.zenovaCategories.includes('tech-innovation'))
);

console.log('Totale Smart+Tech:', smartTech.length);

const visible = smartTech.filter(p => p.visible !== false);
console.log('Visibili:', visible.length);

const hidden = smartTech.filter(p => p.visible === false);
console.log('Nascosti (visible=false):', hidden.length);

if (hidden.length > 0) {
  console.log('\nEsempi nascosti:');
  hidden.slice(0, 5).forEach(p => {
    console.log('  -', p.id, p.name.substring(0, 60));
  });
}

if (visible.length > 0) {
  console.log('\nEsempi visibili:');
  visible.slice(0, 3).forEach(p => {
    console.log('  -', p.id, p.name.substring(0, 60));
    console.log('    Immagini:', p.images ? p.images.length : 0);
  });
}
