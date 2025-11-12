const ftp = require('basic-ftp');

async function listFTPFiles() {
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

        // Lista file nella cartella categorie
        console.log('📂 Contenuto di /files/categories/csv/:\n');
        await client.cd('/files/categories/csv/');
        const list = await client.list();

        console.log(`Trovati ${list.length} file totali:\n`);

        list.forEach(file => {
            const size = (file.size / 1024 / 1024).toFixed(2);
            console.log(`- ${file.name} (${size} MB)`);
        });

        // Filtra solo file CSV italiani
        const italianFiles = list.filter(file =>
            file.name.includes('_it.csv')
        ).sort((a, b) => a.name.localeCompare(b.name));

        console.log(`\n📊 File CSV italiani: ${italianFiles.length}\n`);

        console.log('\n💡 Cerca file che potrebbero contenere "elettronica" o "computer"...\n');

        const electronics = italianFiles.filter(file =>
            file.name.toLowerCase().includes('2609') ||
            file.name.toLowerCase().includes('electr') ||
            file.name.toLowerCase().includes('comput') ||
            file.name.toLowerCase().includes('inform')
        );

        if (electronics.length > 0) {
            console.log('📱 File potenzialmente correlati a Elettronica:');
            electronics.forEach(file => {
                const size = (file.size / 1024 / 1024).toFixed(2);
                console.log(`- ${file.name} (${size} MB)`);
            });
        } else {
            console.log('❌ Nessun file correlato a "elettronica" trovato');
        }

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

listFTPFiles();
