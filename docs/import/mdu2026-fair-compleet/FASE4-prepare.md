# Fase 4 prepare — bezoekers — 2026-09-11

Bron: `bronnen/visitors-show-noshow.xlsx` (4061 rijen)  
JSON: `fase4-uitvoer/mdu2026-bezoekers-01` … `-09` (+ `-phones` / `-addr`)  
**Geen WP-schrijf.**

## Mapping

| Bron `Show` | Activiteit | Aantal |
|-------------|------------|--------|
| `show` | `bezoeker_aanwezig` | 3172 |
| `no_show` | `no_show` | 698 |
| leeg (vrijwel alle bookers) | `bezoeker_geregistreerd` | 189 |
| ongeldig e-mail | overgeslagen | **2** |

Totaal in JSON: **4059**. Geen rollen, geen company-als-werkgever, geen merk-create.

`detail`: o.a. `booker` · ticketsoort · ticketnr · bij geregistreerd ook `status:…`.

## Chunks (500)

9 batches: `mdu2026-bezoekers-01` … `mdu2026-bezoekers-09` (laatste 59).

Per chunk na personen-schrijf: telefoon (`billing_phone` alleen als leeg) + adres (`billing_address_1` / postcode / city / country alleen als leeg).

## Bulk e-mail lookup (live)

| Status | Aantal |
|--------|--------|
| Bestaand account | 330 |
| Contact-claimbaar | 142 |
| Nieuw aan te maken | **3587** |

## Dry-run chunk 01

| | |
|--|--|
| bestaand / contact / nieuw | 42 / 18 / **440** |
| activiteiten | **500** |
| rollen / geweigerd | 0 / 0 |

Phones/addr dry-run tonen nu veel `geen user` — dat verdwijnt ná personen-schrijf van dezelfde chunk.

## Gate

GO → alle 9 chunks schrijven (personen → phones → addr per chunk), daarna totaaltelling.
