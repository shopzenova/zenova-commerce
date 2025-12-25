const fs = require('fs');

const products = JSON.parse(fs.readFileSync('./top-100-products.json', 'utf-8'));

const diffusori = products.filter(p =>
    p.source === 'aw' &&
    (p.zenovaSubcategory === 'diffusori' || p.subcategory === 'diffusori')
);

console.log('=== VERIFICA CATEGORIA DIFFUSORI AW ===\n');
console.log('Totale prodotti:', diffusori.length);

const withMyMemory = diffusori.filter(p =>
    p.description && p.description.includes('MYMEMORY')
);

const withEnglish = diffusori.filter(p =>
    p.name.includes('Gift Set') ||
    p.name.includes('Wax Melts') ||
    p.name.includes('Backflow Incense Burner') ||
    p.name.includes('Simmering Granules')
);

console.log('❌ Con errore MyMemory descrizione:', withMyMemory.length);
console.log('⚠️  Con nomi parzialmente inglesi:', withEnglish.length);
console.log('✅ Prodotti completamente in italiano:', diffusori.length - withEnglish.length);

if (withMyMemory.length > 0) {
    console.log('\nEsempi MyMemory:');
    withMyMemory.slice(0, 3).forEach(p =>
        console.log(`  - ${p.name}`)
    );
}

if (withEnglish.length > 0) {
    console.log('\nEsempi nomi parzialmente inglesi:');
    withEnglish.slice(0, 10).forEach(p =>
        console.log(`  - ${p.name}`)
    );
}

console.log('\n=== RIEPILOGO ===');
console.log('Situazione categoria diffusori:');
console.log(`  ✅ ${diffusori.length - withMyMemory.length} con descrizioni OK`);
console.log(`  ❌ ${withMyMemory.length} con descrizioni MyMemory da sistemare`);
