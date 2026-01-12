const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function createBackup() {
  try {
    console.log('💾 Creazione backup prodotti con categoria "diffusori"...\n');

    const products = await prisma.product.findMany({
      where: {
        zenovaSubcategory: 'diffusori'
      }
    });

    const backupFile = path.join(__dirname, `backup-diffusori-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));

    console.log(`✅ Backup salvato: ${backupFile}`);
    console.log(`📊 ${products.length} prodotti salvati nel backup\n`);

    return backupFile;

  } catch (error) {
    console.error('❌ Errore creazione backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBackup();
