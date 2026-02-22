const { PrismaClient } = require('@prisma/client');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const prisma = new PrismaClient();

const FTP_CONFIG = {
  host: 'www.dropshippers.com.es',
  user: process.env.BIGBUY_FTP_USER,
  password: process.env.BIGBUY_FTP_PASSWORD,
  secure: false
};

const CSV_FILES = [
  'product_2507_it.csv', // Profumeria
  'product_2501_it.csv', // Salute
  'product_2399_it.csv', // Casa
  'product_2609_it.csv', // Elettronica
];

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

async function downloadCSV(client, filename) {
  const localPath = path.join(__dirname, 'tmp', filename);
  if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
    fs.mkdirSync(path.join(__dirname, 'tmp'));
  }
  const remotePath = `/files/products/csv/standard/${filename}`;
  console.log(`  Downloading ${filename}...`);
  await client.downloadTo(localPath, remotePath);
  return fs.readFileSync(localPath, 'utf-8');
}

async function main() {
  // 1. Get all affected products
  const affected = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'MYMEMORY', mode: 'insensitive' } },
        { name: { contains: 'MYMEMORY', mode: 'insensitive' } },
      ]
    },
    select: { id: true, name: true, ean: true, bigbuyId: true, source: true },
  });
  console.log(`Prodotti da correggere: ${affected.length}`);

  // Build lookup maps
  const byBigbuyId = new Map();
  const byId = new Map();
  const byEan = new Map();
  for (const p of affected) {
    if (p.bigbuyId) byBigbuyId.set(p.bigbuyId.toUpperCase(), p);
    byId.set(p.id.toUpperCase(), p);
    if (p.ean) byEan.set(p.ean, p);
  }

  // 2. Download CSVs via FTP
  console.log('\nConnessione FTP BigBuy...');
  const ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = false;
  await ftpClient.access(FTP_CONFIG);
  console.log('Connesso!');

  // Parse all CSVs and build description map
  const descriptions = new Map(); // product DB id -> { name, description }

  for (const csvFile of CSV_FILES) {
    const content = await downloadCSV(ftpClient, csvFile);
    const lines = content.split('\n');
    const header = lines[0].replace(/^\uFEFF/, '');
    const columns = parseCSVLine(header);

    // Find column indices
    const idIdx = columns.findIndex(c => c.toUpperCase() === 'ID');
    const nameIdx = columns.findIndex(c => c.toUpperCase() === 'NAME');
    const descIdx = columns.findIndex(c => c.toUpperCase() === 'DESCRIPTION');
    const eanIdx = columns.findIndex(c => c.toUpperCase() === 'EAN13');

    console.log(`  ${csvFile}: ${lines.length - 1} righe, cols: ID=${idIdx}, NAME=${nameIdx}, DESC=${descIdx}, EAN=${eanIdx}`);

    let matched = 0;
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const fields = parseCSVLine(lines[i]);
      const csvId = (fields[idIdx] || '').trim().toUpperCase();
      const csvName = (fields[nameIdx] || '').trim();
      const csvDesc = (fields[descIdx] || '').trim();
      const csvEan = (fields[eanIdx] || '').trim();

      if (!csvDesc) continue;

      // Try to match
      let product = byBigbuyId.get(csvId) || byId.get(csvId) || byId.get(csvEan) || byEan.get(csvEan);
      if (product) {
        descriptions.set(product.id, { name: csvName, description: csvDesc });
        matched++;
      }
    }
    console.log(`  Matchati: ${matched}`);
  }

  ftpClient.close();
  console.log(`\nDescrizioni trovate: ${descriptions.size}/${affected.length}`);

  // 3. Update database
  let updated = 0, nameFixed = 0;
  for (const [productId, data] of descriptions) {
    const product = affected.find(p => p.id === productId);
    const updateData = { description: data.description };

    // Fix name if it contains MYMEMORY
    if (product && product.name && product.name.toUpperCase().includes('MYMEMORY') && data.name) {
      updateData.name = data.name;
      nameFixed++;
    }

    await prisma.product.update({
      where: { id: productId },
      data: updateData
    });
    updated++;
  }

  console.log(`\nAggiornati: ${updated} descrizioni, ${nameFixed} nomi`);
  console.log(`Non trovati nel CSV: ${affected.length - descriptions.size}`);

  // List unmatched
  const unmatched = affected.filter(p => !descriptions.has(p.id));
  if (unmatched.length > 0) {
    console.log('\nProdotti non matchati:');
    unmatched.slice(0, 20).forEach(p => console.log(`  ${p.id} - ${(p.name || '').substring(0, 50)} (bigbuyId: ${p.bigbuyId})`));
    if (unmatched.length > 20) console.log(`  ... e altri ${unmatched.length - 20}`);
  }

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
