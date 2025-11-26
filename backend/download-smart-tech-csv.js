const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadCSV() {
    const client = new ftp.Client();
    const csvDir = path.join(__dirname, 'bigbuy-data');

    // Assicurati che la cartella esista
    if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
    }

    const files = [
        { name: 'product_2400_it.csv', desc: 'Electronics' },
        { name: 'product_2421_it.csv', desc: 'Home Automation' },
        { name: 'product_2644_it.csv', desc: 'Monitors' },
        { name: 'product_2797_it.csv', desc: 'Laptops' }
    ];

    try {
        console.log('🔄 Connessione FTP BigBuy...\n');

        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false
        });

        console.log('✅ Connesso!\n');

        // Vai nella cartella CSV standard
        await client.cd('files/products/csv/standard');

        for (const file of files) {
            const localPath = path.join(csvDir, file.name);

            // Salta se già scaricato
            if (fs.existsSync(localPath)) {
                const stats = fs.statSync(localPath);
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`⏭️  ${file.name} già scaricato (${sizeMB} MB) - ${file.desc}`);
                continue;
            }

            try {
                console.log(`📥 Scarico ${file.desc} (${file.name})...`);
                await client.downloadTo(localPath, file.name);

                const stats = fs.statSync(localPath);
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`   ✅ Scaricato ${sizeMB} MB\n`);

                // Pausa tra download
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (err) {
                console.log(`   ❌ Errore: ${err.message}\n`);
            }
        }

        console.log('✅ Download completato!\n');

    } catch (err) {
        console.error('❌ Errore FTP:', err.message);
    } finally {
        client.close();
    }
}

downloadCSV();
