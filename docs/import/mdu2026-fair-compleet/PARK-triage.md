# Parkeerlijst-triage — 2026-09-16

Doel: open MDU 2026-gaten dichterzetten **vóór** editie 2025, zonder Claudes regie te overrulen op twijfelgevallen.

## Standbemanning zonder rol (84)

| Emmer | n | Voorstel |
|-------|---|----------|
| **A — AUTO** via `md_activity.object_id` | **47** | `medewerker` + `grond=registratie` + bewijs standbemanning-object (incl. i-did→54787, DenimX→128943) |
| **B — AUTO** via unieke company→draft-merk | **10** | Unilin 140509, Newmor 140452, MYCOTEX 140485, MdW 140506, Lichtlab 140483 |
| **C — SLUITEN** | **9** | vrij e-mail, geen object → geen rol (activiteit blijft) |
| **D — OORDEEL** | **18** | Insert (5), BOOT (5), Oboros (3), LignoLight (3), Maëlys (1), wineo (1) |

JSON dry-run klaar:
- `fase5-uitvoer/mdu2026-park-stand-01.json` (A)
- `fase5-uitvoer/mdu2026-park-stand-02.json` (B)

## Overige categorieën

| Categorie | n | Voorstel |
|-----------|---|----------|
| test@google.com / .eu | 2 | **Sluiten** — terecht geweigerd |
| LEOXX adres NIET | 1 | **Sluiten** — Jeroen BESLIST |
| oordelen NIET (wineo / Insert als exposant-merk) | 2 | **Sluiten** — geen exposant-feit; personen apart in D |
| spreker zonder rol | 17 | **Later** — activiteit staat; meeste zijn bureaus zonder merk in DB; eva@i-did e.d. hebben deels al een rol |
| exhibitor zonder merkkandidaat / contact zonder WEL | 16+18 | **Overlapt D + cargo/instagram** — geen auto-create zonder Claude/Jeroen |

## Gate

- **GO A+B** → schrijf 57 `medewerker`-rollen  
- D blijft open tot jij/Claude beslist (Insert/BOOT/Oboros geen merk in DB)  
- Daarna 2025
