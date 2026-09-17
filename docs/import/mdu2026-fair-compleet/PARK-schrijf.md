# Parkeerlijst schrijf — 2026-09-16

## A+B

GO Johan → batches geschreven.

| Batch | Rollen | Grond |
|-------|--------|-------|
| `mdu2026-park-stand-01` | **47** | registratie (via activity object) |
| `mdu2026-park-stand-02` | **10** | registratie (via company→draft) |

`mag_beheren` = 0 · geweigerd = 0 · idempotent OK.

## D — Jeroen 2026-09-16

Bron: `fase5-uitvoer/park-emmer-D-beslisblad.xlsx` (Downloads-kopie, kolom F = BESLIST).

**Personen (blad Personen, 18).** Protocol + oordelenregister: personen en standbemanning altijd vastleggen, ook als het bedrijf NIET is. Alle 18 stonden al live (user + `standbemanning` MDU 2026). Niets extra geschreven op de persoon zelf.

**Bedrijven (blad Beslissingen, kolom F).**

| Cluster | n | BESLIST | Uitgevoerd |
|---------|---|---------|------------|
| Stichting Insert | 5 | **A** sluiten, geen merk | Geen merk, geen rol. Activiteit blijft. |
| BOOT Ingenieurs | 5 | **B** sluiten, alleen activiteit | Idem. |
| Oboros | 3 | **B** sluiten | Idem. |
| LignoLight / weißensee | 3 | **B** sluiten | Idem (Kempkens blijft ook spreker). |
| Maëlys Venkiah | 1 | **B** sluiten | Idem (blijft ook spreker). |
| wineo by LEOXX | 1 | **A** koppelen aan LEOXX **112907** | `mdu2026-park-stand-03`: 1× `medewerker` op LEOXX B.V. (Andrea Preda). Geen wineo-exposant. |

`oordelen.json`: Insert/BOOT/Oboros ongewijzigd NIET; LignoLight + Maëlys toegevoegd als NIET; `wineobyleoxx` blijft NIET als exposant, met koppeling standbemanning → 112907.

## Stand van zaken standbemanning-rollen

- Zonder merkrol na A+B+D: **26** (= 9 emmer C vrij-email + 17 D-sluiten)
- wineo-rol: **1** (was 18 open oordeel)
- Rollen: zie live telling na schrijf

## Terugdraaien D

```text
wp eval-file …/md-import-personen.php …/mdu2026-park-stand-03.json schrijf terugdraai=mdu2026-park-stand-03
```
