const bigBuyClient = require('./src/integrations/BigBuyClient');
const fs = require('fs');

async function downloadCategories() {
    console.log('=== DOWNLOAD CATEGORIE BIGBUY ===\n');

    try {
        console.log('📡 Chiamata API BigBuy per categorie...\n');

        const categories = await bigBuyClient.getCategories();

        console.log('✅ Categorie ricevute!');
        console.log(`Totale categorie: ${categories.length || 'N/A'}\n`);

        // Salva le categorie in un file JSON
        fs.writeFileSync(
            'bigbuy-categories.json',
            JSON.stringify(categories, null, 2),
            'utf8'
        );

        console.log('💾 Salvate in bigbuy-categories.json');

        // Mostra la struttura principale
        if (Array.isArray(categories)) {
            console.log('\n=== CATEGORIE PRINCIPALI ===\n');

            categories.forEach((cat, index) => {
                if (index < 20) {  // Mostra solo le prime 20
                    console.log(`${cat.id || cat.ID || '?'} - ${cat.name || cat.Name || '?'}`);

                    // Se ha sottocategorie, mostrarne alcune
                    const children = cat.children || cat.Children || [];
                    if (children.length > 0) {
                        children.slice(0, 3).forEach(child => {
                            console.log(`  └─ ${child.id || child.ID || '?'} - ${child.name || child.Name || '?'}`);
                        });
                        if (children.length > 3) {
                            console.log(`  └─ ... e altre ${children.length - 3} sottocategorie`);
                        }
                    }
                }
            });

            if (categories.length > 20) {
                console.log(`\n... e altre ${categories.length - 20} categorie principali`);
            }
        } else {
            // Se è un oggetto, mostralo
            console.log('\n=== STRUTTURA DATI ===\n');
            console.log(JSON.stringify(categories, null, 2).substring(0, 1000));
        }

    } catch (error) {
        console.error('❌ Errore:', error.message);
        console.error(error.stack);
    }
}

downloadCategories();
