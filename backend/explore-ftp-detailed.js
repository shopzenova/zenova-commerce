const ftp = require('basic-ftp');

async function exploreFTP() {
    const client = new ftp.Client();

    try {
        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false
        });

        console.log('✅ Connesso!\n');

        // Vai in /files/products/csv
        await client.cd('/files/products/csv');
        console.log('📂 Contenuto di /files/products/csv:');
        let list = await client.list();
        list.forEach(f => console.log(`  ${f.isDirectory ? '📁' : '📄'} ${f.name}`));

        // Se c'è standard, esplora
        if (list.some(f => f.name === 'standard')) {
            await client.cd('standard');
            console.log('\n📂 Contenuto di /files/products/csv/standard:');
            list = await client.list();

            // Categorie Zenova (IDS CORRETTI da mapper)
            const zenovaCategories = [2491, 2501, 2399, 2507];

            console.log('\n🔍 Cercando file per categorie Zenova (italiano):');
            zenovaCategories.forEach(catId => {
                const fileName = `product_${catId}_it.csv`;
                const found = list.find(f => f.name === fileName);
                if (found) {
                    const size = (found.size / 1024).toFixed(2);
                    console.log(`  ✅ ${fileName} (${size} KB)`);
                } else {
                    console.log(`  ❌ ${fileName} - NON TROVATO`);
                }
            });

            console.log(`\n📊 Totale file: ${list.length}`);
        }

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

exploreFTP();
