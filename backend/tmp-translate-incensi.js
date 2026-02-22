const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

// Traduzioni manuali precise per tutti i 47 incensi importati
const translations = {
  // GoldNCS - Bastoncini di Resina Dorati
  'GoldNCS-01': 'Bastoncini di Resina Dorata 30g - Salvia Bianca (6 pz)',
  'GoldNCS-02': 'Bastoncini di Resina Dorata 30g - Rosa Pura (6 pz)',
  'GoldNCS-03': 'Bastoncini di Resina Dorata 30g - Incenso (6 pz)',
  'GoldNCS-04': 'Bastoncini di Resina Dorata 30g - Palo Santo (6 pz)',
  'GoldNCS-05': 'Bastoncini di Resina Dorata 30g - Cedro e Salvia (6 pz)',
  'GoldNCS-06': 'Bastoncini di Resina Dorata 30g - Patchouli (6 pz)',

  // SMI - Incenso Smudge Earth Inspired
  'SMI-01': 'Incenso Smudge Ispirato alla Terra - Rosa',
  'SMI-02': 'Incenso Smudge Ispirato alla Terra - Camomilla',
  'SMI-03': 'Incenso Smudge Ispirato alla Terra - Citronella',
  'SMI-04': 'Incenso Smudge Ispirato alla Terra - Rosmarino',
  'SMI-05': 'Incenso Smudge Ispirato alla Terra - Citronella Repellente',
  'SMI-06': 'Incenso Smudge Ispirato alla Terra - Eucalipto',
  'SMI-07': 'Incenso Smudge Ispirato alla Terra - Alloro',
  'SMI-08': 'Incenso Smudge Ispirato alla Terra - Yaga',

  // NBoti - Incenso Naturale Botanico Masala
  'NBoti-01': 'Incenso Naturale Botanico Masala - Lavanda Inglese',
  'NBoti-02': 'Incenso Naturale Botanico Masala - Cannella',
  'NBoti-03': 'Incenso Naturale Botanico Masala - Palo Santo',
  'NBoti-04': 'Incenso Naturale Botanico Masala - Patchouli',
  'NBoti-05': 'Incenso Naturale Botanico Masala - Salvia Bianca',
  'NBoti-06': 'Incenso Naturale Botanico Masala - Sandalo',
  'NBoti-07': 'Incenso Naturale Botanico Masala - Nag Champa',
  'NBoti-08': 'Incenso Naturale Botanico Masala - Mirra',
  'NBoti-09': 'Incenso Naturale Botanico Masala - Ambra',

  // RitRinc - Resina Rituale su Bastoncino
  'RitRinc-03': 'Resina Rituale su Bastoncino - Cannella',
  'RitRinc-04': 'Resina Rituale su Bastoncino - Sandalo',
  'RitRinc-05': 'Resina Rituale su Bastoncino - Camomilla',
  'RitRinc-06': 'Resina Rituale su Bastoncino - Incenso Puro',
  'RitRinc-07': 'Resina Rituale su Bastoncino - Copale',
  'RitRinc-08': 'Resina Rituale su Bastoncino - Sangue di Drago',
  'RitRinc-09': 'Resina Rituale su Bastoncino - Palo Santo',
  'RitRinc-10': 'Resina Rituale su Bastoncino - Patchouli',
  'RitRinc-11': 'Resina Rituale su Bastoncino - Salvia Bianca',
  'RitRinc-12': 'Resina Rituale su Bastoncino - Citronella',
  'RitRinc-13': 'Resina Rituale su Bastoncino - Lavanda',
  'RitRinc-14': 'Resina Rituale su Bastoncino - Arruda',
  'RitRinc-15': 'Resina Rituale su Bastoncino - Mirra',
  'RitRinc-16': 'Resina Rituale su Bastoncino - Vaniglia',

  // TribalSi - Tribal Soul Incenso
  'TribalSi-01': 'Tribal Soul Incenso - Copale Bianco',
  'TribalSi-02': 'Tribal Soul Incenso - Palo Santo',
  'TribalSi-03': 'Tribal Soul Incenso - Salvia Bianca',
  'TribalSi-04': 'Tribal Soul Incenso - Mirra',
  'TribalSi-05': 'Tribal Soul Incenso - Salvia Bianca e Lavanda',
  'TribalSi-06': 'Tribal Soul Incenso - Salvia Bianca e Palo Santo',
  'TribalSi-07': 'Tribal Soul Incenso - Palo Santo e Pino',
  'TribalSi-08': 'Tribal Soul Incenso - Erba Dolce e Cedro',
  'TribalSi-09': 'Tribal Soul Incenso - Lavanda',
  'TribalSi-10': 'Tribal Soul Incenso - Sandalo',
};

async function main() {
  let updated = 0;
  for (const [id, italianName] of Object.entries(translations)) {
    try {
      await prisma.product.update({
        where: { id },
        data: { name: italianName }
      });
      console.log(`OK ${id}: ${italianName}`);
      updated++;
    } catch (err) {
      console.log(`ERR ${id}: ${err.message.substring(0, 80)}`);
    }
  }
  console.log(`\nTradotti: ${updated}/${Object.keys(translations).length}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error('ERROR:', e.message); prisma.$disconnect(); });
