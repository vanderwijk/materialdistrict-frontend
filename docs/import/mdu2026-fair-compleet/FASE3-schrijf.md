# Fase 3 schrijf — standbemanning-verrijking — 2026-09-11

GO Johan → A+B geschreven.

## A — rollen (`mdu2026-stand-rollen-01`)

| Metriek | Waarde |
|---------|--------|
| Nieuwe `medewerker` | **33** (25 domein + 8 domeinstam) |
| Activiteiten | **0** |
| `mag_beheren` | **0** |
| Standbemanning nog zonder rol | **84** (bewust: vrij/multi/geen match) |

## B — telefoons (`mdu2026-stand-phones-01`)

| Metriek | Waarde |
|---------|--------|
| `billing_phone` gevuld | **293** |
| Had al billing/telephone | **6** |

## Rollen totaal live

`medewerker` 197 · `contactpersoon` 61 · `beheerder` 11

## Idempotent

Herhaalde dry-run: 33× rol bestond al · 0 telefoons te vullen.

## Terugdraaien

```text
wp eval-file …/md-import-personen.php …/mdu2026-stand-rollen.json schrijf terugdraai=mdu2026-stand-rollen-01
# phones: geen batch-delete in script; filter usermeta md_phone_enriched_batch=mdu2026-stand-phones-01
```
