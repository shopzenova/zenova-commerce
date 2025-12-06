// Verifica se esiste file shipping_costs su FTP BigBuy
const ftp = require('basic-ftp');
const fs = require('fs');

async function checkShippingFile() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🔌 Connessione a FTP BigBuy...\n');

    await client.access({
      host: 'www.dropshippers.com.es',
      user: 'bbCDCSK9mS6i',
      password: 'XgVEDUdao7',
      secure: false
    });

    console.log('✅ Connesso!\n');

    // Cerca file shipping_costs
    console.log('🔍 Ricerca file shipping_costs...\n');

    const rootFiles = await client.list('/');
    const shippingFile = rootFiles.find(f => f.name.toLowerCase().includes('shipping'));

    if (shippingFile) {
      console.log('✅ Trovato file shipping nella root:', shippingFile.name);
    } else {
      console.log('❌ Nessun file shipping nella root');
    }

    // Controlla nella cartella files
    console.log('\n🔍 Controllo cartella /files...\n');
    const filesDir = await client.list('/files');

    const shippingDir = filesDir.find(f => f.name.toLowerCase().includes('shipping'));
    if (shippingDir) {
      console.log('✅ Trovata cartella shipping:', shippingDir.name);

      // Entra nella cartella shipping
      const shippingFiles = await client.list(`/files/${shippingDir.name}`);
      console.log('\nFile nella cartella shipping:');
      shippingFiles.forEach(f => {
        console.log(`  - ${f.name} (${Math.round(f.size / 1024)}KB)`);
      });

      // Scarica il file principale
      const mainFile = shippingFiles.find(f => f.name.includes('shipping_costs') || f.name.includes('.csv'));
      if (mainFile) {
        console.log(`\n📥 Scarico ${mainFile.name}...`);
        await client.downloadTo(`bigbuy-data/${mainFile.name}`, `/files/${shippingDir.name}/${mainFile.name}`);
        console.log(`✅ File salvato in bigbuy-data/${mainFile.name}`);
      }
    }

    // Controlla anche la root per shipping_costs.csv
    const directFile = rootFiles.find(f => f.name === 'shipping_costs.csv');
    if (directFile) {
      console.log('\n📥 Scarico shipping_costs.csv dalla root...');
      await client.downloadTo('bigbuy-data/shipping_costs.csv', '/shipping_costs.csv');
      console.log('✅ File salvato!');
    }

  } catch (err) {
    console.error('❌ Errore:', err.message);
  }

  client.close();
}

checkShippingFile();
