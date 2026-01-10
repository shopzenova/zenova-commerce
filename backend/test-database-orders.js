// Test connessione database e creazione ordine
require('dotenv').config();
const { pool, initializeDatabase } = require('./src/utils/database');
const orderService = require('./src/services/OrderService');

async function testDatabase() {
  console.log('🧪 Test database PostgreSQL...\n');

  try {
    // 1. Test connessione
    console.log('1️⃣ Test connessione...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connesso a PostgreSQL:', result.rows[0].now);

    // 2. Inizializza schema
    console.log('\n2️⃣ Inizializzazione schema...');
    await initializeDatabase();
    console.log('✅ Schema inizializzato');

    // 3. Test creazione ordine
    console.log('\n3️⃣ Test creazione ordine...');
    const testOrder = await orderService.createOrder({
      customer: {
        name: 'Test User',
        email: 'test@zenova.it',
        phone: '1234567890',
        address: { street: 'Via Test 1', city: 'Roma' }
      },
      items: [{
        productId: 'TEST-123',
        name: 'Prodotto Test',
        price: 10.00,
        quantity: 1
      }],
      totals: {
        subtotal: 10.00,
        shipping: 5.00,
        total: 15.00
      },
      payment: {
        method: 'test',
        status: 'pending'
      },
      shipping: {}
    });
    console.log('✅ Ordine creato:', testOrder.id);

    // 4. Test lettura ordine
    console.log('\n4️⃣ Test lettura ordine...');
    const retrieved = await orderService.getOrderById(testOrder.id);
    console.log('✅ Ordine recuperato:', retrieved.id);

    // 5. Test lista ordini
    console.log('\n5️⃣ Test lista ordini...');
    const allOrders = await orderService.getAllOrders();
    console.log('✅ Totale ordini:', allOrders.length);

    console.log('\n🎉 TUTTI I TEST SUPERATI!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testDatabase();
