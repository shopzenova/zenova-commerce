const fs = require('fs');
const path = require('path');

function analyzeCSV() {
    const csvFile = path.join(__dirname, 'bigbuy-data', 'product_2491_it.csv');
    const content = fs.readFileSync(csvFile, 'utf-8');
    const lines = content.split('\n');

    // Header
    const header = lines[0].replace(/^\uFEFF/, '').split(';'); // Rimuovi BOM

    console.log('📊 STRUTTURA CSV BIGBUY\n');
    console.log(`📁 File: product_2491_it.csv (Sport & Fitness)`);
    console.log(`📦 Totale righe: ${lines.length - 1} prodotti\n`);

    // Mostra primi 3 prodotti
    for (let i = 1; i <= 3; i++) {
        if (!lines[i]) break;

        const values = lines[i].split(';');
        const product = {};

        header.forEach((h, index) => {
            product[h] = values[index] || '';
        });

        console.log(`\n${'='.repeat(80)}`);
        console.log(`PRODOTTO #${i}`);
        console.log('='.repeat(80));

        console.log(`\n📝 INFORMAZIONI BASE:`);
        console.log(`   ID: ${product.ID}`);
        console.log(`   Nome: ${product.NAME?.substring(0, 60)}...`);
        console.log(`   Brand: ${product.BRAND}`);
        console.log(`   Categoria: ${product.CATEGORY}`);
        console.log(`   Condizione: ${product.CONDITION}`);

        console.log(`\n💰 PREZZI:`);
        console.log(`   Costo: €${product.PRICE}`);
        console.log(`   PVP BigBuy: €${product.PVP_BIGBUY}`);
        console.log(`   PVD (consigliato): €${product.PVD}`);
        console.log(`   IVA: ${product.IVA}%`);

        console.log(`\n📦 LOGISTICA:`);
        console.log(`   Stock: ${product.STOCK}`);
        console.log(`   Dimensioni: ${product.WIDTH}x${product.HEIGHT}x${product.DEPTH} cm`);
        console.log(`   Peso: ${product.WEIGHT} kg`);
        console.log(`   EAN13: ${product.EAN13}`);

        console.log(`\n🎨 VARIANTI:`);
        console.log(`   ${product.ATTRIBUTE1}: ${product.VALUE1}`);
        console.log(`   ${product.ATTRIBUTE2}: ${product.VALUE2}`);
        console.log(`   Parent SKU: ${product.PARENT_SKU}`);

        console.log(`\n📸 MEDIA:`);
        const images = [1,2,3,4,5,6,7,8].map(n => product[`IMAGE${n}`]).filter(Boolean);
        console.log(`   Immagini: ${images.length} disponibili`);
        if (images.length > 0) {
            console.log(`   Prima immagine: ${images[0]?.substring(0, 60)}...`);
        }
        if (product.VIDEO) {
            console.log(`   Video: ${product.VIDEO.substring(0, 60)}...`);
        }

        console.log(`\n📋 DESCRIZIONE:`);
        console.log(`   ${product.DESCRIPTION?.substring(0, 200)}...`);

        console.log(`\n📅 DATE:`);
        console.log(`   Aggiunto: ${product.DATE_ADD}`);
        console.log(`   Aggiornato: ${product.DATE_UPD}`);
    }

    // Statistiche generali
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 STATISTICHE GENERALI');
    console.log('='.repeat(80));

    let totalProducts = 0;
    let withImages = 0;
    let withVideo = 0;
    let inStock = 0;

    for (let i = 1; i < lines.length && i < 1000; i++) { // Analizzo primi 1000
        if (!lines[i]) continue;

        const values = lines[i].split(';');
        const product = {};
        header.forEach((h, index) => {
            product[h] = values[index] || '';
        });

        totalProducts++;
        if (product.IMAGE1) withImages++;
        if (product.VIDEO) withVideo++;
        if (parseInt(product.STOCK) > 0) inStock++;
    }

    console.log(`\n📦 Prodotti analizzati: ${totalProducts}`);
    console.log(`📸 Con immagini: ${withImages} (${(withImages/totalProducts*100).toFixed(1)}%)`);
    console.log(`🎬 Con video: ${withVideo} (${(withVideo/totalProducts*100).toFixed(1)}%)`);
    console.log(`✅ In stock: ${inStock} (${(inStock/totalProducts*100).toFixed(1)}%)`);
}

analyzeCSV();
