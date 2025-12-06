const data = require('./top-100-products.json');
const smartLiving = data.filter(p => p.zenovaCategories?.includes('smart-living'));

const testProduct = smartLiving.find(p => p.id.includes('TEST'));
const realProducts = smartLiving.filter(p => !p.id.includes('TEST'));

console.log('Total Smart Living products:', smartLiving.length);
console.log('TEST products:', smartLiving.filter(p => p.id.includes('TEST')).length);
console.log('REAL products:', realProducts.length);

console.log('\n=== TEST Product ===');
console.log('ID:', testProduct?.id);
console.log('Name:', testProduct?.name?.substring(0, 50));

console.log('\n=== REAL Products (first 5) ===');
realProducts.slice(0, 5).forEach((p, i) => {
    console.log(`${i+1}. ID: ${p.id}, Name: ${p.name?.substring(0, 50)}`);
});

console.log('\n=== TEST Product Structure ===');
console.log('Keys:', Object.keys(testProduct || {}).join(', '));

console.log('\n=== REAL Product Structure (first one) ===');
if (realProducts[0]) {
    console.log('Keys:', Object.keys(realProducts[0]).join(', '));
    console.log('\nFull REAL Product:');
    console.log(JSON.stringify(realProducts[0], null, 2));
}
