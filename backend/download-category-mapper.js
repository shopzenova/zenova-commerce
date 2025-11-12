const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadCategoryMapper() {
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

        const remotePath = '/files/categories/csv/mapper_category.csv';
        const localPath = path.join(__dirname, 'bigbuy-data', 'mapper_category.csv');

        // Crea cartella se non esiste
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log('📥 Scarico mapper_category.csv...');
        await client.downloadTo(localPath, remotePath);

        console.log('✅ Download completato!\n');

        // Leggi e mostra contenuto
        const content = fs.readFileSync(localPath, 'utf-8');
        const lines = content.split('\n');

        console.log(`📊 Categorie trovate: ${lines.length - 1}\n`);
        console.log('=== TUTTE LE CATEGORIE BIGBUY ===\n');

        lines.forEach((line, i) => {
            if (i === 0) {
                console.log('HEADER:', line);
                console.log('');
            } else if (line.trim()) {
                console.log(line);
            }
        });

        // Cerca categorie elettronica
        console.log('\n\n🔍 Cerca categorie contenenti "elettronica", "computer", "ebook", "tablet"...\n');

        const electronics = lines.filter(line =>
            line.toLowerCase().includes('elettr') ||
            line.toLowerCase().includes('comput') ||
            line.toLowerCase().includes('ebook') ||
            line.toLowerCase().includes('tablet') ||
            line.toLowerCase().includes('inform') ||
            line.toLowerCase().includes('tech')
        );

        if (electronics.length > 0) {
            console.log('📱 Categorie rilevanti:');
            electronics.forEach(line => console.log(line));
        }

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

downloadCategoryMapper();
