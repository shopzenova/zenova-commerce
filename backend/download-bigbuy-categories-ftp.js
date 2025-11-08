require('dotenv').config();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadCategories() {
    console.log('=== DOWNLOAD CATEGORIE DA FTP BIGBUY ===\n');

    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log('📡 Connessione a FTP BigBuy...');

        await client.access({
            host: 'ftp.bigbuy.eu',
            user: process.env.BIGBUY_API_KEY,
            password: '',
            secure: false
        });

        console.log('✅ Connesso!\n');

        // Lista file disponibili
        console.log('📂 File disponibili in /csv:');
        await client.cd('/csv');
        const list = await client.list();

        list.forEach(file => {
            if (file.name.includes('categor')) {
                console.log(`   📄 ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
            }
        });

        // Scarica categories_it.csv
        const categoryFile = 'categories_it.csv';
        console.log(`\n⬇️  Scarico ${categoryFile}...`);

        await client.downloadTo(
            path.join(__dirname, categoryFile),
            categoryFile
        );

        console.log('✅ Download completato!');

        // Leggi e mostra sample
        const content = fs.readFileSync(path.join(__dirname, categoryFile), 'utf8');
        const lines = content.split('\n');

        console.log(`\n📊 File contiene ${lines.length} righe`);
        console.log('\n--- PRIME 20 RIGHE ---\n');
        lines.slice(0, 20).forEach((line, i) => {
            console.log(`${i + 1}: ${line.substring(0, 150)}`);
        });

        client.close();

    } catch (error) {
        console.error('❌ Errore:', error.message);
        console.error(error);
    }
}

downloadCategories();
