# MANIFEST — classificatie en materiaalcodes

Bijgewerkt 04-08-2026. Twee onderwerpen in één pakket: het apparaat om alle materialen
te herclassificeren op material type en channels, en het beheer van de materiaalcodes.

Norm: `docs/materiaal-classificatie-regelboek.md` (v1.3). Wijkt een ander stuk daarvan
af, dan is dát stuk verouderd.

## Bestanden

| Pad | Wat |
|---|---|
| `docs/materiaal-classificatie-regelboek.md` | De norm. Grensregels voor de elf types, de vier vangregels, criteria per channel, de duurzaamheidslimiet, het codebeleid en de methode-eis (lezen, niet tellen). |
| `docs/kalibratieset-68.csv` | 68 handmatig beoordeelde grensgevallen met motivering. Gouden standaard waartegen de run getoetst wordt. |
| `scripts/classify-materials.py` | Haalt de export langs het regelboek via de Claude API. Levert een reviewlijst met zekerheidsscores, laagste zekerheid bovenaan. Schrijft nooit naar WordPress. |
| `scripts/wp-migrate-material-types.php` | WP-CLI. Stap `structure` = termmigratie (gedraaid, staat live). Stap `apply` = goedgekeurde reviewlijst doorvoeren. |
| `scripts/wp-renumber-material-codes.php` | WP-CLI, eenmalig. Voert de goedgekeurde hernummering van de dubbele codes door. Schrijft een omkeerbestand vóór de eerste wijziging. |
| `includes/material-codes.php` | Plugin-onderdeel. Atomaire tellers per type, automatische codetoekenning, hernummering bij typewijziging, ingetrokken codes. Vervangt de handmatige Excel-lijst. |

## Aanroep

`wp eval-file` accepteert `--apply` niet als vlag; deze WP-CLI weigert 'm als onbekende
globale parameter. De scripts nemen daarom het positionele token `do-apply`:

    wp eval-file scripts/wp-renumber-material-codes.php --file=/tmp/hernummering-codes.csv
    wp eval-file scripts/wp-renumber-material-codes.php --file=/tmp/hernummering-codes.csv do-apply

## Volgorde — materiaalcodes

1. `includes/material-codes.php` in de plugin opnemen (`require_once`), daarna
   `wp md-codes install` — maakt de tellertabel aan.
2. `wp md-codes audit` — nulmeting: dubbelen, prefix-mismatches, materialen zonder code.
3. Hernummering doorvoeren met `wp-renumber-material-codes.php`, eerst als dry-run.
   Invoer: `hernummering-codes.csv` (goedgekeurd door de redactie).
4. `wp md-codes seed` — tellers vullen op basis van de hoogste nummers in gebruik.
   Nummers van vijf cijfers of meer worden als typefout genegeerd (ONA11036 was een slip
   voor een nummer in de 1200-reeks; seeden op het ruwe maximum zou die reeks op 11037
   laten beginnen).
5. `wp md-codes backfill` — materialen die nog geen code hebben krijgen er een.
6. `wp md-codes audit` opnieuw — moet nul dubbelen tonen.
7. De Excel-lijst afschaffen. Twee bronnen naast elkaar is hoe dit is ontstaan.

## Volgorde — classificatie

1. `python3 scripts/classify-materials.py --input md-materials.csv --calibrate docs/kalibratieset-68.csv`
   — meet overeenstemming met de 68; bij afwijking het regelboek bijstellen, niet het script
2. Volledige run met `--batch`, daarna `--collect <batch_id>`
3. Reviewlijst naar de redactie; goedgekeurd bestand terug
4. `wp eval-file scripts/wp-migrate-material-types.php apply --file=review-approved.csv`,
   eerst zonder, dan met `do-apply`

## Voorwaarden

- `ANTHROPIC_API_KEY` in de omgeving; `pip install anthropic pandas`
- De classificatierun raakt materiaalcodes nooit aan. Hernummeren gebeurt apart, met
  eigen tellers en fysieke gevolgen in het samplearchief.
- Bij een typewijziging krijgt een materiaal een nieuw nummer in de nieuwe reeks; het oude
  wordt ingetrokken en nooit hergebruikt. Gaten zijn geen probleem.
- De `theme`-taxonomie bevat de elf definitieve channels (bevestigd door Johan, 27-07).

## Openstaand

- **Prefixen voor de twee nieuwe types.** `COM` (Composites) en `LEA` (Leather) zijn een
  voorstel, geen besluit. Ze staan in `md_code_prefix_map()` en zijn daar te wijzigen —
  makkelijk nu, lastig zodra er nummers zijn uitgegeven.
- **Posttype.** De haak is `save_post_material`. Klopt dat niet, dan wijzigt alleen die
  regel.
- **14 samples moeten fysiek een nieuw label** krijgen (zie `hernummering-materiaalcodes.xlsx`,
  tabblad "Te herlabelen"). Redactiewerk, geen scriptwerk.
- **Syntaxcontrole.** In de werkomgeving is geen PHP beschikbaar; er is alleen op haakjes-
  en quotebalans plus leescontrole getoetst. De dry-run op de CMS is de eerste echte toets.
