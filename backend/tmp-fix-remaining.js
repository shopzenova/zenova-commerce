const { PrismaClient } = require('@prisma/client');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ';' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function main() {
  // Get remaining affected products
  const affected = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, ean: true, bigbuyId: true },
  });
  console.log(`Ancora da correggere: ${affected.length}`);

  if (affected.length === 0) {
    console.log('Tutti corretti!');
    await prisma.$disconnect();
    return;
  }

  // Load all CSV data from tmp folder (already downloaded)
  const csvFiles = ['product_2507_it.csv', 'product_2501_it.csv', 'product_2399_it.csv', 'product_2609_it.csv'];

  // Build full CSV lookup by ALL possible keys: ID, EAN, NAME prefix, bigbuyId
  const csvByEan = new Map();
  const csvById = new Map();

  for (const csvFile of csvFiles) {
    const localPath = path.join(__dirname, 'tmp', csvFile);
    if (!fs.existsSync(localPath)) {
      console.log(`File non trovato: ${localPath}, skip`);
      continue;
    }
    const content = fs.readFileSync(localPath, 'utf-8');
    const lines = content.split('\n');
    const header = lines[0].replace(/^\uFEFF/, '');
    const columns = parseCSVLine(header);

    const idIdx = columns.findIndex(c => c.toUpperCase() === 'ID');
    const nameIdx = columns.findIndex(c => c.toUpperCase() === 'NAME');
    const descIdx = columns.findIndex(c => c.toUpperCase() === 'DESCRIPTION');
    const eanIdx = columns.findIndex(c => c.toUpperCase() === 'EAN13');

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const fields = parseCSVLine(lines[i]);
      const csvId = (fields[idIdx] || '').trim();
      const csvName = (fields[nameIdx] || '').trim();
      const csvDesc = (fields[descIdx] || '').trim();
      const csvEan = (fields[eanIdx] || '').trim();

      if (!csvDesc) continue;

      const entry = { name: csvName, description: csvDesc };
      if (csvEan) csvByEan.set(csvEan, entry);
      if (csvId) csvById.set(csvId.toUpperCase(), entry);
    }
  }
  console.log(`CSV lookup: ${csvById.size} per ID, ${csvByEan.size} per EAN`);

  // Try matching with more strategies
  let updated = 0, nameFixed = 0;
  const stillUnmatched = [];

  for (const p of affected) {
    let match = null;

    // Strategy 1: bigbuyId
    if (p.bigbuyId) match = csvById.get(p.bigbuyId.toUpperCase());
    // Strategy 2: id as-is
    if (!match) match = csvById.get(p.id.toUpperCase());
    // Strategy 3: id as EAN
    if (!match) match = csvByEan.get(p.id);
    // Strategy 4: ean field
    if (!match && p.ean) match = csvByEan.get(p.ean);
    // Strategy 5: bigbuyId without prefix (S, M, V)
    if (!match && p.bigbuyId) {
      const stripped = p.bigbuyId.replace(/^[SMV]0*/, '');
      match = csvById.get(stripped);
    }

    if (match) {
      const updateData = { description: match.description };
      if (p.name && p.name.toUpperCase().includes('MYMEMORY') && match.name) {
        updateData.name = match.name;
        nameFixed++;
      }
      await prisma.product.update({ where: { id: p.id }, data: updateData });
      updated++;
    } else {
      stillUnmatched.push(p);
    }
  }

  console.log(`\nAggiornati: ${updated}, Nomi fixati: ${nameFixed}`);
  console.log(`Ancora senza match: ${stillUnmatched.length}`);

  if (stillUnmatched.length > 0) {
    console.log('\nProdotti senza descrizione nel CSV:');
    stillUnmatched.forEach(p => {
      console.log(`  ${p.id} | bigbuyId: ${p.bigbuyId} | ${(p.name || '').substring(0, 55)}`);
    });
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
