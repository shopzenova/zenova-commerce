const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('bigbuy-data/product_2501_it.csv')
  .pipe(csv({separator: ';'}))
  .on('data', (data) => {
    if(results.length < 5) results.push(data);
  })
  .on('end', () => {
    results.forEach((p, i) => {
      console.log(`Prodotto ${i+1}:`);
      console.log('  ID:', p['﻿ID']);
      console.log('  NAME:', p.NAME.substring(0, 60));
      console.log('');
    });
  });
