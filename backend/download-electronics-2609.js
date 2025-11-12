const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function downloadElectronics() {
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

        const remotePath = '/files/products/csv/standard/product_2609_it.csv';
        const localPath = path.join(__dirname, 'bigbuy-data', 'product_2609_it.csv');

        // Crea cartella se non esiste
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log('📥 Scarico product_2609_it.csv (Informatica | Elettronica)...');
        console.log(`   File: ${remotePath}`);
        console.log('   Attendi... (file da 75.82 MB)\n');

        await client.downloadTo(localPath, remotePath);

        const stats = fs.statSync(localPath);
        console.log('✅ Download completato!');
        console.log(`   Dimensione: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Conta righe
        console.log('\n📊 Analisi file...');
        const content = fs.readFileSync(localPath, 'utf-8');
        const lines = content.split('\n');
        const numProducts = lines.length - 1;

        console.log(`   Prodotti: ~${numProducts.toLocaleString()}`);

        // Mostra header
        console.log('\n📋 Header colonne:');
        console.log(lines[0]);

    } catch (err) {
        console.error('❌ Errore:', err.message);
    } finally {
        client.close();
    }
}

downloadElectronics();
