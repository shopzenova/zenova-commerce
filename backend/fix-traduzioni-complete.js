const fs = require('fs');

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./products.backup-traduzioni-complete-${Date.now()}.json`;

console.log('🔧 COMPLETA TRADUZIONI DIFFUSORI AW\n');

// Dizionario completo traduzioni fragranze
const fragranceTranslations = {
    'White Musk': 'Muschio Bianco',
    'Dewberry': 'More Selvatiche',
    'Tuberose': 'Tuberosa',
    'Nagchampa': 'Nag Champa',
    'Mango Fruits': 'Frutti di Mango',
    'Vanilla Nutmeg': 'Vaniglia e Noce Moscata',
    'Japanese Magnolia': 'Magnolia Giapponese',
    'Classic Rose': 'Rosa Classica',
    'Dark Sandalwood': 'Sandalo Scuro',
    'Brandy Butter': 'Burro al Brandy',
    'Bannana Rush': 'Banana Intensa',
    'Cinnamon & Orange': 'Cannella e Arancia',
    'Ylang Ylang': 'Ylang Ylang',
    'Liquorice': 'Liquirizia',
    'Dragon\'s Blood': 'Sangue di Drago',
    'Lemon Harvest': 'Raccolto di Limone',
    'Old Ginger': 'Zenzero Antico',
    'Watermelon Fresh': 'Anguria Fresca',
    'Mint & Menthol': 'Menta e Mentolo',
    'Hidden Garden': 'Giardino Nascosto',
    'Comfort Zone': 'Zona Comfort',
    'Kickback & Relax': 'Rilassati e Goditi',
    'Midnight Roses': 'Rose di Mezzanotte',
    'Passion Boudoir': 'Boudoir della Passione',
    'Fresh Cotton': 'Cotone Fresco',
    'Daisy Fresh': 'Freschezza di Margherita',
    'Heart & Hearth': 'Cuore e Focolare',
    'Watermelon': 'Anguria',
    'Dragon Fruit': 'Frutto del Drago',
    'Papaya': 'Papaya',
    'Pomelo': 'Pomelo',
    'Mangosteen': 'Mangostano',
    'Kiwifruit': 'Kiwi',
    'Strawberry': 'Fragola',
    'Pineapple': 'Ananas',
    'Passion Fruit': 'Frutto della Passione',
    'Banana': 'Banana',
    'Lavender & Rosemary': 'Lavanda e Rosmarino',
    'Ylang Ylang & Orange': 'Ylang Ylang e Arancia',
    'Ginger & Clove': 'Zenzero e Chiodi di Garofano',
    'Nutmeg & Lemon': 'Noce Moscata e Limone'
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

        // Applica traduzioni fragranze
        Object.entries(fragranceTranslations).forEach(([en, it]) => {
            const regex = new RegExp(en, 'gi');
            if (product.name.match(regex)) {
                product.name = product.name.replace(regex, it);
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

console.log('\n🎉 TRADUZIONI COMPLETE!');
