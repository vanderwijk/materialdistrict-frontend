# Parkeerlijst-triage — 2026-09-16

Doel: open MDU 2026-gaten dichterzetten **vóór** editie 2025, zonder Claudes regie te overrulen op twijfelgevallen.

## Standbemanning zonder rol (84)

| Emmer | n | Voorstel |
|-------|---|----------|
| **A — AUTO** via `md_activity.object_id` | **47** | `medewerker` + `grond=registratie` + bewijs standbemanning-object (incl. i-did→54787, DenimX→128943) |
| **B — AUTO** via unieke company→draft-merk | **10** | Unilin 140509, Newmor 140452, MYCOTEX 140485, MdW 140506, Lichtlab 140483 |
| **C — SLUITEN** | **9** | vrij e-mail, geen object → geen rol (activiteit blijft) |
| **D — OORDEEL** | **18** | Insert (5), BOOT (5), Oboros (3), LignoLight (3), Maëlys (1), wineo (1) |

JSON:
- `fase5-uitvoer/mdu2026-park-stand-01.json` (A)
- `fase5-uitvoer/mdu2026-park-stand-02.json` (B)
- `fase5-uitvoer/mdu2026-park-stand-03.json` (D: wineo→LEOXX)

## Overige categorieën

| Categorie | n | Actie |
|-----------|---|-------|
| test@google.com / .eu | 2 | **Sluiten** — terecht geweigerd |
| LEOXX adres NIET | 1 | **Sluiten** — Jeroen BESLIST |
| oordelen NIET (wineo / Insert als exposant-merk) | 2 | **Sluiten** — geen exposant-feit; personen wel |
| spreker zonder rol | 17 | **Later** — activiteit staat; meeste zijn bureaus zonder merk in DB |
| exhibitor zonder merkkandidaat / contact zonder WEL | 16+18 | Overlapt D; geen auto-create |

## Gate

- **GO A+B** → geschreven 2026-09-16 (`PARK-schrijf.md`)
- **D** → Jeroen 2026-09-16 (`park-emmer-D-beslisblad.xlsx`)
