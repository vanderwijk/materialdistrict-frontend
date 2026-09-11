# Fase 3 prepare — standbemanning-verrijking — 2026-09-11

Bron: `bronnen/standbemanning.xlsx` (299)  
**Geen WP-schrijf** — dry-run alleen.

## Stand van zaken vóór fase 3

| Check | Resultaat |
|-------|-----------|
| Users bestaan | 299/299 |
| Activiteit `standbemanning` | 299/299 |
| Voornaam/achternaam leeg | **0** |
| Zonder enige `wp_md_user_brand`-rol | **117** |
| Profieltelefoon leeg (`billing_phone` + `telephone`) | **293** (292 hebben wel meta `phone`, die het profiel niet leest) |

## Voorstel A — ontbrekende domeinrollen

JSON: `fase3-uitvoer/mdu2026-stand-rollen.json`  
Batch: `mdu2026-stand-rollen-01`

| | |
|--|--|
| Nieuwe `medewerker`-rollen | **33** (25× domein + 8× domeinstam) |
| Activiteiten | **0** (bestaan al) |
| Overslaan zonder rol | **84** — 18 vrij e-mail · 12 multi-domein · 54 geen unieke match |

Geen rol op company-naam. Geen `billing_company` schrijven (factuurveld ≠ werkgever).

16 van de 21 doelmerken zijn draft maar wél MDU-exposant — dat zijn de juiste targets.

## Voorstel B — telefoon naar profielveld

JSON: `fase3-uitvoer/mdu2026-stand-phones.json`  
Script: `md-enrich-user-phones.php`  
Batch: `mdu2026-stand-phones-01`

| | |
|--|--|
| `billing_phone` vullen (E.164) | **293** |
| Overslaan (had al billing/telephone) | **6** |
| Overschrijven | **nooit** |

## Dry-run (live CMS)

| Batch | Resultaat |
|-------|-----------|
| `mdu2026-stand-rollen-01` | 33 rol · 0 nieuw · 0 activiteit · 0 geweigerd |
| `mdu2026-stand-phones-01` | 293 vullen · 6 had al · 0 ongeldig |

## Gate

Schrijf A+B na jouw GO (samen of apart).
