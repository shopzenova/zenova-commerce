// Test ShippingService con prodotti reali
const shippingService = require('./src/services/ShippingService');

async function testShipping() {
  console.log('🧪 Test ShippingService\n');

  // Test 1: Italia con prodotto singolo
  console.log('========================================');
  console.log('TEST 1: Italia - 1 prodotto');
  console.log('========================================\n');

  const test1 = await shippingService.calculateShippingCost(
    [{ reference: 'M0100360', quantity: 1 }],
    { country: 'IT', postcode: '00100' }
  );

  console.log('Risultato:', JSON.stringify(test1, null, 2));
  console.log('\n');

  // Test 2: Svizzera con prodotto singolo
  console.log('========================================');
  console.log('TEST 2: Svizzera - 1 prodotto');
  console.log('========================================\n');

  const test2 = await shippingService.calculateShippingCost(
    [{ reference: 'M0100360', quantity: 1 }],
    { country: 'CH', postcode: '8000' }
  );

  console.log('Risultato:', JSON.stringify(test2, null, 2));
  console.log('\n');

  // Test 3: Francia con carrello multiplo
  console.log('========================================');
  console.log('TEST 3: Francia - 3 prodotti');
  console.log('========================================\n');

  const test3 = await shippingService.calculateShippingCost(
    [
      { reference: 'M0100360', quantity: 2 },
      { reference: 'M0100898', quantity: 1 },
      { reference: 'M0101234', quantity: 1 }
    ],
    { country: 'FR', postcode: '75001' }
  );

  console.log('Risultato:', JSON.stringify(test3, null, 2));
  console.log('\n');

  // Test 4: Paese non supportato
  console.log('========================================');
  console.log('TEST 4: Paese non supportato (JP)');
  console.log('========================================\n');

  const test4 = await shippingService.calculateShippingCost(
    [{ reference: 'M0100360', quantity: 1 }],
    { country: 'JP', postcode: '100-0001' }
  );

  console.log('Risultato:', JSON.stringify(test4, null, 2));
  console.log('\n');

  // Riepilogo
  console.log('========================================');
  console.log('RIEPILOGO TEST');
  console.log('========================================\n');

  console.log(`Test 1 (IT): ${test1.success ? '✅ OK' : '❌ FAIL'} - €${test1.cost || 'N/A'}`);
  console.log(`Test 2 (CH): ${test2.success ? '✅ OK' : '❌ FAIL'} - €${test2.cost || 'N/A'}`);
  console.log(`Test 3 (FR): ${test3.success ? '✅ OK' : '❌ FAIL'} - €${test3.cost || 'N/A'}`);
  console.log(`Test 4 (JP): ${!test4.success ? '✅ OK (correttamente rifiutato)' : '❌ FAIL'}`);

  console.log('\n✅ Test completati!');
}

testShipping().catch(console.error);
