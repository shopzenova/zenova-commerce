require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Traduzioni fragranze incenso
const fragranceTranslations = {
  'Sandalwood': 'Legno di Sandalo',
  'Tulsi Basil': 'Tulsi Basilico Sacro',
  'Coconut': 'Cocco',
  'Tibetan Musk': 'Muschio Tibetano',
  'Strawberry': 'Fragola',
  'Lemon': 'Limone',
  'Opium': 'Oppio',
  'Nagchampa': 'Nag Champa',
  'Frank & Myrrh': 'Incenso e Mirra',
  'Jasmine': 'Gelsomino',
  'Ylang Ylang': 'Ylang Ylang',
  'Vanilla': 'Vaniglia',
  'Honeysuckle': 'Caprifoglio',
  'Dragons Blood': 'Sangue di Drago',
  'Apple Cinnamon': 'Mela e Cannella',
  'Orange & Cinnamon': 'Arancia e Cannella',
  'Amber': 'Ambra',
  'Midnight Rose': 'Rosa di Mezzanotte',
  'Patchouli': 'Patchouli',
  'Vertiver Gold': 'Vetiver Oro',
  'Violet': 'Violetta',
  'Peach Mango': 'Pesca e Mango',
  'Citronella': 'Citronella',
  'Lavender': 'Lavanda'
};

// Traduzioni nomi bruciatori
const burnerNameTranslations = {
  'Ancient Chinese Coin': 'Moneta Cinese Antica',
  'Tropical Fish': 'Pesce Tropicale',
  'In Your Lovers Arms': 'Tra le Braccia dell\'Amato',
  'Teahouse Waterfall': 'Cascata Casa del Tè',
  'Dragon Waterfall': 'Cascata del Drago',
  'Lotus Pond & Incenso Stick Holder': 'Stagno di Loto con Portaincenso',
  'Ananas Mountain & Cascade Twin Design': 'Montagna e Cascata Design',
  'Zen Circle of Life': 'Cerchio della Vita Zen',
  'Lotus Flower': 'Fiore di Loto'
};

// Descrizioni italiane per incenso sfuso
function createBulkIncenseDescription(fragrance, translatedFragrance) {
  const descriptions = {
    'Legno di Sandalo': `<p>Il profumo terroso e purificante del <b>Legno di Sandalo</b> è una delle fragranze più antiche, usata nei rituali fin dai tempi antichi e ancora oggi molto popolare. Quando bruci un bastoncino di incenso al sandalo, il suo aroma antisettico purifica l'ambiente.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Legno di Sandalo</li>
</ul>`,

    'Tulsi Basilico Sacro': `<p>Il <b>Tulsi</b>, o basilico sacro, è considerato un purificatore per mente, corpo e spirito. Le nostre fragranze sono realizzate con cura per offrirti un'esperienza aromatica autentica.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Tulsi Basilico Sacro</li>
</ul>`,

    'Cocco': `<p>L'incenso al <b>Cocco</b> evoca atmosfere tropicali e rilassanti. Il suo aroma dolce e avvolgente è perfetto per creare un'atmosfera esotica nella tua casa.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Cocco</li>
</ul>`,

    'Muschio Tibetano': `<p>Brucia l'incenso al <b>Muschio Tibetano</b> per trovare verità interiore, amore e forza. Il muschio ha proprietà calmanti e sensuali, perfetto per la meditazione.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Muschio Tibetano</li>
</ul>`,

    'Fragola': `<p>Con questi bastoncini di incenso alla <b>Fragola</b> puoi goderti la vera fragranza del frutto. Un aroma dolce e fruttato che porta allegria in ogni ambiente.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Fragola</li>
</ul>`,

    'Limone': `<p>L'incenso al <b>Limone</b> è un deodorante naturale per ambienti. Le sue note agrumate e dolci creano un'atmosfera fresca e rivitalizzante.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Limone</li>
</ul>`,

    'Oppio': `<p>I bastoncini di incenso all'<b>Oppio</b> sprigionano un aroma esotico e terroso. Portano serenità e servono come tonico per la mente, ideali per il relax profondo.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Oppio</li>
</ul>`,

    'Nag Champa': `<p>Il <b>Nag Champa</b> è una delle fragranze più amate al mondo. Il suo aroma unico e inconfondibile è perfetto per meditazione, yoga e momenti di relax.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Nag Champa</li>
</ul>`,

    'Incenso e Mirra': `<p><b>Incenso e Mirra</b> con la loro fragranza ricca e calmante sono un'aggiunta meravigliosa alla tua casa. Usati da millenni in rituali sacri e cerimonie.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Incenso e Mirra</li>
</ul>`,

    'Gelsomino': `<p>Il <b>Gelsomino</b> significa "dono di Dio". Il fiore di gelsomino è considerato uno dei più preziosi per il suo profumo dolce e romantico.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Gelsomino</li>
</ul>`,

    'Ylang Ylang': `<p>Il profumo esotico e dolce dello <b>Ylang Ylang</b>, il "fiore dei fiori", è noto per le sue proprietà rilassanti e afrodisiache.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Ylang Ylang</li>
</ul>`,

    'Vaniglia': `<p>Il profumo della <b>Vaniglia</b> eleva i sentimenti di gioia e relax. È anche conosciuta per le sue proprietà calmanti e confortanti.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Vaniglia</li>
</ul>`,

    'Caprifoglio': `<p>Il <b>Caprifoglio</b> si dice attiri amicizie, porti fortuna e sostenga l'amore. Un profumo dolce e floreale per momenti speciali.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Caprifoglio</li>
</ul>`,

    'Sangue di Drago': `<p>I bastoncini di incenso <b>Sangue di Drago</b> sono realizzati con una resina rossa brillante. Aroma intenso e mistico, perfetto per rituali e purificazione.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Sangue di Drago</li>
</ul>`,

    'Mela e Cannella': `<p>L'incenso alla <b>Mela</b> attira felicità, amore e amicizia. La <b>Cannella</b> stimola e riscalda. Insieme creano un'atmosfera accogliente.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Mela e Cannella</li>
</ul>`,

    'Arancia e Cannella': `<p>Il dolce profumo legnoso della <b>Cannella</b> combinato con la fragranza fruttata dell'<b>Arancia</b> porta calore e allegria in ogni ambiente.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Arancia e Cannella</li>
</ul>`,

    'Ambra': `<p>L'<b>Ambra</b>, conosciuta anche come Nettare degli Dei, è deliziosamente aromatica e inebriante. Un profumo caldo e avvolgente.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Ambra</li>
</ul>`,

    'Rosa di Mezzanotte': `<p>Risveglia i tuoi sensi con la ricca e bellissima fragranza floreale della <b>Rosa di Mezzanotte</b>. Romantica e sofisticata.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Rosa di Mezzanotte</li>
</ul>`,

    'Patchouli': `<p>Il <b>Patchouli</b> è noto per le sue proprietà magiche ed è stato usato per secoli in rituali spirituali. Aroma terroso e sensuale.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Patchouli</li>
</ul>`,

    'Vetiver Oro': `<p>La fragranza del <b>Vetiver</b> è un naturale antistress. Il suo aroma legnoso e terroso favorisce calma e concentrazione.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Vetiver Oro</li>
</ul>`,

    'Violetta': `<p>I bastoncini di incenso alla <b>Violetta</b> catturano il profumo delle viole selvatiche. Un aroma delicato e romantico.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Violetta</li>
</ul>`,

    'Pesca e Mango': `<p>L'incenso alla <b>Pesca e Mango</b> porta un tocco tropicale nella tua casa. Perfetto per rilassarsi e staccare dalla routine quotidiana.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Pesca e Mango</li>
</ul>`,

    'Citronella': `<p>La <b>Citronella</b> è la risposta alla ricerca di un metodo naturale al 100%. Ottima anche come repellente per insetti.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Citronella</li>
</ul>`,

    'Lavanda': `<p>L'incenso alla <b>Lavanda</b> ha una fragranza floreale naturale. Nota per le sue proprietà calmanti, favorisce il relax e il sonno.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: Lavanda</li>
</ul>`
  };

  return descriptions[translatedFragrance] || `<p>Incenso sfuso alla fragranza di <b>${translatedFragrance}</b>. Bastoncini di alta qualità per profumare la tua casa.</p>
<ul>
<li>Contenuto: 500g (circa 450 bastoncini)</li>
<li>Lunghezza: 25 cm</li>
<li>Fragranza: ${translatedFragrance}</li>
</ul>`;
}

// Descrizione per bruciatori a cascata
function createBackflowBurnerDescription(name) {
  return `<p>Bruciatore di incenso a cascata (backflow) progettato per creare un effetto fumo che scende a cascata, come una piccola fontana mistica. Un elemento decorativo affascinante per la tua casa.</p>
<ul>
<li>Tipo: Bruciatore Backflow (a riflusso)</li>
<li>Effetto: Fumo a cascata</li>
<li>Utilizzo: Coni di incenso backflow (non inclusi)</li>
</ul>
<p><i>Nota: Richiede coni di incenso backflow specifici con foro centrale per l'effetto cascata.</i></p>`;
}

function isEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const englishWords = ['the ', ' and ', ' with ', ' for ', ' this ', ' when ', ' you ', ' its ', ' each ', 'incense', 'stick', 'pack', 'contains', 'scent', 'smell', 'burn', 'ancient', 'popular', 'approximately', 'backflow', 'specially designed', 'cascades'];
  return englishWords.some(w => lower.includes(w));
}

async function main() {
  console.log('=== Traduzione Prodotti Incenso ===\n');

  const products = await prisma.product.findMany({
    where: { zenovaSubcategory: 'incenso' },
    select: { id: true, name: true, description: true }
  });

  console.log(`Prodotti totali: ${products.length}\n`);

  let updatedNames = 0;
  let updatedDescs = 0;

  for (const p of products) {
    const updates = {};
    let newName = p.name;

    // Traduci nomi "Bulk Incense - XXX"
    const bulkMatch = p.name.match(/Bulk\s+Incense\s*-\s*(.+)/i);
    if (bulkMatch) {
      const fragrance = bulkMatch[1].trim();
      const translatedFragrance = fragranceTranslations[fragrance] || fragrance;
      newName = `Incenso Sfuso - ${translatedFragrance}`;
      updates.name = newName;
      updates.description = createBulkIncenseDescription(fragrance, translatedFragrance);
      updatedNames++;
      updatedDescs++;
      console.log(`${p.id}: ${p.name} -> ${newName}`);
    }

    // Traduci nomi bruciatori con parti inglesi
    for (const [en, it] of Object.entries(burnerNameTranslations)) {
      if (p.name.includes(en)) {
        newName = p.name.replace(en, it);
        updates.name = newName;
        updatedNames++;
        console.log(`${p.id}: ${p.name} -> ${newName}`);
        break;
      }
    }

    // Traduci nomi con "Stick" e "Cone"
    if (p.name.includes('Stick') || p.name.includes('Cone')) {
      newName = p.name
        .replace(/Incenso Stick/gi, 'Bastoncino Incenso')
        .replace(/Stick/gi, 'Bastoncino')
        .replace(/Cone/gi, 'Cono');
      if (newName !== p.name) {
        updates.name = newName;
        updatedNames++;
        console.log(`${p.id}: ${p.name} -> ${newName}`);
      }
    }

    // Fix descrizioni BackF con inglese
    if (p.id.startsWith('BackF') && isEnglish(p.description)) {
      updates.description = createBackflowBurnerDescription(newName);
      updatedDescs++;
      console.log(`${p.id}: Descrizione backflow aggiornata`);
    }

    // Prodotti con nome generico "Prodotto Incenso"
    if (p.name === 'Prodotto Incenso' && isEnglish(p.description)) {
      updates.description = createBackflowBurnerDescription(p.name);
      updatedDescs++;
      console.log(`${p.id}: Descrizione generica aggiornata`);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: updates
      });
    }
  }

  console.log('\n=== Completato ===');
  console.log(`Nomi tradotti: ${updatedNames}`);
  console.log(`Descrizioni aggiornate: ${updatedDescs}`);

  await prisma.$disconnect();
}

main().catch(console.error);
