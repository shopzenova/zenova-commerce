require('dotenv').config();
const AWDropshipClient = require('./src/integrations/AWDropshipClient');

const awClient = new AWDropshipClient();

(async () => {
  try {
    const products = await awClient.getProducts(1, 100);

    console.log('Primi 10 prodotti API AW (code):');
    products.data.slice(0, 10).forEach(p => {
      const name = p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name;
      console.log(`   ${p.code} - ${name}`);
    });

    console.log('');
    console.log('Cerco Zodiac Candle...');
    const zodiac = products.data.filter(p =>
      p.name.toLowerCase().includes('zodiac') ||
      p.name.toLowerCase().includes('crystal candle')
    );

    console.log(`Trovati ${zodiac.length} prodotti zodiac/crystal candle`);
    zodiac.forEach(p => {
      console.log(`   ${p.code} - ${p.name} - €${p.price}`);
    });

  } catch (error) {
    console.error('Errore:', error);
  }
})();
