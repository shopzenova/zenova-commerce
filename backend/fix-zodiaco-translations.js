require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Traduzioni complete per le candele Zodiaco
const zodiacoDescriptions = {
  'aw-zcc-01': `<p>Abbraccia l'energia innovativa e umanitaria dell'<strong>Acquario</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza rinfrescante di <em>Cosmic Breeze</em> crea un'atmosfera stimolante e visionaria, riflettendo la natura progressista e indipendente di questo segno d'aria.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con ametista, acquamarina e labradorite, scelte per supportare la natura creativa e intuitiva dell'Acquario:</p>
<ul>
<li>L'Ametista favorisce la chiarezza mentale e la connessione spirituale</li>
<li>L'Acquamarina promuove la comunicazione e il coraggio</li>
<li>La Labradorite potenzia l'intuizione e protegge l'aura</li>
</ul>
<p>Questa combinazione unica di candela e bracciale è perfetta per la meditazione, la cura di sé o come regalo premuroso per un Acquario.</p>
<p><strong>Note di testa:</strong> Bergamotto, Menta<br>
<strong>Note di cuore:</strong> Lavanda, Eucalipto<br>
<strong>Note di fondo:</strong> Legno di Cedro, Ambra</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-02': `<p>Immergiti nell'energia intuitiva e compassionevole dei <strong>Pesci</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza eterea di <em>Ocean Dreams</em> crea un'atmosfera mistica e rilassante, riflettendo la profondità emotiva e la sensibilità di questo segno d'acqua.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con ametista, acquamarina e pietra di luna, scelte per supportare la natura empatica e creativa dei Pesci:</p>
<ul>
<li>L'Ametista favorisce la spiritualità e la protezione</li>
<li>L'Acquamarina promuove la calma e la chiarezza emotiva</li>
<li>La Pietra di Luna potenzia l'intuizione e l'equilibrio emotivo</li>
</ul>
<p>Questa combinazione delicata di candela e bracciale è perfetta per la meditazione, la cura di sé o come regalo premuroso per un Pesci.</p>
<p><strong>Note di testa:</strong> Brezza Marina, Fiori Bianchi<br>
<strong>Note di cuore:</strong> Gelsomino, Ninfea<br>
<strong>Note di fondo:</strong> Muschio, Legno di Sandalo</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-03': `<p>Accendi la tua passione con l'energia audace e dinamica dell'<strong>Ariete</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza speziata di <em>Fire Warrior</em> crea un'atmosfera energizzante e coraggiosa, riflettendo lo spirito pionieristico di questo segno di fuoco.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con corniola, diaspro rosso e citrino, scelte per supportare la natura determinata e avventurosa dell'Ariete:</p>
<ul>
<li>La Corniola stimola il coraggio e la vitalità</li>
<li>Il Diaspro Rosso fornisce forza e resistenza</li>
<li>Il Citrino attrae successo e abbondanza</li>
</ul>
<p>Questa combinazione energizzante di candela e bracciale è perfetta per la motivazione, la cura di sé o come regalo premuroso per un Ariete.</p>
<p><strong>Note di testa:</strong> Pepe Rosa, Zenzero<br>
<strong>Note di cuore:</strong> Cannella, Cardamomo<br>
<strong>Note di fondo:</strong> Legno di Cedro, Ambra</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-04': `<p>Connettiti con l'energia stabile e sensuale del <strong>Toro</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza avvolgente di <em>Earth Garden</em> crea un'atmosfera lussuosa e radicante, riflettendo l'apprezzamento per la bellezza e il comfort di questo segno di terra.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con quarzo rosa, malachite e smeraldo, scelte per supportare la natura affettuosa e determinata del Toro:</p>
<ul>
<li>Il Quarzo Rosa favorisce l'amore e l'armonia</li>
<li>La Malachite promuove la trasformazione e la protezione</li>
<li>Lo Smeraldo attrae prosperità e fedeltà</li>
</ul>
<p>Questa combinazione lussuosa di candela e bracciale è perfetta per il relax, la cura di sé o come regalo premuroso per un Toro.</p>
<p><strong>Note di testa:</strong> Rosa, Pera<br>
<strong>Note di cuore:</strong> Gelsomino, Ylang Ylang<br>
<strong>Note di fondo:</strong> Vaniglia, Patchouli</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-05': `<p>Esplora l'energia versatile e comunicativa dei <strong>Gemelli</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza vivace di <em>Dual Spirit</em> crea un'atmosfera stimolante e curiosa, riflettendo la natura intellettuale e sociale di questo segno d'aria.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con agata, citrino e occhio di tigre, scelte per supportare la natura adattabile e ingegnosa dei Gemelli:</p>
<ul>
<li>L'Agata favorisce l'equilibrio e la stabilità emotiva</li>
<li>Il Citrino stimola la creatività e l'ottimismo</li>
<li>L'Occhio di Tigre promuove la concentrazione e la chiarezza mentale</li>
</ul>
<p>Questa combinazione vivace di candela e bracciale è perfetta per la creatività, la cura di sé o come regalo premuroso per un Gemelli.</p>
<p><strong>Note di testa:</strong> Limone, Menta<br>
<strong>Note di cuore:</strong> Verbena, Tè Verde<br>
<strong>Note di fondo:</strong> Muschio Bianco, Legno di Cedro</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-06': `<p>Attingi all'energia intuitiva e nutriente del <strong>Cancro</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza rilassante di <em>Moonstone Eclipse</em> crea un'atmosfera calmante e protettiva, riflettendo la profondità emotiva e la sensibilità di questo segno d'acqua.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con acquamarina, quarzo fumé e pietra di luna, scelte per supportare la natura compassionevole ed empatica del Cancro:</p>
<ul>
<li>L'Acquamarina promuove la tranquillità e la guarigione emotiva</li>
<li>Il Quarzo Fumé fornisce radicamento e protezione</li>
<li>La Pietra di Luna potenzia l'intuizione e l'equilibrio emotivo</li>
</ul>
<p>Questa combinazione delicata e curativa di candela e bracciale è perfetta per la cura di sé, la meditazione o come regalo premuroso per un Cancro.</p>
<p><strong>Note di testa:</strong> Cassis, Mandarino<br>
<strong>Note di cuore:</strong> Lavanda, Bacche Rosse, Rosa<br>
<strong>Note di fondo:</strong> Sandalo, Ambra</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-07': `<p>Risplendi con l'energia regale e carismatica del <strong>Leone</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza maestosa di <em>Golden Sun</em> crea un'atmosfera radiosa e ispiratrice, riflettendo la natura generosa e creativa di questo segno di fuoco.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con citrino, occhio di tigre e corniola, scelte per supportare la natura coraggiosa e appassionata del Leone:</p>
<ul>
<li>Il Citrino attrae abbondanza e gioia</li>
<li>L'Occhio di Tigre rafforza la fiducia e la determinazione</li>
<li>La Corniola stimola la creatività e la vitalità</li>
</ul>
<p>Questa combinazione radiosa di candela e bracciale è perfetta per la motivazione, la cura di sé o come regalo premuroso per un Leone.</p>
<p><strong>Note di testa:</strong> Arancia, Bergamotto<br>
<strong>Note di cuore:</strong> Gelsomino, Rosa<br>
<strong>Note di fondo:</strong> Ambra, Muschio</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-08': `<p>Abbraccia l'energia pratica e intuitiva della <strong>Vergine</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza terrosa di <em>Pure Earth</em> crea un'atmosfera purificante e organizzata, riflettendo la natura analitica e premurosa di questo segno di terra.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con amazzonite, corniola e quarzo fumé, scelte per supportare la natura meticolosa e dedita della Vergine:</p>
<ul>
<li>L'Amazzonite favorisce l'armonia e la comunicazione</li>
<li>La Corniola stimola la concentrazione e la motivazione</li>
<li>Il Quarzo Fumé promuove il radicamento e la chiarezza mentale</li>
</ul>
<p>Questa combinazione equilibrata di candela e bracciale è perfetta per la produttività, la cura di sé o come regalo premuroso per una Vergine.</p>
<p><strong>Note di testa:</strong> Lavanda, Eucalipto<br>
<strong>Note di cuore:</strong> Camomilla, Salvia<br>
<strong>Note di fondo:</strong> Legno di Sandalo, Vetiver</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-09': `<p>Trova l'armonia con l'energia equilibrata e diplomatica della <strong>Bilancia</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza elegante di <em>Rose Harmony</em> crea un'atmosfera raffinata e pacifica, riflettendo l'amore per la bellezza e la giustizia di questo segno d'aria.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con quarzo rosa, lapislazzuli e citrino, scelte per supportare la natura armoniosa e socievole della Bilancia:</p>
<ul>
<li>Il Quarzo Rosa favorisce l'amore e le relazioni armoniose</li>
<li>Il Lapislazzuli promuove la verità e la comunicazione</li>
<li>Il Citrino attrae positività e gioia</li>
</ul>
<p>Questa combinazione elegante di candela e bracciale è perfetta per il relax, la cura di sé o come regalo premuroso per una Bilancia.</p>
<p><strong>Note di testa:</strong> Rosa, Pera<br>
<strong>Note di cuore:</strong> Peonia, Gelsomino<br>
<strong>Note di fondo:</strong> Muschio, Vaniglia</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-10': `<p>Trasformati con l'energia intensa e misteriosa dello <strong>Scorpione</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza profonda di <em>Dark Phoenix</em> crea un'atmosfera magnetica e trasformativa, riflettendo la passione e la determinazione di questo segno d'acqua.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con ossidiana, malachite e granato, scelte per supportare la natura potente e perspicace dello Scorpione:</p>
<ul>
<li>L'Ossidiana fornisce protezione e radicamento profondo</li>
<li>La Malachite favorisce la trasformazione e la guarigione</li>
<li>Il Granato stimola la passione e la vitalità</li>
</ul>
<p>Questa combinazione intensa di candela e bracciale è perfetta per la trasformazione, la cura di sé o come regalo premuroso per uno Scorpione.</p>
<p><strong>Note di testa:</strong> Pepe Nero, Cardamomo<br>
<strong>Note di cuore:</strong> Tuberosa, Oud<br>
<strong>Note di fondo:</strong> Ambra, Muschio Scuro</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-11': `<p>Espandi i tuoi orizzonti con l'energia avventurosa e ottimista del <strong>Sagittario</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza vivace di <em>Wild Adventure</em> crea un'atmosfera ispiratrice e libera, riflettendo lo spirito esploratore e filosofico di questo segno di fuoco.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con turchese, lapislazzuli e citrino, scelte per supportare la natura ottimista e sincera del Sagittario:</p>
<ul>
<li>Il Turchese favorisce la protezione e la saggezza spirituale</li>
<li>Il Lapislazzuli promuove la verità e l'illuminazione</li>
<li>Il Citrino attrae fortuna e abbondanza</li>
</ul>
<p>Questa combinazione avventurosa di candela e bracciale è perfetta per l'ispirazione, la cura di sé o come regalo premuroso per un Sagittario.</p>
<p><strong>Note di testa:</strong> Pompelmo, Zenzero<br>
<strong>Note di cuore:</strong> Spezie Orientali, Incenso<br>
<strong>Note di fondo:</strong> Legno di Sandalo, Ambra</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`,

  'aw-zcc-12': `<p>Raggiungi le vette con l'energia ambiziosa e disciplinata del <strong>Capricorno</strong> con questa Candela Cristallo Zodiaco.</p>
<p>La fragranza sofisticata di <em>Mountain Peak</em> crea un'atmosfera determinata e radicante, riflettendo la natura responsabile e perseverante di questo segno di terra.</p>
<p>Il set include un <strong>bracciale in pietre preziose</strong> realizzato con onice nero, granato e quarzo fumé, scelte per supportare la natura ambiziosa e paziente del Capricorno:</p>
<ul>
<li>L'Onice Nero fornisce forza e protezione</li>
<li>Il Granato stimola la determinazione e il successo</li>
<li>Il Quarzo Fumé promuove il radicamento e la stabilità</li>
</ul>
<p>Questa combinazione potente di candela e bracciale è perfetta per la concentrazione, la cura di sé o come regalo premuroso per un Capricorno.</p>
<p><strong>Note di testa:</strong> Pino, Bergamotto<br>
<strong>Note di cuore:</strong> Vetiver, Legno di Cedro<br>
<strong>Note di fondo:</strong> Muschio, Ambra Grigia</p>
<p><strong>Tempo di combustione:</strong> circa 35 ore</p>`
};

async function main() {
  console.log('=== Correzione Candele Zodiaco ===\n');

  let updated = 0;

  for (const [id, description] of Object.entries(zodiacoDescriptions)) {
    try {
      await prisma.product.update({
        where: { id },
        data: { description }
      });
      console.log(`✓ ${id} aggiornato`);
      updated++;
    } catch (error) {
      console.log(`✗ ${id} errore:`, error.message);
    }
  }

  console.log(`\n=== Completato: ${updated}/12 candele aggiornate ===`);

  await prisma.$disconnect();
}

main().catch(console.error);
