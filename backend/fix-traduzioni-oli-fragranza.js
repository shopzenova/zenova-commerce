/**
 * Fix traduzioni Oli per Fragranza
 * Aggiorna nomi e descrizioni in italiano per tutti gli 88 prodotti
 * Aggiorna: top-100-products.json, data/products.json, database PostgreSQL
 *
 * Eseguire: node fix-traduzioni-oli-fragranza.js
 */

const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================
// MAPPA TRADUZIONI COMPLETE: id -> { name, description }
// ============================================================

const traduzioni = {
  // ===== AWPFO - 250g =====
  'AWPFO-01': {
    name: 'Olio per Fragranza Lega Metallica - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Lega Metallica. Note metalliche moderne e sofisticate con sfumature muschiate. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura, perfetta per uso professionale e hobbistico.'
  },
  'AWPFO-02': {
    name: 'Olio per Fragranza Ambra - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Ambra. Un classico accordo ambrato con note di muschio, legni pregiati e labdano. Caldo e avvolgente, ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-03': {
    name: 'Olio per Fragranza Mela e Sambuco - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mela e Sambuco. Un fresco accordo floreale con note di mela dolce e fiori di sambuco, su una base morbida di ambra e fiori bianchi. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-04': {
    name: 'Olio per Fragranza Torta di Mele e Crema - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Torta di Mele e Crema. Una golosa fragranza di mele cotte con zucchero di canna, burro e crema alla vaniglia. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-05': {
    name: 'Olio per Fragranza Banana - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Banana. Una fresca fragranza fruttata di banana con un cremoso sfondo di vaniglia. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-06': {
    name: 'Olio per Fragranza Pepe Nero - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Pepe Nero. Una sontuosa fragranza legnosa e maschile con note agrumate di bergamotto e limone che rinfrescano note speziate di pepe nero. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-07': {
    name: 'Olio per Fragranza Mora - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mora. Una fresca fragranza fruttata di mora combinata con dolci note di lampone e mirtillo, su una base calda e muschiata. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-08': {
    name: 'Olio per Fragranza Mirtillo - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mirtillo. Una dolce fragranza fruttata con note di mirtillo fresco accompagnate da mela verde e un tocco di pesca. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-09': {
    name: 'Olio per Fragranza Bouquet Floreale - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Bouquet Floreale. Un ricco bouquet floreale con note di pesca e prugna matura, un cuore complesso di fiori e una base morbida e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-10': {
    name: 'Olio per Fragranza Pudding di Natale - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Pudding di Natale. Un accordo speziato e goloso con note di uvetta, fichi, pera, cannella, chiodi di garofano e vaniglia che evocano le feste natalizie. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-11': {
    name: 'Olio per Fragranza Mirtillo Rosso - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mirtillo Rosso. Un accordo fruttato e vivace di mirtillo rosso con un mix di frutti di bosco e lampone, su una base speziata. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-12': {
    name: 'Olio per Fragranza Cioccolato Fondente - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Cioccolato Fondente. Una ricca fragranza di cioccolato fondente con note di testa fruttate e una base di cioccolato, vaniglia e sfumature fruttate. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-13': {
    name: 'Olio per Fragranza Eiffel - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Eiffel. Note di apertura verdi e fresche, un cuore che combina violetta e rosa con tocchi di mughetto, su una base morbida e cipriata. Ideale per bruciatori di oli, potpourri e pietre profumate.'
  },
  'AWPFO-14': {
    name: 'Olio per Fragranza Geranio - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Geranio. Fragranza floreale fresca e delicata con note verdi e rosate. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-15': {
    name: 'Olio per Fragranza Zenzero e Lime - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Zenzero e Lime. Un vivace mix di zenzero speziato e lime fresco, energizzante e rinfrescante. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-16': {
    name: 'Olio per Fragranza Zenzero e Noce - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Zenzero e Noce. Un caldo accordo di zenzero candito e noce, ricco e speziato. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-18': {
    name: 'Olio per Fragranza Ribes e Te Bianco - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Ribes e Te Bianco. Un delicato accordo fruttato e raffinato con note di ribes fresco e te bianco. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-19': {
    name: 'Olio per Fragranza Pompelmo e Mandarino - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Pompelmo e Mandarino. Un fresco e vivace accordo agrumato di pompelmo e mandarino. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-20': {
    name: 'Olio per Fragranza Guava Lava - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Guava Lava. Una fragranza tropicale ed esotica con note intense di guava. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-21': {
    name: 'Olio per Fragranza Miele e Avena - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Miele e Avena. Un caldo e confortevole accordo di miele dorato e avena cremosa. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-22': {
    name: 'Olio per Fragranza Caprifoglio - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Caprifoglio. Una dolce e delicata fragranza floreale di caprifoglio in fiore. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-24': {
    name: 'Olio per Fragranza Magnolia Giapponese - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Magnolia Giapponese. Un elegante accordo floreale orientale con note di magnolia e petali delicati. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-25': {
    name: 'Olio per Fragranza Limonata - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Limonata. Una fresca e frizzante fragranza agrumata che ricorda una limonata estiva. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-26': {
    name: 'Olio per Fragranza Mughetto - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mughetto. Una delicata e fresca fragranza floreale di mughetto primaverile. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-27': {
    name: 'Olio per Fragranza Lime - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Lime. Una vivace e rinfrescante fragranza agrumata di lime. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-28': {
    name: 'Olio per Fragranza Mima - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mima. Una sofisticata composizione aromatica unica e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-29': {
    name: 'Olio per Fragranza Mirra - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Mirra. Un caldo e resinoso accordo di mirra, mistico e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-30': {
    name: 'Olio per Fragranza Nag Champa - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Nag Champa. La classica fragranza indiana di sandalo e frangipane, perfetta per meditazione e relax. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },
  'AWPFO-31': {
    name: 'Olio per Fragranza Magia Notturna - 250g',
    description: 'Olio per fragranza puro da 250g alla fragranza Magia Notturna. Un misterioso e sensuale accordo notturno con note profonde e avvolgenti. Ideale per bruciatori di oli, potpourri e pietre profumate. Fragranza concentrata e duratura.'
  },

  // ===== FOBp - 500ml =====
  'FOBp-01': {
    name: 'Olio Puro per Fragranza Ambra - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ambra. Caldo e avvolgente accordo ambrato con note di muschio e legni pregiati. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-04': {
    name: 'Olio Puro per Fragranza Mela Fresca - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mela Fresca. Una frizzante e croccante fragranza di mela verde appena colta. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-08': {
    name: 'Olio Puro per Fragranza Mora - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mora. Fresca fragranza fruttata di mora selvatica con sfumature dolci. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-15': {
    name: 'Olio Puro per Fragranza Legno di Cedro - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Legno di Cedro. Una calda fragranza legnosa di cedro, rilassante e naturale. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-17': {
    name: 'Olio Puro per Fragranza Camomilla - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Camomilla. Una delicata e rilassante fragranza floreale di camomilla. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-18': {
    name: 'Olio Puro per Fragranza Ciliegia - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ciliegia. Una dolce e succosa fragranza fruttata di ciliegia matura. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-19': {
    name: 'Olio Puro per Fragranza Mattina di Natale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mattina di Natale. Una magica fragranza natalizia che evoca il calore e la gioia delle feste. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-20': {
    name: 'Olio Puro per Fragranza Albero di Natale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Albero di Natale. La fresca fragranza di pino e abete che ricorda un vero albero di Natale. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-22': {
    name: 'Olio Puro per Fragranza Cannella e Arancia - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Cannella e Arancia. Un caldo e speziato accordo di cannella e arancia dolce, perfetto per le feste. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-28': {
    name: 'Olio Puro per Fragranza Erba Tagliata - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Erba Tagliata. Una fresca e naturale fragranza verde di erba appena tagliata. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-31': {
    name: 'Olio Puro per Fragranza Dewberry - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Dewberry. Una dolce e fruttata fragranza di bacche di rubus con note floreali. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-43': {
    name: 'Olio Puro per Fragranza Incenso - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Incenso. Una sacra e resinosa fragranza di olibano, perfetta per meditazione e relax. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-46': {
    name: 'Olio Puro per Fragranza Geranio - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Geranio. Una fresca e delicata fragranza floreale di geranio con note verdi e rosate. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-48': {
    name: 'Olio Puro per Fragranza Oro - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Oro. Una lussuosa e opulenta composizione con note calde e preziose. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-53': {
    name: 'Olio Puro per Fragranza Caprifoglio - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Caprifoglio. Una dolce e delicata fragranza floreale di caprifoglio in fiore. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-56': {
    name: 'Olio Puro per Fragranza Magnolia Giapponese - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Magnolia Giapponese. Un elegante accordo floreale orientale con note di magnolia e petali delicati. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-61': {
    name: 'Olio Puro per Fragranza Limone e Lime - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Limone e Lime. Un fresco e vivace accordo agrumato di limone e lime. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-65': {
    name: 'Olio Puro per Fragranza Lilla - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Lilla. Una dolce e romantica fragranza floreale di lilla primaverile. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-66': {
    name: 'Olio Puro per Fragranza Mughetto - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mughetto. Una fresca e delicata fragranza floreale di mughetto primaverile. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-67': {
    name: 'Olio Puro per Fragranza Lime - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Lime. Una vivace e rinfrescante fragranza agrumata di lime. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-71': {
    name: 'Olio Puro per Fragranza Mandarino - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mandarino. Una dolce e solare fragranza agrumata di mandarino. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-78': {
    name: 'Olio Puro per Fragranza Mirra - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mirra. Un caldo e resinoso accordo di mirra, mistico e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-79': {
    name: 'Olio Puro per Fragranza Nag Champa - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Nag Champa. La classica fragranza indiana di sandalo e frangipane, perfetta per meditazione e relax. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-80': {
    name: 'Olio Puro per Fragranza Magia Notturna - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Magia Notturna. Un misterioso e sensuale accordo notturno con note profonde e avvolgenti. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-86': {
    name: 'Olio Puro per Fragranza Fiori d\'Arancio - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Fiori d\'Arancio. Una raffinata e delicata fragranza floreale di zagara. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-91': {
    name: 'Olio Puro per Fragranza Parigina - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Parigina. Una sofisticata ed elegante composizione ispirata alla raffinatezza parigina. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-96': {
    name: 'Olio Puro per Fragranza Caramella alla Pera - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Caramella alla Pera. Una dolce e nostalgica fragranza fruttata di caramelle alla pera. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-97': {
    name: 'Olio Puro per Fragranza Menta Piperita - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Menta Piperita. Una fresca e tonificante fragranza mentolata, energizzante e rinfrescante. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-99': {
    name: 'Olio Puro per Fragranza Pino - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Pino. Una fresca e naturale fragranza boschiva di aghi di pino. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-108': {
    name: 'Olio Puro per Fragranza Sensuale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Sensuale. Una calda e seducente composizione con note avvolgenti e romantiche. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-123': {
    name: 'Olio Puro per Fragranza Lavanda Bianca - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Lavanda Bianca. Una fresca e pulita variante della classica lavanda, piu leggera e delicata. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBp-125': {
    name: 'Olio Puro per Fragranza Passeggiata nel Bosco - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Passeggiata nel Bosco. Una naturale e terrosa fragranza boschiva con note di muschio, felce e legni. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },

  // ===== FOBP - 500ml =====
  'FOBP-136': {
    name: 'Olio Puro per Fragranza Mirtillo - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mirtillo. Una dolce e succosa fragranza fruttata di mirtillo fresco. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-137': {
    name: 'Olio Puro per Fragranza Delizioso - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Delizioso. Una irresistibile e golosa composizione aromatica, dolce e appagante. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-139': {
    name: 'Olio Puro per Fragranza Ciliegia Nera - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ciliegia Nera. Una intensa e profonda fragranza di ciliegia scura e matura. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-144': {
    name: 'Olio Puro per Fragranza Calendula - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Calendula. Una delicata fragranza floreale di calendula, calda e solare. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-147': {
    name: 'Olio Puro per Fragranza Trifoglio - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Trifoglio. Una fresca e verde fragranza erbacea di trifoglio, naturale e primaverile. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-149': {
    name: 'Olio Puro per Fragranza Stella di Natale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Stella di Natale. Una festiva e magica fragranza natalizia con note calde e speziate. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-156': {
    name: 'Olio Puro per Fragranza Sangue di Drago - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Sangue di Drago. Una intensa e misteriosa fragranza resinosa, profonda e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-162': {
    name: 'Olio Puro per Fragranza Oro, Incenso e Mirra - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Oro, Incenso e Mirra. Una preziosa e sacra composizione che unisce note resinose di incenso e mirra con calde sfumature dorate. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale.'
  },
  'FOBP-163': {
    name: 'Olio Puro per Fragranza Ribes e Te Bianco - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ribes e Te Bianco. Un delicato accordo fruttato e raffinato con note di ribes fresco e te bianco. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-170': {
    name: 'Olio Puro per Fragranza Somnus - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Somnus. Una rilassante e avvolgente composizione ispirata al sonno e al relax profondo. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-175': {
    name: 'Olio Puro per Fragranza Lino Fresco - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Lino Fresco. Una pulita e fresca fragranza che ricorda il bucato appena lavato. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-176': {
    name: 'Olio Puro per Fragranza Fiore di Loto - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Fiore di Loto. Una delicata e zen fragranza floreale acquatica di fiore di loto. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-177': {
    name: 'Olio Puro per Fragranza Margarita - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Margarita. Una vivace e frizzante composizione ispirata al celebre cocktail con note di lime e sale. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-184': {
    name: 'Olio Puro per Fragranza Frutto Opale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Frutto Opale. Una fresca e fruttata composizione con un mix di frutti tropicali e agrumi. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-189': {
    name: 'Olio Puro per Fragranza Violetta Passionale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Violetta Passionale. Una intensa e romantica fragranza di violetta con sfumature sensuali. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-200': {
    name: 'Olio Puro per Fragranza Rafe - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Rafe. Una sofisticata e moderna composizione aromatica maschile e intensa. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-215': {
    name: 'Olio Puro per Fragranza Mattina Festiva - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Mattina Festiva. Una gioiosa fragranza che evoca il risveglio di un giorno di festa con note calde e speziate. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale.'
  },
  'FOBP-216': {
    name: 'Olio Puro per Fragranza Natale Bianco - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Natale Bianco. Una magica fragranza invernale con note fresche di neve, pino e spezie natalizie. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-217': {
    name: 'Olio Puro per Fragranza Fuoco Scoppiettante - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Fuoco Scoppiettante. Una calda e accogliente fragranza che evoca un caminetto acceso con note di legno e resina. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale.'
  },
  'FOBP-218': {
    name: 'Olio Puro per Fragranza Agrifoglio e Edera - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Agrifoglio e Edera. Una fresca e verde fragranza natalizia con note di bacche rosse e foglie. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-219': {
    name: 'Olio Puro per Fragranza Notti Invernali Accoglienti - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Notti Invernali Accoglienti. Una calda e confortevole fragranza che evoca serate invernali davanti al camino. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale.'
  },
  'FOBP-220': {
    name: 'Olio Puro per Fragranza Ghirlanda di Natale - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ghirlanda di Natale. Una festiva fragranza di abete, bacche e spezie che ricorda le decorazioni natalizie. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale.'
  },
  'FOBP-221': {
    name: 'Olio Puro per Fragranza Emozione - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Emozione. Una vivace e dinamica composizione aromatica, energizzante e coinvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-222': {
    name: 'Olio Puro per Fragranza Esplosione di Aroma - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Esplosione di Aroma. Una intensa e travolgente composizione di aromi concentrati. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-223': {
    name: 'Olio Puro per Fragranza Ribelle - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Ribelle. Una audace e anticonvenzionale composizione aromatica, forte e decisa. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-224': {
    name: 'Olio Puro per Fragranza Peccaminoso - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Peccaminoso. Una irresistibile e tentante composizione aromatica, sensuale e avvolgente. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  },
  'FOBP-225': {
    name: 'Olio Puro per Fragranza Audace - 500ml',
    description: 'Olio puro per fragranza da 500ml alla fragranza Audace. Una forte e coraggiosa composizione aromatica con note decise e moderne. Ideale per bruciatori di oli, potpourri e pietre profumate. Formato professionale, fragranza concentrata e duratura.'
  }
};

// ============================================================
// ESECUZIONE
// ============================================================

async function main() {
  console.log('='.repeat(70));
  console.log('  FIX TRADUZIONI OLI PER FRAGRANZA - 88 PRODOTTI');
  console.log('='.repeat(70));

  const ids = Object.keys(traduzioni);
  console.log(`\nTraduzioni preparate: ${ids.length} prodotti\n`);

  // ----- 1. Aggiorna top-100-products.json -----
  const TOP_FILE = './top-100-products.json';
  const top100 = JSON.parse(fs.readFileSync(TOP_FILE, 'utf-8'));

  // Backup
  const backupName = `./top-100-products.backup-traduzioni-oli-${Date.now()}.json`;
  fs.writeFileSync(backupName, JSON.stringify(top100, null, 2));
  console.log(`Backup: ${backupName}`);

  let updatedJson = 0;
  top100.forEach(product => {
    if (traduzioni[product.id]) {
      product.name = traduzioni[product.id].name;
      product.description = traduzioni[product.id].description;
      updatedJson++;
    }
  });

  fs.writeFileSync(TOP_FILE, JSON.stringify(top100, null, 2));
  console.log(`top-100-products.json: ${updatedJson} prodotti aggiornati`);

  // ----- 2. Aggiorna data/products.json -----
  const DATA_FILE = './data/products.json';
  if (fs.existsSync(DATA_FILE)) {
    const dataProducts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    let updatedData = 0;
    dataProducts.forEach(product => {
      if (traduzioni[product.id]) {
        product.name = traduzioni[product.id].name;
        product.description = traduzioni[product.id].description;
        updatedData++;
      }
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataProducts, null, 2));
    console.log(`data/products.json: ${updatedData} prodotti aggiornati`);
  }

  // ----- 3. Aggiorna database PostgreSQL -----
  console.log('\nAggiornamento database PostgreSQL...');
  let updatedDb = 0;
  let errorsDb = 0;

  for (const [id, trad] of Object.entries(traduzioni)) {
    try {
      const result = await prisma.product.updateMany({
        where: { id: id },
        data: {
          name: trad.name,
          description: trad.description
        }
      });
      if (result.count > 0) {
        updatedDb++;
        console.log(`  OK: ${id} -> ${trad.name}`);
      } else {
        console.log(`  SKIP: ${id} (non trovato nel DB)`);
      }
    } catch (err) {
      errorsDb++;
      console.log(`  ERRORE: ${id} - ${err.message}`);
    }
  }

  // ----- 4. Aggiorna aw-translations.json -----
  const TRANS_FILE = './aw-translations.json';
  if (fs.existsSync(TRANS_FILE)) {
    const awTrans = JSON.parse(fs.readFileSync(TRANS_FILE, 'utf-8'));
    let updatedTrans = 0;
    for (const [id, trad] of Object.entries(traduzioni)) {
      awTrans[id] = { name: trad.name, description: trad.description };
      updatedTrans++;
    }
    fs.writeFileSync(TRANS_FILE, JSON.stringify(awTrans, null, 2));
    console.log(`\naw-translations.json: ${updatedTrans} traduzioni aggiornate`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('  RIEPILOGO');
  console.log('='.repeat(70));
  console.log(`  JSON aggiornati: ${updatedJson}`);
  console.log(`  Database aggiornati: ${updatedDb}`);
  console.log(`  Errori database: ${errorsDb}`);
  console.log('='.repeat(70));
  console.log('\nFatto!\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Errore fatale:', err);
  prisma.$disconnect();
  process.exit(1);
});
