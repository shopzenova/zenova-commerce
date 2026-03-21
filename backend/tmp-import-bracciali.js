require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// Parser CSV robusto
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const FAMIGLIE = ['AWPS','Boho-','ManB-','CWBG','ChkSB','FGemB','GDPB','LavaSB','MGBS','PFJ'];

function isBracciale(code) {
  return FAMIGLIE.some(f => code.startsWith(f));
}

async function main() {
  const csv = fs.readFileSync('./aw-catalog-march21.csv', 'utf8');
  const lines = csv.split('\n').filter(l => l.trim());

  const prodotti = [];
  for (const line of lines.slice(1)) {
    const c = parseCSVLine(line);
    const code = c[1];
    if (!code || !isBracciale(code)) continue;
    if (c[0] !== 'Active') continue;

    const wholesale = parseFloat(c[11]) || 0;
    const retailPrice = Math.round((wholesale * 1.5 + 3) * 100) / 100;
    const stock = parseInt(c[27]) || 0;
    const weight = parseFloat(c[17]) || 0.02; // kg
    const images = c[28] ? c[28].split(',').map(u => u.trim()).filter(u => u.startsWith('http')) : [];
    const name = c[15].replace(/^"|"$/g, '');
    const descPlain = c[22].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const ean = c[9] || null;

    prodotti.push({
      id: code,
      name,
      description: descPlain || name,
      price: wholesale,
      retailPrice,
      stock,
      weight,
      weightUnit: 'kg',
      images,
      image: images[0] || null,
      ean,
      source: 'aw',
      zenovaCategory: 'natural-wellness',
      zenovaSubcategory: 'pietre-preziose',
      visible: true,
      active: true,
    });
  }

  console.log(`📦 Prodotti da importare: ${prodotti.length}`);

  let importati = 0, aggiornati = 0, errori = 0;

  for (const p of prodotti) {
    try {
      const exists = await prisma.product.findUnique({ where: { id: p.id } });
      if (exists) {
        await prisma.product.update({ where: { id: p.id }, data: p });
        aggiornati++;
        console.log(`🔄 Aggiornato: ${p.id} — ${p.name}`);
      } else {
        await prisma.product.create({ data: p });
        importati++;
        console.log(`✅ Importato: ${p.id} — ${p.name} | €${p.price} ws → €${p.retailPrice} | stock:${p.stock}`);
      }
    } catch(e) {
      errori++;
      console.log(`❌ Errore ${p.id}: ${e.message.substring(0,80)}`);
    }
  }

  console.log(`\n✅ Importati: ${importati} | 🔄 Aggiornati: ${aggiornati} | ❌ Errori: ${errori}`);
  await prisma.$disconnect();
}

main();
