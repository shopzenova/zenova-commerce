const ftp = require('basic-ftp');

async function listProductsFolder() {
    const client = new ftp.Client();

    try {
        console.log('🔄 Connessione a BigBuy FTP...');

        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false
        });

        console.log('✅ Connesso!\n');

        console.log('📂 /files/products/csv/standard directory:\n');
        const products = await client.list('/files/products/csv/standard');

        // Ordina per nome
        products.sort((a, b) => a.name.localeCompare(b.name));

        console.log(`Trovati ${products.length} elementi\n`);

        products.forEach(item => {
            if (item.isDirectory) {
                console.log(`  [DIR] ${item.name}`);
            } else {
                const size = (item.size / 1024 / 1024).toFixed(2);
                console.log(`  [FILE] ${item.name} (${size} MB)`);
            }
        });

        // Cerca product_2609
        console.log('\n🔍 Cerca product_2609...');
        const electronics = products.filter(f =>
            f.name.includes('2609')
        );

        if (electronics.length > 0) {
            console.log('✅ TROVATO!');
            electronics.forEach(f => {
                const size = (f.size / 1024 / 1024).toFixed(2);
                console.log(`  ${f.name} (${size} MB)`);
            });
        } else {
            console.log('❌ product_2609 non presente');
        }

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

listProductsFolder();
