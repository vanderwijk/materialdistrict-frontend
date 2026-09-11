# Fase 4 schrijf — bezoekers — 2026-09-11

GO Johan → 9 chunks geschreven.

## Activiteiten MDU 2026 (na fase 4)

| Type | n |
|------|---|
| `bezoeker_aanwezig` | **3172** |
| `no_show` | **698** |
| `bezoeker_geregistreerd` | **189** |
| standbemanning | 299 |
| exposant | 112 |
| spreker | 45 |

Bezoekers-activiteiten totaal: **4059** (= bron − 2 test-e-mails).

## Users

| | |
|--|--|
| Nieuwe contacten (batch `mdu2026-bezoekers-*`) | **3587** |
| Geweigerd / mail | **0** |

## Verrijking

| | |
|--|--|
| `billing_phone` gevuld | **3616** |
| Adresrijen geraakt (`*-addr`) | **3850** |
| Company/VAT | niet aangeraakt |

## Batches

`mdu2026-bezoekers-01` … `09` (8×500 + 59).

Idempotent steekproef chunk 01/09: activiteiten → feit bestond al.

## Terugdraaien (per chunk)

```text
wp eval-file …/md-import-personen.php …/mdu2026-bezoekers-NN.json schrijf terugdraai=mdu2026-bezoekers-NN
```
