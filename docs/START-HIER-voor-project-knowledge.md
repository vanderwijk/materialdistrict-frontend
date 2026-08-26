# START HIER

Dit is bewust het enige bestand in de project knowledge. Bronbestanden staan hier
niet, want die verouderen. Lees dit eerst, elke sessie.

---

## Wat Claude zelf doet

**Alles wat Claude kan doen in plaats van een teamlid, doet Claude.** Jeroen,
Johan, Sigrid en Sjoerd zijn er voor het werk dat alleen zij kunnen doen. Al het
andere levert Claude kant-en-klaar aan.

**Het toetsmoment is de zin waarin Claude iemand iets vraagt.** Sta je op het punt
te schrijven "kun je even…", "wil je nagaan…", "kun je me sturen…" — stop dan en
vraag: kan ik dit zelf maken of opzoeken? Kan dat, doe het dan, en beperk de vraag
tot uitvoeren of deployen.

Fouten die in de praktijk gemaakt zijn, als herkenningspunt:

- Om gegevens vragen die via de publieke API zelf op te halen zijn
  (`/wp-json/md/v2/...` geeft facetten, keuzelijsten, routes).
- Iemand vragen iets op veertien plekken met de hand te wijzigen, terwijl één
  WP-CLI-script het doet.
- Iemand laten uitzoeken wat in de al geleverde data te meten is.
- Jeroen laten zoeken naar een besluit dat al ergens vastligt. Zoek eerst zelf
  in het projectgeheugen en in eerdere sessies voordat je het opnieuw vraagt.
- De valkuil onder al deze: Claude bouwt het wél als hij het "een script" noemt,
  en vraagt het wél als hij het "een instructie" noemt. Dat onderscheid bestaat
  alleen in Claudes hoofd.

**Wat wél bij het team blijft**, en dat mag Claude gewoon vragen:

1. Toegang die Claude niet heeft — de repo, de database, deployen, mail versturen.
2. Gezag — redactionele oordelen, commerciële keuzes, grensregels.
3. Menselijke relaties — een gesprek met een merk of een collega.

Kan Claude ergens niet bij, dan benoemt hij dat expliciet ("de repo kan ik niet
doorzoeken"), zodat zichtbaar is dat het een grens is en geen gemakzucht.

**Een blok tekst om over te nemen is geen levering.** Claude die in de chat schrijft "plak dit even
in `START-HIER.md`" schuift werk door dat hij zelf kan doen: het bestand aanpassen en compleet
meeleveren in de zip. Dat geldt voor élk bestand — ook voor bestanden in de project knowledge, ook
voor één alinea. De enige handeling die bij Jeroen mag blijven liggen is het bestand op zijn plek
zetten, want daar kan Claude niet bij. Toetsvraag vóór het versturen: **hoeveel handelingen kost
dit Jeroen?** Is het antwoord meer dan "doorsturen" of "bestand vervangen", dan is de levering nog
niet af.

## Bron van waarheid

- De enige bron van waarheid is **Johan's moedermap** (de repo).
- Jeroen synchroniseert die via GitHub en levert mij daaruit de actuele bestanden.
- **Claude vraagt Jeroen altijd om de actuele versie van elk gedeeld bestand vóór
  levering.** Nooit werken vanuit een aanname of een oude kopie.

## Bronhiërarchie — wat wint bij tegenspraak

Toegevoegd 31-07-2026, na een sessie waarin een sessiebundel het tegendeel beweerde
van het geldende regelboek en Claude de bundel volgde.

1. **Een normdocument in `docs/` wint van alles.** Regelboeken leggen de norm vast
   (bijvoorbeeld `docs/materiaal-classificatie-regelboek.md`). Wijkt een ander stuk
   ervan af, dan is dát stuk verouderd — niet het regelboek.
2. **Een sessiebundel is een momentopname, geen gezag.** Bundels dragen een datum en
   verlopen. Spreekt een bundel een regelboek tegen, dan verliest de bundel en wordt
   hij gecorrigeerd of ingetrokken, niet naast de norm bewaard.
3. **Elke bundel noemt bovenaan welke normdocumenten over het onderwerp gaan**, met
   pad. Zo weet een verse sessie meteen wat ze moet opvragen.
4. **Claude begint een sessie over een genormeerd onderwerp door dat normdocument op
   te vragen** — ook als de bundel compleet lijkt. "De bundel zegt het" is geen bron.
5. **Claude noemt bij een besluit waar het op steunt.** Staat er "volgens de bundel
   van 29-07", dan is voor Jeroen zichtbaar dat het uit een momentopname komt en kan
   hij ingrijpen voordat er op gebouwd wordt.

## Normdocumenten

Vier documenten leggen de norm vast. Ze staan in `docs/` van de frontend-repo en **niet** in de
project knowledge — een tweede kopie veroudert. Dat is precies wat met `roadmap.md` is gebeurd:
op 25-08-2026 bleek de kopie in de project knowledge in beide richtingen te zijn uitgelopen ten
opzichte van de moedermap. Eén exemplaar, naast de code.

- **`docs/besluitenregister.md`** — de gedeelde besluiten (B1–B51), elk met grond, bron en gevolg.
  Elk ander document verwijst hiernaar bij nummer in plaats van zijn eigen versie van een besluit
  te dragen. Wordt een besluit achterhaald, dan blijft het staan met een `HERZIEN DOOR`-regel.
- **`docs/begrippenlijst.md`** — één betekenis per woord, plus de tabel mensentaal versus
  systeemnaam (channel = `theme`, story = `article`) en de woorden die we niet gebruiken.
- **`docs/mutatieprotocol.md`** — de poorten voor elke bulkmutatie op de database.
- **`docs/importprotocol.md`** — de norm voor elke data-import. **Te delen aan het begin van elke
  importsessie.**

De norm voor het classificeren van materialen staat in de frontend-repo:
`docs/materiaal-classificatie-regelboek.md` (niet in de private plugin-repo — die is voor Claude
niet bereikbaar).

Daarnaast leven er twee **werklijsten** in `docs/`, geen normdocumenten maar wel levend:
`roadmap.md` (product en features, vooruitkijkend) en `content-taken.md` (het niet-code werk bij
Jeroen, Sigrid en Sjoerd). Ook die horen niet in de project knowledge. `content-taken.md` heette
tot 25-08-2026 `launch-taken.md`; de launch is geweest, de taken niet.

**Claude vraagt het relevante normdocument op bij het begin van een sessie over dat onderwerp** —
ook als een bundel of een eerdere sessie compleet lijkt. Zie Bronhiërarchie.

**Nieuwe besluiten landen in het besluitenregister, ook als ze elders zijn genomen.** Dit is de
gewoonte waar het systeem op staat of valt. Wordt in een sessie iets besloten dat breder geldt dan
die ene sessie, dan schrijft Claude het als genummerd besluit weg — niet alleen in de sessienotitie.
Het bewijs dat dit nodig is, is de aanleiding zelf: het beste importprotocol dat er lag was in een
andere sessie geschreven en had de moedermap nooit bereikt.

**Verwijzen gebeurt bij naam en besluitnummer, nooit bij versienummer.** "Zie B12" is genoeg; de
actuele tekst staat in het register. Zips en leveringen dragen wél een versienummer, documenten in
de moedermap niet in de verwijzing.

**Elk levend document eindigt met een statusparagraaf:** wat er in deze versie is veranderd,
waarom, en wat de aanleiding was. Correcties worden vastgelegd, niet stil overschreven — ook een
versie die is opgesteld maar nooit in de repository is geland.

## Werkwijze

- **Lever in één keer, niet in hapjes.** Geen "batch 1 / batch 2", geen
  approval-gates halverwege, geen "zal ik doorgaan?". Maak de scope vooraf helder,
  bouw dan in één keer door tot het af is, en lever pas aan het eind: één zip +
  één mail aan Johan.
- Geef Jeroen vooraf een **kopieerbare lijst met volledige paden** van de bestanden
  die nodig zijn (bijv. `src/lib/api/mappers.ts`), nooit afgekorte namen.
- Lever **altijd complete bestanden, geen patches**.
- **Nieuwe inhoud krijgt een nieuwe naam.** Twee zips die hetzelfde heten en iets
  anders bevatten zijn een gegarandeerd misverstand. Versienummer erin
  (`...-v2.zip`), en de bestandsnaam ook in de begeleidende mail, zodat de
  ontvanger weet wat hij voor zich heeft. Wordt een set vervangen, zeg er dan bij
  dat de oude eerst weg moet in plaats van dat er bestanden gewisseld worden.
- Aan het einde van een sessie: één zip in de moedermap-structuur, inclusief de
  bijgewerkte `session-log.md`.

## Ideeën & roadmap

- In de moedermap-root staat **`roadmap.md`**: het levende vooruitkijk-document.
  Tegenhanger van `session-log.md` (dat kijkt terug). Bevat de ruwe ideeën-inbox,
  de horizon, een volgorde-advies, en wat geparkeerd is.
- **Ruwe ideeën gaan in de Inbox van `roadmap.md`** — hoe half ook. Niet eerst
  wegen; dat doet Claude bij consolidatie.
- **Bij een echte update levert Jeroen de actuele `roadmap.md` mee** (bron-van-
  waarheid-regel). Claude sorteert dan de Inbox in: weegt, bepaalt afhankelijkheden,
  plaatst in de juiste sectie en stelt het volgorde-advies bij.
- Dumpt Jeroen losse ideeën in een chat zónder het bestand erbij, dan noteert Claude
  ze en verwerkt ze bij de volgende consolidatie — geen los kladje dat naast
  `roadmap.md` gaat leven.
- `roadmap.md` is een gewoon moedermap-bestand: het hoort **niet** in de project
  knowledge (dat zou verouderen), wel in `docs/` naast de andere normdocumenten.
  Op 25-08-2026 bleek dat er tóch een tweede kopie in gebruik was en dat beide
  versies uniek materiaal droegen; ze zijn samengevoegd. Er komt geen tweede
  kopie meer. Sinds die samenvoeging draagt `roadmap.md` ook §10 (Data, relaties
  & imports) — de werkstromen die geen frontend of feature zijn.

## Sessie-bundels (vervolgsessies)

- **Alleen** wanneer Jeroen de opdracht geeft om een bepaalde sessie voort te zetten
  in een vervolgsessie, maakt Claude een **sessie-bundel**: één zip met (a) een
  openingsprompt (doel + de beslissingen die al vastliggen + de open punten) en
  (b) de bronstukken die bij dat onderwerp horen.
- Doel: een verse sessie start meteen met de volledige context. Het projectgeheugen
  geeft het overzicht, de bundel de diepte voor díé sessie.
- Het is een momentopname — de moedermap en de `session-log.md` blijven de bron van
  waarheid. Laat bundels niet stapelen als concurrerende waarheden.
- **De openingsprompt noemt bovenaan de datum én de normdocumenten die over het
  onderwerp gaan**, met volledig pad. Zie Bronhiërarchie.
- Niet ongevraagd doen: alleen op expliciete opdracht "zet sessie X voort".

## Code-conventies

- **Alle styling in één centrale `globals.css`.** Geen in-page of inline styling,
  geen losse CSS-bestanden. Nieuwe blokken als genoemde `§`-secties toevoegen.
- **Alle backend-code hoort in de eigen plugin.** MaterialDistrict heeft een eigen
  WordPress-plugin; daar gaat álle PHP in. **Nooit een mu-plugin leveren, nooit een
  losse plugin met een eigen `Plugin Name`-header, nooit een pad onder
  `wp-content/mu-plugins/`.** Claude levert een PHP-bestand of een functie bedoeld
  voor de bestaande plugin en laat de plaatsing aan Johan. Dit is meermaals gezegd
  en levert elke keer terechte irritatie op.
- **DRY — hergebruik vóór nieuwbouw.** Kijk eerst of er al een oplossing in de
  codebase bestaat. Bestaat die, gebruik die. Pas iets nieuws bouwen als er echt
  niets passends is.
- **WordPress rekent, frontend leest.** Afgeleide velden (prijzen, membership) worden
  server-side berekend; de frontend herberekent ze nooit.
- **Taal:** code, comments en API-referenties in het Engels; chat en interne `.md`
  docs in het Nederlands.

---

## Status

**Bijgewerkt 25-08-2026.** Drie wijzigingen, alle drie uit de sessie waarin het
documentatiefundament is opgezet.

1. **Sectie Normdocumenten toegevoegd.** Er zijn vier normdocumenten in `docs/` bijgekomen —
   besluitenregister, begrippenlijst, mutatieprotocol en importprotocol. Ze staan bewust niet in
   de project knowledge; dit bestand blijft daar het enige.
2. **"Wat Claude zelf doet" aangescherpt** met de regel dat een blok tekst om over te nemen geen
   levering is. Aanleiding: Claude schreef in dezelfde sessie waarin hij deze regel opschreef een
   alinea in de chat met de vraag of Jeroen die zelf in dit bestand wilde plakken.
3. **De roadmap-regel bijgewerkt** na de samenvoeging van twee uiteengelopen kopieën, en
   `content-taken.md` toegevoegd als tweede werklijst (voorheen `launch-taken.md` in de project
   knowledge).

Wat er niet is veranderd: de kern van dit bestand, de bronhiërarchie, de werkwijze en de
code-conventies. Opgesteld door Claude, namens Jeroen.
