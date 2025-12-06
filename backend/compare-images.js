const data = require('./top-100-products.json');

// Trova un prodotto beauty che funziona
const beauty = data.find(p => p.zenovaCategories?.includes('beauty'));

// Trova un prodotto smart-living che non funziona (esclude TEST)
const smartLiving = data.find(p => p.zenovaCategories?.includes('smart-living') && !p.id.includes('TEST'));

console.log('=== BEAUTY Product (funziona) ===');
console.log('ID:', beauty?.id);
console.log('Name:', beauty?.name?.substring(0, 50));
console.log('Images type:', Array.isArray(beauty?.images) ? 'Array' : typeof beauty?.images);
console.log('Images length:', beauty?.images?.length);
console.log('First image:', JSON.stringify(beauty?.images?.[0], null, 2));
console.log('Second image:', JSON.stringify(beauty?.images?.[1], null, 2));

console.log('\n=== SMART LIVING Product (non funziona) ===');
console.log('ID:', smartLiving?.id);
console.log('Name:', smartLiving?.name?.substring(0, 50));
console.log('Images type:', Array.isArray(smartLiving?.images) ? 'Array' : typeof smartLiving?.images);
console.log('Images length:', smartLiving?.images?.length);
console.log('First image:', JSON.stringify(smartLiving?.images?.[0], null, 2));
console.log('Second image:', JSON.stringify(smartLiving?.images?.[1], null, 2));
