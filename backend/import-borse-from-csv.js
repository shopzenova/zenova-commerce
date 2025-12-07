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

// Rimuovi le vecchie borse JNS AW se esistono
const withoutOldBags = existingProducts.filter(p => {
    const isJNS = p.sku && (p.sku.startsWith('JNS-'));
    if (isJNS) {
        console.log(`🗑️ Rimuovo vecchia borsa: ${p.sku} - ${p.name}`);
    }
    return !isJNS;
});

console.log(`📦 Prodotti dopo rimozione vecchie borse: ${withoutOldBags.length}`);

const newProducts = [];
let productId = Math.max(...existingProducts.map(p => p.id || 0), 1000) + 1;

// Leggi il CSV
const results = [];
fs.createReadStream(path.join(__dirname, 'aw-jns-import.csv'))
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
            const name = row['Unit Name'] || 'Borsa';
            const price = parseFloat(row['Price']) || 0;
            const rrp = parseFloat(row['Unit RRP']) || price * 2;
            const stock = row['Stock'];
            const barcode = row['Barcode'];
            const weight = parseFloat(row['Unit net weight']) || 0;
            const dimensions = row['Unit dimensions'] || '';
            const materials = row['Materials/Ingredients'] || '';
            const descriptionHTML = row['Webpage description (html)'] || '';
            const descriptionPlain = row['Webpage description (plain text)'] || '';

            // Pulisci la descrizione HTML dai tag
            let description = descriptionPlain;
            if (!description && descriptionHTML) {
                description = descriptionHTML
                    .replace(/<[^>]*>/g, '') // Rimuovi tag HTML
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&rsquo;/g, "'")
                    .replace(/&ldquo;/g, '"')
                    .replace(/&rdquo;/g, '"')
                    .replace(/&amp;/g, '&')
                    .trim();
            }

            // Estrai caratteristiche tecniche
            const features = [];

            if (materials) features.push(`Materiale: ${materials}`);
            if (dimensions) features.push(`Dimensioni: ${dimensions}`);
            if (weight > 0) features.push(`Peso: ${Math.round(weight * 1000)}g`);

            features.push('Stile etnico Nepal');
            features.push('Tessuto jacquard');
            features.push('Fodera in cotone');
            features.push('Cerniere e tasche');
            features.push('Design casual');

            // Immagini - mappa alle immagini locali
            const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
            const images = [];

            // Immagine principale
            const mainImage = `/images/aw-products/borse/${sku}.jpg`;
            images.push(mainImage);

            // Immagini aggiuntive (massimo 5 totali)
            for (let i = 2; i <= 6; i++) {
                const additionalImage = `/images/aw-products/borse/${sku}-${i}.jpg`;
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
                stockQuantity = 50; // Stima per "Normal"
            } else if (!isNaN(parseInt(stock))) {
                stockQuantity = parseInt(stock);
                inStock = stockQuantity > 0;
            }

            // Crea oggetto prodotto Zenova
            const product = {
                id: productId++,
                sku: sku,
                name: name,
                description: description.substring(0, 500), // Limita lunghezza
                shortDescription: `Borsa casual stile Nepal in tessuto jacquard`,
                price: parseFloat((price * 1.5).toFixed(2)), // Markup 50%
                compareAtPrice: parseFloat((rrp * 1.2).toFixed(2)),
                cost: price,
                rrp: rrp,
                category: 'Wellness',
                subcategory: 'vestiario-wellness',
                tags: ['borsa', 'zaino', 'nepal', 'jacquard', 'casual', 'etnico'],
                image: images[0],
                images: images,
                inStock: inStock,
                stockQuantity: stockQuantity,
                barcode: barcode,
                weight: weight,
                dimensions: dimensions,
                features: features,
                specifications: {
                    'Tipo': 'Borsa casual',
                    'Stile': 'Nepal - Etnico',
                    'Materiale': materials || 'Cotone',
                    'Dimensioni': dimensions || 'N/A',
                    'Peso': weight > 0 ? `${Math.round(weight * 1000)}g` : 'N/A',
                    'Fodera': 'Cotone',
                    'Chiusura': 'Cerniera',
                    'Tasche': 'Multiple',
                    'Barcode': barcode || 'N/A'
                },
                supplier: 'AW Dropship',
                supplierSKU: sku,
                lastUpdated: new Date().toISOString()
            };

            newProducts.push(product);
            console.log(`✅ [${index + 1}/${results.length}] Importato: ${sku} - ${name} (€${product.price})`);
        });

        // Combina prodotti vecchi (senza borse JNS AW) + nuove borse
        const finalProducts = [...withoutOldBags, ...newProducts];

        // Salva il file aggiornato
        fs.writeFileSync(
            productsFile,
            JSON.stringify(finalProducts, null, 2),
            'utf8'
        );

        console.log('\n✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📦 Totale prodotti nel catalogo: ${finalProducts.length}`);
        console.log(`🆕 Nuove borse importate: ${newProducts.length}`);
        console.log(`📁 File salvato: ${productsFile}`);
    });
