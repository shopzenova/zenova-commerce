const fs = require('fs');

console.log('🌍 TRADUZIONE COMPLETA DESCRIZIONI KIT BENESSERE\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-full-translation-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Descrizioni complete manuali per ogni tipo di prodotto
const descrizioniComplete = {
  // Gift Boxes Agnes+Cat
  "ACGP-01": "Candela in Vasetto 'Rabarbaro Rabarbaro' + Frizzante da Bagno 'Fico Bianco' + Frizzante da Bagno 'Frutti di Bosco'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-02": "Candela in Vasetto 'Caffè e Noce' + Frizzante da Bagno 'Peonie Pressate' + Frizzante da Bagno 'Fioritura Giapponese'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-03": "Candela in Vasetto 'Agrumi Freschi' + Frizzante da Bagno 'Clementine' + Frizzante da Bagno 'Mor.Roll'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-04": "Candela in Vasetto 'Violetta di Parma' + Frizzante da Bagno 'Sale Marino e Muschio' + Frizzante da Bagno 'Dolly Blue'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-05": "Candela in Vasetto 'Luna di Velluto' + Frizzante da Bagno 'Windermere' + Frizzante da Bagno 'Agrumi'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-06": "Candela in Vasetto 'Pietra di Luna' + Frizzante da Bagno 'Provenza' + Frizzante da Bagno 'Tè e Rose'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  // Fragrance Gift Sets
  "ACGS-04": "Un set di fragranze per la casa morbido e romantico fatto a mano nel Regno Unito, che unisce la dolce delicatezza delle rose con il calore confortante del tè. Un modo incantevole per rendere ogni stanza calma e accogliente.\n\nQuesto set include quattro cere profumate da sciogliere, un bruciatore di oli in ceramica bianca con delicati motivi floreali traforati e una candela tealight per iniziare.\n\nLa fragranza è accogliente e al tempo stesso floreale—note leggere di rosa addolcite da un tocco di tè caldo—creando un'atmosfera confortante senza sopraffare lo spazio.\n\nLe cere si adagiano magnificamente nel piattino smerlato del bruciatore, rilasciando lentamente il profumo mentre si scaldano.\n\nConfezionato in una scatola regalo rosa a forma di casa con incantevoli dettagli floreali, è un regalo tutto-in-uno facile e premuroso.",

  "ACGS-05": "Un set di fragranze per la casa fresco e rilassante fatto a mano nel Regno Unito. La fragranza Windermere evoca la tranquillità dei laghi inglesi.\n\nQuesto set include quattro cere profumate da sciogliere, un bruciatore di oli in ceramica bianca con delicati motivi floreali traforati e una candela tealight.\n\nPerfetto per creare un'atmosfera di pace e serenità in qualsiasi ambiente.\n\nConfezionato in una elegante scatola regalo a forma di casa.",

  "ACGS-06": "Un set di fragranze per la casa esotico e avvolgente fatto a mano nel Regno Unito. La fragranza marocchina porta note speziate e calde.\n\nQuesto set include quattro cere profumate da sciogliere, un bruciatore di oli in ceramica bianca con delicati motivi floreali traforati e una candela tealight.\n\nIdeale per chi ama le atmosfere orientali e mistiche.\n\nConfezionato in una elegante scatola regalo a forma di casa.",

  // Essential Oil Sets
  "EOSet-01": "Set base di oli essenziali per aromaterapia, perfetto per iniziare il tuo viaggio nel mondo degli oli essenziali. Include una selezione curata degli oli più versatili e amati.\n\nGli oli essenziali sono estratti naturali concentrati dalle piante, utilizzati da secoli per benessere fisico e mentale.\n\nIdeale come regalo o per chi si avvicina per la prima volta all'aromaterapia.",

  "EOSet-02": "Set completo dei 12 oli essenziali più popolari per aromaterapia. Una collezione professionale per uso quotidiano.\n\nInclude:\n• Lavanda - rilassante e calmante\n• Tea Tree - purificante\n• Eucalipto - rinfrescante\n• Menta Piperita - energizzante\n• E molti altri...\n\nPerfetto per diffusori, massaggi e uso topico diluito.",

  "EOSet-03": "Set di oli essenziali a tema autunnale. Fragranze calde e avvolgenti perfette per la stagione fredda.\n\nNote speziate, legnose e confortanti che ricordano le foglie che cadono e le serate accanto al camino.\n\nIdeale per creare atmosfera durante i mesi autunnali.",

  "EOSET-04": "Set di oli essenziali a tema primaverile. Fragranze fresche e floreali che celebrano il risveglio della natura.\n\nNote leggere, fiorite e rivitalizzanti perfette per i mesi primaverili.\n\nIdeale per purificare gli ambienti e portare energia positiva.",

  "EOSET-05": "Set di oli essenziali a tema estivo. Fragranze fresche, agrumate e energizzanti perfette per la bella stagione.\n\nNote vivaci e solari che evocano giornate di sole e vacanze al mare.\n\nIdeale per diffondere nei mesi estivi."
};

console.log('🌍 APPLICAZIONE TRADUZIONI:\n');

let count = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'kit-benessere-cofanetti-regalo') {

    if (descrizioniComplete[product.sku]) {
      product.description = descrizioniComplete[product.sku];
      console.log(`✅ ${product.sku}: ${product.name}`);
      console.log(`   Descrizione aggiornata (${product.description.length} caratteri)`);
      count++;
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 RIEPILOGO: ${count} descrizioni tradotte completamente\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE DESCRIZIONI COMPLETATA!\n');
