/**
 * Script: Converti tutti i retailPrice per includere IVA (22%)
 *
 * Operazioni in ordine:
 * 1. Ripristina i 37 Smart LED dal backup (avevano prezzi sbagliati)
 * 2. Moltiplica TUTTI i retailPrice nel DB per 1.22
 * 3. Aggiorna i file JSON (top-100-products.json, data/products.json)
 * 4. Applica arrotondamento .90 ai Smart LED
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('=== CONVERSIONE PREZZI IVA ===\n');

  // ========== STEP 1: Ripristina Smart LED dal backup ==========
  console.log('STEP 1: Ripristino Smart LED dal backup...');

  const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup-prezzi-completo.json'), 'utf8'));
  const smartLedBackup = backup.products.filter(p => p.zenovaSubcategory === 'smart-led-illuminazione');

  console.log(`  Trovati ${smartLedBackup.length} prodotti Smart LED nel backup`);

  let restoredCount = 0;
  for (const p of smartLedBackup) {
    await prisma.product.update({
      where: { id: p.id },
      data: { retailPrice: parseFloat(p.retailPrice) }
    });
    restoredCount++;
  }
  console.log(`  Ripristinati: ${restoredCount}/${smartLedBackup.length}\n`);

  // ========== STEP 2: Converti TUTTI i retailPrice nel DB (x1.22) ==========
  console.log('STEP 2: Conversione TUTTI i retailPrice nel DB (x1.22)...');

  const allProducts = await prisma.product.findMany({
    select: { id: true, retailPrice: true, name: true, zenovaSubcategory: true }
  });

  console.log(`  Totale prodotti nel DB: ${allProducts.length}`);

  let convertedCount = 0;
  let errors = [];

  for (const p of allProducts) {
    try {
      const oldPrice = parseFloat(p.retailPrice);
      const newPrice = Math.round(oldPrice * 1.22 * 100) / 100;

      await prisma.product.update({
        where: { id: p.id },
        data: { retailPrice: newPrice }
      });
      convertedCount++;
    } catch (err) {
      errors.push({ id: p.id, error: err.message });
    }
  }

  console.log(`  Convertiti: ${convertedCount}/${allProducts.length}`);
  if (errors.length > 0) {
    console.log(`  Errori: ${errors.length}`);
    errors.forEach(e => console.log(`    ${e.id}: ${e.error}`));
  }
  console.log('');

  // ========== STEP 3: Aggiorna i file JSON ==========
  console.log('STEP 3: Aggiornamento file JSON...');

  const jsonFiles = [
    path.join(__dirname, 'top-100-products.json'),
    path.join(__dirname, 'data', 'products.json')
  ];

  for (const filePath of jsonFiles) {
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${path.basename(filePath)} non esiste`);
      continue;
    }

    try {
      const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let updated = 0;

      for (const p of products) {
        if (p.retailPrice !== undefined) {
          const oldPrice = parseFloat(p.retailPrice);
          p.retailPrice = Math.round(oldPrice * 1.22 * 100) / 100;
          updated++;
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
      console.log(`  ${path.basename(filePath)}: ${updated} prezzi aggiornati`);
    } catch (err) {
      console.log(`  ERRORE ${path.basename(filePath)}: ${err.message}`);
    }
  }
  console.log('');

  // ========== STEP 4: Arrotondamento Smart LED a .90 ==========
  console.log('STEP 4: Arrotondamento Smart LED a .90...');

  const smartLedProducts = await prisma.product.findMany({
    where: { zenovaSubcategory: 'smart-led-illuminazione' },
    select: { id: true, retailPrice: true, name: true }
  });

  console.log(`  Trovati ${smartLedProducts.length} prodotti Smart LED nel DB`);

  let roundedCount = 0;
  for (const p of smartLedProducts) {
    const currentPrice = parseFloat(p.retailPrice); // ora include IVA

    // Arrotonda per difetto a .90
    // Es: 55.02 -> 54.90, 62.07 -> 61.90, 9.31 -> 8.90
    const intPart = Math.floor(currentPrice);
    const decPart = currentPrice - intPart;

    let roundedPrice;
    if (decPart >= 0.90) {
      // Es: 55.95 -> 55.90
      roundedPrice = intPart + 0.90;
    } else {
      // Es: 55.02 -> 54.90
      roundedPrice = (intPart - 1) + 0.90;
    }

    // Sicurezza: non andare sotto 0.90
    if (roundedPrice < 0.90) roundedPrice = 0.90;

    console.log(`  ${p.name.substring(0, 50).padEnd(50)} €${currentPrice.toFixed(2)} -> €${roundedPrice.toFixed(2)}`);

    await prisma.product.update({
      where: { id: p.id },
      data: { retailPrice: roundedPrice }
    });
    roundedCount++;
  }

  console.log(`\n  Arrotondati: ${roundedCount}/${smartLedProducts.length}\n`);

  // ========== RIEPILOGO ==========
  console.log('=== RIEPILOGO ===');
  console.log(`Smart LED ripristinati dal backup: ${restoredCount}`);
  console.log(`Prezzi DB convertiti (x1.22): ${convertedCount}`);
  console.log(`Smart LED arrotondati a .90: ${roundedCount}`);
  console.log(`Errori totali: ${errors.length}`);
  console.log('\nFatto! Il backend con applyIVA pass-through e\' ora compatibile.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
