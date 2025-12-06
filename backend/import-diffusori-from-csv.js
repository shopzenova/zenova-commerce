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

// Rimuovi i vecchi diffusori AW se esistono
const withoutOldDiffusers = existingProducts.filter(p => {
    const isAWDiffuser = p.sku && p.sku.startsWith('AATOM-');
    if (isAWDiffuser) {
        console.log(`🗑️ Rimuovo vecchio diffusore: ${p.sku} - ${p.name}`);
    }
    return !isAWDiffuser;
});

console.log(`📦 Prodotti dopo rimozione vecchi diffusori: ${withoutOldDiffusers.length}`);

const newProducts = [];
let productId = Math.max(...existingProducts.map(p => p.id || 0), 1000) + 1;

// Leggi il CSV
const results = [];
fs.createReadStream(path.join(__dirname, 'aw-diffusori-import.csv'))
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
            const name = row['Unit Name'] || 'Diffusore';
            const price = parseFloat(row['Price']) || 0;
            const rrp = parseFloat(row['Unit RRP']) || price * 2;
            const stock = row['Stock'];
            const barcode = row['Barcode'];
            const weight = parseFloat(row['Unit net weight']) || 0;
            const dimensions = row['Unit dimensions'] || '';
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
                    .trim();
            }

            // Estrai caratteristiche tecniche dalla descrizione
            const features = [];
            const tankMatch = description.match(/Tank Capacity (\d+ml)/i);
            const ledMatch = description.match(/LED light - (\d+)pcs/i);
            const timerMatch = description.match(/timer (\d+-\d+h)/i);
            const heightMatch = dimensions.match(/(\d+\.?\d*)x(\d+\.?\d*)/);

            if (tankMatch) features.push(`Capacità serbatoio: ${tankMatch[1]}`);
            if (ledMatch) features.push(`LED: ${ledMatch[1]} colori`);
            if (timerMatch) features.push(`Timer: ${timerMatch[1]}`);
            features.push('Alimentazione USB');
            features.push('Spegnimento automatico');
            features.push('Ultrasuoni silenziosi');
            if (heightMatch) {
                features.push(`Dimensioni: ${heightMatch[1]}x${heightMatch[2]} cm`);
            }
            if (weight > 0) {
                features.push(`Peso: ${Math.round(weight * 1000)}g`);
            }

            // Immagini - mappa alle immagini locali
            const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
            const images = [];

            // Immagine principale
            const mainImage = `/images/aw-products/diffusori/${sku}.jpg`;
            images.push(mainImage);

            // Immagini aggiuntive (massimo 5 totali)
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
                shortDescription: `Diffusore di aromi ultrasonico con cambio colore LED e timer`,
                price: parseFloat((price * 1.5).toFixed(2)), // Markup 50%
                compareAtPrice: parseFloat((rrp * 1.2).toFixed(2)),
                cost: price,
                rrp: rrp,
                category: 'Aromatherapy',
                subcategory: 'diffusori',
                tags: ['diffusore', 'aromaterapia', 'USB', 'LED', 'ultrasuoni'],
                image: images[0],
                images: images,
                inStock: inStock,
                stockQuantity: stockQuantity,
                barcode: barcode,
                weight: weight,
                dimensions: dimensions,
                features: features,
                specifications: {
                    'Capacità': tankMatch ? tankMatch[1] : 'N/A',
                    'Alimentazione': 'USB',
                    'LED': ledMatch ? `${ledMatch[1]} colori` : 'Multicolore',
                    'Timer': timerMatch ? timerMatch[1] : 'Spegnimento automatico',
                    'Peso': weight > 0 ? `${Math.round(weight * 1000)}g` : 'N/A',
                    'Dimensioni': dimensions || 'N/A',
                    'Materiale': 'Plastica',
                    'Origine': 'Cina'
                },
                supplier: 'AW Dropship',
                supplierSKU: sku,
                lastUpdated: new Date().toISOString()
            };

            newProducts.push(product);
            console.log(`✅ [${index + 1}/${results.length}] Importato: ${sku} - ${name} (€${product.price})`);
        });

        // Combina prodotti vecchi (senza diffusori AW) + nuovi diffusori
        const finalProducts = [...withoutOldDiffusers, ...newProducts];

        // Salva il file aggiornato
        fs.writeFileSync(
            productsFile,
            JSON.stringify(finalProducts, null, 2),
            'utf8'
        );

        console.log('\n✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📦 Totale prodotti nel catalogo: ${finalProducts.length}`);
        console.log(`🆕 Nuovi diffusori importati: ${newProducts.length}`);
        console.log(`📁 File salvato: ${productsFile}`);
    });
