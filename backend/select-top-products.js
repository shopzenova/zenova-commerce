const fs = require('fs');
const path = require('path');

// Keywords per categorie Zenova
const ZENOVA_KEYWORDS = {
    benessere: ['diffusor', 'aroma', 'oli essenzial', 'relax', 'massaggi', 'benessere', 'meditazione', 'yoga', 'wellness', 'spa'],
    smartHome: ['led', 'lampada', 'luce', 'smart', 'illuminazione', 'strip led', 'lampadina', 'faretto', 'applique'],
    design: ['design', 'decorazione', 'modern', 'minimal', 'elegante', 'stile', 'arredo']
};

// Funzione per parsare CSV con ; come separatore
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current.trim());
    return fields;
}

function analyzeProducts() {
    console.log('🔍 RICERCA TOP 100 PRODOTTI ZENOVA\n');

    const dataDir = path.join(__dirname, 'bigbuy-data');

    // File da analizzare (focus su categorie Zenova)
    const files = [
        { name: 'product_2501_it.csv', category: 'Health & Beauty', priority: 1 },
        { name: 'product_2399_it.csv', category: 'Home & Garden', priority: 2 },
        { name: 'product_2507_it.csv', category: 'Tech & Electronics', priority: 3 }
    ];

    const allProducts = [];

    for (const fileInfo of files) {
        console.log(`📂 Analizzando: ${fileInfo.name} (${fileInfo.category})...`);

        const filePath = path.join(dataDir, fileInfo.name);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Header (rimuovi BOM se presente)
        const headerLine = lines[0].replace(/^\uFEFF/, '');
        const header = parseCSVLine(headerLine);

        let matched = 0;

        // Analizza prodotti
        for (let i = 1; i < lines.length && i < 10000; i++) { // Prime 10k per file
            if (!lines[i] || lines[i].trim() === '') continue;

            const values = parseCSVLine(lines[i]);
            const product = {};

            header.forEach((h, index) => {
                product[h] = values[index] || '';
            });

            // Pulizia nome e descrizione
            const name = product.NAME?.replace(/^"(.*)"$/, '$1').toLowerCase() || '';
            const desc = product.DESCRIPTION?.toLowerCase() || '';
            const fullText = name + ' ' + desc;

            // Filtra per keywords Zenova
            let matchScore = 0;
            let matchedCategories = [];

            for (const [cat, keywords] of Object.entries(ZENOVA_KEYWORDS)) {
                for (const keyword of keywords) {
                    if (fullText.includes(keyword)) {
                        matchScore += (cat === 'benessere' || cat === 'smartHome') ? 3 : 1;
                        if (!matchedCategories.includes(cat)) {
                            matchedCategories.push(cat);
                        }
                    }
                }
            }

            if (matchScore === 0) continue; // Skip se non matcha

            // Parse numeri
            const price = parseFloat(product.PRICE?.replace(',', '.') || '0');
            const pvd = parseFloat(product.PVD?.replace(',', '.') || '0');
            const stock = parseInt(product.STOCK || '0');

            // Filtra per qualità
            if (stock <= 0) continue; // Deve essere in stock
            if (price < 5 || price > 200) continue; // Prezzo ragionevole
            if (!product.IMAGE1) continue; // Deve avere almeno 1 immagine

            // Conta immagini
            const imageCount = [1,2,3,4,5,6,7,8]
                .map(n => product[`IMAGE${n}`])
                .filter(img => img && img.trim() !== '').length;

            if (imageCount < 2) continue; // Almeno 2 immagini

            // Calcola score finale
            let finalScore = matchScore * 10;
            finalScore += imageCount * 5; // Più immagini = meglio
            finalScore += (stock > 10) ? 10 : stock; // Stock alto = meglio
            finalScore += (product.BRAND && product.BRAND.trim() !== '') ? 5 : 0;
            finalScore += fileInfo.priority === 1 ? 20 : 0; // Priorità Health & Beauty

            // Margine
            const margin = pvd > 0 ? ((pvd - price) / price * 100) : 0;
            if (margin > 30) finalScore += 15; // Buon margine

            allProducts.push({
                id: product.ID,
                name: product.NAME?.replace(/^"(.*)"$/, '$1'),
                description: product.DESCRIPTION?.replace(/^"(.*)"$/, '$1'),
                brand: product.BRAND,
                category: fileInfo.category,
                zenovaCategories: matchedCategories,
                price: price,
                pvd: pvd,
                margin: margin.toFixed(1),
                stock: stock,
                imageCount: imageCount,
                images: [1,2,3,4,5,6,7,8]
                    .map(n => product[`IMAGE${n}`])
                    .filter(img => img && img.trim() !== ''),
                video: product.VIDEO,
                ean: product.EAN13,
                width: product.WIDTH,
                height: product.HEIGHT,
                depth: product.DEPTH,
                weight: product.WEIGHT,
                score: finalScore,
                raw: product
            });

            matched++;
        }

        console.log(`   ✅ Trovati ${matched} prodotti compatibili\n`);
    }

    // Ordina per score e prendi top 100
    allProducts.sort((a, b) => b.score - a.score);
    const top100 = allProducts.slice(0, 100);

    console.log('🎯 TOP 100 PRODOTTI SELEZIONATI!\n');

    // Statistiche
    const categories = {};
    top100.forEach(p => {
        p.zenovaCategories.forEach(cat => {
            categories[cat] = (categories[cat] || 0) + 1;
        });
    });

    console.log('📊 DISTRIBUZIONE CATEGORIE:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} prodotti`);
    });

    const avgPrice = (top100.reduce((sum, p) => sum + p.price, 0) / top100.length).toFixed(2);
    const avgMargin = (top100.reduce((sum, p) => sum + parseFloat(p.margin), 0) / top100.length).toFixed(1);

    console.log(`\n💰 PREZZI:`);
    console.log(`   Media: €${avgPrice}`);
    console.log(`   Margine medio: ${avgMargin}%`);

    console.log(`\n📸 MEDIA:`);
    console.log(`   Immagini medie: ${(top100.reduce((sum, p) => sum + p.imageCount, 0) / 100).toFixed(1)}`);

    // Salva risultati
    const outputFile = path.join(__dirname, 'top-100-products.json');
    fs.writeFileSync(outputFile, JSON.stringify(top100, null, 2), 'utf-8');

    console.log(`\n💾 Salvati in: ${outputFile}`);

    // Mostra primi 5
    console.log('\n📋 ANTEPRIMA TOP 5:\n');
    top100.slice(0, 5).forEach((p, i) => {
        console.log(`${i+1}. ${p.name?.substring(0, 60)}`);
        console.log(`   Categoria: ${p.category} | Zenova: ${p.zenovaCategories.join(', ')}`);
        console.log(`   Prezzo: €${p.price} → €${p.pvd} (margine ${p.margin}%)`);
        console.log(`   Stock: ${p.stock} | Immagini: ${p.imageCount} | Score: ${p.score}`);
        console.log('');
    });

    return top100;
}

analyzeProducts();
