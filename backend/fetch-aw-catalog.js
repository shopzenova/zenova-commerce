/**
 * Scarica e analizza TUTTO il catalogo AW Dropship
 */
require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');
const fs = require('fs');

async function fetchFullCatalog() {
  console.log('📦 Download catalogo completo AW Dropship...\n');

  const awClient = new AWDropshipClient();
  let allProducts = [];
  let currentPage = 1;
  let totalPages = 1;

  try {
    // Scarica prima pagina per vedere quante pagine ci sono
    console.log('📄 Scaricamento pagina 1...');
    const firstPage = await awClient.getProducts(1, 100);

    totalPages = firstPage.pagination.lastPage;
    const totalProducts = firstPage.pagination.total;

    console.log(`📊 Trovati ${totalProducts} prodotti totali in ${totalPages} pagine\n`);

    allProducts = [...firstPage.data];

    // Scarica resto delle pagine
    for (let page = 2; page <= totalPages; page++) {
      console.log(`📄 Scaricamento pagina ${page}/${totalPages}...`);
      const pageData = await awClient.getProducts(page, 100);
      allProducts = [...allProducts, ...pageData.data];

      // Progress
      const progress = Math.round((page / totalPages) * 100);
      console.log(`   ✅ ${allProducts.length}/${totalProducts} prodotti (${progress}%)`);
    }

    console.log(`\n✅ Download completato: ${allProducts.length} prodotti\n`);

    // Analizza per categorie/departments
    const byDepartment = {};
    const byFamily = {};

    allProducts.forEach(product => {
      const dept = product.department_slug || 'no-department';
      const family = product.family_slug || 'no-family';

      if (!byDepartment[dept]) byDepartment[dept] = [];
      if (!byFamily[family]) byFamily[family] = [];

      byDepartment[dept].push(product);
      byFamily[family].push(product);
    });

    console.log('📋 DEPARTMENTS (Categorie principali):');
    Object.keys(byDepartment).sort().forEach(dept => {
      console.log(`   ${dept}: ${byDepartment[dept].length} prodotti`);
    });

    console.log('\n📋 FAMILIES (Sottocategorie):');
    const families = Object.keys(byFamily).sort();
    families.slice(0, 20).forEach(family => {
      console.log(`   ${family}: ${byFamily[family].length} prodotti`);
    });

    if (families.length > 20) {
      console.log(`   ... e altre ${families.length - 20} families`);
    }

    // Salva tutto in un file
    const outputPath = './aw-catalog-full.json';
    fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
    console.log(`\n💾 Catalogo salvato in: ${outputPath}`);

    // Salva analisi categorie
    const analysisPath = './aw-catalog-analysis.json';
    fs.writeFileSync(analysisPath, JSON.stringify({
      totalProducts: allProducts.length,
      departments: Object.keys(byDepartment).sort().map(dept => ({
        slug: dept,
        count: byDepartment[dept].length,
        products: byDepartment[dept].slice(0, 3).map(p => ({ id: p.id, code: p.code, slug: p.slug }))
      })),
      families: Object.keys(byFamily).sort().map(family => ({
        slug: family,
        count: byFamily[family].length
      }))
    }, null, 2));
    console.log(`💾 Analisi salvata in: ${analysisPath}`);

    console.log('\n✅ TUTTO COMPLETATO! Controlla i file JSON per vedere il catalogo.\n');

  } catch (error) {
    console.error('\n❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fetchFullCatalog().then(() => {
  process.exit(0);
});
