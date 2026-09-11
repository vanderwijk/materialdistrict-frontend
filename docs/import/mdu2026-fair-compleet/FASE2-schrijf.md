# Fase 2 schrijf — sprekers — 2026-09-11

Batch: `mdu2026-sprekers-01`  
JSON: `fase2-uitvoer/mdu2026-sprekers.json`  
GO Johan → geschreven.

## Live resultaat

| Metriek | Waarde |
|---------|--------|
| Activiteiten `spreker` | **45** |
| Nieuwe user | **1** — Philippe Gaud (`phil.gaud28@gmail.com`), contact zonder inlog |
| Nieuwe rol | **1** — `lisannepeters@symbiomatter.com` → brand 119400, `medewerker`/`domein` |
| Rol bestond al | **13** |
| `mag_beheren` | altijd **0** |
| Geweigerd / mail | **0** |

MDU 2026-totaal activiteiten na deze ronde: exposant 112 · standbemanning 299 · spreker **45**.

## Idempotent

Herhaalde dry-run: 0 nieuw, 0 rol, 45× feit bestond al.

## Terugdraaien

```text
wp eval-file …/md-import-personen.php …/mdu2026-sprekers.json schrijf terugdraai=mdu2026-sprekers-01
```
