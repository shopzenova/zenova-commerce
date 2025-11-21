const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function downloadAllCategories() {
    try {
        console.log('🔄 Download tutte le categorie BigBuy...\n');

        let allCategories = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            console.log(`📥 Scaricando pagina ${page}...`);

            const response = await axios.get('https://api.bigbuy.eu/rest/catalog/categories.json', {
                headers: {
                    'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`
                },
                params: {
                    isoCode: 'it',
                    page: page,
                    pageSize: 100
                }
            });

            const categories = response.data;

            if (!categories || categories.length === 0) {
                hasMore = false;
                console.log(`✅ Pagina ${page} vuota. Fine download.\n`);
            } else {
                allCategories = allCategories.concat(categories);
                console.log(`   ✓ ${categories.length} categorie scaricate`);
                page++;

                // Pausa 500ms tra richieste per non sovraccaricare l'API
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.log(`\n✅ TOTALE: ${allCategories.length} categorie scaricate!\n`);

        // Salva tutte le categorie
        fs.writeFileSync(
            'bigbuy-all-categories.json',
            JSON.stringify(allCategories, null, 2)
        );
        console.log('✅ Salvate in: bigbuy-all-categories.json\n');

        // Cerca categoria 2501 (Salute | Bellezza)
        console.log('🔍 Cerco categoria 2501 (Salute | Bellezza)...\n');

        const cat2501 = allCategories.find(cat => cat.id === 2501);

        if (cat2501) {
            console.log('✅ TROVATA categoria 2501!\n');
            console.log(`ID: ${cat2501.id}`);
            console.log(`Nome: ${cat2501.name}`);
            console.log(`URL: ${cat2501.url}`);
            console.log(`Parent: ${cat2501.parentCategory || 'ROOT'}\n`);

            // Trova TUTTE le sottocategorie con parent=2501
            const subcategories = allCategories.filter(cat => cat.parentCategory === 2501);

            console.log(`📂 SOTTOCATEGORIE di 2501 (${subcategories.length}):\n`);

            subcategories.forEach((subcat, index) => {
                console.log(`${index + 1}. [${subcat.id}] ${subcat.name}`);

                // Trova sotto-sottocategorie
                const subsubcats = allCategories.filter(cat => cat.parentCategory === subcat.id);
                if (subsubcats.length > 0) {
                    subsubcats.forEach(ssc => {
                        console.log(`   └─ [${ssc.id}] ${ssc.name}`);
                    });
                }
            });

            // Crea struttura gerarchica
            const tree = {
                ...cat2501,
                children: subcategories.map(subcat => ({
                    ...subcat,
                    children: allCategories.filter(cat => cat.parentCategory === subcat.id)
                }))
            };

            fs.writeFileSync(
                'bigbuy-2501-tree.json',
                JSON.stringify(tree, null, 2)
            );
            console.log('\n✅ Albero categoria 2501 salvato in: bigbuy-2501-tree.json');
        } else {
            console.log('❌ Categoria 2501 NON trovata!\n');
        }

        // Cerca anche 2507 (Profumeria | Cosmesi)
        console.log('\n🔍 Cerco categoria 2507 (Perfumes | Cosmetics)...\n');

        const cat2507 = allCategories.find(cat => cat.id === 2507);

        if (cat2507) {
            console.log('✅ TROVATA categoria 2507!\n');
            console.log(`ID: ${cat2507.id}`);
            console.log(`Nome: ${cat2507.name}`);
            console.log(`Parent: ${cat2507.parentCategory || 'ROOT'}\n`);

            const subcategories = allCategories.filter(cat => cat.parentCategory === 2507);

            console.log(`📂 SOTTOCATEGORIE di 2507 (${subcategories.length}):\n`);

            subcategories.forEach((subcat, index) => {
                console.log(`${index + 1}. [${subcat.id}] ${subcat.name}`);

                const subsubcats = allCategories.filter(cat => cat.parentCategory === subcat.id);
                if (subsubcats.length > 0) {
                    subsubcats.forEach(ssc => {
                        console.log(`   └─ [${ssc.id}] ${ssc.name}`);
                    });
                }
            });

            const tree = {
                ...cat2507,
                children: subcategories.map(subcat => ({
                    ...subcat,
                    children: allCategories.filter(cat => cat.parentCategory === subcat.id)
                }))
            };

            fs.writeFileSync(
                'bigbuy-2507-tree.json',
                JSON.stringify(tree, null, 2)
            );
            console.log('\n✅ Albero categoria 2507 salvato in: bigbuy-2507-tree.json');
        }

    } catch (error) {
        console.error('❌ Errore:', error.response?.data || error.message);
    }
}

downloadAllCategories();
