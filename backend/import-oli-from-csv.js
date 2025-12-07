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

// Rimuovi i vecchi oli essenziali AW se esistono
const withoutOldEssentialOils = existingProducts.filter(p => {
    const isAWEO = p.sku && (p.sku.startsWith('EO-') || p.sku.startsWith('EOBND-'));
    if (isAWEO) {
        console.log(`🗑️ Rimuovo vecchio olio essenziale: ${p.sku} - ${p.name}`);
    }
    return !isAWEO;
});

console.log(`📦 Prodotti dopo rimozione vecchi oli essenziali: ${withoutOldEssentialOils.length}`);

const newProducts = [];
let productId = Math.max(...existingProducts.map(p => p.id || 0), 1000) + 1;

// Leggi il CSV
const results = [];
fs.createReadStream(path.join(__dirname, 'aw-eo-import.csv'))
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
            const name = row['Unit Name'] || 'Olio Essenziale';
            const price = parseFloat(row['Price']) || 0;
            const rrp = parseFloat(row['Unit RRP']) || price * 2;
            const stock = row['Stock'];
            const barcode = row['Barcode'];
            const weight = parseFloat(row['Unit net weight']) || 0;
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

            // Estrai caratteristiche tecniche dalla descrizione HTML
            const features = [];

            const latinNameMatch = descriptionHTML.match(/<strong>Latin Name\s*:?\s*<\/strong>\s*([^<]+)/i);
            const partOfPlantMatch = descriptionHTML.match(/<strong>Part[^<]*Used\s*:?\s*<\/strong>\s*([^<]+)/i);
            const sourceMatch = descriptionHTML.match(/<strong>Source\s*:?\s*<\/strong>\s*([^<]+)/i);
            const extractionMatch = descriptionHTML.match(/<strong>Extraction Method\s*:?\s*<\/strong>\s*([^<]+)/i);

            if (latinNameMatch) features.push(`Nome botanico: ${latinNameMatch[1].trim()}`);
            if (partOfPlantMatch) features.push(`Parte utilizzata: ${partOfPlantMatch[1].trim()}`);
            if (sourceMatch) features.push(`Origine: ${sourceMatch[1].trim()}`);
            if (extractionMatch) features.push(`Metodo: ${extractionMatch[1].trim()}`);

            features.push('Volume: 10ml');
            features.push('100% Puro e Naturale');
            if (weight > 0) {
                features.push(`Peso: ${Math.round(weight * 1000)}g`);
            }

            // Immagini - mappa alle immagini locali
            const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
            const images = [];

            // Immagine principale
            const mainImage = `/images/aw-products/oli-essenziali/${sku}.jpg`;
            images.push(mainImage);

            // Immagini aggiuntive (massimo 5 totali)
            for (let i = 2; i <= 6; i++) {
                const additionalImage = `/images/aw-products/oli-essenziali/${sku}-${i}.jpg`;
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
                shortDescription: `Olio essenziale puro 100% naturale - 10ml`,
                price: parseFloat((price * 1.5).toFixed(2)), // Markup 50%
                compareAtPrice: parseFloat((rrp * 1.2).toFixed(2)),
                cost: price,
                rrp: rrp,
                category: 'Aromatherapy',
                subcategory: 'oli-essenziali',
                tags: ['olio essenziale', 'aromaterapia', 'naturale', 'puro', '10ml'],
                image: images[0],
                images: images,
                inStock: inStock,
                stockQuantity: stockQuantity,
                barcode: barcode,
                weight: weight,
                dimensions: '10ml',
                features: features,
                specifications: {
                    'Volume': '10ml',
                    'Purezza': '100% puro',
                    'Tipo': 'Olio essenziale',
                    'Nome botanico': latinNameMatch ? latinNameMatch[1].trim() : 'N/A',
                    'Parte della pianta': partOfPlantMatch ? partOfPlantMatch[1].trim() : 'N/A',
                    'Origine': sourceMatch ? sourceMatch[1].trim() : 'N/A',
                    'Metodo di estrazione': extractionMatch ? extractionMatch[1].trim() : 'N/A',
                    'Ingredienti': materials || 'Olio essenziale puro',
                    'Peso': weight > 0 ? `${Math.round(weight * 1000)}g` : 'N/A',
                    'Barcode': barcode || 'N/A'
                },
                supplier: 'AW Dropship',
                supplierSKU: sku,
                lastUpdated: new Date().toISOString()
            };

            newProducts.push(product);
            console.log(`✅ [${index + 1}/${results.length}] Importato: ${sku} - ${name} (€${product.price})`);
        });

        // Combina prodotti vecchi (senza oli essenziali AW) + nuovi oli essenziali
        const finalProducts = [...withoutOldEssentialOils, ...newProducts];

        // Salva il file aggiornato
        fs.writeFileSync(
            productsFile,
            JSON.stringify(finalProducts, null, 2),
            'utf8'
        );

        console.log('\n✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📦 Totale prodotti nel catalogo: ${finalProducts.length}`);
        console.log(`🆕 Nuovi oli essenziali importati: ${newProducts.length}`);
        console.log(`📁 File salvato: ${productsFile}`);
    });
