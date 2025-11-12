const ftp = require('basic-ftp');

async function exploreFTP() {
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

        // Lista root
        console.log('📂 Root directory:');
        const root = await client.list('/');
        root.forEach(item => {
            console.log(`  ${item.isDirectory ? '[DIR]' : '[FILE]'} ${item.name}`);
        });

        // Lista /files
        console.log('\n📂 /files directory:');
        const files = await client.list('/files');
        files.forEach(item => {
            console.log(`  ${item.isDirectory ? '[DIR]' : '[FILE]'} ${item.name}`);
        });

        // Cerca file product nella root /files
        console.log('\n🔍 Cerco file product_2609_it.csv in /files...');
        const productFiles = files.filter(f =>
            f.name.includes('product') && f.name.includes('2609')
        );

        if (productFiles.length > 0) {
            console.log('✅ Trovato!');
            productFiles.forEach(f => {
                const size = (f.size / 1024 / 1024).toFixed(2);
                console.log(`  ${f.name} (${size} MB)`);
            });
        } else {
            console.log('❌ Non trovato in /files');

            // Prova in /files/categories
            console.log('\n📂 /files/categories directory:');
            const categories = await client.list('/files/categories');
            categories.forEach(item => {
                console.log(`  ${item.isDirectory ? '[DIR]' : '[FILE]'} ${item.name}`);
            });
        }

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

exploreFTP();
