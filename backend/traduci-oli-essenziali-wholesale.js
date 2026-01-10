const fs = require('fs');

console.log('🌍 TRADUZIONE COMPLETA OLI ESSENZIALI WHOLESALE\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-translation-oli-wholesale-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Mappatura nomi oli essenziali EN → IT
const oliTraduzioni = {
  "Citronella": "Citronella",
  "Cinnamon": "Cannella",
  "Clove Leaf": "Chiodi di Garofano",
  "Cypress": "Cipresso",
  "Ginger": "Zenzero",
  "Grapefruit": "Pompelmo",
  "Juniperberry": "Bacche di Ginepro",
  "Lemongrass": "Citronella",
  "Lime": "Lime",
  "Mandarin": "Mandarino",
  "Marjoram Spanish": "Maggiorana Spagnola",
  "Neroli Dilute": "Neroli Diluito",
  "Nutmeg": "Noce Moscata",
  "Orange": "Arancia",
  "Palmarosa": "Palmarosa",
  "Petitgrain": "Petit Grain",
  "Rosewood": "Legno di Rosa",
  "Myrrh": "Mirra",
  "Rose Dilute": "Rosa Diluito",
  "Coriander Seed": "Semi di Coriandolo",
  "Niaouli": "Niaouli",
  "Pine Sylvestris": "Pino Silvestre",
  "Sage": "Salvia",
  "Cedarwood Virginian": "Legno di Cedro Virginiano",
  "Hyssop": "Issopo",
  "May Chang": "May Chang",
  "Vetivert": "Vetiver",
  "Carrot Seed": "Semi di Carota",
  "Cajaput": "Cajeput",
  "White Camphor": "Canfora Bianca",
  "Dill Seed": "Semi di Aneto",
  "Benzoin": "Benzoino",
  "Aniseed China Star": "Anice Stellato",
  "Melissa (Blend)": "Melissa (Miscela)",
  "Tangerine": "Mandarino",
  "Lemon Verbena": "Verbena Limone",
  "Frankinsence (Pure)": "Incenso Puro",
  "Cumin Seed": "Semi di Cumino",
  "Spruce": "Abete Rosso",
  "Parsley": "Prezzemolo",
  "Ho Wood": "Legno di Ho",
  "Lemon Tea Tree": "Tea Tree Limone",
  "Bay Leaf": "Alloro",
  "Ravensara": "Ravensara",
  "Rose Geranium": "Geranio Rosa",
  "White Birch": "Betulla Bianca",
  "Ylang Ylang III": "Ylang Ylang III",
  "Cornmint": "Menta di Campo",
  "Spearmint": "Menta Verde",
  "Bulgarian Lavender": "Lavanda Bulgara"
};

// Descrizione base per oli wholesale
const descrizioneBase = (nomeItaliano, nomeOriginale) => {
  const benefici = {
    "Citronella": "Repellente naturale per insetti, purificante e rinfrescante.",
    "Cannella": "Stimolante, riscaldante, antibatterico naturale.",
    "Chiodi di Garofano": "Analgesico naturale, antibatterico, riscaldante.",
    "Cipresso": "Tonico circolatorio, astringente, rinfrescante.",
    "Zenzero": "Stimolante digestivo, antinausea, riscaldante.",
    "Pompelmo": "Energizzante, purificante, tonificante.",
    "Bacche di Ginepro": "Purificante, diuretico, rilassante.",
    "Lime": "Rinfrescante, energizzante, purificante.",
    "Mandarino": "Calmante, dolce, adatto per bambini.",
    "Maggiorana Spagnola": "Rilassante muscolare, calmante, confortante.",
    "Neroli Diluito": "Rilassante, afrodisiaco, anti-ansia.",
    "Noce Moscata": "Riscaldante, stimolante, confortante.",
    "Arancia": "Allegro, dolce, rilassante.",
    "Palmarosa": "Idratante pelle, antibatterico, equilibrante.",
    "Petit Grain": "Calmante nervoso, deodorante, equilibrante.",
    "Legno di Rosa": "Rilassante, afrodisiaco, tonificante pelle.",
    "Mirra": "Meditativo, cicatrizzante, antisettico.",
    "Rosa Diluito": "Lussuoso, afrodisiaco, equilibrante emotivo.",
    "Semi di Coriandolo": "Digestivo, stimolante, rinfrescante.",
    "Niaouli": "Antisettico, espettorante, rinfrescante.",
    "Pino Silvestre": "Balsamico, purificante, energizzante.",
    "Salvia": "Purificante, stimolante mentale, equilibrante ormonale.",
    "Legno di Cedro Virginiano": "Calmante, legnoso, repellente insetti.",
    "Issopo": "Espettorante, purificante, tonificante.",
    "May Chang": "Energizzante, agrumato, purificante.",
    "Vetiver": "Radicante, calmante profondo, terroso.",
    "Semi di Carota": "Rigenerante pelle, detossificante, nutriente.",
    "Cajeput": "Antisettico, espettorante, analgesico.",
    "Canfora Bianca": "Stimolante circolatorio, analgesico, rinfrescante.",
    "Semi di Aneto": "Digestivo, calmante, antispasmodico.",
    "Benzoino": "Calmante, riscaldante, fissativo profumi.",
    "Anice Stellato": "Digestivo, riscaldante, dolce.",
    "Melissa (Miscela)": "Calmante nervoso, anti-ansia, uplifting.",
    "Verbena Limone": "Rinfrescante, sedativo, digestivo.",
    "Incenso Puro": "Meditativo, spirituale, anti-infiammatorio.",
    "Semi di Cumino": "Digestivo, stimolante, riscaldante.",
    "Abete Rosso": "Balsamico, purificante, rinfrescante.",
    "Prezzemolo": "Purificante, diuretico, rinnovante.",
    "Legno di Ho": "Calmante, simile al legno di rosa, equilibrante.",
    "Tea Tree Limone": "Antibatterico, antivirale, energizzante.",
    "Alloro": "Purificante, stimolante mentale, protettivo.",
    "Ravensara": "Antivirale, espettorante, rilassante.",
    "Geranio Rosa": "Equilibrante ormonale, profumato, tonificante pelle.",
    "Betulla Bianca": "Depurativo, diuretico, rinfrescante.",
    "Ylang Ylang III": "Afrodisiaco, calmante, equilibrante emotivo.",
    "Menta di Campo": "Rinfrescante, decongestionante, analgesico.",
    "Menta Verde": "Dolce, digestiva, rinfrescante gentile.",
    "Lavanda Bulgara": "Rilassante premium, calmante, equilibrante."
  };

  return `Confezione Wholesale da 10 pezzi di Olio Essenziale di ${nomeItaliano} puro al 100% - 10ml ciascuno (totale 100ml).

${benefici[nomeItaliano] || "Olio essenziale puro di alta qualità per aromaterapia professionale."}

✨ Caratteristiche:
• Purezza: 100% olio essenziale puro
• Formato: 10 flaconi da 10ml ciascuno
• Uso: Aromaterapia professionale
• Qualità: Grado terapeutico
• Certificazione: Adatto per uso professionale

🌿 Utilizzi:
• Diffusori aromatici e bruciaessenze
• Massaggi (diluito in olio vettore)
• Bagni aromatici (poche gocce)
• Pulizia naturale della casa
• Cosmetica naturale
• Profumazione ambienti

⚠️ Avvertenze:
• Non ingerire
• Diluire sempre prima dell'applicazione sulla pelle
• Tenere fuori dalla portata dei bambini
• Conservare in luogo fresco e asciutto

💼 Confezione Wholesale:
Perfetta per professionisti dell'aromaterapia, spa, centri benessere o rivenditori.
Formato economico da 10 pezzi per uso intensivo o rivendita.`;
};

console.log('🌍 APPLICAZIONE TRADUZIONI:\n');

let count = 0;

products.forEach(product => {
  // Identifico i prodotti oli essenziali wholesale appena importati
  if (product.sku && product.sku.startsWith('EOUL-')) {

    // Estraggo il nome dell'olio dal titolo inglese
    // Es: "10x 10ml Citronella Essential Oil Unlabelled" → "Citronella"
    const match = product.name.match(/10x 10ml (.+?) Essential Oil/);

    if (match) {
      const nomeOriginale = match[1];
      const nomeItaliano = oliTraduzioni[nomeOriginale] || nomeOriginale;

      // Traduco il titolo
      product.name = `10x Olio Essenziale di ${nomeItaliano} 10ml Senza Etichetta`;

      // Aggiungo descrizione completa
      product.description = descrizioneBase(nomeItaliano, nomeOriginale);

      console.log(`✅ ${product.sku}: ${product.name}`);
      count++;
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 RIEPILOGO: ${count}/50 oli essenziali tradotti\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE OLI ESSENZIALI COMPLETATA!\n');
