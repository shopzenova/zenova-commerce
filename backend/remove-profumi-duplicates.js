/**
 * RIMUOVI DUPLICATI PROFUMI UOMO E DONNA
 *
 * Problema: Ogni profumo è stato importato 2 volte da BigBuy
 * - Una volta con ID barcode/EAN (es. 3614273790840)
 * - Una volta con ID interno BigBuy (es. M0121783)
 *
 * Strategia: Per ogni gruppo di duplicati (stesso nome), teniamo
 * l'ID interno BigBuy (M..., S..., V...) e rimuoviamo i barcode/EAN.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicates() {
  console.log('🔍 Ricerca duplicati profumi...\n');

  // Cerca prodotti profumi-uomini e profumi-donne
  const profumi = await prisma.product.findMany({
    where: {
      zenovaSubcategory: { in: ['profumi-uomini', 'profumi-donne'] }
    },
    select: { id: true, name: true, zenovaSubcategory: true }
  });

  console.log(`📦 Totale prodotti profumi: ${profumi.length}`);

  // Raggruppa per nome
  const groups = {};
  for (const p of profumi) {
    if (!groups[p.name]) groups[p.name] = [];
    groups[p.name].push(p);
  }

  // Trova gruppi con duplicati
  const duplicateGroups = Object.entries(groups).filter(([_, items]) => items.length > 1);
  console.log(`🔄 Gruppi con duplicati: ${duplicateGroups.length}`);

  const toDelete = [];

  for (const [name, items] of duplicateGroups) {
    // Priorità: tieni ID interno BigBuy (M..., S..., V...), elimina EAN/barcode (numerico puro)
    const internal = items.filter(p => /^[A-Z]/.test(p.id)); // ID che inizia con lettera
    const barcode = items.filter(p => /^\d+$/.test(p.id));   // ID tutto numerico (EAN)

    if (internal.length > 0 && barcode.length > 0) {
      // Tieni gli interni, elimina i barcode
      toDelete.push(...barcode);
    } else if (items.length > 1) {
      // Se sono tutti dello stesso tipo, tieni il primo ed elimina il resto
      toDelete.push(...items.slice(1));
    }
  }

  console.log(`\n🗑️  Prodotti da eliminare: ${toDelete.length}`);

  // Conta per categoria
  const uominiDelete = toDelete.filter(p => p.zenovaSubcategory === 'profumi-uomini').length;
  const donneDelete = toDelete.filter(p => p.zenovaSubcategory === 'profumi-donne').length;
  console.log(`   - Profumi Uomini: ${uominiDelete}`);
  console.log(`   - Profumi Donna: ${donneDelete}`);

  // Mostra alcuni esempi
  console.log('\n📋 Esempi di eliminazione:');
  for (const [name, items] of duplicateGroups.slice(0, 5)) {
    const internal = items.filter(p => /^[A-Z]/.test(p.id));
    const barcode = items.filter(p => /^\d+$/.test(p.id));
    console.log(`   "${name}"`);
    console.log(`     ✅ Tengo: ${internal.map(p => p.id).join(', ') || items[0].id}`);
    console.log(`     ❌ Elimino: ${barcode.map(p => p.id).join(', ') || items.slice(1).map(p => p.id).join(', ')}`);
  }

  if (toDelete.length === 0) {
    console.log('\n✅ Nessun duplicato trovato!');
    await prisma.$disconnect();
    return;
  }

  // Elimina duplicati
  const deleteIds = toDelete.map(p => p.id);

  console.log(`\n🚀 Eliminazione ${deleteIds.length} duplicati in corso...`);

  // Prima elimina gli OrderItem che referenziano questi prodotti
  const deletedOrderItems = await prisma.orderItem.deleteMany({
    where: { productId: { in: deleteIds } }
  });
  if (deletedOrderItems.count > 0) {
    console.log(`   Rimossi ${deletedOrderItems.count} order items collegati`);
  }

  // Poi elimina i prodotti
  const result = await prisma.product.deleteMany({
    where: { id: { in: deleteIds } }
  });

  console.log(`\n✅ Eliminati ${result.count} prodotti duplicati!`);

  // Conta prodotti rimanenti
  const remaining = await prisma.product.count({
    where: { zenovaSubcategory: { in: ['profumi-uomini', 'profumi-donne'] } }
  });
  console.log(`📦 Profumi rimanenti: ${remaining}`);

  await prisma.$disconnect();
}

removeDuplicates().catch(e => {
  console.error('❌ Errore:', e);
  prisma.$disconnect();
  process.exit(1);
});
