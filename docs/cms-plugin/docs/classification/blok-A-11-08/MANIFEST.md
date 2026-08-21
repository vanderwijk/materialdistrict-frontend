# MANIFEST — blok A, harde regelovertredingen

**Levering:** `md-blok-A-11-08-v1.zip`
**Datum:** 11-08-2026
**Onderwerp:** hercategorisering materialen — blok A uit de sessiebundel
**Norm:** `docs/materiaal-classificatie-regelboek.md` versie 1.2 (11-08-2026). Dit pakket
wijzigt de norm niet en stelt geen wijziging voor.

## Wat hier ligt

| bestand | doel |
|---|---|
| `data/besluit-blok-A1-onbetwist-v1.csv` | 12 records, onbetwist te corrigeren — invoer voor het script |
| `data/blok-A2-voorleggen-redactie-v1.csv` | 17 records die een redactioneel oordeel vragen |
| `data/blok-A3-signalering-legacy-v1.csv` | 2 records die alleen bij letterlijke telling over de grens gaan |
| `docs/blok-A-redactiebesluiten-11-08-2026.docx` | de twee besluiten, voor Sigrid |
| `docs/blok-A-verantwoording.md` | hoe er gemeten is en waar deze meting afwijkt van de bundel |
| `scripts/class-md-classification-cli.php` | WP-CLI-commando's `apply`, `rollback`, `audit` |

## Plaatsing

`scripts/class-md-classification-cli.php` hoort **in de bestaande MaterialDistrict-plugin**.
Het bestand draagt bewust geen `Plugin Name`-header en is geen mu-plugin. Voorgesteld pad
binnen de plugin: `inc/cli/class-md-classification-cli.php`, geladen vanuit de bootstrap
achter een `defined( 'WP_CLI' )`-check. De definitieve plaatsing is aan Johan.

## Volgorde

1. `wp md-classification audit` — bevestigt de nulstand (31 records in overtreding).
2. `wp md-classification apply --file=besluit-blok-A1-onbetwist-v1.csv` — dry run, verandert niets.
3. Dezelfde regel met `--execute` — schrijft, en legt een terugdraaibestand naast het besluitbestand.
4. `wp md-classification audit` opnieuw — verwacht: 19 records over (17 uit A2 + 2 uit A3).

Terugdraaien: `wp md-classification rollback --file=<terugdraaibestand> --execute`.

## Wat er niet in zit

- **`session-log.md`.** Die staat in de moedermap; de actuele versie is nodig om er een
  bijgewerkte versie van terug te leveren.
- **Blok B en C.** Hertypering (Leather / Composites / Coatings) en de channelronde wachten
  op het methodebesluit uit regelboek §7.
- **Een wijziging van het regelboek.** De afwijkingen in §3.6a staan in
  `docs/blok-A-verantwoording.md` beschreven, niet in de norm verwerkt.
