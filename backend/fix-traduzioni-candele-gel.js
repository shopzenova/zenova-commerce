/**
 * Fix traduzioni Candele Gel Profumati e Sali da Bagno
 * Corregge nomi e descrizioni dove necessario
 * Aggiorna: top-100-products.json, data/products.json, database PostgreSQL
 *
 * Eseguire: node fix-traduzioni-candele-gel.js
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// CORREZIONI
// ============================================================

const correzioni = {

  // --- NOME: "Large" → "Grande" ---
  'aw-chkcc-08': {
    name: 'Grande Candela Cristallo Chakra - Sette Chakra'
  },

  // --- NOME: "Artisticain" → "Artistica in" + descrizione fix ---
  'aw-atc-01': {
    name: 'Candela Artistica in Latta - Unicorni',
    description: '<p><strong>Candela Artistica in Latta - Unicorni</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },
  'aw-atc-02': {
    name: 'Candela Artistica in Latta - Vita Marina',
    description: '<p><strong>Candela Artistica in Latta - Vita Marina</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },
  'aw-atc-03': {
    name: 'Candela Artistica in Latta - Messaggi Amichevoli',
    description: '<p><strong>Candela Artistica in Latta - Messaggi Amichevoli</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },
  'aw-atc-04': {
    name: 'Candela Artistica in Latta - Matrioske Russe',
    description: '<p><strong>Candela Artistica in Latta - Matrioske Russe</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },
  'aw-atc-05': {
    name: 'Candela Artistica in Latta - Giardino Romantico',
    description: '<p><strong>Candela Artistica in Latta - Giardino Romantico</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },
  'aw-atc-06': {
    name: 'Candela Artistica in Latta - Weekend Parigino',
    description: '<p><strong>Candela Artistica in Latta - Weekend Parigino</strong> e un prodotto di alta qualita realizzato con ingredienti naturali per offrire un\'esperienza aromaterapica unica.</p><p>Perfetto per creare un\'atmosfera rilassante e armoniosa nella tua casa.</p>'
  },

  // --- DESCRIZIONE: aw-chkcc-01 (misto inglese/italiano) ---
  'aw-chkcc-01': {
    description: '<p>Sperimenta il potere di guarigione con questa candela di cristallo Chakra. Realizzata con vere pietre preziose, cera di soia completamente naturale, profumo appositamente miscelato e stoppini in legno magici. Realizzata con l\'energia radicante del Diaspro Rosso e il potere protettivo dell\'Agata Nera, questa candela incarna l\'essenza del Chakra Radice. La rilassante fragranza di Oud Nero aggiunge una dimensione terrosa e profonda alla tua esperienza.</p>'
  },

  // --- DESCRIZIONE: aw-pc (specifiche tecniche in inglese) ---
  'aw-pc-05': {
    description: '<p>Tempo di combustione: ~11 h / 16 h / 22 h / 33 h</p><p>Peso: ~ 105g / 135g / 170g / 200g</p><p>Altezza: 7,0 cm / 9,0 cm / 11,0 cm / 13,0 cm</p><p>Diametro: 4,8 cm</p><p>Set di 4 candele pilastro in avorio da 50mm di diametro, in quattro diverse altezze. Ideali per creare un\'atmosfera calda e accogliente.</p>'
  },
  'aw-pc-06': {
    description: '<p>Tempo di combustione: ~11 h / 16 h / 22 h / 33 h</p><p>Peso: ~ 105g / 135g / 170g / 200g</p><p>Altezza: 7,0 cm / 9,0 cm / 11,0 cm / 13,0 cm</p><p>Diametro: 4,8 cm</p><p>Set di 4 candele pilastro rosse da 50mm di diametro, in quattro diverse altezze. Ideali per creare un\'atmosfera calda e accogliente.</p>'
  },

  // --- DESCRIZIONE: aw-asc (italiano con errori grammaticali) ---
  'aw-asc-01': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Salvia Sclarea e Menta Piperita. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Vibrazioni Positive sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Profumazione fresca e stimolante che favorisce pensieri positivi e buon umore.</p>'
  },
  'aw-asc-02': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Rosmarino. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Pensiero Chiaro sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Fragranza erbacea e rinfrescante che favorisce la concentrazione e la chiarezza mentale.</p>'
  },
  'aw-asc-03': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Menta Piperita e Chiodi di Garofano. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Creativita sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Fragranza speziata e fresca che stimola la creativita e l\'ispirazione.</p>'
  },
  'aw-asc-04': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Lavanda e Geranio. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Pace sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Fragranza floreale e rilassante che favorisce la pace interiore e la serenita.</p>'
  },
  'aw-asc-05': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Ylang Ylang e Patchouli. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Afrodisiaco sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Fragranza sensuale e avvolgente che crea un\'atmosfera romantica e intima.</p>'
  },
  'aw-asc-06': {
    description: '<p>Realizzata con olio essenziale puro al 100% di Lavanda e Finocchio. 200g di cera di soia, tempo di combustione 40h. Le nostre candele aromaterapiche Relax sono realizzate con oli essenziali puri e cera di soia naturale. Senza paraffina, coloranti artificiali ne ingredienti sintetici. Stoppino in cotone. Fragranza calmante e rilassante che favorisce il relax e il benessere.</p>'
  },

  // --- DESCRIZIONE: aw-hhc (italiano con parole corrotte: PaiRosso, surRotondoings, rivelandoRosso) ---
  'aw-hhc-01': {
    description: '<p>Parti per un viaggio d\'amore con Gli Amanti, candela magica con cristallo. Immergi i tuoi sensi nell\'accattivante fragranza dei prati di rose in fiore, creando un\'atmosfera di romanticismo e tenerezza. Il fulcro di questa incantevole candela e il quarzo rosa, che si ritiene apra il Chakra del Cuore e inviti l\'amore nella tua vita. Mentre la fiamma danza, lascia che l\'energia rilassante del quarzo rosa e il delicato profumo di rosa creino uno spazio di amore e connessione.</p>'
  },
  'aw-hhc-02': {
    description: '<p>Entra in un regno di tranquillita con Il Mago, candela magica con cristallo. La fragranza rinfrescante della menta incantata danza nell\'aria, creando un\'oasi di calma e chiarezza. Abbinata alla calmante gemma di giada, questa candela e un tocco magico per i tuoi sensi, che sussurra antichi incantesimi di serenita. La giada, nota per le sue proprieta armonizzanti, favorisce l\'equilibrio e l\'armonia nella tua vita.</p>'
  },
  'aw-hhc-03': {
    description: '<p>Vivi la serenita delle Colline di Lavanda illuminate dalla luna con La Luna, candela magica con cristallo. La fragranza calmante alla lavanda abbraccia i tuoi sensi, creando un\'oasi di pace. Esaltata dalla rilassante gemma di ametista, questa candela invita equilibrio e armonia nel tuo spazio. L\'ametista, apprezzata per le sue proprieta antistress, favorisce un\'atmosfera tranquilla, rendendo questa candela il compagno ideale per momenti di meditazione e relax.</p>'
  },

  // --- DESCRIZIONE: aw-qsalt (inglese con parole corrotte) ---
  'aw-qsalt-29': {
    description: '<p>Portacandele in sale himalayano di forma rotonda. Si ritiene che il sale himalayano crei ioni negativi nell\'aria, contribuendo a purificare l\'ambiente. Ogni portacandele e unico per forma e colore, grazie alla natura del sale himalayano. Emana una calda luce ambrata che crea un\'atmosfera rilassante e accogliente. Ideale per meditazione e relax.</p>'
  },
  'aw-qsalt-31': {
    description: '<p>Portacandele in sale himalayano a forma di cuore medio. Si ritiene che il sale himalayano crei ioni negativi nell\'aria, contribuendo a purificare l\'ambiente. Ogni portacandele e unico per forma e colore, grazie alla natura del sale himalayano. Emana una calda luce ambrata che crea un\'atmosfera romantica e rilassante.</p>'
  },
  'aw-qsalt-44': {
    description: '<p>Portacandele naturale in sale himalayano con 2 fori per candeline. Si ritiene che il sale himalayano crei ioni negativi nell\'aria, contribuendo a purificare l\'ambiente. Ogni portacandele e unico per forma e colore, grazie alla natura del sale himalayano. Emana una calda luce ambrata che crea un\'atmosfera rilassante e accogliente.</p>'
  },

  // --- DESCRIZIONE: aw-selch (inglese) ---
  'aw-selch-07': {
    description: '<p>Portacandele in selenite a forma di cuore. La selenite, un cristallo semi-trasparente, permette alla fiamma della candela di brillare delicatamente attraverso le pareti del portacandele. I bordi sono naturalmente irregolari, caratteristica tipica della selenite. Il portacandele e lucido con alcune zone piu chiare. Per mantenere la sua bellezza, evitare il contatto con l\'acqua.</p>'
  },
  'aw-selch-08': {
    description: '<p>Portacandele in selenite a forma di palla di neve da 8 cm. La selenite, un cristallo semi-trasparente, permette alla fiamma della candela di brillare delicatamente attraverso le pareti del portacandele. I bordi sono naturalmente irregolari, caratteristica tipica della selenite. Il portacandele e lucido con alcune zone piu chiare. Per mantenere la sua bellezza, evitare il contatto con l\'acqua.</p>'
  },

  // --- DESCRIZIONE: AWMJ (inglese) ---
  'AWMJ-01': {
    description: '<p>Cere profumate aromatiche alla Lavanda e Rosmarino. Rilassati con la miscela calmante di oli essenziali di lavanda e rosmarino. Basta uno o due cuoricini di cera nel tuo bruciatore per riempire la stanza di un aroma erbaceo e pulito che schiarisce la mente e aiuta a rilassarsi. Il vasetto contiene circa 14-16 cuoricini di cera (circa 85g). Realizzate in cera di soia con oli essenziali puri, senza paraffina.</p>'
  },
  'AWMJ-03': {
    description: '<p>Cere profumate aromatiche allo Ylang Ylang e Arancia. Luminosa e confortante, questa fragranza riempie lo spazio con un profumo dolce, floreale e agrumato che calma e solleva lo spirito. Uno o due cuoricini di cera nel bruciatore rilasciano una fragranza calda e allegra. Il vasetto contiene circa 14-16 cuoricini di cera (circa 85g). Realizzate in cera di soia con oli essenziali puri, senza paraffina.</p>'
  },
  'AWMJ-05': {
    description: '<p>Cere profumate aromatiche allo Zenzero e Chiodi di Garofano. Avvolgi il tuo spazio di calore con la ricca e speziata miscela di oli essenziali di zenzero e chiodi di garofano. Basta uno o due cuoricini di cera nel bruciatore per creare un aroma accogliente e confortante. Ogni vasetto contiene circa 14-16 cuoricini di cera (circa 85g). Realizzate in cera di soia con oli essenziali puri, senza paraffina.</p>'
  },
  'AWMJ-06': {
    description: '<p>Cere profumate aromatiche alla Noce Moscata e Limone. Luminosa e confortante, questa fragranza combina il calore speziato della noce moscata con la freschezza agrumata del limone. Uno o due cuoricini di cera nel bruciatore riempiono la stanza di un aroma vivace e rilassante. Ogni vasetto contiene circa 14-16 cuoricini di cera (circa 85g). Realizzate in cera di soia con oli essenziali puri, senza paraffina.</p>'
  },

  // --- DESCRIZIONE: BSV (inglese) ---
  'BSV-01': {
    description: '<p>Sali da bagno in eleganti boccette di vetro - confezione regalo da 7 pezzi. Ogni boccetta contiene una fragranza diversa, una per ogni giorno della settimana, per trasformare il bagno in un\'esperienza spa. Ingredienti naturali e profumazioni rilassanti per un rituale di benessere quotidiano. Confezione regalo elegante, perfetta come idea regalo.</p>'
  },
  'BSV-02': {
    description: '<p>Scopri il potere dell\'aromaterapia con questa squisita collezione di sali da bagno Chakra in boccette di vetro. La collezione include sette sali da bagno diversi, ciascuno formulato per uno specifico chakra, utilizzando oli essenziali pregiati. Sette fragranze uniche per bilanciare e armonizzare i centri energetici del corpo. Confezione regalo elegante da 7 pezzi.</p>'
  },

  // --- DESCRIZIONE: GBBB (inglese) ---
  'GBBB-01': {
    description: '<p>Bomba da bagno al Pompelmo e Ylang Ylang con sale marino, contenente un braccialetto in pietre di Diaspro Bianco. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },
  'GBBB-02': {
    description: '<p>Bomba da bagno al Sandalo con sale marino, contenente un braccialetto in pietre di Sodalite. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },
  'GBBB-03': {
    description: '<p>Bomba da bagno al Bergamotto con sale marino, contenente un braccialetto in pietre di Quarzo Rosa. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },
  'GBBB-04': {
    description: '<p>Bomba da bagno alla Lavanda e Tea Tree con sale marino, contenente un braccialetto in pietre di Ametista. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },
  'GBBB-05': {
    description: '<p>Bomba da bagno all\'Arancia e Mandarino con sale marino, contenente un braccialetto in pietre di Occhio di Tigre. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },
  'GBBB-06': {
    description: '<p>Bomba da bagno al Limone e Lime con sale marino, contenente un braccialetto in pietre di Avventurina Verde. Trasforma il momento del bagno in un\'esperienza spa di lusso. Queste bombe da bagno artigianali nutrono la pelle e creano un\'atmosfera rilassante e rigenerante. All\'interno troverai uno splendido braccialetto in pietre preziose naturali.</p>'
  },

  // --- DESCRIZIONE: LWMelt (22 prodotti - inglese) ---
  'LWMelt-01': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Campi di Lavanda, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina, cosi la tua casa sara pervasa solo da fragranze di qualita. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-02': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Gelsomino di Mezzanotte, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-03': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Mela Speziata, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-04': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Caffe Artigianale, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-05': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Ylang Ylang, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-06': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Liquirizia, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-07': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Nag Champa, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-08': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Sangue di Drago, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-10': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Vaniglia e Noce Moscata, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-11': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Raccolto di Limone, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-12': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Zenzero Antico, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-13': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Anguria Fresca, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-14': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Magnolia Giapponese, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-16': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Sandalo Scuro, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-17': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Menta e Mentolo, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-18': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Patchouli Intenso, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-19': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Burro al Brandy, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-20': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Giardino Nascosto, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-21': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Cannella e Arancia, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-22': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Muschio Bianco, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-23': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza More Selvatiche, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },
  'LWMelt-24': {
    description: '<p>Set regalo di 6 cere profumate alla fragranza Tuberosa, presentate in elegante confezione regalo. Realizzate con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contengono paraffina. Basta aggiungere una cera al bruciatore per riempire la stanza di profumo. Durata: circa 8 ore per cera.</p>'
  },

  // --- DESCRIZIONE: SWMJ (18 prodotti - inglese) ---
  'SWMJ-01': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Campi di Lavanda. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina, cosi la tua stanza sara pervasa solo da fragranze di qualita. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-02': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Gelsomino di Mezzanotte. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-03': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Mela Speziata. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-04': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Caffe Artigianale. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-05': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Pesca Fresca. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-06': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Nag Champa. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-07': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Frutti di Mango. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-08': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Vaniglia e Noce Moscata. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-09': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Magnolia Giapponese. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-10': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Rosa Classica. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-11': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Sandalo Scuro. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-12': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Patchouli Intenso. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-13': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Burro al Brandy. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-14': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Banana Intensa. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-15': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Cannella e Arancia. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-16': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Muschio Bianco. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-17': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza More Selvatiche. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  },
  'SWMJ-18': {
    description: '<p>Cera di soia profumata in vasetto alla fragranza Tuberosa. Realizzata con una miscela naturale di cera di soia e oli per fragranza di altissima qualita. Non contiene paraffina. Basta aggiungere un cuoricino di cera al bruciatore per riempire l\'ambiente di profumo. Vasetto in vetro riutilizzabile.</p>'
  }
};

// ============================================================
// ESECUZIONE
// ============================================================

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX TRADUZIONI CANDELE GEL E SALI DA BAGNO');
  console.log('='.repeat(70));

  const ids = Object.keys(correzioni);
  console.log('\nCorrezioni da applicare: ' + ids.length + ' prodotti\n');

  // ----- 1. Aggiorna top-100-products.json -----
  const TOP_FILE = './top-100-products.json';
  const top100 = JSON.parse(fs.readFileSync(TOP_FILE, 'utf-8'));

  let updatedJson = 0;
  top100.forEach(product => {
    if (correzioni[product.id]) {
      const fix = correzioni[product.id];
      if (fix.name) product.name = fix.name;
      if (fix.description) product.description = fix.description;
      updatedJson++;
    }
  });
  fs.writeFileSync(TOP_FILE, JSON.stringify(top100, null, 2));
  console.log('top-100-products.json: ' + updatedJson + ' prodotti aggiornati');

  // ----- 2. Aggiorna data/products.json -----
  const DATA_FILE = './data/products.json';
  if (fs.existsSync(DATA_FILE)) {
    const dataProducts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    let updatedData = 0;
    dataProducts.forEach(product => {
      if (correzioni[product.id]) {
        const fix = correzioni[product.id];
        if (fix.name) product.name = fix.name;
        if (fix.description) product.description = fix.description;
        updatedData++;
      }
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataProducts, null, 2));
    console.log('data/products.json: ' + updatedData + ' prodotti aggiornati');
  }

  // ----- 3. Aggiorna database PostgreSQL -----
  console.log('\nAggiornamento database PostgreSQL...');
  let updatedDb = 0;
  let errorsDb = 0;

  for (const [id, fix] of Object.entries(correzioni)) {
    try {
      const data = {};
      if (fix.name) data.name = fix.name;
      if (fix.description) data.description = fix.description;

      const result = await prisma.product.updateMany({
        where: { id: id },
        data: data
      });
      if (result.count > 0) {
        updatedDb++;
        console.log('  OK: ' + id + (fix.name ? ' -> ' + fix.name : ' (descrizione)'));
      } else {
        console.log('  SKIP: ' + id + ' (non trovato nel DB)');
      }
    } catch (err) {
      errorsDb++;
      console.log('  ERRORE: ' + id + ' - ' + err.message);
    }
  }

  // ----- 4. Aggiorna aw-translations.json -----
  const TRANS_FILE = './aw-translations.json';
  if (fs.existsSync(TRANS_FILE)) {
    const awTrans = JSON.parse(fs.readFileSync(TRANS_FILE, 'utf-8'));
    let updatedTrans = 0;
    for (const [id, fix] of Object.entries(correzioni)) {
      if (awTrans[id] === undefined) awTrans[id] = {};
      if (fix.name) awTrans[id].name = fix.name;
      if (fix.description) awTrans[id].description = fix.description;
      updatedTrans++;
    }
    fs.writeFileSync(TRANS_FILE, JSON.stringify(awTrans, null, 2));
    console.log('\naw-translations.json: ' + updatedTrans + ' traduzioni aggiornate');
  }

  console.log('\n' + '='.repeat(70));
  console.log('  RIEPILOGO');
  console.log('='.repeat(70));
  console.log('  JSON aggiornati: ' + updatedJson);
  console.log('  Database aggiornati: ' + updatedDb);
  console.log('  Errori database: ' + errorsDb);
  console.log('='.repeat(70));
  console.log('\nFatto!\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Errore fatale:', err);
  prisma.$disconnect();
  process.exit(1);
});
