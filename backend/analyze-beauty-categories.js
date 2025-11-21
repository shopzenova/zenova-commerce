const fs = require('fs');
const csv = require('csv-parser');

const beautyIds = ['2507','2508','2509','2510','2511','2513','2514','2527','2531','2533','2534','2536','2537','2538','2539','2547','2549','2550','2551','2553','2555','2557','2558','2560','2562','2564','2566','2569','2653','2659','2891','2892','2900','3009','3010','3011','3167','3168','3169','3171','3189','3190','3191'];

console.log('📊 Categorie Beauty BigBuy:\n');

fs.createReadStream('bigbuy-data/mapper_category.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    if (beautyIds.includes(row.id)) {
      const name = row.name_it || row.name || '';
      console.log(`${row.id.padEnd(6)} → ${name}`);
    }
  })
  .on('end', () => {
    console.log('\n✅ Analisi completata');
  });
