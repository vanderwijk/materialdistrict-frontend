# Mutatieprotocol

> **Normdocument.** De poorten waar elke bulkmutatie op de database doorheen moet. Geldt voor
> WP-CLI-scripts, importrondes, classificatierondes, taxonomiewijzigingen, kolomdrops en elke
> andere ingreep die meer dan een handvol records raakt.
>
> **Waarom dit bestaat.** De database is de commerciële ruggengraat: brands, memberships,
> materiaalcodes, samplecollectie. Een fout in een bulkmutatie is niet een bug die de volgende
> deploy repareert — het is dataverlies dat je pas maanden later opmerkt, als je het al opmerkt.
> Tot nu toe hebben we per ronde afspraken gemaakt. Dit maakt er één vaste poort van.
>
> **Wat dit niet is.** Geen norm over *wat* er geclassificeerd wordt — dat is
> `docs/materiaal-classificatie-regelboek.md` in de frontend-repo. Dit gaat alleen over de weg van
> voorstel naar uitvoering.
>
> Versie 1.0 · 25-08-2026 · eerste vastlegging. Zie §Status.

---

## 1. De zes poorten

Elke bulkmutatie doorloopt ze in volgorde. Een poort overslaan is een besluit dat expliciet
genomen en genoteerd wordt, geen stilzwijgende versnelling.

### Poort 1 — Norm vóór script
Het regelboek of de norm ligt vast en is actueel opgehaald uit de bron (niet uit een
sessiebundel, niet uit een kopie — zie `besluitenregister.md` B27). Wijzigt de norm tijdens de
ronde, dan wordt de ronde opnieuw gedaan, niet het regelboek achteraf bijgeschreven.

### Poort 2 — Meting vóór voorstel
Voordat er een voorstel ligt: hoeveel records raakt dit, en hoe zijn ze verdeeld? Een mutatie
waarvan de omvang niet gemeten is, is niet te beoordelen. Het getal komt uit een query of een
API-telling, niet uit een schatting.

### Poort 3 — Dry-run met volledige uitdraai
Het script draait eerst zonder te schrijven en levert een uitdraai met **alle** voorgestelde
wijzigingen: identifier, oude waarde, nieuwe waarde, en de regel waarop de wijziging steunt. Niet
een steekproef — de volledige lijst, zodat de patronen zichtbaar worden en niet alleen de
gevallen die het script zelf interessant vond.

### Poort 4 — Menselijk oordeel op patroon, niet op regel
De uitdraai gaat naar degene met het gezag (Sigrid voor redactioneel, Jeroen voor commercieel).
Die beoordeelt **patronen**, geen honderden losse rijen: "alle honingraatpanelen komen bij
Composites uit — klopt dat?" is de vraag, niet vierhonderd keer ja/nee. Een script dat geen
patronen kan laten zien, is nog niet klaar voor deze poort.

### Poort 5 — Uitvoering met terugweg
Vóór het schrijven ligt vast hoe het teruggedraaid wordt. Bij voorkeur een uitdraai van de oude
waarden van precies de te wijzigen records; anders een databasekopie. Wie de mutatie draait
(Johan) weet wat de terugweg is voordat hij begint.

### Poort 6 — Verificatie na afloop
Na de mutatie wordt opnieuw gemeten en vergeleken met wat de dry-run voorspelde. Wijkt het af,
dan is dat een bevinding die genoteerd wordt, ook als het resultaat op zichzelf goed is. Het
verschil tussen voorspeld en gerealiseerd is het enige signaal dat een stille fout in het script
zichtbaar maakt.

---

## 2. De twee-helften-regel

Een kandidaat om te verwijderen — een kolom, een taxonomieterm, een channel, een tabel — heeft
altijd twee helften:

- **De code-helft.** Wordt er ergens gelezen of geschreven? Vastgesteld op de codebase.
- **De data-helft.** Staat er iets in? Vastgesteld met een telling op de database.

**Zolang één van beide open staat, is de kandidaat onbeslist.** Nul referenties in de code is
geen bewijs dat de kolom leeg is; een lege kolom is geen bewijs dat niets 'm leest. Beide helften
of geen besluit.

**Val bij de code-helft:** dynamisch gebruik via strings. Een grep op `_material_code` vindt geen
`get_post_meta($id, '_' . $prefix . '_code')`. Wie alleen greps heeft gedraaid, heeft de
code-helft niet vastgesteld — hoogstens een indicatie.

---

## 3. Nog-niet-gebruikt versus niet-meer-gebruikt

De belangrijkste val, en de reden dat een statuslijst met alleen "houden" en "weg" niet volstaat.
Een veld dat gereserveerd is voor een feature in aanbouw ziet er identiek uit als een veld dat
ooit gebruikt werd en is achtergebleven: beide nul referenties, beide leeg.

Elke kandidaat krijgt daarom één van deze vijf statussen:

| Status | Betekenis |
|---|---|
| **KEEPER** | Blijft en wordt gebouwd of gevuld. |
| **GO** | Goedgekeurd om te verwijderen; code-only, geen datahelft nodig. |
| **KANDIDAAT (na telling)** | Code-helft schoon; wacht op het datagetal vóór verwijdering. |
| **GERESERVEERD** | Nog-niet-gebruikt, belegd voor een feature of besluit. **Niet verwijderen.** |
| **NAKIJKEN** | Lage zekerheid; eerst bevestigen. |

Wie een kandidaat op GO zet zonder te kunnen zeggen waarvóór het veld níét gereserveerd is, heeft
de vraag niet beantwoord.

**Bij MaterialDistrict is de scherpste vorm hiervan het lege channelveld.** Leeg betekent daar
"nog niet beoordeeld", niet "geen channel van toepassing" — en er is op dit moment geen veld dat
die twee onderscheidt. Zolang dat zo is, mag geen enkele afleiding uit "leeg" getrokken worden.

---

## 4. Wat een script nooit mag

- **Een channel-set leegmaken.** Een versmallende regel die alles zou weghalen, doet niets en
  levert een rapportregel op (`besluitenregister.md` B26).
- **Een gevulde waarde overschrijven met een lege.** Bij imports: een lege cel is "geen opgave",
  niet "maak leeg". Dit geldt voor elke import, niet alleen materiaalimports.
- **Merken samenvoegen op naam.** Alleen op aantoonbare identiteit: exact hetzelfde domein, of
  een overeenkomend btw- of KvK-nummer. Nooit op naamgelijkenis alleen.
- **Materiaalcodes bijwerken bij een typewijziging.** De code is stabiel; de prefix wordt
  historisch (B25).
- **Zonder dry-run schrijven.** Ook niet "even snel voor twintig records".

---

## 5. Wie doet wat

| Stap | Wie |
|---|---|
| Norm ophalen en actueel bevestigen | Claude |
| Meting en dry-run-uitdraai | Claude |
| Script schrijven (WP-CLI, PHP in de bestaande plugin) | Claude |
| Redactioneel oordeel op de patronen | Sigrid |
| Commercieel oordeel op de patronen | Jeroen |
| Uitvoeren op de database + terugweg klaarzetten | Johan |
| Verificatiemeting na afloop | Claude |

De mens komt langs twee poorten in beeld — oordeel (4) en toegang (5) — en verder niet. Alles
daarbuiten hoort kant-en-klaar aangeleverd te worden (`START-HIER.md`).

---

## 6. Wat er in de moedermap achterblijft

Na elke bulkmutatie landt in `docs/`:

- de dry-run-uitdraai (xlsx of csv, met datum in de naam),
- het script zelf,
- een korte notitie met de meting vooraf, het oordeel en de verificatie achteraf,
- een regel in `session-log.md`.

**En:** raakt de ronde een besluit dat breder geldt dan deze ene mutatie, dan gaat dat besluit
naar `besluitenregister.md` — niet alleen in de notitie. Dat is precies de stap die tot nu toe
werd overgeslagen, waardoor besluiten alleen terug te vinden zijn door de vindplaats al te kennen.

---

## Status

**v1.0 · 25-08-2026** — eerste vastlegging. Aanleiding: de documentatieset van Sample.Store, waar
schema-ingrepen achter benoemde poorten liggen (telling vlak vóór de drop, drie voorwaarden vóór
een legacy-drop, de twee-helften-regel, en een aparte status voor gereserveerde velden). Bij
MaterialDistrict bestonden vergelijkbare afspraken wel, maar per ronde en niet op één plek — de
regel dat een script een channel-set niet mag leegmaken stond bijvoorbeeld alleen in het
classificatieregelboek, terwijl de onderliggende val (leeg is niet hetzelfde als niet van
toepassing) voor elke bulkmutatie geldt.

Nog te beslissen: of er een expliciete markering komt voor "beoordeeld, geen channel van
toepassing", zodat leeg wél iets gaat betekenen. Zolang die er niet is, blijft §3 de rem.
Opgesteld door Claude, namens Jeroen.
