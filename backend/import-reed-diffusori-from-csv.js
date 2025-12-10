const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Leggi il file top-100-products.json esistente
const productsFile = path.join(__dirname, 'top-100-products.json');
let existingProducts = [];

try {
    const data = fs.readFileSync(productsFile, 'utf8');
    existingProducts = JSON.parse(data);
    console.log(`✅ Caricati ${existingProducts.length} prodotti esistenti`);
} catch (error) {
    console.log('⚠️ Nessun file prodotti esistente, creo nuovo array');
}

// Rimuovi i vecchi reed diffusori ACD-DS se esistono
const withoutOldReedDiffusers = existingProducts.filter(p => {
    const isACDDS = p.sku && p.sku.startsWith('ACD-') && p.sku.endsWith('DS');
    if (isACDDS) {
        console.log(`🗑️ Rimuovo vecchio reed diffusore: ${p.sku} - ${p.name}`);
    }
    return !isACDDS;
});

console.log(`📦 Prodotti dopo rimozione vecchi reed diffusori: ${withoutOldReedDiffusers.length}`);

const newProducts = [];
let productId = Math.max(...existingProducts.map(p => p.id || 0), 1000) + 1;

// Mappa fragranze in italiano
const fragranceTranslations = {
    'Windermere': 'Windermere',
    'Moroccan Roll': 'Roll Marocchino',
    'Clementine': 'Clementina',
    'Fell Berry': 'Frutti di Bosco',
    'Seasalt and Moss': 'Sale Marino e Muschio',
    'Japanese Bloom': 'Fiori Giapponesi',
    'Pressed Peonie': 'Peonia',
    'White Fig': 'Fico Bianco',
    'Provence': 'Provenza',
    'Citrus': 'Agrumi',
    'Rhubarb Rhubarb': 'Rabarbaro',
    'Tea & Roses': 'Tè e Rose'
};

// Leggi il CSV
const results = [];
fs.createReadStream(path.join(__dirname, 'aw-acd-ds-import.csv'))
    .pipe(csv())
    .on('data', (row) => {
        results.push(row);
    })
    .on('end', () => {
        console.log(`📊 CSV letto: ${results.length} prodotti`);

        results.forEach((row, index) => {
            const sku = row['Product code'];
            const status = row['Status'];

            // Salta prodotti non attivi
            if (status !== 'Active') {
                console.log(`⏭️ Skip prodotto non attivo: ${sku}`);
                return;
            }

            // Estrai dati
            const rawName = row['Unit Name'] || 'Diffusore con Bastoncini';
            const price = parseFloat(row['Price']) || 0;
            const rrp = parseFloat(row['Unit RRP']) || price * 2;
            const stock = row['Stock'];
            const barcode = row['Barcode'];
            const weight = parseFloat(row['Unit net weight']) || 0;
            const dimensions = row['Unit dimensions'] || '';
            const materials = row['Materials/Ingredients'] || '';

            // Estrai fragranza dal nome (es: "Box of 140ml Reed Diffuser - Windermere")
            const fragranceMatch = rawName.match(/Reed Diffuser - (.+)$/);
            const fragranceEN = fragranceMatch ? fragranceMatch[1].trim() : 'Fragranza';
            const fragranceIT = fragranceTranslations[fragranceEN] || fragranceEN;

            // Nome prodotto in italiano
            const name = `Diffusore con Bastoncini 140ml - ${fragranceIT}`;

            // Descrizione prodotto
            const description = `Diffusore per ambienti con bastoncini in legno da 140ml con fragranza ${fragranceIT}. Include bottiglia in vetro elegante e bastoncini di rattan che diffondono delicatamente l'aroma nell'ambiente. Perfetto per profumare casa, ufficio o qualsiasi spazio. Durata fino a 8-12 settimane. Senza fiamma, sicuro e decorativo.`;

            // Caratteristiche tecniche
            const features = [];
            features.push('Capacità: 140ml');
            features.push('Include bastoncini in rattan');
            features.push('Bottiglia in vetro di design');
            features.push('Durata: 8-12 settimane');
            features.push('Senza fiamma - sicuro');
            features.push('Fragranza: ' + fragranceIT);
            if (dimensions) features.push(`Dimensioni: ${dimensions}`);
            if (weight > 0) features.push(`Peso: ${Math.round(weight * 1000)}g`);
            features.push('Made in UK');

            // Immagini - mappa alle immagini locali
            const images = [];
            const mainImage = `/images/aw-products/diffusori/${sku}.jpg`;
            images.push(mainImage);

            // Immagini aggiuntive (se disponibili)
            for (let i = 2; i <= 6; i++) {
                const additionalImage = `/images/aw-products/diffusori/${sku}-${i}.jpg`;
                if (fs.existsSync(path.join(__dirname, '..', additionalImage))) {
                    images.push(additionalImage);
                }
            }

            // Determina disponibilità
            let inStock = true;
            let stockQuantity = 0;
            if (stock === 'OutofStock') {
                inStock = false;
            } else if (stock === 'Normal') {
                inStock = true;
                stockQuantity = 50;
            } else if (stock === 'Low') {
                inStock = true;
                stockQuantity = 15;
            } else if (!isNaN(parseInt(stock))) {
                stockQuantity = parseInt(stock);
                inStock = stockQuantity > 0;
            }

            // Crea oggetto prodotto Zenova
            const product = {
                id: productId++,
                sku: sku,
                name: name,
                description: description,
                shortDescription: `Diffusore ambiente 140ml con bastoncini - ${fragranceIT}`,
                price: parseFloat((price * 1.5).toFixed(2)), // Markup 50%
                compareAtPrice: parseFloat((rrp * 1.2).toFixed(2)),
                cost: price,
                rrp: rrp,
                category: 'Wellness',
                subcategory: 'diffusori',
                tags: ['diffusore', 'bastoncini', 'reed diffuser', 'profumatore', 'aromaterapia', fragranceIT.toLowerCase()],
                image: images[0],
                images: images,
                inStock: inStock,
                stockQuantity: stockQuantity,
                barcode: barcode,
                weight: weight,
                dimensions: dimensions,
                features: features,
                specifications: {
                    'Tipo': 'Diffusore con Bastoncini (Reed Diffuser)',
                    'Capacità': '140ml',
                    'Fragranza': fragranceIT,
                    'Durata': '8-12 settimane',
                    'Materiale Bottiglia': 'Vetro',
                    'Bastoncini': 'Rattan naturale',
                    'Dimensioni': dimensions || '8x6x30 cm',
                    'Peso': weight > 0 ? `${Math.round(weight * 1000)}g` : '500g',
                    'Origine': 'Regno Unito',
                    'Barcode': barcode || 'N/A'
                },
                supplier: 'AW Dropship',
                supplierSKU: sku,
                supplierFamily: 'Reed Diffusers 140ml',
                lastUpdated: new Date().toISOString()
            };

            newProducts.push(product);
            console.log(`✅ [${index + 1}/${results.length}] Importato: ${sku} - ${name} (€${product.price})`);
        });

        // Combina prodotti vecchi (senza reed diffusori ACD-DS) + nuovi reed diffusori
        const finalProducts = [...withoutOldReedDiffusers, ...newProducts];

        // Salva il file aggiornato
        fs.writeFileSync(
            productsFile,
            JSON.stringify(finalProducts, null, 2),
            'utf8'
        );

        console.log('\n✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📦 Totale prodotti nel catalogo: ${finalProducts.length}`);
        console.log(`🆕 Nuovi reed diffusori importati: ${newProducts.length}`);
        console.log(`📁 File salvato: ${productsFile}`);
        console.log('\n📋 Fragranze importate:');
        newProducts.forEach(p => {
            console.log(`   - ${p.name} (€${p.price})`);
        });
    });
