const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Traduzioni manuali per i nomi dei diffusori
const translations = {
    'Lavender & Fennel': 'Lavanda e Finocchio',
    'Lemon & Nutmeg': 'Limone e Noce Moscata',
    'Cinnamon & Clove': 'Cannella e Chiodi di Garofano',
    'Patchouli': 'Patchouli',
    'Lime & Ginger': 'Lime e Zenzero',
    'Petitgrain & Rosewood': 'Petitgrain e Legno di Rosa',
    'Sage & Rosemary': 'Salvia e Rosmarino',
    'Ylang Ylang & Mandarin': 'Ylang Ylang e Mandarino',
    'Lemon Verbena': 'Verbena al Limone',
    'Geranium & Rose': 'Geranio e Rosa',
    'Basil & Maychang': 'Basilico e Maychang',
    'Peppermint & Frankincense': 'Menta Piperita e Incenso'
};

// Traduzione descrizione HTML generica
function translateDescription(englishName, italianName) {
    return `<p>Gli oli puri di piante, erbe e alberi sono stati usati per migliaia di anni per sedurre, incantare e guarire. Ora puoi liberare l'antica magia e il potere degli oli aromatici nella tua casa.</p>
<p>Questo elegante <strong>Diffusore a Bastoncini con Olio Essenziale ${italianName}</strong> contiene solo oli essenziali naturali (in base di olio minerale) per incantare e deliziare la tua famiglia e i tuoi amici.</p>
<p>Lentamente e delicatamente l'aroma salirà lungo i bastoncini e riempirà qualsiasi stanza con una fragranza deliziosa e veramente aromatica. L'aroma può durare fino a 12 settimane.</p>
<p>Rimuovere tutto l'imballaggio prima dell'uso. Basta aprire il coperchio, rimuovere il tappo e inserire i bastoncini di rattan indonesiano nel collo. Opzionalmente, una volta che i bastoncini hanno assorbito l'olio, girarli e reinserirli nel barattolo di vetro con l'estremità imbevuta di olio esposta per un rilascio più rapido della fragranza.</p>
<p><strong>Speriamo che tu possa goderti la tua avventura aromatica!</strong></p>`;
}

// Traduzione descrizione plain text
function translatePlainDescription(italianName) {
    return `Gli oli puri di piante, erbe e alberi sono stati usati per migliaia di anni per sedurre, incantare e guarire. Ora puoi liberare l'antica magia e il potere degli oli aromatici nella tua casa. Questo elegante Diffusore a Bastoncini con Olio Essenziale ${italianName} contiene solo oli essenziali naturali (in base di olio minerale) per incantare e deliziare la tua famiglia e i tuoi amici. Lentamente e delicatamente l'aroma salirà lungo i bastoncini e riempirà qualsiasi stanza con una fragranza deliziosa e veramente aromatica. L'aroma può durare fino a 12 settimane. Rimuovere tutto l'imballaggio prima dell'uso. Basta aprire il coperchio, rimuovere il tappo e inserire i bastoncini di rattan indonesiano nel collo. Opzionalmente, una volta che i bastoncini hanno assorbito l'olio, girarli e reinserirli nel barattolo di vetro con l'estremità imbevuta di olio esposta per un rilascio più rapido della fragranza. Speriamo che tu possa goderti la tua avventura aromatica!`;
}

async function importDiffusori() {
    const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20260104.csv';
    const productsPath = path.join(__dirname, 'data/products.json');
    const uploadsDir = path.join(__dirname, '../uploads');

    // Carica prodotti esistenti
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`📦 Prodotti esistenti: ${products.length}`);

    const newProducts = [];
    const imageSourceDir = 'C:\\Users\\giorg\\Downloads';

    // Crea directory uploads se non esiste
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => {
                console.log(`\n📋 CSV letto: ${rows.length} prodotti\n`);

                rows.forEach((row, index) => {
                    const sku = row['Product code'];
                    const englishName = row['Unit Name'];
                    const price = parseFloat(row['Price']);
                    const rrp = parseFloat(row['Unit RRP']);
                    const stock = parseInt(row['Available Quantity']);
                    const barcode = row['Barcode'];
                    const weight = parseFloat(row['Unit net weight']);
                    const materials = row['Materials/Ingredients'];
                    const descriptionHtml = row['Webpage description (html)'];
                    const imagesUrls = row['Images'].split(', ');

                    // Estrai nome fragranza
                    const match = englishName.match(/200ml (.+?) Essential Oil Reed Diffuser/);
                    const fragranceName = match ? match[1] : englishName;
                    const italianFragrance = translations[fragranceName] || fragranceName;

                    // Nome italiano completo
                    const italianName = `Diffusore a Bastoncini Olio Essenziale ${italianFragrance} 200ml`;

                    // Copia immagini locali
                    const productImages = [];
                    const imageFiles = fs.readdirSync(imageSourceDir).filter(f =>
                        f.toLowerCase().startsWith(sku.toLowerCase()) && f.endsWith('.jpeg')
                    );

                    imageFiles.forEach((imgFile, imgIndex) => {
                        const sourcePath = path.join(imageSourceDir, imgFile);
                        const destFilename = `${sku.toLowerCase()}-${imgIndex + 1}.jpeg`;
                        const destPath = path.join(uploadsDir, destFilename);

                        // Copia immagine
                        fs.copyFileSync(sourcePath, destPath);
                        productImages.push(`/uploads/${destFilename}`);
                    });

                    // Crea prodotto
                    const product = {
                        id: `aw-${sku.toLowerCase()}`,
                        sku: sku,
                        name: italianName,
                        price: price,
                        originalPrice: rrp,
                        category: 'natural-wellness',
                        subcategory: 'diffusori-oli',
                        supplier: 'aw-dropship',
                        stock: stock,
                        images: productImages,
                        description: translateDescription(fragranceName, italianFragrance),
                        shortDescription: translatePlainDescription(italianFragrance),
                        barcode: barcode,
                        weight: weight,
                        materials: materials,
                        featured: false,
                        visibility: 'visible',
                        tags: ['diffusore', 'oli essenziali', 'aromaterapia', 'natural wellness', italianFragrance.toLowerCase()],
                        metadata: {
                            volume: '200ml',
                            duration: '12 settimane',
                            origin: 'GBR',
                            includes: 'Bastoncini di rattan indonesiano inclusi'
                        }
                    };

                    newProducts.push(product);

                    console.log(`✅ ${index + 1}. ${italianName}`);
                    console.log(`   SKU: ${sku} | Prezzo: €${price} | Stock: ${stock}`);
                    console.log(`   Immagini: ${productImages.length}`);
                });

                // Aggiungi nuovi prodotti
                products.push(...newProducts);

                // Salva products.json
                fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

                console.log(`\n✅ Importazione completata!`);
                console.log(`📦 Totale prodotti: ${products.length} (+${newProducts.length})`);
                console.log(`🖼️  Immagini copiate in: ${uploadsDir}`);

                resolve();
            })
            .on('error', reject);
    });
}

importDiffusori().catch(console.error);
