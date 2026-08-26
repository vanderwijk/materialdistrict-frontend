# MANIFEST — classificatie-apparaat materialen

Sessie 26-07-2026. Levering: het apparaat om alle materialen te herclassificeren op
material type en channels. Bevat geen doorgevoerde wijzigingen.

## Bestanden

| Pad | Wat |
|---|---|
| `docs/materiaal-classificatie-regelboek.md` (repo-root `docs/`, niet onder `cms-plugin/`) | De norm. Grensregels voor de elf types, criteria per channel, de duurzaamheidslimiet, en wat wel/niet uit tekst afgeleid mag worden. |
| `docs/kalibratieset-68.csv` | 68 handmatig beoordeelde grensgevallen met motivering. Gouden standaard waartegen de run getoetst wordt. |
| `scripts/classify-materials.py` | Haalt de export langs het regelboek via de Claude API. Levert een reviewlijst met zekerheidsscores, laagste zekerheid bovenaan. Schrijft nooit naar WordPress. |
| `scripts/wp-migrate-material-types.php` | WP-CLI. Stap `structure` = mechanische termmigratie. Stap `apply` = goedgekeurde reviewlijst doorvoeren. Dry-run standaard, `--apply` verplicht. |

## Uitvoervolgorde

1. `wp eval-file scripts/wp-migrate-material-types.php structure` — controleren
2. idem met `--apply` — termen omzetten, Composites en Leather aanmaken
3. `Surfaces`-testpost verwijderen, daarna de term (commando staat in de dry-run-output)
4. `python3 scripts/classify-materials.py --input md-materials.csv --calibrate docs/kalibratieset-68.csv`
   — meet overeenstemming met de 68; bij afwijking het regelboek bijstellen, niet het script
5. Volledige run met `--batch`, daarna `--collect <batch_id>`
6. Reviewlijst naar redactie; goedgekeurd bestand terug
7. `wp eval-file scripts/wp-migrate-material-types.php apply --file=review-approved.csv` — eerst zonder, dan met `--apply`

## Voorwaarden

- `ANTHROPIC_API_KEY` in de omgeving; `pip install anthropic pandas`
- Materiaalcodes worden nergens aangeraakt. Het nummer is de identiteit, de prefix een
  geboortestempel. Zie het besluit in de sessie-log.
- De `theme`-taxonomie moet de elf definitieve channels als termen bevatten voordat
  stap 7 draait, anders slaat het script channels over met een waarschuwing.

## Nog nodig

De actuele `session-log.md` uit de moedermap ontbreekt in deze levering — die is niet
aangeleverd. Lever hem aan en ik verwerk de sessie erin.
