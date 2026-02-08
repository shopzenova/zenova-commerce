/**
 * Fix descrizioni Kit Regalo - Traduzioni complete in italiano
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const descriptions = {
  // Set Incenso Stamford
  'StamGS-01': `Set Regalo Incenso Stamford - Floreale

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze floreali. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze floreali selezionate
✓ Aroma intenso e duraturo
✓ Confezione regalo elegante

Perfetto per riempire ogni stanza della tua casa con profumi unici e seducenti. Ideale come regalo per ogni occasione.

Come usare: Accendi la punta del bastoncino, attendi che diventi incandescente, soffia sulla fiamma e posiziona in un porta incenso.`,

  'StamGS-02': `Set Regalo Incenso Stamford - Esotico

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze esotiche. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze esotiche selezionate
✓ Aroma intenso e duraturo
✓ Confezione regalo elegante

Perfetto per riempire ogni stanza della tua casa con profumi unici e seducenti. Ideale come regalo per ogni occasione.`,

  'StamGS-03': `Set Regalo Incenso Stamford - Aromaterapia

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze per aromaterapia. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze aromaterapiche
✓ Favorisce rilassamento e benessere
✓ Confezione regalo elegante

Perfetto per creare un'atmosfera rilassante e favorire il benessere quotidiano.`,

  'StamGS-04': `Set Regalo Incenso Stamford - Moods

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze per ogni stato d'animo. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze per ogni mood
✓ Aroma intenso e duraturo
✓ Confezione regalo elegante

Perfetto per accompagnare ogni momento della giornata con il profumo giusto.`,

  'StamGS-06': `Set Regalo Incenso Stamford - Mistico

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze mistiche. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze mistiche e avvolgenti
✓ Perfetto per meditazione
✓ Confezione regalo elegante

Ideale per creare un'atmosfera mistica e spirituale nella tua casa.`,

  'StamGS-07': `Set Regalo Incenso Stamford - Spirituale

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze spirituali. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze spirituali
✓ Perfetto per yoga e meditazione
✓ Confezione regalo elegante

Ideale per pratiche spirituali, yoga e momenti di riflessione.`,

  'StamGS-08': `Set Regalo Incenso Stamford - Angelo (Bianco)

Questo elegante set regalo contiene 6 confezioni di bastoncini di incenso Stamford con fragranze angeliche e pure. Ogni bastoncino ha un'alta percentuale di fragranza per un aroma intenso e duraturo.

✓ 6 confezioni di bastoncini di incenso
✓ Fragranze pure e delicate
✓ Aroma celestiale
✓ Confezione regalo elegante in bianco

Perfetto per creare un'atmosfera serena e purificante.`,

  // Campane Tibetane
  'TIBS-13': `Set Regalo Mini Campana Tibetana - Nero

Set completo di mini campana tibetana in elegante custodia nera. Include battente in legno per far "cantare" la campana.

✓ Mini campana tibetana artigianale
✓ Battente in legno incluso
✓ Elegante custodia regalo
✓ Colore: Nero

Perfetto per meditazione, yoga, rilassamento e pratiche di mindfulness. Il suono armonioso favorisce concentrazione e pace interiore.

Come usare: Usa l'estremità in legno del battente per far vibrare il bordo della campana e produrre il caratteristico suono meditativo.`,

  'TIBS-14': `Set Regalo Mini Campana Tibetana - Verde

Set completo di mini campana tibetana in elegante custodia verde. Include battente in legno per far "cantare" la campana.

✓ Mini campana tibetana artigianale
✓ Battente in legno incluso
✓ Elegante custodia regalo
✓ Colore: Verde

Perfetto per meditazione, yoga, rilassamento e pratiche di mindfulness. Il suono armonioso favorisce concentrazione e pace interiore.`,

  'TIBS-16': `Set Campana Tibetana - Fiore della Vita

Campana tibetana decorata con il simbolo del Fiore della Vita, antica geometria sacra. Include battente per produrre suoni armoniosi.

✓ Campana tibetana con incisione Fiore della Vita
✓ Battente incluso
✓ Simbolo di geometria sacra
✓ Lavorazione artigianale

Il Fiore della Vita rappresenta l'interconnessione di tutta la vita nell'universo. Perfetto per meditazione e armonizzazione degli spazi.`,

  'TIbS-20': `Set Regalo Campana Tibetana Incisa a Mano - 14cm - Tara Verde

Splendida campana tibetana battuta e incisa a mano con l'immagine di Tara Verde, divinità buddhista della compassione. Diametro 14cm.

✓ Campana tibetana 14cm
✓ Incisa a mano con Tara Verde
✓ Battente incluso
✓ Lavorazione artigianale tradizionale

La Tara Verde simboleggia la compassione attiva. Questa campana è perfetta per pratiche meditative e come elemento decorativo spirituale.`,

  'TIB-96': `Set Grande Campana Tibetana Yin & Yang - Bianco/Viola 14cm

Elegante set di campana tibetana con simbolo Yin & Yang in bianco e viola. Diametro 14cm, peso circa 0.9kg.

✓ Campana tibetana 14cm
✓ Design Yin & Yang bianco/viola
✓ Battente incluso
✓ Peso: 0.9kg

Il simbolo Yin Yang rappresenta l'equilibrio delle forze opposte. Perfetto per meditazione e armonizzazione energetica.`,

  'TIB-116': `Set Grande 7 Campane Tibetane Chakra (19.5-35cm)

Set professionale di sette grandi campane tibetane, una per ogni chakra. Dimensioni da 19.5cm a 35cm, accordate sulle frequenze dei sette chakra principali.

✓ 7 campane tibetane (19.5-35cm)
✓ Una per ogni chakra
✓ Accordate sulle frequenze chakra
✓ Set professionale completo

Set ideale per terapisti del suono, praticanti avanzati e centri benessere. Ogni campana è progettata per risuonare con uno specifico centro energetico del corpo.`,

  // Set Teiera
  'TeaP-02': `Set Teiera per Infusi - Farfalle

Elegante set teiera in ceramica con decorazione a farfalle. Perfetto per preparare e servire tè ed infusi alle erbe.

✓ Teiera in ceramica decorata
✓ Design farfalle elegante
✓ Ideale per tè e infusi
✓ Confezione regalo

Un regalo perfetto per gli amanti del tè. Design raffinato che unisce funzionalità e bellezza.`,

  'TeaP-03': `Set Teiera per Infusi - Ventagli Cinesi

Elegante set teiera in ceramica con decorazione a ventagli cinesi. Perfetto per preparare e servire tè ed infusi alle erbe.

✓ Teiera in ceramica decorata
✓ Design ventagli cinesi tradizionali
✓ Ideale per tè e infusi
✓ Confezione regalo

Un regalo perfetto per gli amanti del tè e della cultura orientale.`,

  'TeaP-04': `Set Teiera per Infusi - Mosaico Verde

Elegante set teiera in ceramica con decorazione a mosaico verde. Perfetto per preparare e servire tè ed infusi alle erbe.

✓ Teiera in ceramica decorata
✓ Design mosaico verde
✓ Ideale per tè e infusi
✓ Confezione regalo

Un regalo perfetto per gli amanti del tè. Il design mosaico verde dona eleganza alla tavola.`,

  // Set Incenso Corda
  'RIH-01': `Set Incenso Corda con Porta Incenso Argentato - Albero della Vita

Set completo con incenso in corda nepalese e porta incenso argentato con simbolo dell'Albero della Vita.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Simbolo Albero della Vita
✓ Confezione regalo

L'Albero della Vita simboleggia crescita, forza e connessione con la natura. Perfetto per meditazione e purificazione degli ambienti.`,

  'RIH-02': `Set Incenso Corda con Porta Incenso Argentato - Fiore della Vita

Set completo con incenso in corda nepalese e porta incenso argentato con simbolo del Fiore della Vita.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Simbolo Fiore della Vita
✓ Confezione regalo

Il Fiore della Vita è un'antica geometria sacra che rappresenta l'interconnessione universale.`,

  'RIH-03': `Set Incenso Corda con Porta Incenso Argentato - Mandala Fiore

Set completo con incenso in corda nepalese e porta incenso argentato con design Mandala Fiore.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Design Mandala Fiore
✓ Confezione regalo

Il Mandala rappresenta l'universo e favorisce la meditazione e la concentrazione.`,

  'RIH-04': `Set Incenso Corda con Porta Incenso Argentato - Sette Chakra

Set completo con incenso in corda nepalese e porta incenso argentato con simboli dei Sette Chakra.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Simboli Sette Chakra
✓ Confezione regalo

I Sette Chakra rappresentano i centri energetici del corpo. Perfetto per pratiche di bilanciamento energetico.`,

  'RIH-05': `Set Incenso Corda con Porta Incenso Argentato - Astamangala

Set completo con incenso in corda nepalese e porta incenso argentato con simbolo Astamangala.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Simbolo Astamangala (Otto Simboli di Buon Auspicio)
✓ Confezione regalo

L'Astamangala comprende gli Otto Simboli di Buon Auspicio del Buddhismo tibetano.`,

  'RIH-06': `Set Incenso Corda con Porta Incenso Argentato - Pancha Buddha

Set completo con incenso in corda nepalese e porta incenso argentato con simbolo dei Cinque Buddha.

✓ Incenso in corda tradizionale nepalese
✓ Porta incenso argentato
✓ Simbolo Pancha Buddha (Cinque Buddha)
✓ Confezione regalo

I Pancha Buddha rappresentano le cinque saggezze del Buddhismo. Ideale per pratiche spirituali.`
};

async function updateDescriptions() {
  console.log('📝 Aggiornamento descrizioni Kit Regalo...\n');

  let updated = 0;

  for (const [id, description] of Object.entries(descriptions)) {
    try {
      await prisma.product.update({
        where: { id },
        data: { description }
      });
      console.log(`✅ ${id} - Descrizione aggiornata`);
      updated++;
    } catch (error) {
      console.error(`❌ ${id}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Aggiornate ${updated}/${Object.keys(descriptions).length} descrizioni`);
}

// Fix anche i nomi mancanti
async function fixNames() {
  const nameUpdates = {
    'RIH-04': 'Set Incenso Corda con Porta Incenso Argentato - Sette Chakra',
    'RIH-05': 'Set Incenso Corda con Porta Incenso Argentato - Astamangala'
  };

  console.log('\n📝 Correzione nomi...\n');

  for (const [id, name] of Object.entries(nameUpdates)) {
    try {
      await prisma.product.update({
        where: { id },
        data: { name }
      });
      console.log(`✅ ${id} - Nome aggiornato: ${name}`);
    } catch (error) {
      console.error(`❌ ${id}: ${error.message}`);
    }
  }
}

async function main() {
  await updateDescriptions();
  await fixNames();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
