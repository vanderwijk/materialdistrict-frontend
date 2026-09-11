# Fase 2 prepare — sprekers — 2026-09-11

Bron: `bronnen/sprekers.xlsx` (45 rijen)  
JSON: `fase2-uitvoer/mdu2026-sprekers.json`  
Batch: `mdu2026-sprekers-01`  
**Geen WP-schrijf** — alleen dry-run.

## Voorstel

| Onderdeel | Aantal | Toelichting |
|-----------|--------|-------------|
| Activiteit `spreker` | **45** | Altijd; `detail` = theater · thema · tijdslot |
| Rol `medewerker` | **14** | Alleen unieke domeinmatch (`domein` 13 + `domeinstam` 1) |
| Geen rol | **31** | 14 vrij e-mail / 16 geen match / 1 multi (i-did.nl) |
| Nieuwe users | **1** | Live dry-run |
| Contact-claimbaar | **28** | |
| Bestaand account | **16** | |
| Nieuwe rol | **1** | 13 van 14 domeinrollen bestonden al |
| Activiteiten (nieuw) | **45** | 0 bestonden al |
| Geweigerd | **0** | |

## Bewuste keuzes

- Geen rol zonder uniek domeinbewijs (ook niet als bron `exposant=ja`).
- `i-did.nl` → 2 merken: **geen rol**, wel spreker-activiteit.
- `mag_beheren` nooit uit import.
- Object van activiteit = merk alleen als er een rol-match is.

## Twijfel (geen rol; wel activiteit)

Zie `fase2-uitvoer/fase2-prepare-meta.json` — o.a. architectenbureaus zonder merk in snapshot, exposanten zonder website-match.

## Gate

Dry-run OK → schrijf na jouw GO.
