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

            // Estrai informazioni botaniche
            const latinNameMatch = descriptionHTML.match(/<strong>Latin Name\s*:?\s*<\/strong>\s*([^<]+)/i);
            const partOfPlantMatch = descriptionHTML.match(/<strong>Part[^<]*Used\s*:?\s*<\/strong>\s*([^<]+)/i);
            const sourceMatch = descriptionHTML.match(/<strong>Source\s*:?\s*<\/strong>\s*([^<]+)/i);
            const extractionMatch = descriptionHTML.match(/<strong>Extraction Method\s*:?\s*<\/strong>\s*([^<]+)/i);

            // Aggiungi informazioni botaniche alle features
            if (latinNameMatch) {
                features.push(`Nome botanico: ${latinNameMatch[1].trim()}`);
            }
            if (partOfPlantMatch) {
                features.push(`Parte utilizzata: ${partOfPlantMatch[1].trim()}`);
            }
            if (sourceMatch) {
                features.push(`Origine: ${sourceMatch[1].trim()}`);
            }
            if (extractionMatch) {
                features.push(`Metodo di estrazione: ${extractionMatch[1].trim()}`);
            }

            // Aggiungi volume standard
            features.push('Volume: 10ml');
            features.push('100% Puro e Naturale');

            // Immagini - mappa alle immagini locali
            const imageUrls = row['Images'] ? row['Images'].split(',').map(url => url.trim()) : [];
            const images = [];

            // Immagine principale
            const mainImage = `/images/aw-products/oli-essenziali/${sku}.jpg`;
            images.push(mainImage);

            // Specifiche tecniche dettagliate
            const specifications = {
                volume: '10ml',
                purity: '100% puro',
                type: 'Olio essenziale',
                barcode: barcode || 'N/A'
            };

            if (latinNameMatch) {
                specifications['nome_botanico'] = latinNameMatch[1].trim();
            }
            if (partOfPlantMatch) {
                specifications['parte_pianta'] = partOfPlantMatch[1].trim();
            }
            if (sourceMatch) {
                specifications['origine'] = sourceMatch[1].trim();
            }
            if (extractionMatch) {
                specifications['estrazione'] = extractionMatch[1].trim();
            }
            if (materials) {
                specifications['ingredienti'] = materials;
            }
            if (weight > 0) {
                specifications['peso_netto'] = `${Math.round(weight * 1000)}g`;
            }

            // Calcola prezzi con markup
            const costPrice = price;
            const sellingPrice = parseFloat((costPrice * 1.5).toFixed(2));

            // Determina quantità stock
            let stockQuantity = 50; // Default
            if (stock === 'Normal') {
                stockQuantity = 50;
            } else if (stock && !isNaN(parseInt(stock))) {
                stockQuantity = parseInt(stock);
            }

            // Crea il prodotto
            const product = {
                id: productId++,
                sku: sku,
                name: name,
                description: description.substring(0, 500), // Limita descrizione
                price: sellingPrice,
                cost: costPrice,
                rrp: rrp,
                category: 'Aromatherapy',
                subcategory: 'oli-essenziali',
                zenovaSubcategory: 'oli-essenziali',
                zenovaCategory: 'aromatherapy',
                zenovaCategories: ['aromatherapy'],
                images: images,
                features: features,
                specifications: specifications,
                stock: stockQuantity,
                inStock: stockQuantity > 0,
                supplier: 'AW Dropship',
                supplierFamily: 'Essential Oils (EO)',
                barcode: barcode
            };

            newProducts.push(product);
            console.log(`✅ ${sku} - ${name} - €${sellingPrice}`);
        });

        // Unisci prodotti vecchi e nuovi
        const allProducts = [...withoutOldEssentialOils, ...newProducts];

        // Salva
        fs.writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));

        console.log('\n✅ IMPORTAZIONE COMPLETATA!');
        console.log(`📦 Totale prodotti: ${allProducts.length}`);
        console.log(`🌿 Nuovi oli essenziali importati: ${newProducts.length}`);
        console.log(`💾 File salvato: ${productsFile}`);
    });
