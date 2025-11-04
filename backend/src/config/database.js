const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error']
});

// Test connessione database
async function testConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connesso con successo');
  } catch (error) {
    logger.error('❌ Errore connessione database:', error);
    process.exit(1);
  }
}

testConnection();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnesso');
});

module.exports = prisma;
