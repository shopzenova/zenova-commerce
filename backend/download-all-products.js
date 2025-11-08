const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadAllProducts() {
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

        // Categorie Zenova
        const categories = [
            { id: 2491, name: 'Sport & Fitness' },
            { id: 2501, name: 'Health & Beauty' },
            { id: 2399, name: 'Home & Garden' },
            { id: 2507, name: 'Tech & Electronics' }
        ];

        // Vai alla cartella prodotti
        await client.cd('/files/products/csv/standard');

        // Crea cartella locale se non esiste
        const dataDir = path.join(__dirname, 'bigbuy-data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let totalSize = 0;

        // Scarica ogni file
        for (const cat of categories) {
            const fileName = `product_${cat.id}_it.csv`;
            const remotePath = fileName;
            const localPath = path.join(dataDir, fileName);

            console.log(`📥 Scaricando: ${fileName} (${cat.name})...`);

            const startTime = Date.now();
            await client.downloadTo(localPath, remotePath);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            const stats = fs.statSync(localPath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            totalSize += stats.size;

            console.log(`   ✅ Completato! ${sizeMB} MB in ${elapsed}s\n`);
        }

        const totalMB = (totalSize / 1024 / 1024).toFixed(2);
        console.log(`\n🎉 DOWNLOAD COMPLETATO!`);
        console.log(`📦 Totale scaricato: ${totalMB} MB`);
        console.log(`📂 File salvati in: ${dataDir}`);

        // Mostra un'anteprima del primo file
        console.log('\n📋 Anteprima product_2491_it.csv (prime 3 righe):');
        const previewFile = path.join(dataDir, 'product_2491_it.csv');
        const content = fs.readFileSync(previewFile, 'utf-8');
        const lines = content.split('\n').slice(0, 3);

        lines.forEach((line, i) => {
            if (i === 0) {
                console.log(`Header: ${line.substring(0, 150)}...`);
            } else {
                console.log(`Riga ${i}: ${line.substring(0, 150)}...`);
            }
        });

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

downloadAllProducts();
