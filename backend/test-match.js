require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const ftp = require('basic-ftp');

async function main() {
  // -- PART 1: Database products --
  const prisma = new PrismaClient();
  try {
    console.log('=== CONNECTING TO DATABASE ===\n');
    const products = await prisma.product.findMany({
      where: { source: 'bigbuy' },
      take: 10,
    });

    if (products.length === 0) {
      console.log('No BigBuy products found in DB.');
    } else {
      const keys = Object.keys(products[0]);
      console.log('--- All field names (' + keys.length + ' fields) ---');
      console.log(keys.join(', '));
      console.log('');

      console.log('--- 10 sample BigBuy DB products ---');
      for (const p of products) {
        const out = { id: p.id };
        if ('bigbuyId' in p) out.bigbuyId = p.bigbuyId;
        if ('ean' in p) out.ean = p.ean;
        if ('sku' in p) out.sku = p.sku;
        if ('externalId' in p) out.externalId = p.externalId;
        if ('sourceId' in p) out.sourceId = p.sourceId;
        if ('parentSku' in p) out.parentSku = p.parentSku;
        if ('slug' in p) out.slug = p.slug;
        if ('barcode' in p) out.barcode = p.barcode;
        if ('mpn' in p) out.mpn = p.mpn;
        if ('partNumber' in p) out.partNumber = p.partNumber;
        out.name = p.name ? p.name.substring(0, 60) : null;
        console.log(out);
      }
    }
    await prisma.$disconnect();
  } catch (err) {
    console.error('DB Error:', err.message);
    await prisma.$disconnect().catch(() => {});
  }

  // -- PART 2: BigBuy FTP CSV --
  console.log('\n=== CONNECTING TO BIGBUY FTP ===\n');
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: process.env.BIGBUY_FTP_HOST,
      user: process.env.BIGBUY_FTP_USER,
      password: process.env.BIGBUY_FTP_PASSWORD,
      secure: false,
    });
    console.log('FTP connected.');

    // Explore directory structure to find the CSV
    const dirs = ['files/products', 'files/combinations', 'files/categories', 'files/manufacturer', 'files/gpsr'];
    for (const dir of dirs) {
      console.log('\n--- ' + dir + '/ ---');
      try {
        const list = await client.list(dir);
        list.forEach(f => console.log('  ' + f.type + ' ' + f.name + ' (' + f.size + ')'));
      } catch (e) {
        console.log('  Error: ' + e.message);
      }
    }

    // Now try to find and download the actual product CSV
    const productsDir = await client.list('files/products');
    const csvFile = productsDir.find(f => f.name.includes('product_') && f.name.includes('_it'));
    let csvPath;
    if (csvFile) {
      csvPath = 'files/products/' + csvFile.name;
    } else if (productsDir.length > 0 && productsDir[0].type === 2) {
      // It's a subdirectory, list it
      const subDir = 'files/products/' + productsDir[0].name;
      console.log('\n--- ' + subDir + '/ ---');
      const subList = await client.list(subDir);
      subList.forEach(f => console.log('  ' + f.type + ' ' + f.name + ' (' + f.size + ')'));
      const found = subList.find(f => f.name.includes('product_') && f.name.includes('_it'));
      csvPath = found ? subDir + '/' + found.name : null;
    }

    if (!csvPath) {
      // Try all product files
      console.log('\nCould not find specific IT file. Trying first CSV found...');
      const allFiles = productsDir.filter(f => f.name.endsWith('.csv'));
      if (allFiles.length > 0) {
        csvPath = 'files/products/' + allFiles[0].name;
      }
    }

    if (!csvPath) {
      console.log('ERROR: Could not locate product CSV file.');
    } else {
      console.log('\nWill download: ' + csvPath);
      const { Writable } = require('stream');
      const chunks = [];
      const writable = new Writable({
        write(chunk, _enc, cb) {
          chunks.push(chunk);
          cb();
        },
      });

      console.log('Downloading...');
      await client.downloadTo(writable, csvPath);
      let csvData = Buffer.concat(chunks).toString('utf-8');

      if (csvData.charCodeAt(0) === 0xfeff) {
        csvData = csvData.slice(1);
      }

      const allLines = csvData.split(/\r?\n/).filter(l => l.length > 0);
      console.log('Total lines in CSV: ' + allLines.length);

      const lines = allLines.slice(0, 100);
      const header = parseCsvLine(lines[0], ';');
      console.log('\n--- CSV Header (' + header.length + ' columns) ---');
      header.forEach((col, i) => console.log('  [' + i + '] ' + col));

      // Find columns by name (flexible)
      const findCol = (name) => header.findIndex(h => h.trim().toUpperCase() === name.toUpperCase());
      const idxID = findCol('ID') >= 0 ? findCol('ID') : 0;
      const idxEAN13 = findCol('EAN13') >= 0 ? findCol('EAN13') : 15;
      const idxPARENT_SKU = findCol('PARENT_SKU') >= 0 ? findCol('PARENT_SKU') : 33;
      const idxNAME = findCol('NAME') >= 0 ? findCol('NAME') : 2;

      console.log('\nUsing columns: ID=[' + idxID + '], EAN13=[' + idxEAN13 + '], PARENT_SKU=[' + idxPARENT_SKU + '], NAME=[' + idxNAME + ']');

      console.log('\n--- First ~99 CSV data rows (ID, EAN13, PARENT_SKU, NAME) ---');
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i], ';');
        if (cols.length < 2) continue;
        const id = cols[idxID] || '';
        const ean = cols[idxEAN13] || '';
        const parentSku = cols[idxPARENT_SKU] || '';
        const name = (cols[idxNAME] || '').substring(0, 50);
        console.log('  Row ' + i + ': ID=' + id + '  EAN13=' + ean + '  PARENT_SKU=' + parentSku + '  NAME="' + name + '"');
      }
    }
  } catch (err) {
    console.error('FTP Error:', err.message);
  } finally {
    client.close();
  }

  console.log('\n=== DONE ===');
}

function parseCsvLine(line, sep) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
