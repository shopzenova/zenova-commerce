const ftp = require('basic-ftp');

async function testBigBuyFTP() {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Log dettagliato

    try {
        console.log('🔄 Connessione a BigBuy FTP...');

        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false // Prova prima senza SSL
        });

        console.log('✅ Connesso a BigBuy FTP!');

        // Lista file nella directory root
        console.log('\n📂 File nella root:');
        const rootList = await client.list();

        rootList.forEach(file => {
            const size = (file.size / 1024 / 1024).toFixed(2); // MB
            console.log(`  ${file.isDirectory ? '📁' : '📄'} ${file.name} (${size} MB)`);
        });

        // Esplora cartella files
        console.log('\n📂 Contenuto cartella "files":');
        await client.cd('files');
        const filesList = await client.list();

        filesList.forEach(file => {
            const size = (file.size / 1024 / 1024).toFixed(2); // MB
            console.log(`  ${file.isDirectory ? '📁' : '📄'} ${file.name} (${size} MB)`);
        });

        console.log(`\n✅ Trovati ${filesList.length} file/cartelle nella cartella "files"`);

        // Esplora cartella products
        console.log('\n📦 Contenuto cartella "files/products":');
        await client.cd('products');
        const productsList = await client.list();

        productsList.forEach(file => {
            const size = (file.size / 1024 / 1024).toFixed(2); // MB
            console.log(`  ${file.isDirectory ? '📁' : '📄'} ${file.name} (${size} MB)`);
        });

        console.log(`\n✅ Trovati ${productsList.length} file/cartelle nella cartella "products"`);

    } catch (err) {
        console.error('❌ Errore FTP:', err.message);
    } finally {
        client.close();
    }
}

testBigBuyFTP();
