// Script per esportare products.json con layout corretto per Vercel
const fs = require('fs');
const path = require('path');

console.log('📦 Esportazione products.json per Vercel...\n');

// Leggi i prodotti
const productsPath = path.join(__dirname, 'top-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
console.log(`✅ Caricati ${products.length} prodotti`);

// Leggi il layout
const layoutPath = path.join(__dirname, 'config', 'product-layout.json');
const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
console.log(`✅ Layout: ${layout.home.length} home, ${layout.featured.length} featured, ${layout.hidden.length} hidden\n`);

// Applica il layout ai prodotti
const productsWithLayout = products.map(product => {
    const updatedProduct = { ...product };

    // Imposta zone
    if (layout.home.includes(product.id)) {
        updatedProduct.zone = 'home';
    } else if (layout.hidden.includes(product.id)) {
        updatedProduct.zone = 'hidden';
    } else {
        updatedProduct.zone = 'sidebar';
    }

    // Imposta featured
    updatedProduct.featured = layout.featured.includes(product.id);

    return updatedProduct;
});

// Conta risultati
const homeCount = productsWithLayout.filter(p => p.zone === 'home').length;
const featuredCount = productsWithLayout.filter(p => p.featured === true).length;
const hiddenCount = productsWithLayout.filter(p => p.zone === 'hidden').length;

console.log('📊 Risultati:');
console.log(`   🏠 Home: ${homeCount} prodotti`);
console.log(`   ⭐ Featured: ${featuredCount} prodotti`);
console.log(`   🚫 Hidden: ${hiddenCount} prodotti`);
console.log(`   📂 Sidebar: ${productsWithLayout.length - homeCount - hiddenCount} prodotti\n`);

// Salva nella root del progetto
const outputPath = path.join(__dirname, '..', 'products.json');
fs.writeFileSync(outputPath, JSON.stringify(productsWithLayout, null, 2));

const stats = fs.statSync(outputPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
console.log(`✅ Esportato in: ${outputPath}`);
console.log(`📏 Dimensione: ${sizeMB} MB`);
console.log('\n✨ Pronto per il deploy su Vercel!');
