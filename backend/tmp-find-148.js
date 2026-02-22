const fs = require('fs');
const path = require('path');

// Get all product codes from the original CSV import files
const csvDir = __dirname;
const csvFiles = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv') && (f.startsWith('aw-') || f.endsWith('-NEW.csv')));

console.log('=== CSV di importazione originali ===');
const allCsvCodes = new Set();

for (const file of csvFiles) {
  const content = fs.readFileSync(path.join(csvDir, file), 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) continue;

  const header = lines[0];
  // Find "Product code" or "code" column
  const cols = header.split(',').map(c => c.replace(/"/g, '').trim());
  let codeIdx = cols.findIndex(c => c.toLowerCase().includes('product code'));
  if (codeIdx === -1) codeIdx = cols.findIndex(c => c.toLowerCase() === 'code');
  if (codeIdx === -1) codeIdx = cols.findIndex(c => c.toLowerCase() === 'id');

  if (codeIdx === -1) continue;

  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',').map(f => f.replace(/"/g, '').trim());
    const code = fields[codeIdx];
    if (code) {
      allCsvCodes.add(code.toUpperCase());
      count++;
    }
  }
  console.log(`  ${file}: ${count} prodotti (colonna: ${cols[codeIdx]})`);
}

console.log(`\nTotale codici unici nei CSV: ${allCsvCodes.size}`);

// Now compare with DB
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const dbProducts = await prisma.product.findMany({
    where: { source: 'aw' },
    select: { id: true }
  });
  const dbCodes = new Set(dbProducts.map(p => p.id.toUpperCase()));

  console.log(`Prodotti AW nel DB: ${dbCodes.size}`);

  // CSV codes NOT in DB = the 148 missing
  const missingFromDb = [];
  for (const code of allCsvCodes) {
    const variations = [code, 'AW-' + code, code.replace(/^AW-/, '')];
    const found = variations.some(v => dbCodes.has(v.toUpperCase()));
    if (!found) {
      missingFromDb.push(code);
    }
  }

  console.log(`\nCodici nei CSV ma NON nel DB: ${missingFromDb.length}`);
  missingFromDb.sort().forEach(c => console.log(`  ${c}`));

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
