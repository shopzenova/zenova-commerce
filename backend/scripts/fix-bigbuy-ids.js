/**
 * FIX BIGBUY IDS
 * Aggiorna il campo bigbuyId nel database usando i CSV BigBuy.
 * Matcha i prodotti per EAN e imposta il bigbuyId corretto.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function fixBigBuyIds() {
  console.log('\n=== FIX BIGBUY IDS ===\n');

  // 1. Leggi tutti i CSV BigBuy e crea mappa EAN → ID
  const csvDir = path.join(__dirname, '../bigbuy-data');
  const csvFiles = fs.readdirSync(csvDir).filter(f => f.startsWith('product_') && f.endsWith('.csv'));

  console.log(`Trovati ${csvFiles.length} file CSV BigBuy`);

  const eanToId = {};

  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file);
    console.log(`\nProcesso: ${file}`);

    await new Promise((resolve, reject) => {
      let count = 0;
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          // ID BigBuy (con BOM UTF-8 nella prima colonna)
          const bigbuyId = row['﻿ID'] || row['ID'] || row['id'];
          // EAN
          const ean = row['EAN13'] || row['EAN'] || row['ean'];

          if (bigbuyId && ean && ean.trim()) {
            // Normalizza EAN (rimuovi spazi, aggiungi zeri iniziali se necessario)
            const eanNorm = ean.trim();
            eanToId[eanNorm] = bigbuyId.trim();
            count++;
          }
        })
        .on('end', () => {
          console.log(`  -> ${count} prodotti con EAN`);
          resolve();
        })
        .on('error', reject);
    });
  }

  console.log(`\nTotale mappature EAN → ID: ${Object.keys(eanToId).length}`);

  // 2. Carica prodotti BigBuy dal database
  console.log('\nCarico prodotti BigBuy dal database...');

  const products = await prisma.product.findMany({
    where: { source: 'bigbuy' },
    select: { id: true, ean: true, bigbuyId: true, name: true }
  });

  console.log(`Trovati ${products.length} prodotti BigBuy nel DB`);

  // 3. Aggiorna bigbuyId per ogni prodotto che matcha per EAN
  let updated = 0;
  let notFound = 0;
  let alreadyCorrect = 0;

  for (const product of products) {
    const ean = product.ean?.trim();
    if (!ean) {
      notFound++;
      continue;
    }

    const correctId = eanToId[ean];
    if (!correctId) {
      notFound++;
      continue;
    }

    // Salta se gia' corretto
    if (product.bigbuyId === correctId) {
      alreadyCorrect++;
      continue;
    }

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { bigbuyId: correctId }
      });
      updated++;

      if (updated <= 5) {
        console.log(`  Aggiornato: ${product.id} -> bigbuyId=${correctId} (era: ${product.bigbuyId})`);
      } else if (updated === 6) {
        console.log('  ...');
      }
    } catch (error) {
      console.error(`  Errore aggiornamento ${product.id}: ${error.message}`);
    }
  }

  console.log('\n=== RISULTATI ===');
  console.log(`Prodotti aggiornati: ${updated}`);
  console.log(`Gia' corretti: ${alreadyCorrect}`);
  console.log(`EAN non trovato nei CSV: ${notFound}`);
  console.log('');

  await prisma.$disconnect();
}

fixBigBuyIds()
  .then(() => {
    console.log('Completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Errore:', error);
    process.exit(1);
  });
