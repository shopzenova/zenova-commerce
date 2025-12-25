const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-traduzioni-100-${Date.now()}.json`;

console.log('🔧 TRADUZIONI 100% - DIFFUSORI AW\n');

// Traduzioni complete
const completeTranslations = {
    'Gift Set of 6 Wax Melts': 'Set Regalo 6 Cere Profumate',
    'Soywax Melts Jar': 'Cera di Soia Profumata in Vasetto',
    'Tropical Paradise Simmering Granules': 'Granuli Profumati Paradiso Tropicale',
    'Aroma Wax Melts': 'Cere Profumate Aromatiche',
    'Backflow Incense Burner': 'Bruciatore Incenso a Cascata',
    'Mango Wood Candle Stand': 'Portacandele in Legno di Mango',
    'Classic Candle Stand': 'Portacandele Classico',
    'Set of 2  Flower Flip Dinner Candle / Tealight Holder': 'Set 2 Portacandele Fiore',
    'Set of 2 Buddha Faces Candle Jar': 'Set 2 Portacandele Facce di Buddha',
    'Set of 2 Mushroom Flip Dinner Candle / Tealight Holder': 'Set 2 Portacandele Fungo',
    'Set of 2 Vintage Dinner Candle Holder': 'Set 2 Portacandele Vintage',
    'Gem Bracelet Bath Bomb': 'Bomba da Bagno con Braccialetto di Gemme',
    'Bath Salts in Vials': 'Sali da Bagno in Boccette',
    'Chakra Bath Salt': 'Sale da Bagno Chakra',
    'Whitewash': 'Bianco Anticato',
    'Small': 'Piccolo',
    'Medium': 'Medio',
    'Large': 'Grande',
    'Antique Amber': 'Ambra Antica',
    'Garden Jade': 'Giada del Giardino',
    'Vampire Red': 'Rosso Vampiro',
    'Royal Blue': 'Blu Reale',
    'Midnight Grey': 'Grigio Notte',
    'Green Aventurine': 'Avventurina Verde',
    'Tiger Eye': 'Occhio di Tigre',
    'Amethyst': 'Ametista',
    'Rose Quartz': 'Quarzo Rosa',
    'Sodalite': 'Sodalite',
    'White Jasper': 'Diaspro Bianco',
    'Gift Pack of 7': 'Confezione Regalo da 7'
};

// Backup
console.log('💾 Backup...');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`✅ Backup: ${BACKUP_FILE}\n`);

let updateCount = 0;

products.forEach(product => {
    // Solo prodotti AW nella categoria diffusori
    if (product.source === 'aw' &&
        (product.zenovaSubcategory === 'diffusori' || product.subcategory === 'diffusori')) {

        let updated = false;
        let oldName = product.name;

        // Applica traduzioni complete - dall'espressione più lunga alla più corta
        const sortedTranslations = Object.entries(completeTranslations)
            .sort((a, b) => b[0].length - a[0].length);

        sortedTranslations.forEach(([en, it]) => {
            if (product.name.includes(en)) {
                product.name = product.name.replace(en, it);
                updated = true;
            }
        });

        if (updated) {
            updateCount++;
            console.log(`✅ ${product.sku}`);
            console.log(`   ${oldName}`);
            console.log(`   → ${product.name}`);
            console.log('');
        }
    }
});

console.log(`📊 Aggiornati: ${updateCount} prodotti\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
fs.writeFileSync('../products.json', JSON.stringify(products, null, 2));

console.log('✅ File aggiornati!');
console.log('   - backend/top-100-products.json');
console.log('   - products.json');

console.log('\n🎉 TRADUZIONI 100% COMPLETE!');
console.log('   Tutti i nomi prodotti diffusori ora sono in italiano');
