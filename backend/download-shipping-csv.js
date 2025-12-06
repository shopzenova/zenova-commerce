// Scarica file shipping costs dalla cartella CSV
const ftp = require('basic-ftp');

async function downloadShipping() {
  const client = new ftp.Client();

  try {
    console.log('🔌 Connessione a FTP BigBuy...');

    await client.access({
      host: 'www.dropshippers.com.es',
      user: 'bbCDCSK9mS6i',
      password: 'XgVEDUdao7',
      secure: false
    });

    console.log('✅ Connesso!\n');

    // Lista file nella cartella CSV
    console.log('📂 File in /files/shipping_costs/csv/:\n');
    const files = await client.list('/files/shipping_costs/csv/');

    files.forEach(f => {
      if (!f.isDirectory) {
        console.log(`  ${f.name} - ${Math.round(f.size / 1024)}KB`);
      }
    });

    // Scarica tutti i CSV
    for (const file of files) {
      if (!file.isDirectory && file.name.endsWith('.csv')) {
        console.log(`\n📥 Scarico ${file.name}...`);
        await client.downloadTo(
          `bigbuy-data/${file.name}`,
          `/files/shipping_costs/csv/${file.name}`
        );
        console.log(`✅ Salvato in bigbuy-data/${file.name}`);
      }
    }

    console.log('\n✅ Download completato!');

  } catch (err) {
    console.error('❌ Errore:', err.message);
  }

  client.close();
}

downloadShipping();
