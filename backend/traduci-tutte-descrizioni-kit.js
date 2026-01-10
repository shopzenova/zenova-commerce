const fs = require('fs');

console.log('🌍 TRADUZIONE COMPLETA DI TUTTE LE 51 SCHEDE KIT BENESSERE\n');
console.log('='.repeat(90));

const PRODUCTS_FILE = './top-100-products.json';
const BACKUP_FILE = `./top-100-products.backup-before-complete-translation-${Date.now()}.json`;

const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

// Backup
fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2));
console.log(`💾 Backup: ${BACKUP_FILE}\n`);

// Tutte le descrizioni complete tradotte
const descrizioniComplete = {
  // Gift Boxes Agnes+Cat (già fatte - le tengo)
  "ACGP-01": "Candela in Vasetto 'Rabarbaro Rabarbaro' + Frizzante da Bagno 'Fico Bianco' + Frizzante da Bagno 'Frutti di Bosco'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-02": "Candela in Vasetto 'Caffè e Noce' + Frizzante da Bagno 'Peonie Pressate' + Frizzante da Bagno 'Fioritura Giapponese'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-03": "Candela in Vasetto 'Agrumi Freschi' + Frizzante da Bagno 'Clementine' + Frizzante da Bagno 'Mor.Roll'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-04": "Candela in Vasetto 'Violetta di Parma' + Frizzante da Bagno 'Sale Marino e Muschio' + Frizzante da Bagno 'Dolly Blue'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-05": "Candela in Vasetto 'Luna di Velluto' + Frizzante da Bagno 'Windermere' + Frizzante da Bagno 'Agrumi'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  "ACGP-06": "Candela in Vasetto 'Pietra di Luna' + Frizzante da Bagno 'Provenza' + Frizzante da Bagno 'Tè e Rose'\n\nIl Regalo Perfetto per Ogni Occasione!\n\nQuesti cofanetti regalo splendidamente confezionati sono ideali per Natale, compleanni, anniversari o qualsiasi celebrazione speciale.\n\nCosa li Rende Speciali?\nLa carta da regalo è esclusivamente disegnata per Agnes + Cat – non la troverai da nessun'altra parte!\n\nAll'Interno di Ogni Cofanetto:\n\n2 x Frizzanti da Bagno:\n• Profumati con le fragranze esclusive della casa\n• Realizzati con un tocco di burro di cocco per un bagno lussuoso e idratante\n• Ogni frizzante può essere usato intero o diviso per due bagni e viene fornito singolarmente confezionato\n\n1 x Candela in Vasetto:\n• Realizzata con cera di soia naturale\n• Infusa con una miscela di oli essenziali naturali e oli profumati di alta qualità per un aroma delizioso\n\nRendi l'esperienza dei tuoi clienti indimenticabile con Agnes+Cat!",

  // Wellness Gift Sets
  "ACGS-01": "Set Regalo Benessere completo con fragranze naturali per la casa. Include prodotti artigianali di alta qualità.\n\nLa fragranza 'Bloom & Bliss' (Fioritura e Beatitudine) combina note floreali fresche con essenze rilassanti per creare un'atmosfera di pura felicità.\n\nPerfetto per chi ama i profumi floreali delicati e le atmosfere primaverili.\n\nIdea regalo elegante per ogni occasione speciale.",

  "ACGS-02": "Set Regalo Benessere completo con fragranze naturali per la casa. Include prodotti artigianali di alta qualità.\n\nLa fragranza 'Lake Breeze' (Brezza di Lago) evoca la freschezza delle rive dei laghi inglesi con note acquatiche e verdi.\n\nPerfetto per chi ama le atmosfere rilassanti e la natura.\n\nIdea regalo elegante per ogni occasione speciale.",

  "ACGS-03": "Set Regalo Benessere completo con fragranze naturali per la casa. Include prodotti artigianali di alta qualità.\n\nLa fragranza 'Moroccan Morning' (Mattino Marocchino) porta note speziate orientali che evocano i mercati del Marocco all'alba.\n\nPerfetto per chi ama le atmosfere esotiche e mistiche.\n\nIdea regalo elegante per ogni occasione speciale.",

  // Fragrance Gift Sets (già fatte - migliorate)
  "ACGS-04": "Un set di fragranze per la casa morbido e romantico fatto a mano nel Regno Unito, che unisce la dolce delicatezza delle rose con il calore confortante del tè.\n\nQuesto set include:\n• 4 cere profumate da sciogliere\n• 1 bruciatore di oli in ceramica bianca con delicati motivi floreali traforati\n• 1 candela tealight\n\nLa fragranza è accogliente e floreale - note leggere di rosa addolcite da un tocco di tè caldo - creando un'atmosfera confortante senza sopraffare lo spazio.\n\nLe cere si adagiano magnificamente nel piattino smerlato del bruciatore, rilasciando lentamente il profumo.\n\nConfezionato in una scatola regalo rosa a forma di casa con incantevoli dettagli floreali.\n\nUn regalo tutto-in-uno perfetto e premuroso!",

  "ACGS-05": "Un set di fragranze per la casa fresco e rilassante fatto a mano nel Regno Unito.\n\nQuesto set include:\n• 4 cere profumate da sciogliere\n• 1 bruciatore di oli in ceramica bianca con delicati motivi floreali traforati\n• 1 candela tealight\n\nLa fragranza 'Windermere' evoca la tranquillità dei laghi inglesi con note fresche e acquatiche.\n\nPerfetto per creare un'atmosfera di pace e serenità in qualsiasi ambiente.\n\nConfezionato in una elegante scatola regalo a forma di casa.",

  "ACGS-06": "Un set di fragranze per la casa esotico e avvolgente fatto a mano nel Regno Unito.\n\nQuesto set include:\n• 4 cere profumate da sciogliere\n• 1 bruciatore di oli in ceramica bianca con delicati motivi floreali traforati\n• 1 candela tealight\n\nLa fragranza marocchina porta note speziate e calde che evocano i mercati orientali.\n\nIdeale per chi ama le atmosfere esotiche e mistiche.\n\nConfezionato in una elegante scatola regalo a forma di casa.",

  // Bottom Up Glasses
  "BBUG-01": "Set Regalo di 12 Bicchierini Bottom Up (25ml) decorati con Creature della Foresta e Mistiche in finitura Bronzo Antico.\n\nUna collezione unica di bicchierini da shot decorati a mano con dettagli incisi di creature fantastiche: cervi, gufi, draghi e simboli celtici.\n\nCaratteristiche:\n• Capacità: 25ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Incise a mano\n• Include: 12 bicchierini assortiti\n\nPerfetti per:\n• Collezioni regalo\n• Appassionati di fantasy\n• Decorazione casa rustica\n• Eventi a tema medievale\n\nOgni bicchiere è un piccolo capolavoro artigianale. Idea regalo originale per amanti delle atmosfere mistiche!",

  "BBUG-02": "Bicchierini Bottom Up (25ml) decorati con Creature della Foresta e Mistiche in finitura Bronzo Antico.\n\nBicchierini da shot decorati a mano con dettagli incisi di creature fantastiche: cervi, gufi, draghi e simboli celtici.\n\nCaratteristiche:\n• Capacità: 25ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Incise a mano\n\nPerfetti per collezioni o come regalo originale per amanti del fantasy e delle atmosfere medievali.",

  "BBUG-03": "Set Regalo di 6 Bicchierini da Shot (50ml) decorati con Creature della Foresta Selvaggia in finitura Bronzo Antico.\n\nCaratteristiche:\n• Capacità: 50ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Creature della foresta incise\n• Include: 6 bicchierini assortiti\n\nPerfetto come regalo per amanti della natura e dello stile rustico. Design elegante e dettagli curati.",

  "BBUG-04": "Set Regalo di 6 Bicchierini da Shot (50ml) decorati con Creature della Foresta Selvaggia in finitura Bronzo Antico.\n\nCaratteristiche:\n• Capacità: 50ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Creature della foresta incise\n• Include: 6 bicchierini assortiti\n\nPerfetto come regalo per amanti della natura e dello stile rustico. Design elegante e dettagli curati.",

  "BBUG-05": "Set Regalo di 6 Bicchieri (100ml) decorati con Creature Mistiche in finitura Bronzo Antico.\n\nCaratteristiche:\n• Capacità: 100ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Draghi e creature mitologiche\n• Include: 6 bicchieri assortiti\n\nIdeale per chi ama il fantasy e le atmosfere medievali. Perfetto per eventi a tema o come collezione.",

  "BBUG-06": "Set Regalo di 6 Bicchieri (100ml) decorati con Creature Mistiche in finitura Bronzo Antico.\n\nCaratteristiche:\n• Capacità: 100ml ciascuno\n• Finitura: Bronzo antico anticato\n• Decorazioni: Draghi e creature mitologiche\n• Include: 6 bicchieri assortiti\n\nIdeale per chi ama il fantasy e le atmosfere medievali. Perfetto per eventi a tema o come collezione.",

  // Bali Sarongs
  "BCS-02DS": "Parei Bali Celtico con motivo 'Monete Portafortuna' - disponibile in 4 colori assortiti.\n\nTradizionale sarong in cotone leggero con stampa di simboli celtici e monete portafortuna.\n\nCaratteristiche:\n• Tessuto: 100% cotone naturale\n• Dimensioni: Taglia unica\n• Colori: 4 varianti assortite\n• Stile: Celtico-Balinese\n\nPerfetto come:\n• Parei da mare\n• Copricostume\n• Decorazione murale\n• Scialle leggero\n\nStile etnico elegante e versatile. Idea regalo originale!",

  "BCS-03DS": "Parei Bali Celtico con motivo 'Yin & Yang' - disponibile in 4 colori assortiti.\n\nTradizionale sarong in cotone leggero con stampa del simbolo Yin Yang e decorazioni celtiche.\n\nCaratteristiche:\n• Tessuto: 100% cotone naturale\n• Dimensioni: Taglia unica\n• Colori: 4 varianti assortite\n• Stile: Celtico-Orientale\n\nPerfetto come:\n• Parei da mare\n• Copricostume\n• Decorazione murale\n• Scialle leggero\n\nSimbolizza equilibrio e armonia. Idea regalo spirituale!",

  // Cocktail Bath Bombs
  "CBB-03": "Set di Tre Bombe da Bagno al Martini - fragranza cocktail gourmet.\n\nBombe da bagno effervescenti profumate come il classico cocktail Martini.\n\nCaratteristiche:\n• Profumazione: Martini cocktail\n• Quantità: 3 bombe\n• Ingredienti: Naturali e idratanti\n• Effetto: Frizzante e rilassante\n\nPerfette per:\n• Bagni rilassanti\n• Idee regalo divertenti\n• Appassionati di cocktail\n\nTrasforma il tuo bagno in un momento cocktail glamour!",

  "CBB-04": "Set di Tre Bombe da Bagno al Mojito - fragranza cocktail rinfrescante.\n\nBombe da bagno effervescenti profumate come il cocktail Mojito.\n\nCaratteristiche:\n• Profumazione: Mojito (menta e lime)\n• Quantità: 3 bombe\n• Ingredienti: Naturali e idratanti\n• Effetto: Frizzante e tonificante\n\nPerfette per:\n• Bagni energizzanti\n• Estate e caldo\n• Idee regalo fresche\n\nFreschezza tropicale nella tua vasca!",

  "CBB-06": "Set di Tre Bombe da Bagno alla Piña Colada - fragranza cocktail tropicale.\n\nBombe da bagno effervescenti profumate come il cocktail Piña Colada.\n\nCaratteristiche:\n• Profumazione: Piña Colada (cocco e ananas)\n• Quantità: 3 bombe\n• Ingredienti: Naturali e idratanti\n• Effetto: Frizzante e cremoso\n\nPerfette per:\n• Bagni esotici\n• Momenti di relax tropicale\n• Idee regalo estive\n\nVacanza tropicale nel tuo bagno!",

  // Cotton Wall Art
  "CWA-01": "Arazzo in Cotone decorativo con Buddha Chakra - arte murale spirituale.\n\nTappezzeria in cotone stampato con rappresentazione artistica di Buddha e i 7 chakra.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Buddha meditativo con chakra\n• Stile: Spirituale/Orientale\n• Uso: Decorazione murale\n\nPerfetto per:\n• Sale yoga e meditazione\n• Camere da letto zen\n• Spazi di relax\n• Arredamento etnico\n\nCrea un'atmosfera di pace e spiritualità!",

  "CWA-02": "Arazzo in Cotone decorativo con Foglia Erborea - arte murale naturale.\n\nTappezzeria in cotone stampato con design botanico di foglia stilizzata.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Foglia decorativa\n• Stile: Naturale/Botanico\n• Uso: Decorazione murale\n\nPerfetto per:\n• Arredamento naturale\n• Stile boho\n• Amanti della natura\n\nPorta la natura in casa tua!",

  "CWA-03": "Arazzo in Cotone decorativo con Albero della Vita Classico - simbolo universale.\n\nTappezzeria in cotone stampato con il classico simbolo dell'Albero della Vita.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Albero della Vita tradizionale\n• Stile: Spirituale/Celtico\n• Uso: Decorazione murale\n\nPerfetto per:\n• Arredamento spirituale\n• Regalo simbolico\n• Stanze meditative\n\nSimbolizza crescita, connessione e eternità!",

  "CWA-04": "Arazzo in Cotone decorativo con Mandala Rotondo - geometria sacra.\n\nTappezzeria in cotone stampato con mandala circolare dettagliato.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Mandala geometrico\n• Stile: Spirituale/Meditativo\n• Uso: Decorazione murale\n\nPerfetto per:\n• Meditazione\n• Yoga\n• Arredamento zen\n\nArmonia e simmetria per la tua casa!",

  "CWA-05": "Arazzo in Cotone decorativo con Albero della Forza - simbolo di resilienza.\n\nTappezzeria in cotone stampato con albero robusto e radici profonde.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Albero forte e radicato\n• Stile: Simbolico/Naturale\n• Uso: Decorazione murale\n\nPerfetto per:\n• Ispirazione quotidiana\n• Regalo motivazionale\n• Arredamento significativo\n\nSimbolizza forza interiore e stabilità!",

  "CWA-08": "Arazzo in Cotone decorativo con Mandala Elefante - saggezza orientale.\n\nTappezzeria in cotone stampato con elefante stilizzato in design mandala.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Elefante mandala\n• Stile: Orientale/Spirituale\n• Uso: Decorazione murale\n\nPerfetto per:\n• Arredamento etnico\n• Amanti degli elefanti\n• Stile boho-chic\n\nL'elefante simboleggia saggezza e fortuna!",

  "CWA-09": "Arazzo in Cotone decorativo con Albero con Adamo ed Eva - arte sacra.\n\nTappezzeria in cotone stampato con rappresentazione artistica dell'Albero della Conoscenza.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Albero biblico con figure\n• Stile: Arte sacra/Simbolico\n• Uso: Decorazione murale\n\nPerfetto per:\n• Arredamento spirituale\n• Arte religiosa\n• Conversazione culturale\n\nRappresenta conoscenza e umanità!",

  "CWA-13": "Arazzo in Cotone decorativo con Acchiappasogni - tradizione nativa.\n\nTappezzeria in cotone stampato con design di dream catcher tradizionale.\n\nCaratteristiche:\n• Materiale: 100% cotone naturale\n• Design: Acchiappasogni decorativo\n• Stile: Native/Spirituale\n• Uso: Decorazione murale\n\nPerfetto per:\n• Camere da letto\n• Protezione sogni\n• Stile etnico\n\nTradizionalmente protegge dai brutti sogni!",

  // Essential Oil Sets (già fatte - migliorate)
  "EOSet-01": "Set base di oli essenziali per aromaterapia, perfetto per iniziare il tuo viaggio nel mondo degli oli essenziali.\n\nInclude una selezione curata degli oli più versatili e amati per uso quotidiano.\n\nGli oli essenziali sono estratti naturali concentrati dalle piante, utilizzati da secoli per benessere fisico e mentale.\n\nCaratteristiche:\n• Oli puri al 100%\n• Certificati per aromaterapia\n• Flaconi con contagocce\n• Istruzioni d'uso incluse\n\nIdeale come regalo o per chi si avvicina per la prima volta all'aromaterapia.",

  "EOSet-02": "Set completo dei 12 oli essenziali più popolari per aromaterapia. Una collezione professionale per uso quotidiano.\n\nInclude i migliori oli essenziali:\n• Lavanda - rilassante e calmante\n• Tea Tree - purificante e antibatterico\n• Eucalipto - rinfrescante per vie respiratorie\n• Menta Piperita - energizzante e tonificante\n• Limone - rivitalizzante e purificante\n• Rosmarino - stimolante memoria\n• E altri 6 oli essenziali!\n\nPerfetto per:\n• Diffusori aromatici\n• Massaggi (diluiti)\n• Bagni rilassanti\n• Pulizia naturale\n\nKit professionale completo!",

  "EOSet-03": "Set di oli essenziali a tema autunnale. Fragranze calde e avvolgenti perfette per la stagione fredda.\n\nNote speziate, legnose e confortanti che ricordano:\n• Foglie che cadono\n• Serate accanto al camino\n• Spezie autunnali\n• Atmosfere accoglienti\n\nPerfetto per:\n• Diffusori in casa\n• Creare atmosfera autunnale\n• Momenti di relax\n\nPorta l'essenza dell'autunno in casa!",

  "EOSET-04": "Set di oli essenziali a tema primaverile. Fragranze fresche e floreali che celebrano il risveglio della natura.\n\nNote leggere, fiorite e rivitalizzanti:\n• Profumi floreali\n• Freschezza mattutina\n• Energia primaverile\n• Rinnovamento\n\nPerfetto per:\n• Purificare gli ambienti dopo l'inverno\n• Portare energia positiva\n• Diffusori primaverili\n\nFesta della primavera in casa!",

  "EOSET-05": "Set di oli essenziali a tema estivo. Fragranze fresche, agrumate e energizzanti perfette per la bella stagione.\n\nNote vivaci e solari:\n• Agrumi energizzanti\n• Freschezza marina\n• Profumi tropicali\n• Vitalità estiva\n\nPerfetto per:\n• Rinfrescare casa\n• Energia estiva\n• Momenti all'aperto\n\nVacanza estiva tutto l'anno!",

  // Palo Santo Incense
  "MSantoI-05": "Bastoncini di Incenso Palo Santo Large - Classico.\n\nIncenso Palo Santo (legno santo) tradizionale dal Sud America.\n\nIl Palo Santo è un legno sacro utilizzato da secoli per:\n• Purificazione energetica\n• Meditazione\n• Rilassamento profondo\n• Allontanare energie negative\n\nCaratteristiche:\n• Profumazione: Legnosa dolce naturale\n• Dimensione: Large sticks\n• Origine: Sudamerica\n• Uso: Bruciare per aromaterapia\n\nTradizione spirituale autentica!",

  "MSantoI-07": "Bastoncini di Incenso Palo Santo Large - Menta Piperita.\n\nPalo Santo arricchito con olio essenziale di menta piperita.\n\nUnisce le proprietà purificanti del Palo Santo con:\n• Freschezza mentolata\n• Effetto energizzante\n• Chiarezza mentale\n• Pulizia vie respiratorie\n\nPerfetto per:\n• Meditazioni mattutine\n• Concentrazione\n• Purificazione energetica\n\nFreschezza spirituale!",

  "MSantoI-08": "Bastoncini di Incenso Palo Santo Large - Chiodi di Garofano.\n\nPalo Santo arricchito con olio essenziale di chiodi di garofano.\n\nUnisce le proprietà del Palo Santo con:\n• Note speziate calde\n• Effetto rilassante\n• Atmosfera accogliente\n• Proprietà antibatteriche\n\nPerfetto per momenti di relax serale!",

  "MSantoI-09": "Bastoncini di Incenso Palo Santo Large - Sandalo.\n\nPalo Santo arricchito con olio essenziale di sandalo.\n\nUnisce le proprietà del Palo Santo con:\n• Profumo legnoso orientale\n• Meditazione profonda\n• Atmosfera sacra\n• Rilassamento spirituale\n\nPerfetto per yoga e meditazione!",

  "MSantoI-10": "Bastoncini di Incenso Palo Santo Large - Lavanda.\n\nPalo Santo arricchito con olio essenziale di lavanda.\n\nUnisce le proprietà del Palo Santo con:\n• Profumo rilassante floreale\n• Riduzione stress\n• Miglior sonno\n• Calma mentale\n\nPerfetto per rilassamento serale!",

  "MSantoI-11": "Bastoncini di Incenso Palo Santo Large - Wiracoa.\n\nPalo Santo arricchito con essenza tradizionale Wiracoa.\n\nFragranza esotica e mistica che evoca:\n• Tradizioni sudamericane\n• Cerimonie spirituali\n• Connessione con la natura\n\nPerfetto per rituali spirituali autentici!",

  "MSantoI-12": "Bastoncini di Incenso Palo Santo Large - Cipro.\n\nPalo Santo arricchito con fragranza cipriata.\n\nNote sofisticate e orientali:\n• Profumo muschiato\n• Atmosfera mistica\n• Eleganza orientale\n\nPerfetto per atmosfere raffinate!",

  "MSantoI-13": "Bastoncini di Incenso Palo Santo Large - Ruta.\n\nPalo Santo arricchito con olio di ruta, erba tradizionale protettiva.\n\nLa ruta è usata tradizionalmente per:\n• Protezione energetica\n• Allontanare negatività\n• Purificazione profonda\n\nPerfetto per rituali di protezione!",

  "MSantoI-14": "Bastoncini di Incenso Palo Santo Large - Eucalipto.\n\nPalo Santo arricchito con olio essenziale di eucalipto.\n\nUnisce le proprietà del Palo Santo con:\n• Freschezza balsamica\n• Pulizia vie respiratorie\n• Effetto tonificante\n• Aria purificata\n\nPerfetto per ambienti freschi e puliti!",

  "MSantoI-15": "Bastoncini di Incenso Palo Santo Large - Gelsomino.\n\nPalo Santo arricchito con olio essenziale di gelsomino.\n\nUnisce le proprietà del Palo Santo con:\n• Profumo floreale delicato\n• Atmosfera romantica\n• Riduzione ansia\n• Elevazione spirituale\n\nPerfetto per momenti intimi!",

  "MSantoI-16": "Bastoncini di Incenso Palo Santo Large - Gardenia.\n\nPalo Santo arricchito con essenza di gardenia.\n\nUnisce le proprietà del Palo Santo con:\n• Profumo floreale intenso\n• Atmosfera elegante\n• Sensazione di lusso\n\nPerfetto per occasioni speciali!",

  "MSantoI-17": "Bastoncini di Incenso Palo Santo Large - Rosmarino.\n\nPalo Santo arricchito con olio essenziale di rosmarino.\n\nUnisce le proprietà del Palo Santo con:\n• Aroma erbaceo stimolante\n• Miglioramento concentrazione\n• Memoria potenziata\n• Purificazione energetica\n\nPerfetto per studio e lavoro!",

  "MSantoI-18": "Bastoncini di Incenso Palo Santo Large - Cannella.\n\nPalo Santo arricchito con olio essenziale di cannella.\n\nUnisce le proprietà del Palo Santo con:\n• Note speziate dolci\n• Calore accogliente\n• Atmosfera festiva\n• Proprietà antibatteriche\n\nPerfetto per l'inverno e le feste!",

  // Palo Santo Wood Sticks
  "Msanto-01": "Bastoncini di Legno Palo Santo 1° Grado - Qualità Premium.\n\nPalo Santo autentico di prima qualità dal Sud America.\n\nIl Palo Santo di 1° grado offre:\n• Massima concentrazione di oli essenziali\n• Profumo intenso e duraturo\n• Legno selezionato a mano\n• Certificazione di raccolta sostenibile\n\nCaratteristiche:\n• Qualità: Premium (1° Grado)\n• Origine: Ecuador/Perù\n• Profumo: Legnoso dolce intenso\n• Durata: Lunga combustione\n\nCome usarlo:\n1. Accendi l'estremità del bastoncino\n2. Lascia bruciare 30 secondi\n3. Spegni la fiamma e lascia fumare\n4. Il fumo purifica l'ambiente\n\nTradizione sacra autentica, qualità superiore!",

  "Msanto-02": "Bastoncini di Legno Palo Santo 2° Grado - Ottimo Rapporto Qualità/Prezzo.\n\nPalo Santo autentico di seconda qualità dal Sud America.\n\nIl Palo Santo di 2° grado offre:\n• Buona concentrazione di oli essenziali\n• Profumo piacevole e naturale\n• Certificazione di raccolta sostenibile\n• Eccellente rapporto qualità/prezzo\n\nCaratteristiche:\n• Qualità: Standard (2° Grado)\n• Origine: Ecuador/Perù\n• Profumo: Legnoso dolce\n• Uso: Quotidiano\n\nCome usarlo:\n1. Accendi l'estremità del bastoncino\n2. Lascia bruciare 30 secondi\n3. Spegni la fiamma e lascia fumare\n4. Il fumo purifica l'ambiente\n\nOttima scelta per uso regolare!"
};

console.log('🌍 APPLICAZIONE TRADUZIONI COMPLETE:\n');

let count = 0;

products.forEach(product => {
  if (product.zenovaSubcategory === 'kit-benessere-cofanetti-regalo') {
    if (descrizioniComplete[product.sku]) {
      product.description = descrizioniComplete[product.sku];
      console.log(`✅ ${product.sku}: ${product.name}`);
      count++;
    } else {
      console.log(`⚠️  ${product.sku}: MANCA TRADUZIONE`);
    }
  }
});

console.log('\n' + '='.repeat(90));
console.log(`\n📊 RIEPILOGO: ${count}/51 descrizioni tradotte\n`);

// Salva
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
console.log(`💾 File salvato: ${PRODUCTS_FILE}`);
console.log('\n✅ TRADUZIONE TUTTE LE DESCRIZIONI COMPLETATA!\n');
