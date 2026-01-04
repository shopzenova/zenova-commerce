const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Traduzioni comuni
const fragranceTranslations = {
    'White Sage': 'Salvia Bianca',
    'Palo Santo': 'Palo Santo',
    'Citronella': 'Citronella',
    'Coconut & Mango': 'Cocco e Mango',
    'Sandalwood': 'Sandalo',
    'Lavender': 'Lavanda',
    'Rose': 'Rosa',
    'Jasmine': 'Gelsomino',
    'Frankincense': 'Incenso',
    'Myrrh': 'Mirra',
    'Dragon Blood': 'Sangue di Drago',
    'Nag Champa': 'Nag Champa',
    'Patchouli': 'Patchouli',
    'Vanilla': 'Vaniglia',
    'Cinnamon': 'Cannella',
    'Cedar': 'Cedro',
    'Pine': 'Pino',
    'Eucalyptus': 'Eucalipto',
    'Lemongrass': 'Citronella',
    'Opium': 'Oppio',
    'Lotus': 'Loto',
    'Ylang Ylang': 'Ylang Ylang',
    'Amber': 'Ambra',
    'Musk': 'Muschio',
    'Strawberry': 'Fragola',
    'Cherry': 'Ciliegia',
    'Apple': 'Mela',
    'Ocean': 'Oceano',
    'Rain': 'Pioggia',
    'Forest': 'Foresta',
    'Meditation': 'Meditazione',
    'Relaxation': 'Relax',
    'Energy': 'Energia',
    'Positive Vibes': 'Vibrazioni Positive',
    'Good Luck': 'Buona Fortuna',
    'Money': 'Denaro',
    'Love': 'Amore',
    'Peace': 'Pace',
    'Harmony': 'Armonia',
    'Balance': 'Equilibrio'
};

// Funzione per tradurre il nome del prodotto
function translateProductName(englishName) {
    let italianName = englishName;

    // Sostituisci le fragranze
    Object.entries(fragranceTranslations).forEach(([en, it]) => {
        const regex = new RegExp(en, 'gi');
        italianName = italianName.replace(regex, it);
    });

    // Sostituisci termini comuni
    italianName = italianName
        .replace(/Backflow (Dhoop )?Incense Cones?/gi, 'Coni Incenso a Riflusso')
        .replace(/Dhoop Cones?/gi, 'Coni Incenso')
        .replace(/Masala Backflow Incense/gi, 'Incenso Masala a Riflusso')
        .replace(/pack of (\d+)/gi, 'confezione da $1')
        .replace(/Pack/gi, 'Confezione')
        .replace(/(\d+)pcs/gi, '$1 pezzi');

    return italianName;
}

// Funzione per tradurre descrizione HTML
function translateDescription(html, productName) {
    if (!html) {
        return `<p>I coni di incenso a riflusso <strong>${productName}</strong> creano un affascinante effetto cascata di fumo quando usati con un bruciatore a riflusso.</p>
<p>Realizzati a mano con ingredienti naturali di alta qualità, questi coni offrono una fragranza duratura che riempirà il tuo spazio con un'atmosfera rilassante.</p>
<p><strong>Benefici dell'incenso a riflusso:</strong></p>
<ul>
<li>Crea un effetto visivo ipnotico con il fumo che scende a cascata</li>
<li>Purifica l'aria e rimuove le energie negative</li>
<li>Favorisce il rilassamento e la meditazione</li>
<li>Perfetto per yoga, spa e momenti di benessere</li>
</ul>
<p><strong>Modalità d'uso:</strong> Posiziona il cono sulla sommità del bruciatore a riflusso, accendi la punta e lascia bruciare per qualche secondo prima di spegnere la fiamma. Il fumo scenderà creando un bellissimo effetto cascata.</p>`;
    }

    let italianHtml = html;

    // Traduci frasi comuni
    italianHtml = italianHtml
        .replace(/Get ready to spice up your incense collection/gi, 'Arricchisci la tua collezione di incensi')
        .replace(/brand-new/gi, 'nuovissimo')
        .replace(/Inside each pack/gi, 'All\'interno di ogni confezione')
        .replace(/Backflow Incense Cones/gi, 'Coni Incenso a Riflusso')
        .replace(/shaped like a hexagon/gi, 'a forma di esagono')
        .replace(/Embark on a sensory journey/gi, 'Intraprendi un viaggio sensoriale')
        .replace(/tropical paradise/gi, 'paradiso tropicale')
        .replace(/sweet and fruity blend/gi, 'miscela dolce e fruttata')
        .replace(/Light this incense to/gi, 'Accendi questo incenso per')
        .replace(/infuse your space/gi, 'infondere nel tuo spazio')
        .replace(/vacation-like vibe/gi, 'atmosfera vacanziera')
        .replace(/perfect for adding/gi, 'perfetto per aggiungere')
        .replace(/touch of summer/gi, 'tocco d\'estate')
        .replace(/to your environment/gi, 'al tuo ambiente')
        .replace(/Beautifully scented/gi, 'Splendidamente profumato')
        .replace(/backflow incense cones/gi, 'coni incenso a riflusso')
        .replace(/developed by/gi, 'sviluppato da')
        .replace(/available for dropshippers/gi, 'disponibile per dropshipper')
        .replace(/crafted using the highest quality ingredients/gi, 'realizzato con ingredienti di altissima qualità')
        .replace(/to offer long lasting fragrance/gi, 'per offrire una fragranza duratura')
        .replace(/let it fill the room up/gi, 'lascia che riempia la stanza')
        .replace(/release a beautiful aroma/gi, 'rilasciare un aroma meraviglioso')
        .replace(/Use these cones with a/gi, 'Usa questi coni con un')
        .replace(/backflow incense burner/gi, 'bruciatore incenso a riflusso')
        .replace(/to create stunning smoke displays/gi, 'per creare spettacolari effetti di fumo')
        .replace(/Benefits of/gi, 'Benefici di')
        .replace(/Remove negative energies/gi, 'Rimuovi le energie negative')
        .replace(/from people, places & objects/gi, 'da persone, luoghi e oggetti')
        .replace(/Amazing way to/gi, 'Modo straordinario per')
        .replace(/cleanse your Crystals/gi, 'purificare i tuoi Cristalli')
        .replace(/Used in spiritual ceremonies/gi, 'Usato in cerimonie spirituali')
        .replace(/add an extra boost to the ritual/gi, 'dare una spinta extra al rituale')
        .replace(/Believed to/gi, 'Si ritiene che')
        .replace(/uplift moods/gi, 'migliorare l\'umore')
        .replace(/relieves stress & anxiety/gi, 'alleviare stress e ansia');

    // Traduci fragranze
    Object.entries(fragranceTranslations).forEach(([en, it]) => {
        const regex = new RegExp(en, 'gi');
        italianHtml = italianHtml.replace(regex, it);
    });

    return italianHtml;
}

async function importIncensi() {
    const csvPath = 'C:\\Users\\giorg\\Downloads\\portfolio_data_feed_cdeu-000774-dssk_20260104 (1).csv';
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
            .on('data', (row) => {
                // Solo prodotti attivi
                if (row['Status'] === 'Active') {
                    rows.push(row);
                }
            })
            .on('end', () => {
                console.log(`\n📋 CSV letto: ${rows.length} prodotti attivi\n`);

                rows.forEach((row, index) => {
                    const sku = row['Product code'];
                    const englishName = row['Unit Name'];
                    const price = parseFloat(row['Price']);
                    const rrp = parseFloat(row['Unit RRP']);
                    const stock = parseInt(row['Available Quantity']);
                    const barcode = row['Barcode'];
                    const weight = parseFloat(row['Unit net weight']);
                    const materials = row['Materials/Ingredients'] || 'Incenso Naturale';
                    const descriptionHtml = row['Webpage description (html)'];
                    const descriptionPlain = row['Webpage description (plain text)'];

                    // Traduzione nome
                    const italianName = translateProductName(englishName);

                    // Traduzione descrizione
                    const italianDescription = translateDescription(descriptionHtml, italianName);
                    const italianShortDesc = descriptionPlain ? translateDescription(descriptionPlain, italianName).replace(/<[^>]*>/g, '') : italianDescription.replace(/<[^>]*>/g, '').substring(0, 300) + '...';

                    // Copia immagini locali
                    const productImages = [];
                    const skuLower = sku.toLowerCase();
                    const imageFiles = fs.readdirSync(imageSourceDir).filter(f =>
                        f.toLowerCase().startsWith(skuLower) && (f.endsWith('.jpeg') || f.endsWith('.jpg'))
                    );

                    imageFiles.forEach((imgFile, imgIndex) => {
                        const sourcePath = path.join(imageSourceDir, imgFile);
                        const ext = imgFile.endsWith('.jpeg') ? 'jpeg' : 'jpg';
                        const destFilename = `${skuLower}-${imgIndex + 1}.${ext}`;
                        const destPath = path.join(uploadsDir, destFilename);

                        // Copia immagine
                        fs.copyFileSync(sourcePath, destPath);
                        productImages.push(`/uploads/${destFilename}`);
                    });

                    // Crea prodotto
                    const product = {
                        id: `aw-${skuLower}`,
                        sku: sku,
                        name: italianName,
                        price: price,
                        originalPrice: rrp,
                        category: 'natural-wellness',
                        subcategory: 'incenso',
                        supplier: 'aw-dropship',
                        stock: stock,
                        images: productImages,
                        description: italianDescription,
                        shortDescription: italianShortDesc,
                        barcode: barcode,
                        weight: weight,
                        materials: materials === 'Incense' ? 'Incenso Naturale' : materials,
                        featured: false,
                        visibility: 'visible',
                        tags: ['incenso', 'coni riflusso', 'backflow', 'aromaterapia', 'natural wellness'],
                        metadata: {
                            type: 'Coni a riflusso (backflow)',
                            origin: 'India',
                            use: 'Utilizzare con bruciatore a riflusso per effetto cascata'
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

importIncensi().catch(console.error);
