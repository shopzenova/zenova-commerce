const products = require('./top-100-products.json');

const bigbuyProduct = products.find(p => p.id && !p.id.startsWith('AW') && !p.id.startsWith('TEST'));
const awProduct = products.find(p => p.id && p.id.startsWith('AW'));

console.log('========================================');
console.log('PRODOTTO BIGBUY:');
console.log('========================================');
console.log('ID:', bigbuyProduct.id);
console.log('Nome:', bigbuyProduct.name.substring(0, 50));
console.log('zenovaCategory:', bigbuyProduct.zenovaCategory);
console.log('zenovaCategories:', bigbuyProduct.zenovaCategories);
console.log('zenovaSubcategory:', bigbuyProduct.zenovaSubcategory);

console.log('\n========================================');
console.log('PRODOTTO AW:');
console.log('========================================');
console.log('ID:', awProduct.id);
console.log('Nome:', awProduct.name.substring(0, 50));
console.log('zenovaCategory:', awProduct.zenovaCategory);
console.log('zenovaCategories:', awProduct.zenovaCategories);
console.log('zenovaSubcategory:', awProduct.zenovaSubcategory);

console.log('\n========================================');
console.log('DIFFERENZE:');
console.log('========================================');
console.log('BigBuy ha zenovaCategory?', !!bigbuyProduct.zenovaCategory);
console.log('AW ha zenovaCategory?', !!awProduct.zenovaCategory);
console.log('BigBuy ha zenovaSubcategory?', !!bigbuyProduct.zenovaSubcategory);
console.log('AW ha zenovaSubcategory?', !!awProduct.zenovaSubcategory);
