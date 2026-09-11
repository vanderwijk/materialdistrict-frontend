# Fase 5 — verificatie — 2026-09-11

Afsluiting fair-import MDU 2026. Geen nieuwe writes.

## Poort: bron ↔ live

| Feit | Bron | Live | Δ |
|------|------|------|---|
| exposant (merk) | 112 (na oordelen/match) | **112** | 0 |
| standbemanning | 299 | **299** | 0 |
| spreker | 45 | **45** | 0 |
| bezoeker_aanwezig | 3172 show | **3172** | 0 |
| no_show | 698 | **698** | 0 |
| bezoeker_geregistreerd | 189 lege Show | **189** | 0 |
| bezoekers overgeslagen | 2 test@ | 0 feiten | bewust |

**Totaal activiteiten MDU 2026: 4515.**

Rollen (cumulatief): medewerker **197** · contactpersoon **61** · beheerder **11**.

## Poort: herhaal = feit bestond al

Dry-run steekproef na schrijf:

| Batch | nieuw | rol | activiteit | feit bestond al |
|-------|-------|-----|------------|-----------------|
| exposant-contact | 0 | 0 (117 bestond al) | 0 | — |
| sprekers | 0 | 0 | 0 | **45** |
| stand-rollen | 0 | 0 (33 bestond al) | 0 | — |
| bezoekers-01 | 0 | 0 | 0 | **500** |
| bezoekers-05 | 0 | 0 | 0 | **500** |
| bezoekers-09 | 0 | 0 | 0 | **59** |

Geen geweigerd; geen mail tijdens schrijfrondes.

## Parkeerlijst (menselijke review)

Zie `fase5-uitvoer/parkeerlijst.json` + `.tsv`.

| Categorie | n | Actie voor Claude/Jeroen |
|-----------|---|--------------------------|
| standbemanning zonder rol | **84** | vrij/multi/geen domein — handmatig of laten |
| spreker zonder rol | **17** | idem; activiteit staat al |
| exhibitor zonder merkkandidaat | **16** | Instagram/cargo/lege company |
| exposant-contact zonder WEL-merk | **18** | geen contactpersoon-rij |
| oordelen NIET (wineo / Stichting Insert) | **2** | bewust geen exposant-feit |
| LEOXX adres NIET | **1** | beslist, geen rewrite |
| test-e-mails bezoekers | **2** | terecht geweigerd |

## Open (niet-blokkerend)

- PDOK / land-aware postcode-completering (`verrijking-adapters`)
- `importeer.py` `lever()` → `contacten` vullen (fase 1b was handmatig)
- Unique key `(user_id,brand_id)` vs meerdere rollen — documenteer of later verruimen
- Draft-exposantmerken publiceren (redactioneel)

## Oordeel

**Importronde fair-data MDU 2026 is groen:** tallingen kloppen, herhaal is idempotent, afwijzingen staan op de parkeerlijst.
