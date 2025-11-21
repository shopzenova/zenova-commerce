const axios = require('axios');
require('dotenv').config();

async function fetchCategoryTree() {
    try {
        console.log('🔄 Chiamata API BigBuy per ottenere albero categorie...\n');

        const response = await axios.get('https://api.bigbuy.eu/rest/catalog/categories.json', {
            headers: {
                'Authorization': `Bearer ${process.env.BIGBUY_API_KEY}`
            },
            params: {
                isoCode: 'it'
            }
        });

        const categories = response.data;

        console.log('✅ Categorie scaricate!\n');
        console.log(`Totale categorie principali: ${categories.length}\n`);

        // Cerca categoria "Salute | Bellezza"
        const healthBeauty = categories.find(cat =>
            cat.name.toLowerCase().includes('salute') ||
            cat.name.toLowerCase().includes('bellezza') ||
            cat.name.toLowerCase().includes('health') ||
            cat.name.toLowerCase().includes('beauty')
        );

        if (healthBeauty) {
            console.log('🎯 TROVATA CATEGORIA: Salute | Bellezza\n');
            console.log(`ID: ${healthBeauty.id}`);
            console.log(`Nome: ${healthBeauty.name}`);
            console.log(`\n📂 SOTTOCATEGORIE (${healthBeauty.children ? healthBeauty.children.length : 0}):\n`);

            if (healthBeauty.children && healthBeauty.children.length > 0) {
                healthBeauty.children.forEach((subcat, index) => {
                    console.log(`${index + 1}. [${subcat.id}] ${subcat.name}`);

                    // Se ha sotto-sottocategorie
                    if (subcat.children && subcat.children.length > 0) {
                        subcat.children.forEach(subsubcat => {
                            console.log(`   └─ [${subsubcat.id}] ${subsubcat.name}`);
                        });
                    }
                });
            }

            // Salva in JSON per analisi
            const fs = require('fs');
            fs.writeFileSync(
                'bigbuy-health-beauty-tree.json',
                JSON.stringify(healthBeauty, null, 2)
            );
            console.log('\n✅ Struttura salvata in: bigbuy-health-beauty-tree.json');
        } else {
            console.log('❌ Categoria Salute | Bellezza NON trovata');
            console.log('\n📋 Categorie disponibili:');
            categories.forEach(cat => {
                console.log(`- [${cat.id}] ${cat.name}`);
            });
        }

        // Cerca anche categoria Bellezza separata
        const beauty = categories.find(cat =>
            cat.name.toLowerCase().includes('bellezza') ||
            cat.name.toLowerCase().includes('beauty')
        );

        if (beauty && beauty.id !== healthBeauty?.id) {
            console.log('\n\n🎯 TROVATA CATEGORIA SEPARATA: Bellezza\n');
            console.log(`ID: ${beauty.id}`);
            console.log(`Nome: ${beauty.name}`);
            console.log(`\n📂 SOTTOCATEGORIE (${beauty.children ? beauty.children.length : 0}):\n`);

            if (beauty.children && beauty.children.length > 0) {
                beauty.children.forEach((subcat, index) => {
                    console.log(`${index + 1}. [${subcat.id}] ${subcat.name}`);

                    if (subcat.children && subcat.children.length > 0) {
                        subcat.children.forEach(subsubcat => {
                            console.log(`   └─ [${subsubcat.id}] ${subsubcat.name}`);
                        });
                    }
                });
            }

            fs.writeFileSync(
                'bigbuy-beauty-tree.json',
                JSON.stringify(beauty, null, 2)
            );
            console.log('\n✅ Struttura salvata in: bigbuy-beauty-tree.json');
        }

    } catch (error) {
        console.error('❌ Errore chiamata API:', error.response?.data || error.message);
    }
}

fetchCategoryTree();
