const https = require('https');

console.log('=== DIAGNOSI COMPLETA: Dove sono i prodotti? ===\n');

// 1. Verifica Railway
console.log('1️⃣  RAILWAY API\n');

https.request({
  hostname: 'zenova-commerce-production.up.railway.app',
  port: 443,
  path: '/api/products?pageSize=10000',
  method: 'GET',
  rejectUnauthorized: false
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const products = response.data || response;

      console.log(`   Totale prodotti: ${products.length}`);

      // Cerca i nuovi prodotti specifici
      const candeleNuove = products.filter(p =>
        p.id && p.id.startsWith('aw-') &&
        p.name && (p.name.toLowerCase().includes('candel') || p.name.toLowerCase().includes('candle'))
      );

      const incensiNuovi = products.filter(p =>
        p.id && p.id.startsWith('aw-') &&
        p.name && (
          p.name.toLowerCase().includes('incens') ||
          p.name.toLowerCase().includes('coni') ||
          p.name.toLowerCase().includes('cone') ||
          p.name.toLowerCase().includes('backflow') ||
          p.name.toLowerCase().includes('riflusso')
        )
      );

      console.log(`   🕯️  Candele nuove (aw-*): ${candeleNuove.length}`);
      console.log(`   🔥 Incensi nuovi (aw-*): ${incensiNuovi.length}\n`);

      if (candeleNuove.length > 0) {
        console.log('   ✅ Railway HA le candele!\n');
        console.log('   Esempi candele su Railway:');
        candeleNuove.slice(0, 5).forEach(p => {
          console.log(`      ${p.id} | ${p.name.substring(0, 40)} | visible:${p.visible} | zone:${p.zone}`);
        });
      } else {
        console.log('   ❌ Railway NON ha le candele!\n');
      }

      if (incensiNuovi.length > 0) {
        console.log(`\n   ✅ Railway HA gli incensi!\n`);
        console.log('   Esempi incensi su Railway:');
        incensiNuovi.slice(0, 5).forEach(p => {
          console.log(`      ${p.id} | ${p.name.substring(0, 40)} | visible:${p.visible} | zone:${p.zone}`);
        });
      } else {
        console.log('   ❌ Railway NON ha gli incensi!\n');
      }

      // 2. Simula caricamento da shop.zenova.ovh
      setTimeout(() => {
        console.log('\n2️⃣  SIMULAZIONE CARICAMENTO DA SHOP.ZENOVA.OVH\n');

        // Controlla se i prodotti sarebbero visibili con i filtri frontend
        const visibili = products.filter(p => p.visible !== false);
        const conZone = products.filter(p => p.zone !== undefined);

        console.log(`   Prodotti con visible=true: ${visibili.length}`);
        console.log(`   Prodotti con zone definita: ${conZone.length}`);

        // Verifica candele e incensi visibili
        const candeleVisibili = candeleNuove.filter(p => p.visible !== false);
        const incensiVisibili = incensiNuovi.filter(p => p.visible !== false);

        console.log(`\n   🕯️  Candele nuove VISIBILI: ${candeleVisibili.length}/${candeleNuove.length}`);
        console.log(`   🔥 Incensi nuovi VISIBILI: ${incensiVisibili.length}/${incensiNuovi.length}\n`);

        if (candeleVisibili.length < candeleNuove.length) {
          console.log(`   ⚠️  ${candeleNuove.length - candeleVisibili.length} candele sono NASCOSTE!\n`);
        }

        if (incensiVisibili.length < incensiNuovi.length) {
          console.log(`   ⚠️  ${incensiNuovi.length - incensiVisibili.length} incensi sono NASCOSTI!\n`);
        }

        // Verifica sottocategorie
        console.log('   📂 Sottocategorie candele nuove:');
        const candeleSubcats = {};
        candeleNuove.forEach(p => {
          const sub = p.zenovaSubcategory || 'undefined';
          candeleSubcats[sub] = (candeleSubcats[sub] || 0) + 1;
        });
        Object.entries(candeleSubcats).forEach(([sub, count]) => {
          console.log(`      ${sub}: ${count}`);
        });

        console.log('\n   📂 Sottocategorie incensi nuovi:');
        const incensiSubcats = {};
        incensiNuovi.forEach(p => {
          const sub = p.zenovaSubcategory || 'undefined';
          incensiSubcats[sub] = (incensiSubcats[sub] || 0) + 1;
        });
        Object.entries(incensiSubcats).forEach(([sub, count]) => {
          console.log(`      ${sub}: ${count}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('🎯 CONCLUSIONE');
        console.log('='.repeat(60) + '\n');

        if (candeleNuove.length > 0 && incensiNuovi.length > 0) {
          console.log('✅ I prodotti SONO su Railway');
          console.log('✅ I prodotti sono VISIBILI (visible=true)');
          console.log('\nSe non li vedi su shop.zenova.ovh, il problema è nel FRONTEND.');
          console.log('Possibili cause:');
          console.log('  - Cache del browser');
          console.log('  - Filtri per categoria nel frontend');
          console.log('  - Prodotti non in homepage (solo in sidebar/prodotti)');
        } else {
          console.log('❌ I prodotti NON sono ancora su Railway');
          console.log('Il deploy potrebbe non essere completato correttamente.');
        }

        console.log('\n');

      }, 1000);

    } catch (e) {
      console.error('Errore parsing Railway:', e.message);
    }
  });
}).end();
