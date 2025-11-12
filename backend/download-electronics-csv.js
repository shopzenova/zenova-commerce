const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadElectronicsCSV() {
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

        // Scarica categoria 2609 (Computers | Electronics) in italiano
        const categoryId = 2609;
        const language = 'it';
        const remotePath = `/files/categories/csv/product_${categoryId}_${language}.csv`;
        const localPath = path.join(__dirname, 'bigbuy-data', `product_${categoryId}_${language}.csv`);

        // Crea cartella se non esiste
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`📥 Scarico categoria ${categoryId} (Elettronica)...`);
        console.log(`   File: ${remotePath}`);

        await client.downloadTo(localPath, remotePath);

        const stats = fs.statSync(localPath);
        console.log(`✅ Download completato!`);
        console.log(`   Dimensione: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Conta righe (prodotti)
        const content = fs.readFileSync(localPath, 'utf-8');
        const lines = content.split('\n');
        const numProducts = lines.length - 1; // -1 per header

        console.log(`   Prodotti: ~${numProducts.toLocaleString()}`);

        // Mostra prime 5 righe
        console.log('\n📋 Primi 5 prodotti:');
        lines.slice(1, 6).forEach((line, i) => {
            const name = line.split(';')[2] || ''; // NAME è colonna 3
            if (name) {
                console.log(`${i+1}. ${name.substring(0, 70)}`);
            }
        });

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

downloadElectronicsCSV();
