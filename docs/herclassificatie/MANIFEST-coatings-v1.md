# MANIFEST — herclassificatie-coatings-v1.zip

**31-07-2026.** Blok 1 van de tweede aanloop: alle 229 Coatings gelezen en beoordeeld.
Niets toegepast op het CMS — dit is een reviewlijst.

## Normdocument waarop dit steunt

`docs/materiaal-classificatie-regelboek.md` — versie 1.0 (26-07), in deze levering
bijgewerkt naar 1.1. Bij tegenspraak wint dit document van elke sessiebundel.

## Bestanden

| Pad | Wat |
|---|---|
| `docs/materiaal-classificatie-regelboek.md` | **v1.1.** §3.6 vangregels toegevoegd, §3.7 bamboe. v1.0-tekst verder ongewijzigd. |
| `docs/herclassificatie/coatings-voorstel-v1.csv` | 229 rijen, §6-formaat, laagste zekerheid bovenaan. |
| `session-log.md` | Compleet bestand, nieuwe sectie onderaan. |

## Uitkomst

- **185 van 229 (81%) blijven Coatings.** Het regelboek verwachtte ruwweg 70%.
- **44 verlaten Coatings**, verdeeld over (Bio)Plastics 8, Composites 7, Metals 6,
  Bio-based (excl. Wood) 5, Concrete 5, Wood 4, Natural Stones 3, Glass 3, Ceramics 2,
  Leather 1.
- **103 records krijgen nul channels** — 88 generiek, 15 te weinig info.
- Zekerheid type: 151 hoog, 50 midden, 28 laag. Zekerheid channels: 34 hoog, 164 midden,
  31 laag.
- Machinaal getoetst aan het regelboek: geldig type, maximaal drie channels, maximaal
  twee uit de duurzaamheidsgroep, geldige reden bij nul channels. **Nul overtredingen.**

## Drie besluiten die niet van mij zijn

Deze drie bepalen samen ongeveer 34 records en het verschil tussen 81% en 72%.

**1. Zijn pleisters en stucwerk een coating? — 21 records.**
Kalkstuc, leempleister, tadelakt, microcement, Japans shikkui. §3.4 noemt "opgebrachte
laagsystemen", en een pleister wordt nat aangebracht als afwerklaag. Ik heb ze daarom in
Coatings gehouden. Het alternatief is Concrete (§2: "cement- en mineraalgebonden
gietmaterialen"), maar pleister wordt niet gegoten. Zegt de redactie dat pleister een
substantie is en geen laag, dan verhuizen deze 21 en klopt de 70%-verwachting alsnog.

**2. Zijn lijmen een coating? — 6 records.**
Het regelboek noemt lijm nergens. Ik heb ze onder "opgebrachte functionele lagen"
gehouden. Alternatief: (Bio)Plastics op basis van het bindmiddel — maar dan wordt een
biobased PLA-lijm ineens een plastic, wat de filters niet helpt.

**3. Zeven records zijn helemaal geen materiaal.**
Framax laser cutting, Lasertec, O-Pur, Printtapijt, Special Prints, Surfi-Sculpt,
Xylogramm — dat zijn processen, diensten of concepten. §4.3 kent daar geen categorie
voor; "hoort er niet meer" gaat over verlopen merken. Voorstel: aparte afvoerlijst, geen
type.

## Wat hierna nodig is

1. Jeroen en Sigrid lezen van boven naar beneden. De eerste ~60 rijen zijn de
   twijfelgevallen; de laatste ~100 zijn routine.
2. Beslissing op de drie punten hierboven.
3. Pas daarna de schrijfronde, met het bestaande `md-apply-classificatie.php`
   (`types` voor de typewijzigingen). Ik lever dan een apply-CSV in het formaat dat dat
   script leest.

## Twee dingen die los hiervan blijven staan

- **De rubriek op de stories** staat publiek verkeerd en wacht op de restore met
  `md-backup-20260731-121456.csv`.
- **De 23 records** waar de correctieronde "bewust geen channel" zei, hebben hun oude
  channels behouden: het apply-script kan een channelset niet leegmaken. Dat is een
  aanpassing die Johan moet doen voordat de volgende schrijfronde draait, anders blijft
  elk "geen channel"-oordeel onuitgevoerd — ook de 103 uit deze levering.
