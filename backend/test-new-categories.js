const { categorizeProduct } = require('./config/category-mapping');

// Test prodotti per tutte le nuove categorie
const testProducts = [
  // BEAUTY
  {
    name: 'Profumo Donna Chanel N°5',
    description: 'Eau de parfum elegante e raffinata',
    expected: 'beauty'
  },
  {
    name: 'Mascara Volumizzante',
    description: 'Cosmetico per ciglia lunghe e voluminose',
    expected: 'beauty'
  },

  // HEALTH & PERSONAL CARE
  {
    name: 'Shampoo Riparatore Capelli',
    description: 'Trattamento intensivo per capelli danneggiati',
    expected: 'health-personal-care'
  },
  {
    name: 'Massaggiatore Shiatsu',
    description: 'Massaggio rilassante per collo e spalle',
    expected: 'health-personal-care'
  },

  // SMART LIVING
  {
    name: 'Wake-up Light',
    description: 'Sveglia con simulazione alba e smart light',
    expected: 'smart-living'
  },
  {
    name: 'Lampadina Smart LED RGB',
    description: 'Controllo WiFi compatibile con Alexa e Google Home',
    expected: 'smart-living'
  },
  {
    name: 'Presa Smart WiFi',
    description: 'Smart plug con controllo remoto app',
    expected: 'smart-living'
  },

  // TECH INNOVATION
  {
    name: 'Smartwatch Fitness Tracker',
    description: 'Orologio intelligente con monitoraggio attività',
    expected: 'tech-innovation'
  },
  {
    name: 'Auricolari Wireless TWS',
    description: 'Earbuds Bluetooth con cancellazione rumore',
    expected: 'tech-innovation'
  },
  {
    name: 'Mini Proiettore Portatile',
    description: 'Portable tech projector con WiFi',
    expected: 'tech-innovation'
  },

  // NATURAL WELLNESS
  {
    name: 'Set Oli Essenziali',
    description: 'Kit aromaterapia con lavanda, eucalipto, menta',
    expected: 'natural-wellness'
  },
  {
    name: 'Tappetino Yoga Premium',
    description: 'Yoga mat antiscivolo per meditazione',
    expected: 'natural-wellness'
  },
  {
    name: 'Lampada Sale Himalayano',
    description: 'Himalayan salt lamp per purificazione aria',
    expected: 'natural-wellness'
  }
];

console.log('🧪 TEST NUOVA CATEGORIZZAZIONE ZENOVA 2.0\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

testProducts.forEach((test, index) => {
  const categories = categorizeProduct(test);
  const result = categories[0];
  const isCorrect = result === test.expected;

  const icon = isCorrect ? '✅' : '❌';
  console.log(`\n${icon} Test ${index + 1}: ${test.name}`);
  console.log(`   Categoria attesa: ${test.expected}`);
  console.log(`   Categoria ottenuta: ${result}`);

  if (isCorrect) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\n📊 RISULTATI: ${passed}/${testProducts.length} test passati`);
if (failed > 0) {
  console.log(`⚠️  ${failed} test falliti`);
} else {
  console.log('🎉 Tutti i test passati!');
}
