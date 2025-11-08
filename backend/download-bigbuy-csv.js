const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadBigBuyCSV() {
    const client = new ftp.Client();

    try {
        console.log('🔄 Connessione a BigBuy FTP...');

        await client.access({
            host: 'www.dropshippers.com.es',
            user: 'bbCDCSK9mS6i',
            password: 'XgVEDUdao7',
            secure: false
        });

        console.log('✅ Connesso!');

        // Scarica mapper categorie per vedere tutti gli ID disponibili
        const remotePath = '/files/categories/csv/mapper_category.csv';
        const localPath = path.join(__dirname, 'bigbuy-data', 'mapper_category.csv');

        // Crea cartella se non esiste
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`📥 Scarico: ${remotePath}`);
        await client.downloadTo(localPath, remotePath);

        const stats = fs.statSync(localPath);
        console.log(`✅ Download completato! (${(stats.size / 1024).toFixed(2)} KB)`);

        // Leggi prime righe per vedere struttura
        const content = fs.readFileSync(localPath, 'utf-8');
        const lines = content.split('\n').slice(0, 5);

        console.log('\n📋 Prime 5 righe del CSV:');
        lines.forEach((line, i) => {
            if (i === 0) {
                console.log(`Header: ${line}`);
            } else {
                console.log(`Riga ${i}: ${line.substring(0, 100)}...`);
            }
        });

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

downloadBigBuyCSV();
