const axios = require('axios');
require('dotenv').config();
const baseURL = process.env.AW_API_URL || 'https://app.aiku.io/app/re-api';
const token = process.env.AW_API_TOKEN;
const client = axios.create({ baseURL, headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }, timeout: 30000 });

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Get portfolio products from AW API
  let portfolio = new Map();
  let page = 1;
  while (true) {
    const r = await client.get('/dropshipping/products/my-products', { params: { page, per_page: 500, sort: 'code' } });
    const products = r.data.data || [];
    for (const p of products) {
      if (p.code) portfolio.set(p.code.toUpperCase(), { id: p.id, myProductId: p.my_product_id });
    }
    const lastPage = r.data.meta?.last_page || 1;
    if (page >= lastPage) break;
    page++;
  }
  console.log('Portfolio AW API totale: ' + portfolio.size);

  // Get Zenova DB AW products
  const awProducts = await prisma.product.findMany({ where: { source: 'aw' }, select: { id: true, name: true } });
  console.log('Prodotti AW in Zenova DB: ' + awProducts.length);

  let found = 0, missing = [];
  for (const p of awProducts) {
    const code = (p.id || '').toUpperCase();
    if (portfolio.has(code)) {
      found++;
    } else {
      missing.push({ code: p.id, name: (p.name || '').substring(0, 60) });
    }
  }
  console.log('\nCoperti nel portfolio: ' + found + '/' + awProducts.length + ' (' + Math.round(found/awProducts.length*100) + '%)');
  console.log('Mancanti: ' + missing.length);

  if (missing.length > 0) {
    console.log('\nLista prodotti AW mancanti dal portfolio:');
    missing.forEach(m => console.log('  ' + m.code + ' - ' + m.name));
  }

  // Check the 101 previously identified missing ones
  const missingCodes = ['AATOM-11','AATOM-12','AATOM-14','AATOM-16','AATOM-18','AATOM-19','AATOM-20','AATOM-21','AATOM-22','AATOM-23','AATOM-24','AATOM-26','AATOM-28','AATOM-33','AATOM-34','AATOM-35','AATOM-36','AATOM-37','AATOM-38','AATOM-40','AATOM-41','ACGP-02','ACGP-03','ACGP-06','AromaJ-06','asc-01','asc-04','asc-05','AWMJ-01','AWPFO-04','AWPFO-10','AWPFO-14','AWPFO-25','AWPFO-30','BackF-01','BackF-14A','BackF-68','BBUG-01','BBUG-02','BBUG-03','BBUG-04','BBUG-05','BBUG-06','BCS-02DS','BCS-03DS','BinC-01','BinC-02','BinC-03','BinC-04','BinC-05','BinC-07','BinC-13','BinC-15','BinC-16','BinC-21','BinC-23','BinC-24','BincS-04','BincS-13','BincS-18','CBB-03','CBB-04','CBB-06','chkcc-08','CWA-01','CWA-02','CWA-03','CWA-04','CWA-05','CWA-08','CWA-09','CWA-13','EOSet-01','EOUL-32','EOUL-37','EOUL-40','EOUL-44','EOUL-45','EOUL-50','EOUL-55','FOBP-136','FOBP-139','FOBP-147','FOBP-149','FOBP-162','FOBp-20','FOBp-43','FOBp-46','FOBp-61','FOBp-80','hhc-01','hhc-03','qsalt-29','qsalt-31','qsalt-44','Rreed-04','Rreed-05','Rreed-07','TeaP-02','TeaP-03','TeaP-04'];

  let stillMissing = 0, nowFound = 0;
  for (const code of missingCodes) {
    if (portfolio.has(code.toUpperCase())) {
      nowFound++;
    } else {
      stillMissing++;
    }
  }
  console.log('\n--- Status 101 prodotti problematici ---');
  console.log('Ora nel portfolio: ' + nowFound);
  console.log('Ancora mancanti: ' + stillMissing);

  await prisma.$disconnect();
}
main().catch(e => console.error('ERROR:', e.message));
