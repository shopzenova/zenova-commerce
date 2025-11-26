const ftp = require('basic-ftp');

async function exploreFTP() {
    const client = new ftp.Client();

    try {
        console.log('🔄 Connessione FTP BigBuy...\n');

        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false
        });

        console.log('✅ Connesso!\n');

        // Vai nella cartella CSV
        await client.cd('files/products/csv');

        console.log('📂 Contenuto di files/products/csv:\n');
        const csvList = await client.list();

        csvList.forEach(file => {
            const size = (file.size / 1024 / 1024).toFixed(2);
            console.log(`  ${file.isDirectory ? '📁' : '📄'} ${file.name} (${size} MB)`);
        });

        console.log(`\n✅ Trovati ${csvList.length} file/cartelle\n`);

        // Se ci sono sottocartelle, esplora la prima
        const subfolders = csvList.filter(f => f.isDirectory && f.name !== '.' && f.name !== '..');

        if (subfolders.length > 0) {
            console.log('📂 Sottocartelle trovate:\n');

            for (const folder of subfolders.slice(0, 3)) { // Prime 3 sottocartelle
                console.log(`\n📁 Contenuto di ${folder.name}:`);

                try {
                    await client.cd(folder.name);
                    const subList = await client.list();

                    subList.slice(0, 10).forEach(file => {
                        const size = (file.size / 1024 / 1024).toFixed(2);
                        console.log(`  ${file.isDirectory ? '📁' : '📄'} ${file.name} (${size} MB)`);
                    });

                    if (subList.length > 10) {
                        console.log(`  ... e altri ${subList.length - 10} file`);
                    }

                    await client.cdup();
                } catch (err) {
                    console.log(`  ⚠️  Errore: ${err.message}`);
                }
            }
        }

    } catch (err) {
        console.error('❌ Errore FTP:', err.message);
    } finally {
        client.close();
    }
}

exploreFTP();
